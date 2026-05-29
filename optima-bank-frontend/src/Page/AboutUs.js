// src/Page/AboutUs.js
import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import {
  FaInfoCircle, FaBullseye, FaEye, FaLightbulb,
  FaShieldAlt, FaUsers, FaDollarSign,
  FaUserTie, FaChalkboardTeacher, FaUserGraduate
} from 'react-icons/fa';

const sections = [
  {
    title: 'Who We Are',
    icon: <FaInfoCircle className="w-10 h-10" />,
    content: `Optima Bank is a next-generation digital bank committed to redefining the way you manage your finances. Founded with the belief that financial literacy and savings should be accessible to everyone, we strive to make banking simpler, safer, and more rewarding.`
  },
  {
    title: 'Our Mission',
    icon: <FaBullseye className="w-10 h-10" />,
    content: `To provide a seamless and secure banking experience that encourages smart financial habits, empowers customers to save, and supports them in achieving their financial goals.`
  },
  {
    title: 'Our Vision',
    icon: <FaEye className="w-10 h-10" />,
    content: `To become the most trusted and innovative digital bank in the region, enabling every individual to take control of their financial journey with confidence.`
  }
];

const values = [
  { title: 'Integrity', description: 'We build trust through transparency and honesty.', icon: <FaShieldAlt className="w-10 h-10" /> },
  { title: 'Innovation', description: 'We embrace technology to deliver smarter banking.', icon: <FaLightbulb className="w-10 h-10" /> },
  { title: 'Customer First', description: 'We design everything with you in mind.', icon: <FaUsers className="w-10 h-10" /> },
  { title: 'Financial Wellness', description: 'We promote smart saving and spending habits.', icon: <FaDollarSign className="w-10 h-10" /> },
];

const boardMembers = [
  { name: 'Wan Arif', role: 'Board Member', icon: <FaUserTie className="w-10 h-10" /> },
  { name: 'Arieza Aziera', role: 'Board Member', icon: <FaUserTie className="w-10 h-10" /> },
  { name: 'Nurfatin Nadhirah', role: 'Board Member', icon: <FaUserTie className="w-10 h-10" /> },
  { name: 'Alis Aqilah', role: 'Board Member', icon: <FaUserTie className="w-10 h-10" /> },
  { name: 'Anita', role: 'Board Member', icon: <FaUserTie className="w-10 h-10" /> },
];

const trainerAndTA = [
  { name: 'Dr. Nin Hayati', role: 'Trainer', icon: <FaChalkboardTeacher className="w-10 h-10" /> },
  { name: 'Ayumazlan', role: 'Teaching Assistant', icon: <FaUserGraduate className="w-10 h-10" /> },
];

export default function AboutUs() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    // 🔹 Auto-detect environment
    const isLocalhost = window.location.hostname === "localhost";

    // 🔹 Backend + frontend URLs
    const backendURL = isLocalhost
      ? "http://localhost:5000" // local backend
      : "https://optimabank-gift1.onrender.com"; // production backend

    const frontendURL = isLocalhost
      ? "http://localhost:3000" // local frontend
      : "https://optimabank-gift.vercel.app"; // production frontend

    try {
      const res = await fetch(`${backendURL}/logout`, {
        method: "GET",
        credentials: "include", // keeps session cookies
      });

      if (res.ok) {
        localStorage.removeItem("user");
        window.location.href = frontendURL;
      } else {
        const errorData = await res.json();
        console.error("Logout failed:", errorData);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar user={user} handleLogout={handleLogout} />

      <div className="relative max-w-6xl mx-auto px-6 py-24 z-10">
        <div className="bg-white bg-opacity-90 backdrop-blur-md p-10 rounded-3xl shadow-2xl">

          {/* Header */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center ...">
            About Us
          </h1>
          <p className="text-center text-gray-600 text-xl mb-14 italic animate-fade-in">
            Empowering your financial future — <span className="text-green-700 font-semibold">smart</span>, <span className="text-green-600 font-semibold">simple</span>, <span className="text-green-500 font-semibold">secure</span>.
          </p>

          {/* Core Sections */}
          <div className="grid gap-8 md:grid-cols-3 mb-20">
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg bg-gradient-to-br from-green-50 to-white text-center transform transition-all hover:shadow-2xl hover:-translate-y-2 duration-300 animate-fade-in"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white mx-auto mb-5 shadow-lg hover:scale-110 transition-transform">
                  {sec.icon}
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-3 tracking-wide">{sec.title}</h2>
                <p className="text-gray-700 leading-relaxed">{sec.content}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <section className="mb-20 mt-5">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-10">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((val, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-gradient-to-br from-green-100 to-white text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${0.8 + idx * 0.2}s` }}
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white mx-auto mb-4 shadow-md hover:scale-110 transition-transform">
                    {val.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-green-700">{val.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">{val.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Story Section */}
          <section className="relative mb-20 rounded-3xl overflow-hidden shadow-xl animate-fade-in" style={{ animationDelay: `1.8s` }}>
            <img src="/bg-bank.png" alt="Our Story" className="w-full h-72 object-cover filter brightness-50" />
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center text-white">
              <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">Our Story</h2>
              <p className="max-w-3xl text-lg italic leading-relaxed">
                “Optima Bank was born out of a simple realization: people want more control over their money, but traditional banking often falls short. Saving should be rewarding.”
              </p>
            </div>
          </section>

          {/* Board Members */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-10">Board of Organization</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {boardMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="w-full sm:w-[45%] lg:w-[30%] p-6 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg text-center transform transition-all hover:shadow-2xl hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${2.2 + idx * 0.2}s` }}
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white mx-auto mb-4 shadow-md hover:scale-110 transition-transform">
                    {member.icon}
                  </div>
                  <h3 className="text-xl font-bold text-green-800">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>

          </section>

          {/* Trainer & TA */}
          <section>
            <h2 className="text-3xl font-bold text-center text-green-700 mb-10">Trainer & Teaching Assistant</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {trainerAndTA.map((person, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg text-center transform transition-all hover:shadow-2xl hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${3.0 + idx * 0.2}s` }}
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white mx-auto mb-4 shadow-md hover:scale-110 transition-transform">
                    {person.icon}
                  </div>
                  <h3 className="text-xl font-bold text-green-800">{person.name}</h3>
                  <p className="text-gray-600">{person.role}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
