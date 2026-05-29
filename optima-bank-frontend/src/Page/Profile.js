import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    gender: "",
    language: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    address: "",
    postcode: "",
    country: "",
    payment: "",
    profileImage: null,
  });

  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  // ✅ Environment variables
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const frontendURL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) return;
    setUser(savedUser);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${backendURL}/profile/${savedUser._id}`);
        const data = await res.json();

        if (data) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            birthMonth: new Date(data.dob).getMonth() + 1,
            birthDay: new Date(data.dob).getDate(),
            birthYear: new Date(data.dob).getFullYear(),
          }));
          setUserId(savedUser._id);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchProfile();
  }, [backendURL]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      const res = await fetch(`${backendURL}/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        localStorage.removeItem("user");
        window.location.href = frontendURL;
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profileImage: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const updatedData = { ...formData };
      if (formData.birthYear && formData.birthMonth && formData.birthDay) {
        updatedData.dob = new Date(
          `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`
        ).toISOString();
      }

      const form = new FormData();
      for (const key in updatedData) {
        if (key !== "profileImage") {
          form.append(key, updatedData[key]);
        }
      }

      if (formData.profileImage instanceof File) {
        form.append("profileImage", formData.profileImage);
      }

      const res = await fetch(`${backendURL}/profile/update/${userId}`, {
        method: "PUT",
        body: form,
      });

      if (res.ok) {
        alert("Profile updated!");
      } else {
        const errData = await res.json();
        alert(errData.message || "Update failed");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div
      className="min-h-screen pt-24 bg-cover bg-center"
      style={{ backgroundImage: "url('/bgprofile.png')" }}
    >
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-10 bg-white shadow">
        <Navbar user={user} handleLogout={handleLogout} />
      </div>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-4 pb-24 sm:mb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Profile <span className="text-gray-400 font-normal">→ Edit</span>
          </h2>
          <button
            className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800 transition px-6 py-3 rounded-xl text-white font-semibold shadow-md"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-cyan-950/50 backdrop-blur-lg rounded-3xl shadow-xl p-5 sm:p-24 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-8">
            <div className="relative">
              <img
                src={
                  imagePreview ||
                  (formData.profileImage
                    ? formData.profileImage.startsWith("/uploads")
                      ? `${backendURL}${formData.profileImage}`
                      : formData.profileImage
                    : "/default-profile.png")
                }
                alt="User"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-cyan-600 shadow-lg"
              />
              <label className="absolute bottom-2 right-2 bg-cyan-700 hover:bg-cyan-800 px-3 py-1 rounded-full text-xs cursor-pointer shadow-md">
                Upload
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-sm sm:text-lg font-semibold">User ID: {userId}</p>
              {user && (
                <div className="flex flex-col sm:flex-row sm:items-start justify-center sm:justify-start gap-2 sm:gap-3">
                  <span className="text-sm sm:text-lg font-semibold text-gray-200 mt-3">
                    Points:
                  </span>
                  <span className="text-5xl sm:text-6xl md:text-8xl font-extrabold text-cyan-200 drop-shadow-lg leading-none">
                    {user.points}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: "firstName", label: "First Name" },
              { id: "lastName", label: "Last Name" },
              { id: "username", label: "Username" },
              { id: "password", label: "Password", type: "password" },
              { id: "email", label: "Email" },
              { id: "phone", label: "Phone" },
            ].map(({ id, label, type }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-sm mb-1 font-medium text-gray-200"
                >
                  {label}
                </label>
                <input
                  id={id}
                  name={id}
                  type={type || "text"}
                  placeholder={label}
                  value={formData[id]}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-cyan-500 bg-cyan-900/50 text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 outline-none"
                />
              </div>
            ))}

            {/* Gender */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-200">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-cyan-500 bg-cyan-900/50 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Birth Date */}
            <div className="col-span-2">
              <label className="block text-sm mb-1 font-medium text-gray-200">
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-3">
                <select
                  name="birthMonth"
                  value={formData.birthMonth}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-cyan-500 bg-cyan-900/50 text-white focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  name="birthDay"
                  value={formData.birthDay}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-cyan-500 bg-cyan-900/50 text-white focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-cyan-500 bg-cyan-900/50 text-white focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => (
                    <option key={i} value={2025 - i}>
                      {2025 - i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
