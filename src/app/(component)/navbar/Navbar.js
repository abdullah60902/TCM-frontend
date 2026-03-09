"use client"
import React, { useState } from 'react';
import { FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
function Navbar() {
    const {user,setUser} = useAuth()
    const [showNotifications, setShowNotifications] = useState(false);
 const router = useRouter();
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
                setJaa(false)

    };
     const { logout } = useAuth();
      
      const handleLogout = () => {
        logout();
        router.push('/Login'); // smooth client-side redirect
      };
      const {jaa,setJaa} = useAuth()

    
    return (
        <div className="bg-gray-800 shadow sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                {/* Left section */}
               <div className="flex items-center">
  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-200">
    Care Home Management
  </h1>
</div>


                {/* Right section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={toggleNotifications}
                            className="text-gray-300 hover:text-white relative"
                        >
                            
                            <FaBell className="text-xl cursor-pointer" />
                            { jaa &&<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                1
                            </span>}
                        </button>


                        {/* Notification Panel */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-[60vw] max-w-sm sm:w-80 bg-gray-800 rounded-md shadow-lg overflow-hidden z-50">
  <div className="p-3 border-gray-700 bg-gray-700">
    <h3 className="text-sm font-medium text-gray-200">Notifications</h3>
  </div>
  <div className="divide-y divide-gray-700">
    <div className="p-2 hover:bg-gray-700">
      <p className="text-sm font-medium text-white">Welcome to the System</p>
      <p className="text-xs text-gray-400">
        You{"'"}ve successfully logged in to the Care Home Management System
      </p>
      <p className="text-xs text-gray-400 mt-1">Just now</p>
    </div>
  </div>
</div>

                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#EEEEFF] flex items-center justify-center text-[#4A49B0] font-medium">
              {
 (user?.fullName || "A B")
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
}
              </div>
                        <div className="ml-2 hidden sm:block">
                            <p className="text-sm font-medium text-gray-200">{user?.fullName}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout}
                            id="logout-button"
                            className=" cursor-pointer ml-4 text-sm text-red-400 hover:text-red-300 flex justify-center items-center"
                        >
                            <FaSignOutAlt/>
                            <span className="hidden sm:inline ml-1">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
