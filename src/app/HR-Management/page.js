"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import { SiSimpleanalytics } from "react-icons/si";
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
import { MdMedicationLiquid } from "react-icons/md";

const StaffData = [
  {
    email: "nomigt6@gmail.com ",
    name: "Noman Developer",
    position: "Registered Nurse",
    department: "Nursing",
    startDate: "2023-05-10",
    status: "Active",
  },
];

const Page = () => {
  const { hasClients } = useAuth();
  const { user, logout } = useAuth();

  // Define your navigation links here with proper routes
  const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", href: "/Dashboard" },
    {
      icon: <FaUser />,
      label: "Resident Management",
      href: "/Client-Management",
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

    { icon: <FaSearch />, label: "Social Activity", href: "/Social-Activity" },
    {
      icon: <MdMedicationLiquid />,
      label: "Medication Management",
      href: "/Medication-Management",
    },
    ...(hasClients
      ? []
      : [
          {
            icon: <TbClockRecord />,
            label: "Medication-Record",
            href: "/Medication-Record",
          },

          {
            icon: <FaUsers />,
            label: "HR Management",
            href: "/HR-Management",
            active: true,
          },
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
  const [filteredStaff, setFilteredStaff] = useState([]);
  const { hasLowStock, setHasLowStock } = useAuth();
  const { hasReviews, setHasReviews } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState("All Staff");
  const filters = [
    "All Staff",
    "Nursing",
    "Care",
    "Administration",
    "Management",
  ];
  const [careSettingFilter, setCareSettingFilter] = useState(
    " Filter All Settings"
  );

  // Define your navigation links here with proper routes
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // add staf -------------------------------------------------------------------------------------------------------------
  const [showModal3, setShowModal3] = useState(false);
  const [formData3, setFormData3] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    careSetting: "", // <-- Added this
    startDate: "",
  });

  const handleEdit = (hr) => {
    console.log("handleEdit called with:", hr);
    setFormData3({
      name: hr.fullName,
      email: hr.email,
      position: hr.position,
      department: hr.department,
      startDate: hr.startDate?.slice(0, 10),
      careSetting: hr.careSetting || "", // <-- Add this line if careSetting is
    });
    setShowModal3(true);
    setEditingUserId(hr._id);
  };

  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Function to toggle dropdown for a specific client
  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };
  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("HR Management Details", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Field", "Value"]],
      body: [
        ["Full Name", item.fullName || "—"],
        ["Email", item.email || "—"],
        ["Position", item.position || "—"],
        ["Department", item.department || "—"],
        ["Start Date", item.startDate ? item.startDate.slice(0, 10) : "—"],
        ["Care Setting", item.careSetting || "Not specified"],
      ],
    });

    doc.save(`${item.fullName || "hr_record"}_details.pdf`);
  };

  // ✅ CSV Download
  const handleDownloadCsv = (item) => {
    const headers = ["Field,Value"];
    const rows = [
      `Full Name,${item.fullName || "—"}`,
      `Email,${item.email || "—"}`,
      `Position,${item.position || "—"}`,
      `Department,${item.department || "—"}`,
      `Start Date,${item.startDate ? item.startDate.slice(0, 10) : "—"}`,
      `Care Setting,${item.careSetting || "Not specified"}`,
    ];

    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item.fullName || "hr_record"}_details.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancel10 = () => {
    setShowModal3(false);
    setFormData3({
      name: "",
      department: "",
      email: "",
      position: "",
      startDate: "",
    });
    setEditingUserId(null); // Reset editing state
  };

  const handleChange3 = (e) => {
    const { name, value } = e.target;
    setFormData3((prev) => ({ ...prev, [name]: value }));
  };

  const [editingUserId, setEditingUserId] = useState(null); // track if editing

  const [loading, setLoading] = useState(false); // track loading state

  const handleSubmit3 = (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
    const { name, email, position, department, startDate } = formData3;

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const payload = {
      fullName: name,
      email: email,
      position: position,
      department: department,
      careSetting: formData3.careSetting, // <-- Add this line
      startDate: startDate,
    };

    const request = editingUserId
      ? axios.put(`https://admin-panel-backend-alpha.vercel.app/hr/${editingUserId}`, payload, config)
      : axios.post(`https://admin-panel-backend-alpha.vercel.app/hr`, payload, config);

    request
      .then((res) => {
        setMessage(
          editingUserId
            ? "Staff updated successfully"
            : "Staff added successfully"
        );

        setEditingUserId(null);
        setLoading(false); // Reset loading state
        setFormData3({
          name: "",
          department: "",
          email: "",
          position: "",
          startDate: "",
        });
        setShowModal3(false);
        toast.success("Add successfuly");
        return axios.get("https://admin-panel-backend-alpha.vercel.app/hr", config);
      })
      .then((res) => {
        setStaffData(res.data.allHr);
      })
      .catch((err) => {
        console.error("Error:", err.response?.data);
        setLoading(false); // Reset loading state
        setError(err.response?.data?.msg || "An error occurred");
        toast.error(err.response?.data?.msg || "An error occurred");
      });
  };

  useEffect(() => {
    const fetchHR = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/hr", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStaffData(res.data.allHr); // no .users needed, your backend returns an array
        setFilteredStaff(res.data.allHr);
        setMessage("Users fetched successfully");
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch HR data");
      }
    };
    fetchHR();
  }, []);

  // Filter staff whenever searchQuery or selected changes
  useEffect(() => {
    let filtered = [];

    if (selected === "All Staff") {
      filtered = StaffData;
    } else {
      filtered = StaffData.filter((staff) => staff.department === selected);
    }

    if (careSettingFilter !== " Filter All Settings") {
      filtered = filtered.filter(
        (staff) => staff.careSetting === careSettingFilter
      );
    }

    if (searchQuery.trim() !== "") {
      const lowerSearch = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (staff) =>
          staff.fullName.toLowerCase().includes(lowerSearch) ||
          (staff.careSetting &&
            staff.careSetting.toLowerCase().includes(lowerSearch))
      );
    }

    setFilteredStaff(filtered);
  }, [selected, careSettingFilter, StaffData, searchQuery]);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`https://admin-panel-backend-alpha.vercel.app/hr/${id}`, {
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
        toast.success("deleted successfuly");
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.msg || "Failed to delete user");
        toast.error(err.response?.data?.msg || "Failed to delete user");
      });
  };

  const [viewName, setViewName] = useState(null);
  const [viewemail, setViewEmail] = useState(null);
  const [viewposition, setViewPosition] = useState(null);
  const [viewdepartment, setViewDepartment] = useState(null);
  const [viewstartDate, setViewStartDate] = useState(null);
  const [showModals, setShowModals] = useState(false);
  const [viewCareSetting, setViewCareSetting] = useState(null);

  const handleView = (client) => {
    setViewName(client.fullName);
    setViewEmail(client.email);
    setViewPosition(client.position);
    setViewDepartment(client.department);
    setViewStartDate(client.startDate?.slice(0, 10));
    setViewCareSetting(client.careSetting || "Not specified"); // Add careSetting if available
    setShowModals(true);
  };

  const data = {
    "Full Name": viewName,
    Email: viewemail,
    Position: viewposition,
    Department: viewdepartment,
    "Start Date": viewstartDate,
    "Care Setting": viewCareSetting,
  };

  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/Login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="bg-[#111827] min-h-screen ">
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

            {/* 🧑‍💼 Heading */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 flex items-center justify-center gap-2 sm:gap-3">
              Staff Details
            </h2>

            {/* 🔄 Scrollable Content */}
            <div className="space-y-5 mb-6">
              {Object.entries(data).map(([field, value]) => (
                <div
                  key={field}
                  className="flex justify-between items-start bg-[#1e212a] p-4 rounded-xl border border-gray-700"
                >
                  <span className="font-semibold text-gray-300">{field}</span>
                  <span className="text-right text-gray-400 max-w-[60%]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navbar Toggle */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
          HR Management
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white text-xl"
        >
          <FaBars />
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
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
          <h2 className="text-xl font-semibold text-gray-200 mb-6 hidden md:block">
            HR Management
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8 h-full overflow-y-auto pr-2 my-scroll">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200">Staff</h3>
                <p className="text-sm text-gray-400">
                  Manage staff and schedules
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:border-primary-light focus:ring-primary-light bg-gray-700 text-white"
                    placeholder="Search staff..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                  </div>
                </div>
                <button
                  onClick={() => setShowModal3(true)}
                  className="bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" /> Add New Staff
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-2 text-white">
              {filters.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(label)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer backdrop-blur-sm ${
                    selected === label
                      ? "bg-primary-light bg-gray-700 text-primary-light shadow-lg"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-primary hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={careSettingFilter}
                onChange={(e) => setCareSettingFilter(e.target.value)}
                className="w-full sm:min-w-[180px] font-medium outline-none  mb-2 px-3 py-2  bg-gray-700 text-white text-sm"
              >
                <option value=" Filter All Settings">
                  {" "}
                  Filter All Settings
                </option>
                <option value="Residential Care">Residential Care</option>
                <option value="Nursing Homes">Nursing Homes</option>
                <option value="Learning Disabilities">
                  Learning Disabilities{" "}
                </option>
                <option value="Supported Living">Supported Living </option>
                <option value="Mental Health Support">
                  Mental Health Support
                </option>
                <option value="Domiciliary Care">
                  Domiciliary Care Organisations
                </option>
                <option value="Other Services">Other Services</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              {/* Table */}
              <table className="min-w-[800px] md:min-w-full divide-y divide-gray-700 text-xs sm:text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    {[
                      "Name",
                      "Position",
                      "Department",
                      "Start Date",
                      "Actions",
                      "View Profile",
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white text-blue-500 flex items-center justify-center rounded-full border-gray-600">
                              {item.fullName
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                          <Link href={`/Staff-Profile?id=${item._id}`}>

                              <div
                                className="text-sm font-medium text-white cursor-pointer hover:underline hover:text-blue-600 transition"
                              >
                                {item.fullName}
                              </div>
</Link>


                             

                              <div className="text-sm text-gray-400">
                                {item.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 text-sm text-white">
                          {item.position}
                        </td>
                        <td className="px-4 py-4 text-sm text-white">
                          {item.department}
                        </td>
                        <td className="px-2 py-4 text-[12px] text-white">
                          {item.startDate.slice(0, 10)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-3 text-white items-center">
                            {/* 👁 View Button */}
                            <button
                              className="hover:text-blue-500 transition cursor-pointer"
                              onClick={() => handleView(item)}
                            >
                              <FaEye />
                            </button>

                            {/* ✏️ Edit Button */}
                            <button
                              className="hover:text-yellow-500 transition cursor-pointer"
                              onClick={() => handleEdit(item)}
                            >
                              <FaEdit />
                            </button>

                            {/* 🗑 Delete Button */}
                            <button
                              className="hover:text-red-500 transition cursor-pointer"
                              onClick={() => handleDelete(item._id)}
                            >
                              <FaTrash />
                            </button>
                           

                            {/* 📥 Download Dropdown (PDF + CSV) */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === item._id
                                      ? null
                                      : item._id
                                  )
                                }
                                className="hover:text-green-500 transition cursor-pointer"
                              >
                                <FaDownload />
                              </button>

                              {openDropdownId === item._id && (
                                <div
                                  className="absolute right-0 mt-2 
             bg-white/20 backdrop-blur-xl border border-white/30 
             shadow-lg rounded-md z-10 w-36 
             transition-all duration-200"
                                >
                                  <button
                                    onClick={() => {
                                      handleDownloadPdf(item);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-3 py-2 
               text-sm text-white hover:bg-white/10 transition"
                                  >
                                    Download PDF
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDownloadCsv(item);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-3 py-2 
               text-sm text-white hover:bg-white/10 transition"
                                  >
                                    Download CSV
                                  </button>
                                </div>
                              )}
                            </div>
                            
                          </div>
                        </td>
                        <td className="px-4 py-4">
                         <Link
  href={`/Staff-Profile?id=${item._id}`}
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
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center px-4 sm:px-6 py-24 text-gray-400 text-sm"
                      >
                        No staff found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Form Add Staff */}
          {showModal3 && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-auto p-4">
              <form
                onSubmit={handleSubmit3}
                className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                  {editingUserId ? " Edit Staff Member " : " Add Staff Member "}
                </h2>
                {/* Full Name */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={formData3.name}
                    onChange={handleChange3}
                    required
                    className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData3.email}
                    onChange={handleChange3}
                    required
                    className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                  />
                </div>

                {/* Position */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Position
                  </label>
                  <input
                    name="position"
                    type="text"
                    value={formData3.position}
                    onChange={handleChange3}
                    required
                    className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600  text-gray-300 focus:outline-none"
                  />
                </div>

                {/* Department */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData3.department}
                    onChange={handleChange3}
                    required
                    className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600  text-gray-300 focus:outline-none"
                  >
                    <option value="">Select Department</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Care">Care</option>
                    <option value="Administration">Administration</option>
                    <option value="Management">Management</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                {/* Care Setting / Service Type */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Care Setting / Service Type
                  </label>
                  <select
                    name="careSetting"
                    value={formData3.careSetting}
                    onChange={handleChange3}
                    required
                    className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                  >
                    <option value="">Select Care Setting</option>
                    <option value="Residential Care">Residential Care</option>
                    <option value="Nursing Homes">Nursing Homes</option>
                    <option value="Learning Disabilities">
                      Learning Disabilities
                    </option>
                    <option value="Supported Living">Supported Living</option>
                    <option value="Mental Health Support">
                      Mental Health Support
                    </option>
                    <option value="Domiciliary Care">Domiciliary Care</option>
                    <option value="Other Services">Other Services</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={formData3.startDate}
                    onChange={handleChange3}
                    required
                    className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel10}
                    className=" bg-gray-700 cursor-pointer hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded"
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
                      "Update Member"
                    ) : (
                      "Add Member"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
