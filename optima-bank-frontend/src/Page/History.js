import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import Swal from "sweetalert2";

export default function History() {
  const [redeemedVouchers, setRedeemedVouchers] = useState([]);
  const [user, setUser] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const frontendURL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);

      // ✅ Declare fetchRedeemed inside useEffect
      const fetchRedeemed = async () => {
        try {
          const res = await fetch(`${backendURL}/redeemed/${savedUser._id}`);
          const data = await res.json();
          setRedeemedVouchers(data || []);
        } catch (err) {
          console.error('Failed to fetch history:', err);
        }
      };

      fetchRedeemed();
    }
  }, [backendURL]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${backendURL}/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        localStorage.removeItem("user");
        window.location.href = frontendURL;
      } else {
        console.error("Logout failed:", await res.json());
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <Navbar user={user} handleLogout={handleLogout} />
      <div className="pt-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Redeem History</h2>

        {redeemedVouchers.length === 0 ? (
          <p className="text-gray-600 text-center">No vouchers have been redeemed.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {redeemedVouchers.map((voucher, idx) => {
              const latestRedeem =
                voucher.serials?.length > 0
                  ? voucher.serials[voucher.serials.length - 1].redeemedAt
                  : null;

              return (
                <div key={idx} className="bg-white rounded-xl shadow p-4">
                  <img
                    src={voucher.image}
                    alt={voucher.name}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-semibold">{voucher.name}</h3>
                  <p className="text-sm text-gray-600">Price: {voucher.price} pts</p>
                  {latestRedeem && (
                    <p className="text-sm text-gray-500">
                      Latest Claim: {new Date(latestRedeem).toLocaleString()}
                    </p>
                  )}

                  <button
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  >
                    {openIndex === idx ? "Hide Details" : "View Details"}
                  </button>

                  {openIndex === idx && (
                    <div className="mt-3 border-t pt-2 text-sm">
                      <p className="font-semibold mb-2">Serial Codes:</p>
                      <ul className="space-y-1">
                        {voucher.serials?.map((s, sIdx) => (
                          <li key={sIdx} className="flex justify-between">
                            <span className="font-mono">{s.serial || s.code}</span>
                            <span className="text-gray-500">
                              {s.redeemedAt ? new Date(s.redeemedAt).toLocaleString() : "—"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
