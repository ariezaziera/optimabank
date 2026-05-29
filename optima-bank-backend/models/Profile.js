import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));

    if (savedUser) {
      // ✅ normalize id (in case passport stored "id" instead of "_id")
      savedUser._id = savedUser._id || savedUser.id;

      setUser(savedUser);
      setFormData(savedUser);
      setUserId(savedUser._id);

      // ✅ fetch latest data from backend using _id
      const fetchUserProfile = async () => {
        try {
          const res = await fetch(`http://:5000/profile/${savedUser._id}`);
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            setFormData(data);
          } else {
            console.error("Failed to fetch profile");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };

      fetchUserProfile();
    }
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setFormData(user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://:5000/profile/update/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setFormData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // ✅ keep localStorage in sync
        setIsEditing(false);
      } else {
        console.error("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div>
      <Navbar user={user} handleLogout={handleLogout} />
      <div className="profile-container">
        <h1>Profile</h1>
        {user ? (
          <div className="profile-details">
            {isEditing ? (
              <div className="edit-form">
                <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} />
                <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} />
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} />
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} />
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
            ) : (
              <div className="view-mode">
                <p><strong>First Name:</strong> {user.firstName}</p>
                <p><strong>Last Name:</strong> {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {user.address || 'N/A'}</p>
                <button onClick={handleEdit}>Edit Profile</button>
              </div>
            )}
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
