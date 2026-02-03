"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
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
  FaTrash,
  FaBars,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import { MdMedicationLiquid } from "react-icons/md";
import Link from "next/link";
import { GrDocumentPerformance } from "react-icons/gr";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function Page() {
    const { user, logout } = useAuth();
  
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
    { icon: <GrDocumentPerformance />, label: "Performance Management", href: "/Performance-Management" , active: true,},
    { icon: <FaGraduationCap />, label: "Training", href: "/Training"},
    { icon: <FaShieldAlt />, label: "Compliance", href: "/Compliance" },
    { icon: <SiSimpleanalytics />, label: "Analytics", href: "/Analytics" },
    { icon: <FaUserCog />, label: "User Management", href: "/User-Management" },
  ];
   const allowedNavItems =
  user?.role === "Admin" || user?.role === "Staff" || user?.role === "Client"
    ? navItems
    : user?.role === "External" && Array.isArray(user.allowedPages)
    ? navItems.filter((item) =>
        user.allowedPages.some(
          (page) =>
            page.toLowerCase().replace(/\s+/g, "") ===
            item.label.toLowerCase().replace(/\s+/g, "")
        )
      )
    : [];
const [sidebarOpen, setSidebarOpen] = useState(false);
const [performanceData, setPerformanceData] = useState([]);
const [filteredPerformance, setFilteredPerformance] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [selected, setSelected] = useState("All Records");
  const { hasLowStock, setHasLowStock } = useAuth();
  const { hasReviews, setHasReviews } = useAuth();

const filters = ["All Records", "Upcoming", "Overdue"];
const [showForm, setShowForm] = useState(false);
const [message, setMessage] = useState('');
const [error, setError] = useState('');
const [formData, setFormData] = useState({
  staff: '',
  supervisions: '',
  appraisals: '',
  objectivesKpi: '',
  feedbackNotes: '',
  appraisalReminderDate: ''
});
const [editingId, setEditingId] = useState(null);
const [loading, setLoading] = useState(false);
const [showModal, setShowModal] = useState(false);
const [viewData, setViewData] = useState({});
const [staffMembers,setStaffMembers] = useState()

const handleEdit = (item) => {
  setFormData({
    staff: item.staff?._id || '',
    supervisions: item.supervisions,
    appraisals: item.appraisals,
    objectivesKpi: item.objectivesKpi,
    feedbackNotes: item.feedbackNotes,
    appraisalReminderDate: item.appraisalReminderDate.slice(0, 10),
  });
  setShowModal(true);
  setEditingId(item._id);
};



const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleCancel = () => {
  setShowModal(false);
  setFormData({
    staff: '',
    supervisions: '',
    appraisals: '',
    objectivesKpi: '',
    feedbackNotes: '',
    appraisalReminderDate: ''
  });
  setEditingId(null);
};
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form is submitting..."); // ✅ DEBUG line
  setLoading(true);

  const token = localStorage.getItem("token");
  if (!token) return setError("Unauthorized");

  const config = { headers: { Authorization: `Bearer ${token}` } };
  const payload = { ...formData };
  console.log("Payload:", payload); // ✅ DEBUG payload

  const request = editingId
    ? axios.put(`https://admin-panel-backend-alpha.vercel.app/performance/${editingId}`, payload, config)
    : axios.post(`https://admin-panel-backend-alpha.vercel.app/performance`, payload, config);

  request
    .then(res => {
      console.log("Success:", res.data); // ✅ DEBUG response
      setMessage(editingId ? "Updated" : "Added");
      setEditingId(null);
      setShowForm(false);
      toast.success(editingId ? "Record updated successfully" : "Record added successfully");
      setShowModal(false); // ✅ Close modal
      fetchPerformance();
      setFormData({
        staff: '',
        supervisions: '',
        appraisals: '',
        objectivesKpi: '',
        feedbackNotes: '',
        appraisalReminderDate: ''
      });
      return axios.get("https://admin-panel-backend-alpha.vercel.app/performance", config)
        .then(res => {
          setPerformanceData(res.data.data);
          setFilteredPerformance(res.data.data);
        });

    })
    .catch(err => {
      console.error("Error:", err.response?.data); // ✅ Better error logging
      setError(err.response?.data?.error || "Failed");
    })
    .finally(() => setLoading(false));
};

const fetchPerformance = async () => {
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/performance", config);
    setPerformanceData(res.data.data);
    setFilteredPerformance(res.data.data);
  } catch (err) {
    setError("Could not fetch data");
  }
};
const handleDelete = async (id) => {
  if (!window.confirm("Confirm delete?")) return;
  const token = localStorage.getItem("token");
  try {
    await axios.delete(`https://admin-panel-backend-alpha.vercel.app/performance/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Record deleted successfully");
    fetchPerformance();
  } catch (err) {
    toast.error("Delete failed");
    setError("Delete failed");
  }
};

useEffect(() => {
  fetchPerformance();
}, []);

useEffect(() => {
  let filtered = performanceData;

  if (selected !== "All Records") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter(item => {
      const reminder = new Date(item.appraisalReminderDate);
      reminder.setHours(0, 0, 0, 0);
      if (selected === "Upcoming") return reminder > today;
      if (selected === "Overdue") return reminder <= today;
      return true;
    });
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      item.staff?.fullName?.toLowerCase().includes(q) ||
      item.supervisions.toLowerCase().includes(q) ||
      item.appraisals.toLowerCase().includes(q) ||
      item.objectivesKpi.toLowerCase().includes(q) ||
      item.feedbackNotes.toLowerCase().includes(q)
    );
  }

  setFilteredPerformance(filtered);
}, [searchQuery, selected, performanceData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('https://admin-panel-backend-alpha.vercel.app/hr', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(response => {
        setStaffMembers(response.data.allHr);  // Staff data set
        setMessage('Staff fetched successfully');
      })
      .catch(error => {
        setError(error.response?.data?.msg || 'Failed to fetch staff');
      });
  }, []);


useEffect(() => {
  console.log("Reminder interval started");

  const token = localStorage.getItem("token");

  const checkReminders = async () => {
    try {
      const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/performance/reminders/due", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dueReminders = res.data?.data || [];

      if (dueReminders.length > 0) {
        const names = dueReminders
          .map(item => item.staff?.fullName)
          .filter(Boolean)
          .join(", ");

        toast.info(`🔔 Reminder due for: ${names}`, {
          toastId: "reminder-toast" // ✅ No duplicates
        });
      }
    } catch (error) {
      console.error("Reminder check failed:", error?.response?.data || error.message);
    }
  };

  checkReminders(); // Run once on mount

  const interval = setInterval(checkReminders, 5 * 60 * 1000);

  return () => clearInterval(interval); // Clean up
}, []);
 // Dependencies to re-run effect
// viewData
// staff: '',
//   supervisions: '',
//   appraisals: '',
//   objectivesKpi: '',
//   feedbackNotes: '',
//   appraisalReminderDate
const [viewsupervisions, setViewSupervisions] = useState('');
const [viewappraisals, setViewAppraisals] = useState('');
const [viewobjectivesKpi, setViewObjectivesKpi] = useState('');
const [viewfeedbackNotes, setViewFeedbackNotes] = useState(''); 
const [viewappraisalReminderDate, setViewAppraisalReminderDate] = useState('');
const  [viewstaff, setViewStaff] = useState(null);
const [showModals, setShowModals] = useState(false);

const handleView = (item) => {
  setViewSupervisions(item.supervisions);
  setViewAppraisals(item.appraisals);
  setViewObjectivesKpi(item.objectivesKpi);
  setViewFeedbackNotes(item.feedbackNotes);
  setViewAppraisalReminderDate(item.appraisalReminderDate.slice(0, 10));
  setViewStaff(item.staff.fullName);
  setShowModals(true);

};


const data = {
  supervisions: viewsupervisions,
  appraisals: viewappraisals,
  objectivesKpi: viewobjectivesKpi,
  feedbackNotes: viewfeedbackNotes,
  appraisalReminderDate: viewappraisalReminderDate,
  staff: viewstaff,
};



 const [openMenu, setOpenMenu] = useState(false);

  // 📄 PDF Download
  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const staffName = item.staff?.fullName || "Unknown Staff";

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Staff Appraisal Details", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Field", "Value"]],
      body: [
        ["Staff", staffName],
        ["Supervisions", item.supervisions || "N/A"],
        ["Appraisals", item.appraisals || "N/A"],
        ["Objectives / KPIs", item.objectivesKpi || "N/A"],
        ["Feedback Notes", item.feedbackNotes || "N/A"],
        [
          "Scheduled Appraisals Reminder",
          item.appraisalReminderDate ? item.appraisalReminderDate.slice(0, 10) : "Not Set",
        ],
      ],
    });

    doc.save(`${staffName}_appraisal.pdf`);
  };

  // 📊 CSV Download (same style as PDF)
  const handleDownloadCsv = (item) => {
    const staffName = item.staff?.fullName || "Unknown Staff";

    const headers = ["Field,Value"];
    const rows = [
      `Staff,${staffName}`,
      `Supervisions,${item.supervisions || "N/A"}`,
      `Appraisals,${item.appraisals || "N/A"}`,
      `Objectives / KPIs,${item.objectivesKpi || "N/A"}`,
      `Feedback Notes,${item.feedbackNotes || "N/A"}`,
      `Scheduled Appraisals Reminder,${
        item.appraisalReminderDate ? item.appraisalReminderDate.slice(0, 10) : "Not Set"
      }`,
    ];

    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${staffName}_appraisal.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };













  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/Login");
  }, [user, router]);

  if (!user) return null;






  return (
    <div className="bg-[#111827] min-h-screen">
      <Navbar />
 {showModals && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-auto">
          <div className="relative w-full max-w-3xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] border border-gray-700 bg-gradient-to-br from-[#1b1e25] to-[#111319] text-white px-8 py-10 max-h-[90vh] overflow-y-auto">
            {/* ❌ Close Button */}
            <button
              onClick={() => setShowModals(false)}
              className="absolute top-4 right-4 w-11 h-11 cursor-pointer bg-[#2b2e3a] hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:rotate-90 transition-all duration-300"
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

            {/* 🧾 Heading */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 flex items-center justify-center gap-2 sm:gap-3">
          Performance Management
            </h2>

            {/* 📄 Info Fields */}
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
      {/* Mobile Navbar */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
          Performance Management
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
          {user?.fullName
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
            Performance Management
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 h-full overflow-y-auto">
            {/* Search & Add */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-200">Record</h3>
                <p className="text-sm text-gray-400">Manage staff performance and goals</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-600 pl-10 pr-4 py-2 bg-gray-700 text-white"
                    placeholder="Search Perfor.."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-[#4a48d4] hover:bg-[#4A49B0] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Record
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-2 text-white">
              {filters.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(label)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selected === label
                      ? "bg-gray-700 text-primary-light"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
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
                    {["Staff Name","Supervisions","Appraisals","Objectives / KPIs","Scheduled Reminder","Actions",].map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y text-gray-300 divide-gray-700">
                  {filteredPerformance.map((staff) => (
                    <tr key={staff._id}>
                                        <td className="px-4 py-4 whitespace-nowrap">{staff.staff?.fullName}</td>
                      <td className="px-4 py-4">{staff.supervisions}</td>
                      <td className="px-4 py-4">{staff.appraisals}</td>
                      <td className="px-4 py-4">{staff.objectivesKpi}</td>
                      <td className="px-4 py-4">{staff.appraisalReminderDate ? staff.appraisalReminderDate.slice(0, 10) : ""}</td>
                      <td className="px-4 py-4 flex gap-3 relative">
      {/* Action Buttons */}
      <FaEye
        className="cursor-pointer hover:text-blue-500"
        onClick={() => handleView(staff)}
      />
      <FaEdit
        className="cursor-pointer hover:text-yellow-500"
        onClick={() => handleEdit(staff)}
      />
      <FaTrash
        className="cursor-pointer hover:text-red-500"
        onClick={() => handleDelete(staff._id)}
      />

      {/* 📥 Download Dropdown (PDF + CSV) */}
      <div className="relative">
        <FaDownload
          className="cursor-pointer hover:text-green-600"
          onClick={() => setOpenMenu((prev) => !prev)}
        />

        {openMenu && (
          <div   className="absolute right-0 mt-2 
             bg-white/20 backdrop-blur-xl border border-white/30 
             shadow-lg rounded-md z-10 w-36 
             transition-all duration-200 cursor-pointer">
            <button
              onClick={() => {
                handleDownloadPdf(staff);
                setOpenMenu(false);
              }}
 className="block w-full text-left px-3 py-2 
               text-sm text-white hover:bg-white/10 transition cursor-pointer"            >
              Download PDF
            </button>

            <button
              onClick={() => {
                handleDownloadCsv(staff);
                setOpenMenu(false);
              }}
 className="block w-full text-left px-3 py-2 
               text-sm text-white hover:bg-white/10 transition cursor-pointer"            >
              Download CSV
            </button>
          </div>
        )}
      </div>
    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPerformance.length === 0 && (
                <p className="text-center py-10 text-gray-400">No records found.</p>
              )}
            </div>
          </div>

          {/* Modal */}
         {showModal && (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-lg max-h-[90vh] overflow-y-auto">
    
      {/* Modal Title */}
      <h2 className="text-center text-white font-semibold mb-6 text-xl sm:text-2xl">
        {editingId ? "Edit Performance Record" : "Add New Performance Record"}
      </h2>

      {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 " >
        
        {/* Staff Name */}
                   <div className="mb-2">
        <label className="block text-sm font-medium text-gray-300">Staff Member</label>
        <select
          name="staff"
          value={formData.staff}
          onChange={handleChange}
          required
          className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
        >
          <option value="">Select Staff Member</option>
          {staffMembers && staffMembers.map((staff) => (
            <option key={staff._id} value={staff._id}>
              {staff.fullName}
            </option>
          ))}
        </select>
      </div>

        {/* Supervisions */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Supervisions
          </label>
          <input
            type="text"
            name="supervisions"
            value={formData.supervisions}
            onChange={handleChange}
            placeholder="e.g. 2 per month"
            className="w-full bg-gray-700 text-white rounded p-2 mb-2"
          />
        </div>



 {/* Scheduled Appraisals Reminder */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Scheduled Appraisals Reminder
          </label>
          <input
            type="date"
            name="appraisalReminderDate"
            value={formData.appraisalReminderDate || ""}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded p-2 mb-2"
          />
        </div>

        {/* Appraisals */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Appraisals
          </label>
          <input
            type="text"
            name="appraisals"
            value={formData.appraisals}
            onChange={handleChange}
            placeholder="e.g. Quarterly"
            className="w-full bg-gray-700 text-white rounded p-2 mb-2"
          />
        </div>

        {/* KPIs */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Objectives / KPIs
          </label>
          <input
            type="text"
            name="objectivesKpi"
            value={formData.objectivesKpi}
            onChange={handleChange}
            placeholder="Enter objectives or KPIs"
            className="w-full bg-gray-700 text-white rounded p-2 mb-2"
          />
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Feedback Notes
          </label>
          <textarea
            name="feedbackNotes"
            value={formData.feedbackNotes}
            onChange={handleChange}
            placeholder="Write feedback notes here..."
            rows="3"
            className="w-full bg-gray-700 text-white rounded p-2"
          ></textarea>
        </div>

       

       
        {/* Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-600 hover:bg-gray-500 cursor-pointer text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 cursor-pointer text-white px-4 py-2 rounded"
          >
            {editingId ? "Update Record" : "Add Record"}
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
}
