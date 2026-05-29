// src/Page/Cart.js
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import "../index.css";
import Barcode from "react-barcode";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [redeemedVouchers, setRedeemedVouchers] = useState([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // ✅ Environment variables
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const frontendURL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

const toBase64 = (url) =>
  fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

const generateBarcodeBase64 = (text) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, { format: "CODE128", width: 2, height: 50 });
  return canvas.toDataURL("image/png");
};

const exportClaimedVouchersPDF = async (claimedVouchers) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(40, 40, 90);
  doc.text("Your Redeemed Vouchers", 14, 20);

  let y = 30;

  for (let i = 0; i < claimedVouchers.length; i++) {
    const v = claimedVouchers[i];
    const imgBase64 = v.image ? await toBase64(v.image) : null;
    const barcodeBase64 = v.serial ? generateBarcodeBase64(v.serial) : null;

    // 🟡 Card background with light fill
    doc.setFillColor(255, 255, 255); // light pastel
    doc.setDrawColor(200, 200, 200); // soft border
    doc.roundedRect(10, y, 190, 67, 5, 5, "FD"); // Fill + Draw

    // 🖼️ Voucher Image
    if (imgBase64) {
      doc.addImage(imgBase64, "JPEG", 14, y + 8, 40, 40);
    }

    // 📋 Voucher details
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.text(v.name, 60, y + 15); // Title bold
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Category: ${v.category}`, 60, y + 25);
    doc.text(`Price: ${v.price} pts`, 60, y + 33);

    // 📦 Barcode (highlighted section)
    if (barcodeBase64) {
      doc.addImage(barcodeBase64, "PNG", 60, y + 45, 90, 20);
    }

    // Move Y for next card
    y += 78;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }
  }

  doc.save("claimed-vouchers.pdf");
};

  const handleQuantityChange = (id, quantity) => {
    const newCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.min(quantity, 3) } : item
    );
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      const res = await fetch(`${backendURL}/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        localStorage.removeItem("user");
        window.location.href = frontendURL;
      } else console.error("Logout failed:", await res.json());
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setSelectedItems((prev) => prev.filter((sid) => sid !== id));
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ✅ Select All toggle
  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  // ✅ Generate unique serial tied to voucher globally
  const generateSerial = (voucher) => {
    const prefixes = {
      Clothing: "CLTH",
      Food: "FOOD",
      Handbag: "HDBG",
      Shoes: "SHOE",
    };
    const prefix = prefixes[voucher.category] || "GEN";

    const baseCode = (voucher.id || voucher.name)
      .toUpperCase()
      .replace(/\s+/g, "")
      .substr(0, 5);

    const uniquePart = Math.random().toString(36).substr(2, 5).toUpperCase();

    return `${prefix}-${baseCode}-${uniquePart}`;
  };

  // ✅ Helper: calculate total cost
  const getTotalCost = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      );
  };

  const handleBulkRedeem = async () => {
    if (!user) return alert("Please login first");
    if (selectedItems.length === 0) return alert("No vouchers selected");

    const vouchersToRedeem = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    const totalCost = getTotalCost();
    if (user.points < totalCost) {
      return alert(
        `Not enough points! You need ${totalCost}, but you only have ${user.points}.`
      );
    }

    const redeemedVouchersList = [];
    const vouchersForBackend = vouchersToRedeem.map((item) => {
      const serials = Array.from(
        { length: item.quantity || 1 },
        () => generateSerial(item)
      );

      serials.forEach((s) => {
        redeemedVouchersList.push({
          ...item,
          serial: s,
          redeemedAt: new Date(),
        });
      });

      return {
        _id: item._id,
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity || 1,
        serials,
      };
    });

    setRedeemedVouchers(redeemedVouchersList);
    setShowVoucherModal(true);

    try {
      const resStock = await fetch(`${backendURL}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          vouchers: vouchersForBackend,
        }),
      });

      const dataStock = await resStock.json();
      if (!resStock.ok)
        return alert(dataStock.message || "Error updating stock");

      const resRedeemed = await fetch(`${backendURL}/redeemed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          vouchers: vouchersForBackend,
        }),
      });

      const dataRedeemed = await resRedeemed.json();
      if (!resRedeemed.ok)
        return alert(dataRedeemed.message || "Error saving redeemed vouchers");

      // ✅ Clear cart
      const updatedCart = cartItems.filter(
        (item) => !selectedItems.includes(item.id)
      );
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setSelectedItems([]);

      if (dataStock.points) {
        const updatedUser = { ...user, points: dataStock.points };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while redeeming vouchers.");
    }
  };

  return (
    <>
      {/* ✅ Navbar hidden in print */}
      <div className="no-print">
        <Navbar user={user} handleLogout={handleLogout} />
      </div>

      <div className="pt-28 px-6 max-w-6xl mx-auto min-h-screen mb-10">
        <h2 className="text-4xl font-extrabold mb-10 text-center text-cyan-950 tracking-tight">
          🛒 Your Cart
        </h2>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="text-xl">Your cart is still empty.</p>
            <p className="text-sm mt-2">Go add some vouchers 😉</p>
          </div>
        ) : (
          <>
            {/* ✅ Select All Checkbox */}
            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.length === cartItems.length}
                onChange={handleSelectAll}
                className="w-5 h-5 accent-green-600"
              />
              <span className="text-gray-700 font-medium">Select All</span>
            </div>

            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-100 shadow-lg rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-6">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleCheckboxChange(item.id)}
                      className="w-5 h-5 accent-green-600"
                    />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl border"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Category: {item.category}
                      </p>
                      <p className="text-sm font-medium text-cyan-700">
                        Points per unit: {item.price}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <label className="text-sm text-gray-600">
                          Quantity:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          value={item.quantity || 1}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-20 border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleBulkRedeem}
                disabled={
                  selectedItems.length === 0 ||
                  !user ||
                  user.points < getTotalCost()
                }
                className={`px-8 py-3 rounded-2xl text-lg font-semibold transition 
                  ${
                    selectedItems.length === 0 ||
                    !user ||
                    user.points < getTotalCost()
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                 Redeem Now
              </button>

              {user &&
                selectedItems.length > 0 &&
                user.points < getTotalCost() && (
                  <p className="text-sm text-red-500 mt-2">
                    Not enough points. You need {getTotalCost()} points but only
                    have {user.points}.
                  </p>
                )}
            </div>
          </>
        )}
      </div>

      {/* ✅ Voucher Popup Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center overflow-auto pt-14 px-4">
          <div className="bg-white p-4 sm:p-6 md:px-12 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
              🎟️ Your Redeemed Vouchers
            </h2>

            {(() => {
              const grouped = {};
              redeemedVouchers.forEach((v) => {
                if (!grouped[v.name]) {
                  grouped[v.name] = { ...v, serials: [] };
                }
                grouped[v.name].serials.push(v.serial);
              });

              const groupedVouchers = Object.values(grouped);

              return (
                <div className="voucher-grid flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4">
                  {groupedVouchers.map((v, i) => (
                    <div
                      key={i}
                      className="voucher-card border p-3 sm:p-4 rounded-lg shadow flex flex-col sm:flex-row w-full sm:min-w-[280px] sm:max-w-[500px] gap-4"
                    >
                      {/* Image */}
                      <div className="flex-shrink-0 flex justify-center sm:justify-start">
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="voucher-title font-semibold text-base sm:text-lg mb-2">
                          {v.name} (x{v.serials.length})
                        </h3>

                        <div className="text-xs sm:text-sm text-gray-700 space-y-1 mb-3">
                          <p>
                            <span className="font-semibold">Points:</span> {v.price}
                          </p>
                          {v.description && (
                            <p>
                              <span className="font-semibold">Description:</span>{" "}
                              {v.description}
                            </p>
                          )}
                          {v.terms && (
                            <p>
                              <span className="font-semibold">T&amp;C:</span>{" "}
                              {v.terms}
                            </p>
                          )}
                        </div>

                        {/* Barcodes */}
                        <div className="voucher-details grid grid-cols-2 gap-2 max-h-28 overflow-y-auto p-2 place-items-center">
                          {v.serials.map((s, j) => (
                            <div key={j}>
                              <Barcode value={s} width={1.5} height={50} fontSize={12} />
                            </div>
                          ))}
                        </div>


                        <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                          Claimed at: {new Date(v.redeemedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ✅ Buttons hidden in print */}
            <div className="no-print text-center mt-6 space-x-2">
              <button
                onClick={() => exportClaimedVouchersPDF(redeemedVouchers)}
                className="bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
