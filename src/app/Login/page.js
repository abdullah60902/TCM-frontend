'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ State for toggle
const [showForgot, setShowForgot] = useState(false);
const [forgotEmail, setForgotEmail] = useState('');

  const { login, setUser } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post('https://admin-panel-backend-alpha.vercel.app/user/login', {
        email,
        password,
      });

      if (res.status === 200) {
        const { token, user } = res.data;
        setUser({
          ...user,
          clients: user.clients || []
        });
        console.log('user', user.clients);

        login(token, user);
        setMsg('Login successful!');
        toast.success(res.data.msg);

        setTimeout(() => {
          router.push('/Dashboard');
        }, 200);
      }
    } catch (err) {
      setLoginError(true);
      setMsg(err.response?.data?.msg || 'Login failed');
      toast.error(err.response?.data?.msg || 'Login failed');
      setIsLoading(false);
    }
  };
 const handleForgotPassword = async () => {
  if (!forgotEmail) {
    toast.error("Please enter your email");
    return;
  }

  setIsLoading(true); // ⏳ Start loader
  try {
    const res = await axios.post("https://admin-panel-backend-alpha.vercel.app/user/forgot-password", { email: forgotEmail });
    toast.success(res.data.msg || "Check your email for new password");
    setShowForgot(false);
    setForgotEmail('');
  } catch (err) {
    toast.error(err.response?.data?.msg || "Something went wrong");
  } finally {
    setIsLoading(false); // ✅ Stop loader
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111827] px-4">
      {/* Login Form */}
      <div className="w-full max-w-md">
        <div className="bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Care Home Management</h2>
            <p className="text-gray-400 mt-2">Sign in to your account</p>
          </div>

         <form onSubmit={handleLogin}>
  {!showForgot ? (
    // 🔹 Login Form
    <>
      {/* Email Field */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      {/* Password Field */}
      <div className="mb-2 relative">
        <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
          Password
        </label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-300 bg-gray-700 border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 cursor-pointer top-9 text-gray-400 hover:text-white"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Forgot Password Button */}
      <div className="flex items-center justify-end mb-4">
        <button
          type="button"
          onClick={() => setShowForgot(true)}
          className="text-sm cursor-pointer text-[#ffffff] hover:text-[#474588] hover:underline"
        >
          Forgot Password
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center cursor-pointer items-center bg-[#4b4aac] hover:bg-[#474588] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          isLoading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Logging in..." : "Sign In"}
      </button>


      <p className="text-gray-300"> Hint: Use email {`"`}mds@gmail.com{`"`} and password {`"`}mdssupport{`"`} </p>
    </>
  ) : (
    // 🔹 Forgot Form
    <>
    {/* 🔹 Forgot Password Form */}
<>
  <div className="mb-4">
    <label htmlFor="forgotEmail" className="block text-gray-300 text-sm font-bold mb-2">
      Enter your email
    </label>
    <input
      id="forgotEmail"
      type="email"
      placeholder="Enter your email"
      value={forgotEmail}
      onChange={(e) => setForgotEmail(e.target.value)}
      required
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
    />
  </div>

  <button
    type="button"
    onClick={handleForgotPassword}
    disabled={isLoading}
    className={`w-full flex justify-center cursor-pointer items-center bg-[#4b4aac] hover:bg-[#474588] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
      isLoading ? "opacity-70 cursor-not-allowed" : ""
    }`}
  >
    {isLoading ? (
      <span className="flex items-center gap-2">
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        Sending...
      </span>
    ) : (
      "Reset Password"
    )}
  </button>

  <button
    type="button"
    onClick={() => setShowForgot(false)}
    className="mt-2 w-full cursor-pointer text-sm text-gray-400 hover:underline"
  >
    Back to Login
  </button>
</>

    </>
  )}
</form>

        </div>
      </div>
    </div>
  );
};

export default Page;
