"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

export default function ChangePasswordPrompt({ user }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // for cancel button

  if (!user?.mustChangePassword || !isVisible) return null;

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (newPassword !== confirmPassword)
    return toast.error("Passwords do not match");

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      "https://admin-panel-backend-alpha.vercel.app/user/change-password",
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Password changed successfully!");

    // ✅ Update localStorage user object — set mustChangePassword to false
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      storedUser.mustChangePassword = false;
      localStorage.setItem("user", JSON.stringify(storedUser));
    }

    // ✅ Close the modal instead of reloading
    setIsVisible(false);
  } catch (err) {
    toast.error(err.response?.data?.msg || "Failed to change password");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 🔹 Background blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/40"></div>

      {/* 🔹 Modal box */}
      <div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md z-[110]">
        {/* ❌ Cancel button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-red-600 text-lg"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          For security reasons, please change your password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Old Password"
              className="w-full border rounded-lg px-3 py-2 pr-10"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {showOld ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              className="w-full border rounded-lg px-3 py-2 pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              className="w-full border rounded-lg px-3 py-2 pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
