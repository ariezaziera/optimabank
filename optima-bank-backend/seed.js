const mongoose = require('mongoose');
const User = require('./models/User');
const Voucher = require('./models/Voucher');
const Redeemed = require('./models/Redeemed');

require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // User (upsert)
    await User.updateOne(
      { email: "arieza@example.com" },
      {
        $set: {
          firstName: "Arieza",
          lastName: "Test",
          password: "hashedpassword", // nanti tukar ke bcrypt hash
          points: 500,
          rewards: []
        }
      },
      { upsert: true }
    );

    // Vouchers (insertMany dengan upsert)
    const vouchers = [
      { id: "V001", name: "Urban Checked Shirt", price: 150, image: "1.png", category: "Fashion", description: "Trendy checked shirt for casual wear", terms: "Valid for 6 months", available: 20 },
      { id: "V002", name: "Crispy Fried Chicken Feast", price: 80, image: "2.png", category: "Food", description: "Delicious fried chicken meal set", terms: "Valid for 3 months", available: 50 },
      { id: "V003", name: "Trendy Sling Bag", price: 120, image: "3.png", category: "Fashion", description: "Stylish sling bag for everyday use", terms: "Valid for 6 months", available: 15 },
      { id: "V004", name: "Pro Sport Shoes", price: 250, image: "4.png", category: "Sports", description: "Comfortable sport shoes for training", terms: "Valid for 6 months", available: 10 },
      { id: "V005", name: "Classic Black & White Tee", price: 90, image: "5.png", category: "Fashion", description: "Minimalist black and white t-shirt", terms: "Valid for 6 months", available: 30 },
      { id: "V006", name: "Cozy Hoodie Collection", price: 180, image: "6.png", category: "Fashion", description: "Warm and stylish hoodie", terms: "Valid for 6 months", available: 25 },
      { id: "V007", name: "Refreshing Soft Drinks Pack", price: 40, image: "7.png", category: "Food", description: "Pack of refreshing soft drinks", terms: "Valid for 3 months", available: 100 },
      { id: "V008", name: "Deluxe Burger Set", price: 70, image: "8.png", category: "Food", description: "Burger set with fries and drink", terms: "Valid for 3 months", available: 60 },
      { id: "V009", name: "Elegant Handbag", price: 300, image: "9.png", category: "Fashion", description: "Elegant handbag for special occasions", terms: "Valid for 6 months", available: 12 },
      { id: "V010", name: "Premium Men’s Wallet", price: 200, image: "10.png", category: "Fashion", description: "High-quality leather men’s wallet", terms: "Valid for 6 months", available: 18 },
      { id: "V011", name: "Streetwear Sneakers", price: 220, image: "11.png", category: "Fashion", description: "Trendy sneakers for casual wear", terms: "Valid for 6 months", available: 15 },
      { id: "V012", name: "Stylish Ladies Sandals", price: 160, image: "12.png", category: "Fashion", description: "Comfortable and stylish sandals", terms: "Valid for 6 months", available: 20 },
    ];

    for (const v of vouchers) {
      await Voucher.updateOne({ id: v.id }, { $set: v }, { upsert: true });
    }

    // Redeemed (upsert)
    await Redeemed.updateOne(
      { voucherId: "V001" },
      {
        $set: {
          name: "Shopping Voucher",
          category: "Shopping",
          redeemedSerials: ["ABC123"]
        }
      },
      { upsert: true }
    );

    console.log("✅ Seed data inserted/updated!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

seed();
