"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import { GrDocumentPerformance } from "react-icons/gr";
import { SiSimpleanalytics } from "react-icons/si";
import { IoDocumentAttach } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";
import { FaDownload } from "react-icons/fa";

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
  FaBars,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { MdMedicationLiquid } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
export default function Page() {
  const { hasClients } = useAuth(); 
  const { hasLowStock, setHasLowStock } = useAuth();
  const { user } = useAuth();
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
    { icon: <LuLayoutTemplate />, label: "Template", href: "/Template", }, 

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
               { icon: <TbClockRecord />, label: "Medication-Record", href: "/Medication-Record"},

          { icon: <FaUsers />, label: "HR Management", href: "/HR-Management" },
          {
            icon: <IoDocumentAttach />,
            label: "Documents Management",
            href: "/Documents-Management",
          },
          {
            icon: <GrDocumentPerformance />,
            label: "Performance Management",
            href: "/Performance-Management",
          },
          { icon: <FaGraduationCap />, label: "Training", href: "/Training" },
          {
            icon: <FaShieldAlt />,
            label: "Compliance",
            href: "/Compliance"
          },
          {
            icon: <SiSimpleanalytics />,
            label: "Analytics",
            href: "/Analytics",
            active: true,
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
  const [analytics, setAnalytics] = useState([]);
  const [activeTab, setActiveTab] = useState("analytics");

  const [carePlanAuditLogs, setCarePlanAuditLogs] = useState([]);
  const [complianceAuditLogs, setComplianceAuditLogs] = useState([]);
    const [medicationAuditLogs, setMedicationAuditLogs] = useState([]);
      const { hasReviews, setHasReviews } = useAuth();



  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/Login");
  }, [user, router]);

  // Fetch analytics data
  useEffect(() => {
    if (activeTab === "analytics") {
      axios
        .get("https://admin-panel-backend-alpha.vercel.app/analytics/care-settings", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setAnalytics(res.data))
        .catch((err) => console.error("Error loading analytics:", err));
    }
  }, [activeTab]);

  // Fetch compliance logs
  useEffect(() => {
    if (activeTab === "compliance") {
      axios
        .get("https://admin-panel-backend-alpha.vercel.app/compliance/audit-logs", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setComplianceAuditLogs(res.data))
        .catch((err) =>
          console.error("Error loading compliance audit logs:", err)
        );
    }
  }, [activeTab]);



   // === FETCH MEDICATION AUDIT LOGS ===
  useEffect(() => {
    if (activeTab === "medication") {
      axios
        .get("https://admin-panel-backend-alpha.vercel.app/medications/audit-logs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => setMedicationAuditLogs(res.data))
        .catch((err) => {
          console.error("Error loading medication audit logs:", err);
          toast.error("Failed to load medication logs");
        });
    }
  }, [activeTab]);


  // Fetch care plan logs
  useEffect(() => {
    if (activeTab === "careplan") {
      axios
        .get("https://admin-panel-backend-alpha.vercel.app/carePlanning/audit-logs", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setCarePlanAuditLogs(res.data))
        .catch((err) =>
          console.error("Error loading care plan audit logs:", err)
        );
    }
  }, [activeTab]);

  // Delete compliance log
  const handleDeleteComplianceAudit = async (id) => {
    if (window.confirm("Delete this compliance audit log?")) {
      try {
        await axios.delete(
          `https://admin-panel-backend-alpha.vercel.app/compliance/audit-logs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setComplianceAuditLogs((prev) => prev.filter((log) => log._id !== id));
        toast.success("Compliance audit log deleted");
      } catch (error) {
        console.error(error);
      }
    }
  };

// download pdf //////////////////////////
// 📦 State for dropdown toggle
const [openDropdownId, setOpenDropdownId] = useState(null);

// 📥 Toggle dropdown
const toggleDropdown = (id) => {
  setOpenDropdownId((prevId) => (prevId === id ? null : id));
};


// ==========================
// 📄 PDF Export
// ==========================
const handleDownloadPdf = async (data, type) => {
  try {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    let title = "Analytics Report";
    let tableHead = [];
    let tableBody = [];

    switch (type) {
      case "analytics":
        title = "Analytics Summary";
        tableHead = [["Care Setting", "Total Staff", "Total Clients", "Valid Trainings", "Expired Trainings"]];
        tableBody = data.map((row) => [
          row.careSetting,
          row.totalStaff,
          row.totalClients,
          row.validTrainings,
          row.expiredTrainings,
        ]);
        break;

      case "compliance":
        title = "Compliance Audit Logs";
        tableHead = [["User", "Action", "Module", "Requirement", "Timestamp"]];
        tableBody = data.map((log) => [
          log.user || "N/A",
          log.action,
          log.targetType,
          log.requirement,
          new Date(log.timestamp).toLocaleString(),
        ]);
        break;

      case "careplan":
        title = "Care Plan Audit Logs";
        tableHead = [["User", "Action", "Module", "Client", "Timestamp"]];
        tableBody = data.map((log) => [
          log.user || "N/A",
          log.action,
          log.targetType || "Careplan",
          log.client?.fullName || "N/A",
          new Date(log.timestamp).toLocaleString(),
        ]);
        break;

      case "medication":
        title = "Medication Audit Logs";
        tableHead = [["User", "Action", "Module", "Medication", "Timestamp"]];
        tableBody = data.map((log) => [
          log.user || "N/A",
          log.action,
          log.targetType,
          log.requirement || "—",
          new Date(log.timestamp).toLocaleString(),
        ]);
        break;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: tableHead,
      body: tableBody,
    });

    doc.save(`${type}_report.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
  }
};

// ==========================
// 📊 CSV Export
// ==========================
const handleDownloadCsv = (data, type) => {
  let headers = [];
  let rows = [];

  switch (type) {
    case "analytics":
      headers = ["Care Setting,Total Staff,Total Clients,Valid Trainings,Expired Trainings"];
      rows = data.map(
        (r) => `${r.careSetting},${r.totalStaff},${r.totalClients},${r.validTrainings},${r.expiredTrainings}`
      );
      break;
    case "compliance":
      headers = ["User,Action,Module,Requirement,Timestamp"];
      rows = data.map(
        (l) => `${l.user || "N/A"},${l.action},${l.targetType},${l.requirement},${new Date(l.timestamp).toLocaleString()}`
      );
      break;
    case "careplan":
      headers = ["User,Action,Module,Client,Timestamp"];
      rows = data.map(
        (l) => `${l.user || "N/A"},${l.action},${l.targetType},${l.client?.fullName || "N/A"},${new Date(l.timestamp).toLocaleString()}`
      );
      break;
    case "medication":
      headers = ["User,Action,Module,Medication,Timestamp"];
      rows = data.map(
        (l) => `${l.user || "N/A"},${l.action},${l.targetType},${l.requirement || "—"},${new Date(l.timestamp).toLocaleString()}`
      );
      break;
  }

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}_report.csv`;
  link.click();
  URL.revokeObjectURL(url);
};



   // === DELETE MEDICATION AUDIT LOG ===
  const handleDeleteMedicationAudit = async (id) => {
    if (window.confirm("Delete this medication audit log?")) {
      try {
        await axios.delete(`https://admin-panel-backend-alpha.vercel.app/medications/audit-logs/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMedicationAuditLogs((prev) => prev.filter((log) => log._id !== id));
        toast.success("Medication audit log deleted");
      } catch (error) {
        console.error(error);
        toast.error("Error deleting log");
      }
    }
  };



  // Delete care plan log
  const handleDeleteCarePlanAudit = async (id) => {
    if (window.confirm("Delete this care plan audit log?")) {
      try {
        await axios.delete(
          `https://admin-panel-backend-alpha.vercel.app/care-planning/audit-logs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCarePlanAuditLogs((prev) => prev.filter((log) => log._id !== id));
        toast.success("Care plan audit log deleted");
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#111827] min-h-screen">
      <Navbar />

      {/* Mobile Navbar Toggle */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
          Analytics
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
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-200">
              Reporting Analytics
            </h3>
            <p className="text-xs mb-2 sm:text-sm text-gray-400">
              Filter Setting Analytics
            </p>
          </div>

          {/* Dropdown */}
          <div className="w-full sm:min-w-[180px] font-medium outline-none mb-4 px-3 py-2 text-white text-sm relative z-10">
            <div className="relative">
             <select
  value={activeTab}
  onChange={(e) => setActiveTab(e.target.value)}
  className="w-full cursor-pointer px-4 py-2 mt-2 bg-gray-800 text-white rounded-md shadow-md appearance-none pr-10"
>
  <option value="" disabled hidden>
    Select Filter
  </option>
  <option value="analytics">Analytics</option>
  <option value="compliance">Compliance</option>
  <option value="careplan">Care Plan</option>
  <option value="medication">Medication</option> {/* ✅ New Option */}
</select>

              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
                ▼
              </div>
            </div>
          </div>

          <div className="text-white h-full bg-gray-800 overflow-y-auto my-scroll">
      {/* ================= Compliance Tab ================= */}
{activeTab === "compliance" && (
  <div className="p-4 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-medium text-gray-200">
          Compliance Audit Logs
        </h3>
        <p className="text-sm text-gray-400">Recent Compliance Activity</p>
      </div>

      {/* 🔹 One Download Button */}
      <div className="relative">
        <button
          onClick={() =>
            setOpenDropdownId(openDropdownId === "compliance" ? null : "compliance")
          }
          className=" cursor-pointer flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all"
        >
          <FaDownload /> Download
        </button>

        {openDropdownId === "compliance" && (
          <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-md z-10 w-40">
            <button 
              onClick={() => {
                handleDownloadPdf(complianceAuditLogs, "compliance");
                setOpenDropdownId(null);
              }}
              className=" cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Export as PDF
            </button>
            <button
              onClick={() => {
                handleDownloadCsv(complianceAuditLogs, "compliance");
                setOpenDropdownId(null);
              }}
              className=" cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Export as CSV
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Table */}
    <table className="w-full table-auto text-sm">
      <thead className="bg-gray-700 text-left">
        <tr>
          <th className="p-3">User</th>
          <th className="p-3">Action</th>
          <th className="p-3">Module</th>
          <th className="p-3">Requirement</th>
          <th className="p-3">Timestamp</th>
          <th className="p-3 text-center">Delete</th>
        </tr>
      </thead>
      <tbody>
        {complianceAuditLogs.length > 0 ? (
          complianceAuditLogs.map((log, i) => (
            <tr key={i} className="border-t border-gray-600 hover:bg-gray-700">
              <td className="p-3">{log.user || "N/A"}</td>
              <td className="p-3">{log.action}</td>
              <td className="p-3">{log.targetType}</td>
              <td className="p-3">{log.requirement || "—"}</td>
              <td className="p-3 text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="p-3 text-center">
                <FaTrash
                  className="hover:text-red-500 cursor-pointer"
                  onClick={() => handleDeleteComplianceAudit(log._id)}
                />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center py-4 text-gray-400">
              No audit logs available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}

{/* ================= Care Plan Tab ================= */}
{activeTab === "careplan" && (
  <div className="p-4 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-medium text-gray-200">
          Care Plan Audit Logs
        </h3>
        <p className="text-sm text-gray-400">Recent Care Planning Activity</p>
      </div>

      {/* One Download Button */}
      <div className="relative">
        <button
          onClick={() =>
            setOpenDropdownId(openDropdownId === "careplan" ? null : "careplan")
          }
          className=" cursor-pointer flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all"
        >
          <FaDownload /> Download
        </button>

        {openDropdownId === "careplan" && (
          <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-md z-10 w-40">
            <button
              onClick={() => {
                handleDownloadPdf(carePlanAuditLogs, "careplan");
                setOpenDropdownId(null);
              }}
              className=" cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Export as PDF
            </button>
            <button
              onClick={() => {
                handleDownloadCsv(carePlanAuditLogs, "careplan");
                setOpenDropdownId(null);
              }}
              className=" cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Export as CSV
            </button>
          </div>
        )}
      </div>
    </div>

    <table className="w-full table-auto text-sm">
      <thead className="bg-gray-700 text-left">
        <tr>
          <th className="p-3">User</th>
          <th className="p-3">Action</th>
          <th className="p-3">Module</th>
          <th className="p-3">Client</th>
          <th className="p-3">Timestamp</th>
          <th className="p-3 text-center">Delete</th>
        </tr>
      </thead>
      <tbody>
        {carePlanAuditLogs.length > 0 ? (
          carePlanAuditLogs.map((log, i) => (
            <tr key={i} className="border-t border-gray-600 hover:bg-gray-700">
              <td className="p-3">{log.user || "N/A"}</td>
              <td className="p-3">{log.action}</td>
              <td className="p-3">{log.targetType || "Careplan"}</td>
              <td className="p-3">{log.client?.fullName || "N/A"}</td>
              <td className="p-3 text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="p-3 text-center">
                <FaTrash
                  className="hover:text-red-500 cursor-pointer"
                  onClick={() => handleDeleteCarePlanAudit(log._id)}
                />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center py-4 text-gray-400">
              No care planning audit logs available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}

{/* ================= Analytics Tab ================= */}
{activeTab === "analytics" && (
  <div className="p-4 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-medium text-gray-200">
          Analytics Summary
        </h3>
        <p className="text-sm text-gray-400">Performance Overview</p>
      </div>

      <div className="relative">
        <button
          onClick={() =>
            setOpenDropdownId(openDropdownId === "analytics" ? null : "analytics")
          }
          className=" cursor-pointer flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all"
        >
          <FaDownload /> Download
        </button>

        {openDropdownId === "analytics" && (
          <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-md z-10 w-40">
            <button
              onClick={() => {
                handleDownloadPdf(analytics, "analytics");
                setOpenDropdownId(null);
              }}
              className=" cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Export as PDF
            </button>
            <button
              onClick={() => {
                handleDownloadCsv(analytics, "analytics");
                setOpenDropdownId(null);
              }}
              className=" cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Export as CSV
            </button>
          </div>
        )}
      </div>
    </div>

    <table className="w-full table-auto text-sm">
      <thead className="bg-gray-700 text-left">
        <tr>
          <th className="p-3">Care Setting</th>
          <th className="p-3">Total Staff</th>
          <th className="p-3">Total Clients</th>
          <th className="p-3">Valid Trainings</th>
          <th className="p-3">Expired Trainings</th>
        </tr>
      </thead>
      <tbody>
        {analytics.length > 0 ? (
          analytics.map((row, i) => (
            <tr key={i} className="border-t border-gray-600 hover:bg-gray-700">
              <td className="p-3">{row.careSetting}</td>
              <td className="p-3">{row.totalStaff}</td>
              <td className="p-3">{row.totalClients}</td>
              <td className="p-3 text-green-400">{row.validTrainings}</td>
              <td className="p-3 text-red-400">{row.expiredTrainings}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="text-center py-4 text-gray-400">
              No analytics available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}

{/* ================= Medication Tab ================= */}
{activeTab === "medication" && (
  <div className="p-4 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-medium text-gray-200">
          Medication Audit Logs
        </h3>
        <p className="text-sm text-gray-400">Medication Stock Activity</p>
      </div>

      <div className="relative">
        <button
          onClick={() =>
            setOpenDropdownId(openDropdownId === "medication" ? null : "medication")
          }
          className=" cursor-pointer flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all"
        >
          <FaDownload /> Download
        </button>

        {openDropdownId === "medication" && (
          <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-md z-10 w-40">
            <button
              onClick={() => {
                handleDownloadPdf(medicationAuditLogs, "medication");
                setOpenDropdownId(null);
              }}
              className=" cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Export as PDF
            </button>
            <button
              onClick={() => {
                handleDownloadCsv(medicationAuditLogs, "medication");
                setOpenDropdownId(null);
              }}
              className=" cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Export as CSV
            </button>
          </div>
        )}
      </div>
    </div>

    <table className="w-full table-auto text-sm">
      <thead className="bg-gray-700 text-left">
        <tr>
          <th className="p-3">User</th>
          <th className="p-3">Action</th>
          <th className="p-3">Medication</th>
          <th className="p-3">Stock</th>
          <th className="p-3">Timestamp</th>
          <th className="p-3 text-center">Delete</th>
        </tr>
      </thead>
      <tbody>
        {medicationAuditLogs.length > 0 ? (
          medicationAuditLogs.map((log, i) => (
            <tr key={i} className="border-t border-gray-600 hover:bg-gray-700">
              <td className="p-3">{log.user || "N/A"}</td>
              <td className="p-3">{log.action}</td>
              <td className="p-3">{log.targetType}</td>
              <td className="p-3">{log.stock}</td>
              <td className="p-3 text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="p-3 text-center">
                <FaTrash
                  className="hover:text-red-500 cursor-pointer"
                  onClick={() => handleDeleteMedicationAudit(log._id)}
                />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center py-4 text-gray-400">
              No medication logs available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}


          </div>
        </main>
      </div>
    </div>
  );
}
