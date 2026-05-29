// src/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Navbar from '../Navbar';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  // ✅ Environment variable
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  console.log("Backend URL:", backendURL);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        const user = data.user;
        localStorage.setItem('user', JSON.stringify(user));
        alert('Login successful!');
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <Navbar />

      <div className="flex w-full max-w-6xl mx-auto mt-24 gap-16 px-6">
        {/* Left Info Panel */}
        <div className="hidden md:flex flex-col justify-center flex-1 text-white text-left pr-56 pl-10 p-15">
          <h1 className="text-6xl font-extrabold mb-6">Online Banking</h1>
          <p className="text-lg text-gray-100 leading-relaxed">
            Your trusted partner in online banking, keeping your money safe while making everyday banking simple and convenient. Also earn reward points with every transaction and redeem them for exclusive vouchers.
          </p>
        </div>

        {/* Right Login Form */}
        <div className="w-full md:w-96 p-8 rounded-3xl shadow-lg bg-[rgba(3,49,66,0.6)]">
          <h2 className="text-white text-3xl font-bold text-center mb-6">Login</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full p-3 pl-5 rounded-3xl border-2 border-white bg-transparent text-white placeholder-white outline-none focus:ring-2 focus:ring-white"
              onChange={handleChange}
              value={formData.username}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full p-3 pl-5 pr-12 rounded-3xl border-2 border-white bg-transparent text-white placeholder-white outline-none focus:ring-2 focus:ring-white"
                onChange={handleChange}
                value={formData.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm underline text-white hover:text-gray-200">
                Forgot Password?
              </Link>
            </div>
            <button type="submit" className="w-3/4 mx-auto block bg-white text-black font-bold py-2 rounded-full">
              Login
            </button>
          </form>

          {/* ✅ Single Google login button */}
          <div className="mt-4 flex flex-col gap-3">
            <a href={`${backendURL}/auth/google`}>
              <button className="w-3/4 mx-auto bg-white text-black font-bold py-2 rounded-full flex items-center justify-center gap-2">
                <FcGoogle size={20} />
                Continue with Google
              </button>
            </a>
          </div>

          <p className="text-center text-white mt-4">
            Don’t have an account?{' '}
            <Link to="/signup" className="underline text-white hover:text-gray-200">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
