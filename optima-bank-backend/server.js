const dotenv = require('dotenv');
dotenv.config(); // ✅ Load .env variables FIRST

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
require('./passport'); // ✅ AFTER .env loaded

const session = require('express-session');
const app = express(); // ✅ DECLARE THIS FIRST!

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const bcrypt = require('bcrypt');
const saltRounds = 10;


// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

app.use(session({
  secret: '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', // Ideally from process.env
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB error:', err));

// Signup route
app.post('/signup', async (req, res) => {
  const { firstName, lastName, dob, phone, email, password, username } = req.body;

  const usernameRegex = /^[a-zA-Z0-9]{6,}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ message: 'Username must be letters/numbers with a minimum of 6 characters.' });
  }

  try {
    const userExist = await User.findOne({ $or: [{ email }, { username }] });
    if (userExist) {
      return res.status(400).json({ message: 'Email atau username telah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      firstName,
      lastName,
      username,
      dob,
      phone,
      email,
      password: hashedPassword,
      provider: 'local',
      points: 500, //  Tambah points semasa signup
      rewards: []  //  Sediakan rewards array kosong
    });

    await newUser.save();
    res.status(201).json({ message: 'Signup successful!' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Error during signup.' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari berdasarkan username SAHAJA
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ message: 'Username tidak dijumpai.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Kata laluan salah.' });

    const userData = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage || ''
    };

    // Jika berjaya
    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error during login.' });
  }
});


// Forgot password route
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.tokenExpiry = Date.now() + 3600000;
    await user.save();

    console.log(`Reset token generated for ${email}: ${token}`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.MAIL_USER,
      subject: 'Password Reset',
      text: `Click this link to reset your password: http://localhost:3000/reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Reset email sent!' });

  } catch (err) {
    console.error('Forgot password error:', err); // ✅ LOG IT
    res.status(500).json({ message: 'Error sending email' });
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiry: { $gt: Date.now() }, // still valid
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset!' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Google OAuth
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // 👈 force account chooser every time
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {
    // Option 1: Send user info via redirect query
    const user = req.user;
    const safeUser = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage || '',
      points: user.points ?? 0   // nullish coalescing, bukan falsy check
    };
    const query = new URLSearchParams(safeUser).toString();
    res.redirect(`${process.env.CLIENT_URL}/dashboard?${query}`);
  }
);

app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: 'Logout error' });
    req.session.destroy(() => {
      res.clearCookie('session');
      res.json({ message: 'Logged out' });
    });
  });
});

//profile
// Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

app.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userId = `${user.username}${user.lastName}`;
    res.json({ ...user._doc, userId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

app.put('/profile/update/:id', upload.single('profileImage'), async (req, res) => {
  try {
    console.log("REQ FILE:", req.file);   // ✅ Important
    console.log("REQ BODY:", req.body);   // ✅ Check all incoming fields

    const updates = req.body;

    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('❌ Update error:', err);  //  Log full error
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

//voucher redeem
app.get('/redeemed/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user.rewards || []);
  } catch (err) {
    res.status(500).json({ message: 'Fail to redeem' });
  }
});

// Redeem vouchers (bulk)
app.post('/redeem', async (req, res) => {
  const { userId, vouchers } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let totalCost = 0;

    // Step 1: Validate all vouchers
    for (const v of vouchers) {
      const dbVoucher = await Voucher.findById(v._id);
      if (!dbVoucher) return res.status(404).json({ message: `Voucher ${v.name} not found` });

      if (dbVoucher.available < v.quantity) {
        return res.status(400).json({ message: `Not enough availability for ${v.name}` });
      }

      totalCost += dbVoucher.price * v.quantity;
    }

    // Step 2: Check points
    if (user.points < totalCost) {
      return res.status(400).json({ message: "Not enough points" });
    }

    // Step 3: Deduct points
    user.points -= totalCost;

    // Step 4: Deduct availability + save to rewards
    for (const v of vouchers) {
      const dbVoucher = await Voucher.findById(v._id);
      dbVoucher.available -= v.quantity;
      await dbVoucher.save();

      // Check if user already has this voucher in rewards
      let existingReward = user.rewards.find(r => r.voucherId.toString() === dbVoucher._id.toString());

      if (existingReward) {
        // Just add new serials into the existing one
        v.serials.forEach(code => {
          existingReward.serials.push({
            code,
            redeemedAt: new Date()
          });
        });
      } else {
        // Create new reward object
        user.rewards.push({
          voucherId: dbVoucher._id,
          name: dbVoucher.name,
          image: dbVoucher.image,
          price: dbVoucher.price,
          serials: v.serials.map(code => ({
            code,
            redeemedAt: new Date()
          }))
        });
      }
    }

    await user.save();

    res.json({ message: "Redeemed successfully", points: user.points });
  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


const Voucher = require('./models/Voucher'); // Create this model

// Get all vouchers
app.get('/voucher', async (req, res) => {
  try {
    const vouchers = await Voucher.find({});
    res.json(vouchers);
  } catch (err) {
    console.error('Error fetching vouchers:', err);
    res.status(500).json({ message: 'Failed to fetch vouchers' });
  }
});

const Redeemed = require('./models/Redeemed'); // ✅ import the model

// Redeemed vouchers (bulk)
app.post('/redeemed', async (req, res) => {
  const { vouchers } = req.body;

  try {
    const redeemedResults = [];

    for (const v of vouchers) {
      const { id: voucherId, name, category, serials } = v;

      // Push new serials into existing document, or create if not exists
      const redeemedDoc = await Redeemed.findOneAndUpdate(
        { voucherId },                         // match by voucherId
        { 
          $setOnInsert: { name, category },    // set name/category if new
          $addToSet: { redeemedSerials: { $each: serials } } // avoid duplicates
        },
        { upsert: true, new: true }
      );

      redeemedResults.push(redeemedDoc);
    }

    res.json({ message: "Redeemed vouchers saved successfully", redeemed: redeemedResults });
  } catch (err) {
    console.error("Redeemed error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
