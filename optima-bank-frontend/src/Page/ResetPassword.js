// src/pages/ResetPassword.js
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AuthLayout from '../AuthLayout';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // ✅ Environment variables
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendURL}/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Error resetting password.');
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-white text-3xl font-bold text-center mb-6">
        Reset Your Password
      </h2>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-700 text-white p-2 rounded"
        >
          Reset Password
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
