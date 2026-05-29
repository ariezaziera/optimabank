# 🌟 Optima Bank Rewards System

Optima Bank is a web application for a customer rewards system. Built with **React (frontend)**, **Node.js + Express (backend)**, and **MongoDB Atlas (database)**, it allows users to log in, view their profile, collect points, and redeem attractive vouchers.

---

## ✨ Features
- 🔐 User authentication (login/register)
- 👤 Profile with points & rewards
- 🎁 Voucher redemption system
- 🖼️ Voucher images (1.png – 12.png stored in `frontend/public`)
- ⚡ Seed script to populate database with sample data

---

## 📂 Project Structure
```
optima-bank-backend/
  ├── models/
  │   ├── User.js
  │   ├── Voucher.js
  │   └── Redeemed.js
  ├── seed.js
  └── server.js

optima-bank-frontend/
  ├── public/
  │   ├── 1.png
  │   ├── 2.png
  │   └── ... 12.png
  └── src/
      ├── components/
      ├── pages/
      └── App.js
```

---

## ⚙️ Setup Guide

### 🔧 Backend
1. Add your MongoDB Atlas connection string in `.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/optimabank
   ```
2. Install dependencies:
   ```bash
   cd optima-bank-backend
   npm install
   ```
3. Run seed script to populate sample data:
   ```bash
   node seed.js
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 🎨 Frontend
1. Install dependencies:
   ```bash
   cd optima-bank-frontend
   npm install
   ```
2. Start the React app:
   ```bash
   npm start
   ```
3. The frontend will fetch voucher images directly from the `public` folder.

---

## 🌐 Deployment
- **Frontend** → Deploy to Vercel  
- **Backend** → Deploy to Render or Railway  
- Ensure `.env` in backend points to your MongoDB Atlas cluster.  
- Update frontend `.env` with backend API URL:
  ```
  REACT_APP_API_URL=https://your-backend-url.com
  ```

---

## 🎁 Voucher List
- Urban Checked Shirt 👕  
- Crispy Fried Chicken Feast 🍗  
- Trendy Sling Bag 🎒  
- Pro Sport Shoes 👟  
- Classic Black & White Tee 👕  
- Cozy Hoodie Collection 🧥  
- Refreshing Soft Drinks Pack 🥤  
- Deluxe Burger Set 🍔  
- Elegant Handbag 👜  
- Premium Men’s Wallet 👛  
- Streetwear Sneakers 👟  
- Stylish Ladies Sandals 👡  

---

## 👤 Author
Developed with ❤️ by **Arieza**
