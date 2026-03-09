"use client";
import React, { use, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiSimpleanalytics } from "react-icons/si";
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
  FaEdit,
  FaKey,
  FaBars,
  FaTimes,
  FaTrash,
  FaEyeSlash,
} from "react-icons/fa";
import Link from "next/link";
import { set } from "nprogress";
import { toast } from "react-toastify";
import { GrDocumentPerformance } from "react-icons/gr";

import { MdMedicationLiquid } from "react-icons/md";

const filters = ["All Users", "Admins", "Staff", "Clients"];

const StaffData = [
  {
    name: "Admin User",
    position: "Nurse",
    email: "john@example.com",
    Rool: "Admin",
    startDate: "2022-10-01",
    status: "Admins",
  },
  {
    name: "Staff Member",
    position: "Care Assistant",
    email: "staff@example.com",
    Rool: "Staff",
    startDate: "2023-01-15",
    status: "Staff",
  },
  {
    name: "Client Person",
    position: "Client",
    email: "client@example.com",
    Rool: "Client",
    startDate: "2023-03-10",
    status: "Clients",
  },
];

const Page = () => {
  const { user, logout } = useAuth();
    console.log("safi butt");

   const navItems = [
    { icon: <FaThLarge />, label: "Dashboard", href: "/Dashboard" },
    { icon: <FaUser />,label: "Resident Management", href: "/Client-Management",    },
    { icon: <FaClipboardList />, label: "Care Planning", href: "/Care-Planning", },
    { icon: <FaExclamationTriangle />, label: "Incident Reports", href: "/Incident-Reports", },
    { icon: <LuLayoutTemplate />, label: "Template", href: "/Template" },
    { icon: <FaSearch />, label: "Social Activity", href: "/Social-Activity" },
    { icon: <MdMedicationLiquid />,label: "Medication Management",href: "/Medication-Management", },
    { icon: <TbClockRecord />, label: "Medication-Record", href: "/Medication-Record"},
    { icon: <FaUsers />, label: "HR Management", href: "/HR-Management" },
    { icon: <IoDocumentAttach />,label: "Documents Management",href: "/Documents-Management",},
    { icon: <GrDocumentPerformance />, label: "Performance Management", href: "/Performance-Management",},
    { icon: <FaGraduationCap />, label: "Training", href: "/Training"},
    { icon: <FaShieldAlt />, label: "Compliance", href: "/Compliance" },
    { icon: <SiSimpleanalytics />, label: "Analytics", href: "/Analytics" },
    { icon: <FaUserCog />, label: "User Management", href: "/User-Management", active: true, },
  ];

  // ✅ Filter logic for External users
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState("All Users");
  const filters = ["All Users", "admin", "staff", "client"];
  const [patient, setPatient] = useState([]);
    const { hasLowStock, setHasLowStock } = useAuth();

  const [fieldopen, setFieldOpen] = useState(false); // State to control the visibility of the field
  const [fieldopensatff , setFieldOpensatff] = useState(false); // State to control the visibility of the field
const [clientSearch, setClientSearch] = useState("");
const [staffMembers, setStaffMembers] = useState([]); // State to hold staff members
const [staffSearch, setStaffSearch] = useState(""); // State for staff search input
const [showExternalAccess, setShowExternalAccess] = useState(false);
  const { hasReviews, setHasReviews } = useAuth();


  // Define your navigation links here with proper routes

  const [showForm6, setShowForm6] = useState(false);
const [formData6, setFormData6] = useState({
  name: "",    
  email: "",
  role: "",
  password: "",
  confirmPassword: "",
  clients: [],
  hr: "",
  allowedPages: [], // ✅ Add this
});



  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
const handleChange6 = (e) => {
  const { name, value } = e.target;

  setFormData6((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "role") {
    if (value === "Client") {
      setFieldOpen(true);
      setFieldOpensatff(false);
      setShowExternalAccess(false);
    } else if (value === "Staff") {
      setFieldOpensatff(true);
      setFieldOpen(false);
      setShowExternalAccess(false);
    } else if (value === "External") {
      setFieldOpen(false);
      setFieldOpensatff(false);
      setShowExternalAccess(true); // 👈 New state for checkboxes
    } else {
      setFieldOpen(false);
      setFieldOpensatff(false);
      setShowExternalAccess(false);
    }
  }
};




 const handleEdit = (user) => {
  setFormData6({
    name: user.fullName || "",
    email: user.email || "",
    role: user.role || "",
    password: "",
    confirmPassword: "",
    clients:
      user.clients?.map((c) => (typeof c === "object" ? c._id : c)) || [],
    hr: user.hr || "",
    allowedPages: user.allowedPages || [], // ✅ new field for page access
  });

  setShowForm6(true);
  setEditingUserId(user._id);


  // ✅ Show specific fields based on role
  if (user.role === "Client") {
    setFieldOpen(true);
    setFieldOpensatff(false);
  } else if (user.role === "Staff") {
    setFieldOpensatff(true);
    setFieldOpen(false);
  } else {
    setFieldOpen(false);
    setFieldOpensatff(false);
    setShowExternalAccess(true);
  }
};


  const [editingUserId, setEditingUserId] = useState(null); // track if editing

  const [loading, setLoading] = useState(false); // track loading state

  const handleSubmit6 = (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
    const { name, email, role, password, confirmPassword } = formData6;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const payload = {
  fullName: name,
  email,
  role,
  ...(password && { password }),
  ...(role === "Client" && { clients: formData6.clients || [] }),
  ...(role === "Staff" && { hr: formData6.hr }),
  ...(role === "External" && { allowedPages: formData6.allowedPages }), // ✅ added
};


    console.log("Sending Payload:", { ...payload, confirmPassword });

    const request = editingUserId
      ? axios.put(
          `https://admin-panel-backend-alpha.vercel.app/user/${editingUserId}`,
          payload,
          config
        )
      : axios.post(
          "https://admin-panel-backend-alpha.vercel.app/user/signup",
          { ...payload, confirmPassword },
          config
        ); // 🟢 Must include config here too

    request
      .then((res) => {
        setMessage(editingUserId ? "User updated successfully" : "User created successfully" );
        setEditingUserId(null);
        setLoading(false); // Reset loading state
        setFormData6({
          name: "",
          email: "",
          role: "Client",
          password: "",
          confirmPassword: "",
        });
        setShowForm6(false);
        toast.success("Add successfuly");
        return axios.get("https://admin-panel-backend-alpha.vercel.app/user", config);
      })
      .then((res) => {
        setStaffData(res.data);
        setFilteredStaff(res.data);
      })
      .catch((err) => {
        console.error("Error:", err.response?.data);
        setLoading(false); // Reset loading state
        setError(err.response?.data?.msg || "An error occurred");
        toast.error(err.response?.data?.msg || "An error occurred");
      });
  };

  
  useEffect(() => {
    axios
      .get("https://admin-panel-backend-alpha.vercel.app/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log("Fetched users:", response.data);
        setStaffData(response.data); // no .users needed, your backend returns an array
        setFilteredStaff(response.data);
        setMessage("Users fetched successfully");
        setError("");
      })
      .catch((error) => {
        console.error(
          "Error fetching users:",
          error.response?.data || error.message
        );
        setError(error.response?.data?.msg || "Failed to fetch users");
      });
  }, []);

  // Filter staff whenever searchQuery or selected changes
  useEffect(() => {
    const filtered = StaffData.filter((staff) => {
      const role = staff.role?.toLowerCase(); // in case of undefined
      const matchesStatus =
        selected === "All Users" || role === selected.toLowerCase();
      const matchesSearch = staff.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    setFilteredStaff(filtered);
  }, [searchQuery, selected, StaffData]);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`https://admin-panel-backend-alpha.vercel.app/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMessage("User deleted");
        // Remove user from UI
        const updated = StaffData.filter((user) => user._id !== id);
        setStaffData(updated);
        setFilteredStaff(updated);
        toast.success("user deleted");
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.msg || "Failed to delete user");
        toast.error(err.response?.data?.msg || "Failed to delete user");
      });
  };
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return;

  axios.get('https://admin-panel-backend-alpha.vercel.app/hr', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(response => {
      setStaffMembers(response.data.allHr);
      setMessage('Staff fetched successfully');
    })
    .catch(error => {
      setError(error.response?.data?.msg || 'Failed to fetch staff');
    });
}, []);





  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://admin-panel-backend-alpha.vercel.app/client", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPatient(response.data.clients); // Staff data set
        setMessage("Staff fetched successfully");
      })
      .catch((error) => {
        setError(error.response?.data?.msg || "Failed to fetch staff");
      });
  }, []);

    const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = () => {
    setShowForm6(false);
    setFormData6({
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
      clients: [], // Reset clients
    });
    setEditingUserId(null); // Reset editing state
    setFieldOpen(false); // Reset field visibility
  };

  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/Login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="bg-[#111827] min-h-screen">
      <Navbar />
      {/* Mobile Navbar Toggle */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
          User Management
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


        <main className="flex-1 p-6 max-h-screen overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-200 mb-6 hidden md:block">
            User Management
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8 h-full overflow-y-auto pr-2 my-scroll">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200">
                  System Users
                </h3>
                <p className="text-sm text-gray-400">
                  Manage user accounts and permissions
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-700 text-white"
                    placeholder="Search Users..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                  </div>
                </div>
                <button
                  onClick={() => setShowForm6(!showForm6)}
                  className="bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FaPlus className="mr-2" /> Add New User
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex text-white flex-wrap gap-2">
              {filters.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(label)}
                  className={`px-3 py-1 rounded-full cursor-pointer text-sm font-medium transition-all ${
                    selected === label
                      ? "bg-primary-light text-primary bg-gray-700 text-white shadow-lg"
                      : " bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-[800px] md:min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    {["Name", "Email", "Role", "Actions"].map((col, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y  divide-gray-700">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((item, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white text-blue-500 flex items-center justify-center rounded-full border border-gray-600">
                              {item.fullName
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {item.fullName}
                              </div>
                              <div className="text-sm text-gray-400">
                                {item.position}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {item.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {item.role}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2 text-white">
                            <button
                              className="hover:text-yellow-500 transition cursor-pointer"
                              onClick={() => handleEdit(item)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="hover:text-red-500 transition cursor-pointer"
                              onClick={() => handleDelete(item._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center px-4 sm:px-6 py-24 text-gray-400 text-sm"
                      >
                        No Users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {showForm6 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4">
              <form
                id="add-user-form"
                className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg"
                onSubmit={handleSubmit6}
              >
                <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                  {editingUserId ? " Edit User " : " Add User "}
                </h2>


                <div className="mb-4">
                  <label
                    htmlFor="role"
                    className="block text-gray-300 text-sm font-medium mb-2"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData6.role}
                    onChange={handleChange6}
                    className="shadow-sm cursor-pointer border rounded w-full py-2 px-3  text-gray-300 bg-gray-700 border-gray-600"
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    <option value="Admin" className=" cursor-pointer">
                      Administrator
                    </option>
                    <option value="Staff" className=" cursor-pointer">
                      Staff
                    </option>
                    <option value="Client" className=" cursor-pointer">
                      Client
                    </option>
                      <option value="External">External</option> {/* 👈 New */}

                  </select>
                </div>

               {fieldopen && (
  <div className="space-y-2 mb-4">
    <h2 className="text-lg font-semibold text-gray-200">
      All Patients
    </h2>

    {/* 🔍 Search box for clients */}
    <div className="mb-2">
      <input
        type="text"
        placeholder="Search patient..."
        value={clientSearch}
        onChange={(e) => setClientSearch(e.target.value)}
        className="w-full rounded-md border border-gray-600 px-3 py-1 text-sm bg-gray-700 text-white focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
      />
    </div>

    {/* Scrollable client list */}
    <div className="max-h-48 overflow-y-auto space-y-1 pr-2 border border-gray-600 rounded-md p-2">
      {patient
        .filter((c) =>
          c.fullName.toLowerCase().includes(clientSearch.toLowerCase())
        )
        .map((client) => (
          <div key={client._id} className="flex items-center space-x-2">
            <input
              className="cursor-pointer"
              type="checkbox"
              id={`client-${client._id}`}
              value={client._id}
              checked={formData6.clients?.includes(client._id)}
              onChange={(e) => {
                const value = e.target.value;
                const checked = e.target.checked;
                setFormData6((prev) => {
                  const updatedClients = checked
                    ? [...(prev.clients || []), value]
                    : (prev.clients || []).filter((id) => id !== value);
                  return { ...prev, clients: updatedClients };
                });
              }}
            />
            <label
              htmlFor={`client-${client._id}`}
              className="text-gray-300 text-sm"
            >
              {client.fullName}
            </label>
          </div>
        ))}
      {patient.filter((c) =>
        c.fullName.toLowerCase().includes(clientSearch.toLowerCase())
      ).length === 0 && (
        <p className="text-gray-400 text-sm text-center">No patients found</p>
      )}
    </div>





    
  </div>
)}
{/* Role Field */}


{/* Page Access (only for External) */}
{showExternalAccess && (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-medium mb-2">
      Select Page Access
    </label>
    <div className="grid grid-cols-2 gap-2 text-white">
      {[
        "Dashboard",
        "Resident Management",
        "Care Planning",
        "Medication Management",
        "Incident Reports",
        "Template",
        "Social Activity",
        "HR Management",
        "Documents Management",
        "Performance Management",
        "Training",
        "Compliance",
        "Analytics",
        "User Management",
      ].map((page) => (
        <label key={page} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={
              page === "Dashboard"
                ? true
                : formData6.allowedPages?.includes(page)
            }
            disabled={page === "Dashboard"} // ✅ Always checked & not editable
            className={`cursor-pointer ${
              page === "Dashboard" ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onChange={(e) => {
              if (page === "Dashboard") return; // prevent unchecking
              const updated = e.target.checked
                ? [...formData6.allowedPages, page]
                : formData6.allowedPages.filter((p) => p !== page);
              setFormData6((prev) => ({ ...prev, allowedPages: updated }));
            }}
          />
          {page}
        </label>
      ))}
    </div>
  </div>
)}


{fieldopensatff && (
  <div className="space-y-2 mb-4">
    <h2 className="text-lg font-semibold text-gray-200">
      All staff
    </h2>

    {/* 🔍 Search box for clients */}
    <div className="mb-2">
      <input
        type="text"
        placeholder="Search staff..."
        value={staffSearch}
        onChange={(e) => setStaffSearch(e.target.value)}
        className="w-full rounded-md border border-gray-600 px-3 py-1 text-sm bg-gray-700 text-white focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
      />
    </div>

    {/* Scrollable client list */}
    <div className="max-h-48 overflow-y-auto space-y-1 pr-2 border border-gray-600 rounded-md p-2">
{staffMembers
  .filter((c) =>
    c.fullName.toLowerCase().includes(staffSearch.toLowerCase())
  )
  .map((staff) => (
    <div key={staff._id} className="flex items-center space-x-2">
      <input
        className="cursor-pointer"
        type="checkbox"
        id={`staff-${staff._id}`}
        value={staff._id}
        checked={formData6.hr === staff._id}  // ✅ sirf ek select
        onChange={(e) => {
          const checked = e.target.checked;

          setFormData6((prev) => {
            if (checked) {
              // ✅ sirf ek staff id rakho
              return {
                ...prev,
                name: staff.fullName,
                email: staff.email,
                hr: staff._id, // ek hi staff store hoga
              };
            } else {
              // ❌ unselect hone par clear kar do
              return {
                ...prev,
                name: "",
                email: "",
                hr: null,
              };
            }
          });
        }}
      />
      <label
        htmlFor={`staff-${staff._id}`}
        className="text-gray-300 text-sm"
      >
        {staff.fullName}
      </label>
    </div>
  ))}

    </div>





    
  </div>
)}





                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-gray-300 text-sm font-medium mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="user-name"
                    name="name"
                    type="text"
                    required
                    value={formData6.name}
                    onChange={handleChange6}
                    className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-gray-300 text-sm font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="user-email"
                    name="email"
                    type="email"
                    required
                    value={formData6.email}
                    onChange={handleChange6}
                    className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600"
                  />
                </div>



                {/* Password Field */}
      <div className="mb-4 relative">
        <label
          htmlFor="password"
          className="block text-gray-300 text-sm font-medium mb-2"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          value={formData6.password}
          onChange={handleChange6}
          className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-10 cursor-pointer text-gray-400 hover:text-white"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Confirm Password Field */}
      <div className="mb-4 relative">
        <label
          htmlFor="confirmPassword"
          className="block text-gray-300 text-sm font-medium mb-2"
        >
          Confirm Password
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type={showConfirm ? "text" : "password"}
          required
          value={formData6.confirmPassword}
          onChange={handleChange6}
          className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-10  text-gray-400 hover:text-white"
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

                <div className="flex justify-end pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-gray-200 font-bold py-2 px-4 rounded mr-2"
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
        ) : (
             editingUserId  ? "Update User" : "Add User"
        )}
      </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
      {/* Roles Panel */}
      {/* Roles Panel */}
      <div className="mt-6">
        <div className="bbg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-white mb-4">User Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Admin */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Admin</h4>
              <p className="text-sm text-gray-300">
                Full system access with user management capabilities
              </p>
              <ul className="mt-2 text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>Manage all users and staff</li>
                <li>Create and delete records</li>
                <li>Access all system features</li>
                <li>Configure system settings</li>
              </ul>
            </div>

            {/* Staff */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Staff</h4>
              <p className="text-sm text-gray-300">
                Basic access for care home employees
              </p>
              <ul className="mt-2 text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>View and create care plans</li>
                <li>Report incidents</li>
                <li>Update client records</li>
                <li>View schedules</li>
              </ul>
            </div>

            {/* Client */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Client/Family</h4>
              <p className="text-sm text-gray-300">
                Limited access for clients and family members
              </p>
              <ul className="mt-2 text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>View care plans</li>
                <li>View activities schedule</li>
                <li>Submit requests</li>
                <li>Complete satisfaction surveys</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
