"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import { SiSimpleanalytics } from "react-icons/si";
import Image from "next/image";
import { MdMedicationLiquid } from "react-icons/md";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoDocumentAttach } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";
import { TbClockRecord } from "react-icons/tb";

import {
  FaThLarge,
  FaUser,
  FaClipboardList,
  FaExclamationTriangle,
  FaUsers,
  FaGraduationCap,
  FaShieldAlt,
  FaUserCog,
  FaSearch,
  FaPlus,
  FaEye,
  // FaEdit,
  // FaTrash,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Optional for table format

const clients = [
  {
    name: "Noman developer",
    age: "20 years",
    room: "99",
    careType: "Residential",
    admitted: "02/21/2222",
    status: "Active",
  },
  {
    name: "k",
    age: "20 years",
    room: "99",
    careType: "Residential",
    admitted: "02/21/2222",
    status: "Active",
  },
];

const Page = () => {
  const { hasClients } = useAuth();
  const { user, logout, userclient } = useAuth();

  // Define your navigation links here with proper routes
  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", href: "/Dashboard" },
    {
      icon: <FaUser />,
      label: "Resident Management",
      href: "/Client-Management",
      active: true,
    },
    {
      icon: <FaClipboardList />,
      label: "Care Planning",
      href: "/Care-Planning",
    },
    {
      icon: <FaExclamationTriangle />,
      label: "Incident Reports",
      href: "/Incident-Reports",
    },
    { icon: <LuLayoutTemplate />, label: "Template", href: "/Template" },
    {
      icon: <FaSearch />,
      label: "Social Activity",
      href: "/Social-Activity",
    },
    {
      icon: <MdMedicationLiquid />,
      label: "Medication Management",
      href: "/Medication-Management",
    },
    ...(hasClients
      ? []
      : [
                           { icon: <TbClockRecord />, label: "Medication-Record", href: "/Medication-Record" },

          { icon: <FaUsers />, label: "HR Management", href: "/HR-Management" },
          {
            icon: <IoDocumentAttach />,
            label: "Documents Management",
            href: "/Documents-Management",
          },
          {
            icon: <GrDocumentPerformance />,
            label: "Performance-Management",
            href: "/Performance-Management",
          },
          { icon: <FaGraduationCap />, label: "Training", href: "/Training" },
          { icon: <FaShieldAlt />, label: "Compliance", href: "/Compliance" },
          {
            icon: <SiSimpleanalytics />,
            label: "Analytics",
            href: "/Analytics",
          },
          {
            icon: <FaUserCog />,
            label: "User Management",
            href: "/User-Management",
          },
        ]),
  ];
  const userRole = user?.role?.toLowerCase();
  const allowedNavItems =
    ["admin", "staff", "client"].includes(userRole)
      ? navItems
      : userRole === "external" && Array.isArray(user.allowedPages)
      ? navItems.filter((item) =>
          user.allowedPages.some(
            (page) =>
              page.toLowerCase().replace(/\s+/g, "") ===
              item.label.toLowerCase().replace(/\s+/g, "")
          )
        )
      : [];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [StaffData, setStaffData] = useState([]);
    const { hasLowStock, setHasLowStock } = useAuth();
  const { hasReviews, setHasReviews } = useAuth();

  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState("All Patients");
  const filters = [
    "All Patients",
    "Nursing",
    "Residential",
    "Memory Care",
    "Respite",
  ];
  const [totalclientlength, setTotalClientLength] = useState(0);
  console.log("Total Clients:", totalclientlength);

  // Define your navigation links here with proper routes
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // add client --------------------------

  const [showModal, setShowModal] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    room: "",
    careType: "",
    admitDate: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleEdit = (client) => {
    setFormData({
      name: client.fullName,
      age: client.age,
      room: client.roomNumber,
      careType: client.careType,
      admitDate: client.admissionDate?.slice(0, 10),
    });
    setShowModal(true); // ✅ FIXED HERE
    setEditingUserId(client._id);
  };

  const [loading, setLoading] = useState(false);

  
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Function to toggle dropdown for a specific client
  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  // ✅ Function to handle PDF download
  const handleDownloadPdf = async (client) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Client Management", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Field", "Value"]],
      body: [
        ["Full Name", client.fullName || "—"],
        ["Age", client.age || "—"],
        ["Room", client.roomNumber || "—"],
        ["Care Type", client.careType || "—"],
        [
          "Admit Date",
          client.admissionDate ? client.admissionDate.slice(0, 10) : "—",
        ],
      ],
    });

    doc.save(`${client.fullName || "client"}_details.pdf`);
  };

  // ✅ Function to handle CSV download
  const handleDownloadCsv = (client) => {
    const headers = ["Field,Value"];
    const rows = [
      `Full Name,${client.fullName || "—"}`,
      `Age,${client.age || "—"}`,
      `Room,${client.roomNumber || "—"}`,
      `Care Type,${client.careType || "—"}`,
      `Admit Date,${
        client.admissionDate ? client.admissionDate.slice(0, 10) : "—"
      }`,
    ];

    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${client.fullName || "client"}_details.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle input changes

  // Optional: Handle form submit

  const [editingUserId, setEditingUserId] = useState(null); // track if editing
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const { name, age, room, careType, admitDate } = formData;

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const payload = {
      fullName: name,
      age: age,
      roomNumber: room,
      careType: careType,
      admissionDate: admitDate,
    };

    const request = editingUserId
      ? axios.put(
          `https://admin-panel-backend-alpha.vercel.app/client/${editingUserId}`,
          payload,
          config
        )
      : axios.post(`https://admin-panel-backend-alpha.vercel.app/client`, payload, config);

    request
      .then((res) => {
        setMessage(
          editingUserId
            ? "Staff updated successfully"
            : "Staff added successfully"
        );
        setEditingUserId(null);
        setFormData({
          name: "",
          age: "",
          room: "",
          careType: "",
          admitDate: "",
        });
        setShowModal(false);
        setLoading(false);
        toast.success("Add successfly");
        return axios.get("https://admin-panel-backend-alpha.vercel.app/client", config);
      })
      .then((res) => {
        setStaffData(res.data.clients || res.data); // Adjust based on your API response structure
      })
      .catch((err) => {
        console.error("Error:", err.response?.data);
        setLoading(false);
        setError(err.response?.data?.msg || "An error occurred");
        toast.error(err.response?.data?.msg || "An error occurred");
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!user) return;

    if (user.role === "Client") {
      // Client login hua hai — unke attached clients ke IDs hain
      if (!Array.isArray(user.clients)) return;

      axios
        .get("https://admin-panel-backend-alpha.vercel.app/client", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const allClients = res.data.clients;

          // ✅ Filter clients matching IDs
          const matchedClients = allClients.filter((client) =>
            user.clients.includes(client._id)
          );

          setStaffData(matchedClients);
          setFilteredStaff(matchedClients);
        })
        .catch((err) => {
          console.error("Failed to fetch clients for Client role", err);
        });
    } else {
      // Admin or Staff — all clients
      axios
        .get("https://admin-panel-backend-alpha.vercel.app/client", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setStaffData(res.data.clients);
          setFilteredStaff(res.data.clients);
        })
        .catch((err) => {
          console.error("Failed to fetch all clients", err);
        });
    }
  }, [user]);

  // Filter staff whenever searchQuery or selected changes
  useEffect(() => {
    let filtered = StaffData;

    if (selected !== "All Patients") {
      filtered = filtered.filter((staff) => staff.careType === selected);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((staff) =>
        staff.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStaff(filtered);
  }, [selected, StaffData, searchQuery]);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`https://admin-panel-backend-alpha.vercel.app/client/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setMessage("User deleted");
        // Remove user from UI
        const updated = StaffData.filter((user) => user._id !== id);
        setStaffData(updated);
        setFilteredStaff(updated);
        toast.success("delete successfuly");
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.msg || "Failed to delete user");
        toast.error(err.response?.data?.msg || "Failed to delete user");
      });
  };

  const [viewName, setViewName] = useState(null);
  const [viewroom, setViewroom] = useState(null);
  const [viewCaretype, setViewCaretype] = useState(null);
  const [viewadmitted, setViewAdmitted] = useState(null);
  const [viewage, setViewage] = useState(null);
  const [showModals, setShowModals] = useState(false);

  const handleView = (client) => {
    setViewName(client.fullName);
    setViewroom(client.roomNumber);
    setViewCaretype(client.careType);
    setViewAdmitted(client.admissionDate?.slice(0, 10));
    setViewage(client.age);
    setShowModals(true);
  };
  const handelCancel = () => {
    setShowModal(false);
    setFormData({
      name: "",
      age: "",
      room: "",
      careType: "",
      admitDate: "",
    });
    setEditingUserId(null);
  };

  const data = {
    "Full Name": viewName,
    "Room Number": viewroom,
    "Care Type": viewCaretype,
    "Admitted Date": viewadmitted,
    Age: viewage,
  };

  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/Login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="bg-[#111827] min-h-screen flex flex-col">
      <Navbar />

      {showModals && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-auto">
          <div className="relative w-full max-w-3xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] border border-gray-700 bg-gradient-to-br from-[#1b1e25] to-[#111319] text-white px-8 py-10 max-h-[90vh] overflow-y-auto">
            {/* ❌ Close Button */}
            <button
              onClick={() => setShowModals(false)}
              className="absolute top-4 right-4 w-11 h-11 bg-[#2b2e3a] hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:rotate-90 transition-all duration-300"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* 🩺 Heading */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 flex items-center justify-center gap-2 sm:gap-3">
              Patient Details
            </h2>

            {/* ℹ️ Field Details */}
            <div className="space-y-5 mb-6">
              {Object.entries(data).map(([field, value]) => (
                <div
                  key={field}
                  className="flex justify-between items-start bg-[#1e212a] p-4 rounded-xl border border-gray-700"
                >
                  <span className="font-semibold text-gray-300">{field}</span>
                  {/* 🖼 If image field (signature/upload), show image */}
                  {field.toLowerCase().includes("signature") ||
                  field.toLowerCase().includes("upload") ? (
                    <Image
                      src={value}
                      alt={field}
                      width={180}
                      height={150}
                      className="max-w-[180px] max-h-[150px] rounded-lg border border-gray-600 shadow-md object-contain"
                    />
                  ) : (
                    <span className="text-right text-gray-400 max-w-[60%] break-words">
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Sidebar Button - only for small screens */}
      <div className="lg:hidden p-4 flex justify-between items-center bg-gray-800 shadow">
        <h2 className="text-gray-200 text-lg font-semibold">
          Client Management
        </h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white text-xl"
        >
          <FaBars />
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - always visible on lg+, toggle on small screens */}
        <aside
  className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 shadow-md transform transition-transform duration-300 ease-in-out
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0 lg:relative lg:block`}
>
  <nav className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
    
    {/* 🔹 Sidebar Header with Toggle Button */}
    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
      <p className="text-sm text-gray-400">Navigation</p>

      {/* Toggle Button inside Sidebar */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="text-white text-xl lg:hidden"
      >
        <FaTimes />
      </button>
    </div>

    {/* 🔹 Sidebar Links */}
    {allowedNavItems.map((item, index) => (
      <Link
        key={index}
        href={item.href}
        className={`side-menu-item flex items-center px-4 py-3 text-gray-300 rounded-md transition-colors ${
          item.active
            ? "bg-gray-700 text-primary-light"
            : "hover:bg-gray-700 hover:text-primary-light"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <span className="mr-3">{item.icon}</span>
        <span className="flex items-center">
          {item.label}

          {/* 🔴 Medication Low Stock Alert */}
          {item.label === "Medication Management" && hasLowStock && (
            <span className="h-3 w-3 mb-4 ml-1 text-xs bg-red-600 rounded-full"></span>
          )}

          {/* 🟡 Care Planning Review Alert */}
          {item.label === "Care Planning" && hasReviews && (
            <span className="h-3 w-3 mb-4 ml-1 text-xs bg-yellow-500 rounded-full"></span>
          )}
        </span>
      </Link>
    ))}

    {/* 🔹 User Info */}
    <div className="p-4 border-t border-gray-700 mt-auto">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#EEEEFF] flex items-center justify-center text-[#4A49B0] font-medium">
          {(user?.fullName || "A B")
                    .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-200">
            {user.fullName}
          </p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </div>
    </div>
  </nav>
</aside>


        {/* Main Content */}
        <main className="flex-1 p-6 max-h-screen overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-200 mb-6">
            Resident Management
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 h-full overflow-y-auto pr-2 my-scroll">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-200">Resident</h3>
                <p className="text-sm text-gray-400">
                  Manage Resident records and information
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:border-primary-light focus:ring-primary-light bg-gray-700 text-white text-base"
                    placeholder="Search Resident..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                  </div>
                </div>
                {!hasClients && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <FaPlus className="mr-2" /> Add New Resident
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-2 text-white">
              {filters.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(label)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    selected === label
                      ? "bg-gray-700 text-primary-light shadow"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-primary-light"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              {/* Table */}
              <table className="min-w-[800px] md:min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    {[
                      "Name",
                      "Room",
                      "Care Type",
                      "Admitted",
                      "Status",
                      "Actions",
                      "View Profile",
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredStaff.map((client, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white text-blue-500 flex items-center justify-center rounded-full font-semibold">
                            {client.fullName
                              ?.split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {client.fullName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {client.age}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white">
                        {client.roomNumber}
                      </td>
                      <td className="px-4 py-4 text-sm text-white">
                        {client.careType}
                      </td>
                      <td className="px-4 py-4 text-sm text-white">
                        {client.admissionDate?.slice(0, 10)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-6 flex items-center gap-3 text-sm text-white relative">
                        {/* 👁 View */}
                        <FaEye
                          className="hover:text-blue-500 transition cursor-pointer"
                          onClick={() => handleView(client)}
                           // 🔹 Smaller icon
                        />

                        {/* ✏️ Edit */}
                        {!hasClients && (
                          <FaEdit
                            className="cursor-pointer hover:text-yellow-500 transition"
                            onClick={() => handleEdit(client)}
                            // 🔹 Smaller icon
                          />
                        )}

                        {/* 🗑 Delete */}
                        {!hasClients && (
                          <FaTrash
                            className="cursor-pointer hover:text-red-500 transition"
                            onClick={() => handleDelete(client._id)}
                          />
                        )}

                        {/* ⬇ Download */}
                        <div className="relative">
                          <FaDownload
                            className="hover:text-green-500 transition cursor-pointer"
                            onClick={() => toggleDropdown(client._id)}
                          />

                          {openDropdownId === client._id && (
                            <div
                              className="absolute right-0 mt-2 
             bg-white/20 backdrop-blur-xl border border-white/30 
             shadow-lg rounded-md z-10 w-36 
             transition-all duration-200"
                            >
                              <button
                                onClick={() => {
                                  handleDownloadPdf(client);
                                  setOpenDropdownId(null);
                                }}
                                className="block w-full text-left px-3 py-2 
               text-sm text-white hover:bg-white/10 transition"
                              >
                                Export as PDF
                              </button>
                              <button
                                onClick={() => {
                                  handleDownloadCsv(client);
                                  setOpenDropdownId(null);
                                }}
                                className="block w-full text-left px-3 py-2 
               text-sm text-white hover:bg-white/10 transition"
                              >
                                Export as CSV
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                        <td className="px-4 py-4">
                                               <Link
                        href={`/Resident-Profile?id=${client._id}`}
                        className="inline-flex items-center  px-1 py-1 bg-gradient-to-r from-blue-800 to-blue-500 text-white font-semibold rounded-md shadow hover:shadow-xl transition-all active:scale-95"
                      >
                        <span>View Profile</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 5l7 7-7 7"></path>
                        </svg>
                      </Link>
                      
                                                </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStaff.length === 0 && (
                <p className="text-center px-4 sm:px-6 py-36 text-gray-400">
                  No Resident found.
                </p>
              )}
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
              <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                  {/* Resident Management */}
                  {editingUserId ? "Edit Resident" : "Add New Resident"}
                </h2>
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="age"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      id="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="room"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Room Number
                    </label>
                    <input
                      type="number"
                      name="room"
                      id="room"
                      value={formData.room}
                      onChange={handleChange}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="careType"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Care Type
                    </label>
                    <select
                      name="careType"
                      id="careType"
                      value={formData.careType}
                      onChange={handleChange}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select Care Type</option>
                      <option value="Residential">Residential</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Memory Care">Memory Care</option>
                      <option value="Respite">Respite</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="admitDate"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Admission Date
                    </label>
                    <input
                      type="date"
                      name="admitDate"
                      id="admitDate"
                      value={formData.admitDate}
                      onChange={handleChange}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t  border-gray-700">
                    <button
                      type="button"
                      onClick={handelCancel}
                      className=" cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex items-center justify-center bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white font-bold py-2 px-4 rounded ${
                        loading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white mr-2"
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
                          Please wait...
                        </>
                      ) : editingUserId ? (
                        "Update Resident"
                      ) : (
                        "Add Resident"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
