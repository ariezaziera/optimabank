// src/Page/Voucher.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar';

const Voucher = () => {
  const location = useLocation();
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Environment variables
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const frontendURL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch(`${backendURL}/voucher`);
        const data = await res.json();
        setVouchers(data);

        const params = new URLSearchParams(location.search);
        const categoryFromUrl = params.get('category');

        if (categoryFromUrl && categoryFromUrl !== 'All') {
          setSelectedCategory(categoryFromUrl);
          setFilteredVouchers(data.filter(v => v.category === categoryFromUrl));
        } else {
          setFilteredVouchers(data);
        }
      } catch (err) {
        console.error("Failed to fetch vouchers:", err);
      }
    };
    fetchVouchers();
  }, [location.search, backendURL]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterVouchers(searchTerm, category);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterVouchers(value, selectedCategory);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      const res = await fetch(`${backendURL}/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        localStorage.removeItem('user');
        window.location.href = frontendURL;
      } else {
        console.error('Logout failed:', await res.json());
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const filterVouchers = (search, category) => {
    let result = vouchers;
    if (category !== 'All') result = result.filter(v => v.category === category);
    if (search.trim() !== '') {
      result = result.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredVouchers(result);
  };

  const addToCart = (voucher) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const exists = cart.find(item => item.id === voucher.id);
    if (exists) {
      alert('This voucher is already in the cart.');
      return;
    }
    cart.push({ ...voucher, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Voucher added to cart!');
    setSelectedVoucher(null);
  };

  const categories = ['All', 'Clothing', 'Food', 'Handbag', 'Shoes'];

  return (
    <>
      <Navbar user={user} handleLogout={handleLogout} />

      <div className="max-w-6xl mx-auto p-4 mt-24">
        {/* Page Title */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-cyan-950 tracking-wide">
          Available Vouchers
        </h2>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-cyan-950 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search vouchers..."
            className="w-full md:w-1/3 px-4 py-3 rounded-lg shadow-md shadow-cyan-900/40 border border-gray-200 
               focus:outline-none focus:ring-2 focus:ring-cyan-950 placeholder-gray-400 transition-all duration-200"
          />
        </div>

        {/* Voucher Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredVouchers.map(voucher => (
            <div
              key={voucher._id || voucher.id}
              className={`bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between 
                          hover:shadow-2xl hover:shadow-cyan-900/40 transform hover:-translate-y-1 
                          transition-all duration-300 ${
                            voucher.available === 0 ? 'opacity-50 pointer-events-none' : ''
                          }`}
            >
              {/* Top Section: Image + Info */}
              <div>
                <img
                  src={voucher.image}
                  alt={voucher.name}
                  onClick={() => setSelectedVoucher(voucher)}
                  className="w-full aspect-square object-cover rounded-xl mb-4 cursor-pointer hover:scale-105 transition-transform duration-300"
                />
                <h3 className="text-xl font-bold text-cyan-950 mb-1">{voucher.name}</h3>
                <p className="text-sm text-gray-500 mb-1">Category: {voucher.category}</p>
                <p className="text-gray-700 font-medium mb-1">Price: {voucher.price} pts</p>
                <p className="text-red-600 font-semibold">Available: {voucher.available}</p>
              </div>

              {/* Bottom Section: Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSelectedVoucher(voucher)}
                  disabled={voucher.available === 0}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200 ${
                    voucher.available === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {voucher.available === 0 ? 'Unavailable' : 'Details'}
                </button>
                <button
                  onClick={() => addToCart(voucher)}
                  disabled={voucher.available === 0}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200 ${
                    voucher.available === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] md:w-[80%] max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-5 text-gray-500 hover:text-gray-900 text-lg"
            >
              ✕
            </button>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
              {/* Left: Image */}
              <div className="flex justify-center items-center">
                <img
                  src={selectedVoucher.image}
                  alt={selectedVoucher.name}
                  className="w-full max-w-sm h-auto object-cover rounded-xl shadow-md"
                />
              </div>

              {/* Right: Details */}
              <div className="flex flex-col md:pl-6">
                <h2 className="text-2xl font-bold mb-3 text-cyan-950">
                  {selectedVoucher.name}
                </h2>
                <p className="text-gray-500 mb-1">Category: {selectedVoucher.category}</p>
                <p className="mb-2 font-semibold text-gray-700">
                  Price: {selectedVoucher.price} pts
                </p>
                <p className="text-gray-600 mb-3">
                  <strong>Description:</strong> {selectedVoucher.description}
                </p>
                <p className="text-gray-600 mb-6">
                  <strong>Terms & Conditions:</strong> {selectedVoucher.terms}
                </p>

                <div className="mt-auto">
                  <button
                    onClick={() => addToCart(selectedVoucher)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full font-semibold transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Voucher;
