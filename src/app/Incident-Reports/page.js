"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import { SiSimpleanalytics } from "react-icons/si";
import { IoDocumentAttach } from "react-icons/io5";
import { LuLayoutTemplate } from  "react-icons/lu";

import { TbClockRecord } from "react-icons/tb";

import Image from "next/image";
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
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import { GrDocumentPerformance } from "react-icons/gr";

import "jspdf-autotable"; // Optional for table format
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { MdMedicationLiquid } from "react-icons/md";
import { set } from "nprogress";
import { BsArrowsFullscreen } from "react-icons/bs";

const Page = () => {
  const {hasClients} = useAuth()
  const { user, logout } = useAuth();

  // Define your navigation links here with proper routes
 const navItems = [
  { icon: <FaThLarge />, label: "Dashboard", href: "/Dashboard" },
  { icon: <FaUser />, label: "Resident Management", href: "/Client-Management" },
  { icon: <FaClipboardList />, label: "Care Planning", href: "/Care-Planning"},
  { icon: <FaExclamationTriangle />, label: "Incident Reports", href: "/Incident-Reports",active: true },
  { icon: <LuLayoutTemplate />, label: "Template", href: "/Template", }, 
  { icon: <FaSearch />, label: "Social Activity", href: "/Social-Activity" },
  { icon: <MdMedicationLiquid />, label: "Medication Management", href: "/Medication-Management" },

  ...(hasClients
    ? []
    : [
                { icon: <TbClockRecord />, label: "Medication-Record", href: "/Medication-Record" },

        { icon: <FaUsers />, label: "HR Management", href: "/HR-Management" },
        { icon: <IoDocumentAttach />, label: "Documents Management", href: "/Documents-Management" },
        { icon: <GrDocumentPerformance />, label: "Performance-Management", href: "/Performance-Management" },
        { icon: <FaGraduationCap />, label: "Training", href: "/Training" },
        { icon: <FaShieldAlt />, label: "Compliance", href: "/Compliance" },
        { icon: <SiSimpleanalytics />, label: "Analytics", href: "/Analytics" },
        { icon: <FaUserCog />, label: "User Management", href: "/User-Management" },
      ]),
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
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState("All Incidents");
  const filters = ["All Incidents", "Open", "Under Investigation", "Resolved"];
  const [patient, setPatient] = useState([]); // For HR/staff members
  const [previewImage, setPreviewImage] = useState(null);
    const { hasLowStock, setHasLowStock } = useAuth();

  const [staff, setStaff] = useState([]);
  const [incidentData, setIncidentData] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };
   const handleChange2 = (e) => {
    const { name, value } = e.target;
    setFormData2((prev) => ({ ...prev, [name]: value }));
  };

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

const [previewVideo, setPreviewVideo] = useState(null);


  const [showModal2, setShowModal2] = useState(false);
  const [formData2, setFormData2] = useState({
    incidentDate: "",
    incidentType: "",
    severity: "",
    reportedBy: "",
    client: "",
    incidentDetails: "",
    status: "Open",
    immediateActions: "",
    staffInvolved: "",
    peopleNotified: "",
    outcomeStatus: "",
  });
  const [editingIncidentId, setEditingIncidentId] = useState(null);

  const router = useRouter();

  // 📊 Calculate 6-month overview
  const last6MonthsStats = React.useMemo(() => {
    const stats = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthKey = `${monthName} ${year}`;
      
      const count = incidentData.filter(inc => {
        if (!inc.incidentDate) return false;
        const incDate = new Date(inc.incidentDate);
        return incDate.getMonth() === d.getMonth() && incDate.getFullYear() === d.getFullYear();
      }).length;
      
      stats.push({ label: monthKey, count });
    }
    return stats;
  }, [incidentData]);

  // Redirect to login if not authenticated

  // Fetch incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/incident/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncidentData(res.data.incidents);
        setFilteredIncidents(res.data.incidents);
        setMessage("Incidents fetched successfully");
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to fetch incidents");
      }
    };
    fetchIncidents();
  }, []);

  // Filter incidents by status
  useEffect(() => {
    let filtered = [];

    // Step 1: Status filter
    if (selected === "All Incidents") {
      filtered = incidentData;
    } else {
      filtered = incidentData.filter((item) => item.status === selected);
    }

    // Step 2: Search filter (by client full name)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const clientName =
          patient.find((staff) => staff._id === item.client?._id)?.fullName ||
          "";
        return clientName.toLowerCase().includes(query);
      });
    }

    setFilteredIncidents(filtered);
  }, [selected, incidentData, searchQuery, patient]);

  const handleEdit = (incident) => {
    console.log(incident);
    
    setFormData2({
      incidentDate: incident.incidentDate.slice(0, 10),
      incidentType: incident.incidentType,
      severity: incident.severity,
      reportedBy: incident.reportedBy,
      incidentDetails: incident.incidentDetails,
      status: incident.status,
      client: incident.client._id,
      immediateActions: incident.immediateActions || "",
      peopleNotified: incident.peopleNotified || "",
      outcomeStatus: incident.outcomeStatus || "",
      staffInvolved: incident.staffInvolved || "",
    });
    setAttachments(incident.attachments || []);
    setShowModal2(true);
    setEditingIncidentId(incident._id);
  };

  const handleCancel11 = () => {
    setShowModal2(false);
    setFormData2({
      incidentDate: "",
      incidentType: "",
      severity: "",
      reportedBy: "",
      incidentDetails: "",
      client: "",
      status: "Open",
      immediateActions: "",
      peopleNotified: "",
      outcomeStatus: "",
      staffInvolved: "",
    });
    setEditingIncidentId(null); // Reset editing state
    setAttachments([]); // Reset attachments
    setError(""); // Clear any error messages
    setMessage(""); // Clear any success messages
  };

    const [openDropdownId, setOpenDropdownId] = useState(null); // ✅ Add this
  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };
  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Incident Reports", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Field", "Value"]],
      body: [
        ["IncidentDate", item.incidentDate?.slice(0, 10) || ""],
        ["IncidentType", item.incidentType || ""],
        ["Severity", item.severity || ""],
        ["ReportedBy", item.reportedBy || ""],
        ["IncidentDetails", item.incidentDetails || ""],
        ["Status", item.status || ""],
        ["Patient", item.client?.fullName || ""],
        ["ImmediateActions", item.immediateActions || ""],
        ["PeopleNotified", item.peopleNotified || ""],
        ["OutcomeStatus", item.outcomeStatus || ""],
        ["StaffInvolved", item.staffInvolved || ""],
      ],
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    async function addAttachments() {
      if (item.attachments?.length > 0) {
        doc.setFontSize(14);
        doc.text("Attachments:", 14, currentY);
        currentY += 10;

        for (let i = 0; i < item.attachments.length; i++) {
          const url = item.attachments[i];
          const ext = url.split(".").pop().toLowerCase();

          const imageFormats = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "heic"];
          const videoFormats = ["mp4", "mov", "mkv", "webm", "avi"];

          if (ext === "pdf") {
            const iconUrl = "https://cdn-icons-png.flaticon.com/512/337/337946.png";
            const res = await fetch(iconUrl);
            const blob = await res.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            await new Promise((resolve) => {
              reader.onloadend = function () {
                const base64 = reader.result;
                if (currentY + 20 > 280) {
                  doc.addPage();
                  currentY = 20;
                }
                doc.addImage(base64, "PNG", 14, currentY, 14, 14);
                doc.link(14, currentY, 14, 14, { url });
                currentY += 20;
                resolve();
              };
            });
          } else if (imageFormats.includes(ext)) {
            try {
              const res = await fetch(url);
              const blob = await res.blob();
              const reader = new FileReader();
              reader.readAsDataURL(blob);

              await new Promise((resolve) => {
                reader.onloadend = function () {
                  const base64 = reader.result;
                  if (currentY + 60 > 280) {
                    doc.addPage();
                    currentY = 20;
                  }
                  doc.addImage(base64, "JPEG", 14, currentY, 60, 50);
                  currentY += 60;
                  resolve();
                };
              });
            } catch (err) {
              doc.setTextColor(255, 0, 0);
              doc.text(`Image failed to load`, 14, currentY);
              currentY += 10;
            }
          } else if (videoFormats.includes(ext)) {
            const videoIcon = "https://cdn-icons-png.flaticon.com/512/727/727245.png";
            const res = await fetch(videoIcon);
            const blob = await res.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            await new Promise((resolve) => {
              reader.onloadend = function () {
                const iconBase64 = reader.result;
                if (currentY + 25 > 280) {
                  doc.addPage();
                  currentY = 20;
                }
                doc.addImage(iconBase64, "PNG", 14, currentY, 18, 18);
                doc.setTextColor(0, 122, 255);
                doc.textWithLink("View Video", 36, currentY + 14, { url });
                doc.setTextColor(0, 0, 0);
                currentY += 25;
                resolve();
              };
            });
          } else {
            doc.setTextColor(200, 0, 0);
            doc.text(`Unsupported File: ${url}`, 14, currentY);
            currentY += 10;
          }
        }
      }
    }

    await addAttachments();

    const fileName = `${item.client?.fullName || "incident"}_record.pdf`;
    doc.save(fileName);
  };

  // 🧮 CSV Export
 // ✅ Function to handle CSV download for Incident Reports
const handleDownloadCsv = (item) => {
  const headers = ["Field,Value"];
  const rows = [
    `Incident Date,${item.incidentDate?.slice(0, 10) || "—"}`,
    `Incident Type,${item.incidentType || "—"}`,
    `Severity,${item.severity || "—"}`,
    `Reported By,${item.reportedBy || "—"}`,
    `Incident Details,${item.incidentDetails || "—"}`,
    `Status,${item.status || "—"}`,
    `Patient,${item.client?.fullName || "—"}`,
    `Immediate Actions,${item.immediateActions || "—"}`,
    `People Notified,${item.peopleNotified || "—"}`,
    `Outcome Status,${item.outcomeStatus || "—"}`,
    `Staff Involved,${item.staffInvolved || "—"}`,
  ];

  const csvContent = [...headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${item.client?.fullName || "incident"}_record.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};




  const [loading, setLoading] = useState(false);

  const handleSubmit2 = (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    console.log(formData2.client);

    const data = new FormData();
    Object.entries(formData2).forEach(([key, value]) => {
      data.append(key, value);
    });
    attachments.forEach((file) => {
      data.append("attachments", file);
    });

    const request = editingIncidentId
      ? axios.put(
          `https://admin-panel-backend-alpha.vercel.app/incident/update/${editingIncidentId}`,
          data,
          config
        )
      : axios.post(`https://admin-panel-backend-alpha.vercel.app/incident/`, data, config);

    request
      .then((res) => {
        setMessage(editingIncidentId ? "Incident updated" : "Incident added");
        setEditingIncidentId(null);
        setLoading(false);
        setFormData2({
          incidentDate: "",
          incidentType: "",
          severity: "",
          reportedBy: "",
          incidentDetails: "",
          client: "",
          status: "Open",
          immediateActions: "",
          peopleNotified: "",
          outcomeStatus: "",
          staffInvolved: "",
        });
        setAttachments([]);
        setShowModal2(false);
        toast.success("Add successfuly");
        return axios.get("https://admin-panel-backend-alpha.vercel.app/incident/all", config);
      })
      .then((res) => {
        setIncidentData(res.data.incidents);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setError(err.response?.data?.msg || "Error occurred");
        toast.error(err.response?.data?.msg || "Error occurred");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this incident?"))
      return;

    const token = localStorage.getItem("token");
    axios
      .delete(`https://admin-panel-backend-alpha.vercel.app/incident/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        const updated = incidentData.filter((i) => i._id !== id);
        setIncidentData(updated);
        setFilteredIncidents(updated);
        setMessage("Incident deleted");
        toast.success("Deleted successfuly");
      })
      .catch((err) => {
        setError(err.response?.data?.msg || "Failed to delete incident");
        toast.error(err.response?.data?.msg || "Failed to delete incident");
      });
  };

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
        console.log(response.data.clients);

        setMessage("Staff fetched successfully");
      })
      .catch((error) => {
        setError(error.response?.data?.msg || "Failed to fetch staff");
      });
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        `https://admin-panel-backend-alpha.vercel.app/incident/update/${id}`,
        { status: newStatus },
        config
      );

      // ✅ Just like handleSubmit2
      const response = await axios.get(
        "https://admin-panel-backend-alpha.vercel.app/incident/all",
        config
      );
      setIncidentData(response.data.incidents);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://admin-panel-backend-alpha.vercel.app/hr", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setStaff(response.data.allHr); // Staff data set
        setMessage("Staff fetched successfully");
      })
      .catch((error) => {
        setError(error.response?.data?.msg || "Failed to fetch staff");
      });
  }, []);

  const [viewClient, setViewClient] = useState(null);
  const [viewStatus, setViewStatus] = useState(null);
  const [viewIncidentDetails, setViewIncidentDetails] = useState(null);
  const [viewReportedBy, setViewReportedBy] = useState(null);
  const [viewSeverity, setViewSeverity] = useState(null);
  const [viewIncidentType, setViewIncidentType] = useState(null);
  const [viewdate, setViewdate] = useState(null);
  const [showModals, setShowModals] = useState(false);
  const [viewAttachments, setViewAttachments] = useState([]); // For viewing attachments
  const [viewStaffInvolved, setViewStaffInvolved] = useState(null);
  const [viewPeopleNotified, setViewPeopleNotified] = useState(null);
  const [viewOutcomeStatus, setViewOutcomeStatus] = useState(null);
  const [viewImmediateActions, setViewImmediateActions] = useState(null);
    const { hasReviews, setHasReviews } = useAuth();


   // serche Patient form data 
   const [openPatient, setOpenPatient] = useState(false);
  const [openStaff, setOpenStaff] = useState(false);
  const [searchPatient, setSearchPatient] = useState("");
  const [searchStaff, setSearchStaff] = useState("");

  // Patient filtering
  const filteredPatients = patient.filter(
    (client) =>
      (user?.role !== "Client" || user.clients.includes(client._id)) &&
      client.fullName.toLowerCase().includes(searchPatient.toLowerCase())
  );

  // Staff filtering
  const filteredStaff = staff.filter((s) =>
    s.fullName.toLowerCase().includes(searchStaff.toLowerCase())
  );

  // Handle selections
  const handlePatientSelect = (client) => {
    setFormData2((prev) => ({
      ...prev,
      client: client._id,
      clientName: client.fullName,
    }));
    setOpenPatient(false);
  };

  const handleStaffSelect = (member) => {
    setFormData2((prev) => ({
      ...prev,
      staffInvolved: member._id,
      staffName: member.fullName,
    }));
    setOpenStaff(false);
  };

  const handleView = (item) => {
    setViewClient(item.client.fullName);
    setViewStatus(item.status);
    setViewIncidentDetails(item.incidentDetails);
    setViewReportedBy(item.reportedBy);
    setViewSeverity(item.severity);
    setViewIncidentType(item.incidentType);
    setViewdate(item.incidentDate.slice(0, 10)); // Format date to YYYY-MM-DD
    setViewAttachments(item.attachments || []); // Set attachments for viewing
    setViewStaffInvolved(
 patient.find(
                                  (staff) => staff._id === item.client?._id
                                )?.fullName || "Unknown"); // Handle staff involved
    setViewPeopleNotified(item.peopleNotified || "N/A"); // Handle people notified
    console.log(
      "jkjdfkjkjkf",
      
    );
    setShowModals(true);

    setViewOutcomeStatus(item.outcomeStatus || "N/A"); // Handle outcome status
    setViewImmediateActions(item.immediateActions || "N/A"); // Handle immediate actions

  };

  const data = {
    Patient: viewClient,
    Status: viewStatus,
    Severity: viewSeverity,
    "Incident Date": viewdate,
    "Incident Type": viewIncidentType,
    "Incident Details": viewIncidentDetails,
    "Immediate Actions": viewImmediateActions,
    "People Notified": viewPeopleNotified,

    "Outcome Status": viewOutcomeStatus,
    "Staff Involved": viewStaffInvolved,
  };

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
        Incident Record Details
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

      {/* 📎 Attachments */}
      {viewAttachments?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586M16 3a4 4 0 015.656 5.656L9.414 21H4v-5.414L16 3z" />
            </svg>
            Attachments
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {viewAttachments.map((file, index) => {
              const lower = file.toLowerCase();
              const isPDF = lower.endsWith(".pdf");
              const isVideo = /\.(mp4|mov|mkv|webm|avi)$/i.test(lower);
              const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(lower);

              return (
                <div
                  key={index}
                  className="relative bg-[#1e212a] p-3 rounded-2xl border border-gray-700 shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  {isPDF ? (
                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2"
                    >
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                        alt="PDF Icon"
                        width={48}
                        height={48}
                        className="w-12 h-12"
                      />
                      <p className="text-sm text-gray-300 font-medium text-center">
                        PDF Attachment {index + 1}
                      </p>
                    </a>
                  ) : isVideo ? (
                    // 🎥 VIDEO VIEW + CLICK PREVIEW
                    <div
                      className="relative group cursor-zoom-in"
                      onClick={() =>
                        setPreviewVideo(file) // 👈 show video preview modal
                      }
                    >
                      <video
                        src={file}
                        className="w-full h-[200px] object-cover rounded-lg border border-gray-600"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                        <BsArrowsFullscreen className="text-white w-6 h-6" />
                      </div>
                    </div>
                  ) : isAudio ? (
                    <div className="flex flex-col items-center p-4">
                      <audio controls className="w-full">
                        <source src={file} />
                        Your browser does not support the audio element.
                      </audio>
                      <p className="text-sm text-gray-300 font-medium mt-2">
                        Audio File {index + 1}
                      </p>
                    </div>
                  ) : (
                    // 🖼️ IMAGE VIEW
                    <div
                      className="relative group cursor-zoom-in"
                      onClick={() => setPreviewImage(file)}
                    >
                      <Image
                        src={file}
                        alt={`Attachment ${index + 1}`}
                        width={400}
                        height={200}
                        className="w-full h-[200px] object-cover rounded-lg border border-gray-600"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                        <BsArrowsFullscreen className="text-white w-6 h-6" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* 🖼️ IMAGE PREVIEW MODAL */}
{previewImage && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-4xl w-full">
      <button
        onClick={() => setPreviewImage(null)}
        className="absolute top-3 right-3 w-10 h-10 bg-gray-800 text-white hover:bg-red-600 rounded-full flex items-center justify-center shadow"
      >
        <svg
          className="w-5 h-5 cursor-pointer"
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
      <Image
        src={previewImage}
        alt="Full View"
        width={800}
        height={600}
        className="w-full h-auto object-contain rounded-xl max-h-[80vh] mx-auto"
      />
    </div>
  </div>
)}

{/* 🎥 VIDEO PREVIEW MODAL */}
{previewVideo && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    onClick={() => setPreviewVideo(null)} // ✅ Click outside closes modal
  >
    <div
      className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-3xl w-full"
      onClick={(e) => e.stopPropagation()} // ❌ Prevent closing when clicking inside video area
    >
      {/* ❌ Close Button */}
      <button
        onClick={() => setPreviewVideo(null)}
        className="absolute top-3 right-3 z-[10000] w-9 h-9 bg-gray-800 text-white hover:bg-red-600 rounded-full flex items-center justify-center shadow transition-all duration-200"
      >
        <svg
          className="w-5 h-5 cursor-pointer"
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

      {/* 🎥 Video Preview */}
      <video
        src={previewVideo}
        controls
        autoPlay
        className="w-full h-auto rounded-xl max-h-[60vh] mx-auto"
      />
    </div>
  </div>
)}



      {/* Mobile Navbar Toggle */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
          Incident Reports
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
          {/* Title - Hide on mobile, show from md and up */}
          <h2 className="text-xl font-semibold text-gray-200 mb-4 md:mb-6 hidden md:block">
            Incident Reports
          </h2>

          {/* 📊 6-Month Overview */}
          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
              <SiSimpleanalytics className="text-blue-400" />
              6-Month Incident Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {last6MonthsStats.map((stat, index) => (
                <div key={index} className="bg-gray-700/50 p-4 rounded-lg text-center border border-gray-600 hover:bg-gray-700 transition">
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 mb-6 sm:mb-8 h-full overflow-y-auto pr-2 my-scroll">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-200">
                  Incidents
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  Record and track incidents
                </p>
              </div>

              {/* Search & Add Button */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-600 pl-10 pr-4 py-2  focus:border-primary-light focus:ring-primary-light text-white text-xs sm:text-sm"
                    placeholder="Search incidents..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500 text-sm" />
                  </div>
                </div>
               {!hasClients && <button
                  onClick={() => setShowModal2(true)}
                  className="bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Report New Incident
                </button>}
              </div>
            </div>

            {/* Filter Tags */}
            <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
              {filters.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(label)}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer backdrop-blur-sm ${
                    selected === label
                      ? "bg-gray-700 text-white shadow-lg"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-primary-light"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-[800px] md:min-w-full divide-y divide-gray-700 text-xs sm:text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    {[
                      "Patient",
                      "Type",
                      "Date",
                      "Severity",
                      "Status",
                      "Actions",
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="px-3 sm:px-2 py-2 text-left text-[12px] sm:text-[12px] font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y  divide-gray-700">
                  {filteredIncidents.length > 0 ? (
                    filteredIncidents.map((item, i) => (
                      <tr key={i}>
                        <td className="px-1 sm:px-1 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white text-blue-500 flex items-center justify-center rounded-full text-xs font-bold">
                              {(
                                patient.find(
                                  (staff) => staff._id === item.client?._id
                                )?.fullName || item.client?.fullName || "Unknown" 
                              )
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-white">
                              {patient.find(
                                (staff) => staff._id === item.client?._id
                              )?.fullName || item.client?.fullName || "Unknown"}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-2 py-3 text-white">
                          {item.incidentType}
                        </td>
                        <td className="px-1 sm:px-1 py-8 text-white">
                          {new Date(item.incidentDate).toLocaleDateString()}
                        </td>
                        <td className="px-2 sm:px-2 py-3 text-white">
                          {item.severity}
                        </td>
                        {/* <td className="px-2 sm:px-2 py-3 text-white">{item.reportedBy}</td> */}
                      <td className="px-1 sm:px-1 py-3 text-white">
  {/* Only show dropdown if not Client or External */}
  {!hasClients && user.role !== "External" ? (
    <select
      className="bg-[#1E2939] border border-gray-600 text-white lg:text-[10px] text-[8px] px-1 sm:px-1 py-1 rounded outline-none"
      value={item.status}
      onChange={(e) => handleStatusChange(item._id, e.target.value)}
    >
      <option
        className="bg-[#1E2939] text-white lg:text-[12px] text-[8px]"
        value="Open"
      >
        Open
      </option>
      <option
        className="bg-[#1E2939] text-white lg:text-[12px] text-[8px]"
        value="Under Investigation"
      >
        Under Investigation
      </option>
      <option
        className="bg-[#1E2939] text-white lg:text-[12px] text-[8px]"
        value="Resolved"
      >
        Resolved
      </option>
    </select>
  ) : (
    // ✅ Client or External — read-only badge
    <span
      className={`px-2 py-1 rounded text-[10px] ${
        item.status === "Resolved"
          ? "bg-green-700 text-white"
          : item.status === "Under Investigation"
          ? "bg-yellow-700 text-white"
          : "bg-red-700 text-white"
      }`}
    >
      {item.status || "Open"}
    </span>
  )}
</td>


                      <td className="px-2 sm:px-2 py-3 text-white">
  <div className="flex items-center space-x-2 relative">
    <button
      onClick={() => handleView(item)}
      className="hover:text-blue-500 transition cursor-pointer"
    >
      <FaEye />
    </button>

    {!hasClients && (
      <button
        onClick={() => handleEdit(item)}
        className="hover:text-yellow-500 transition cursor-pointer"
      >
        <FaEdit />
      </button>
    )}

    {!hasClients && (
      <button
        onClick={() => handleDelete(item._id)}
        className="hover:text-red-500 cursor-pointer"
      >
        <FaTrash />
      </button>
    )}

    {/* ⬇ Download Dropdown */}
    <div className="relative">
      <FaDownload
        className="hover:text-green-500 transition cursor-pointer"
        onClick={() => toggleDropdown(item._id)}
      />

      {openDropdownId === item._id && (
        <div
          className="absolute right-0 mt-2 
          bg-white/20 backdrop-blur-xl border border-white/30 
          shadow-lg rounded-md z-10 w-36 transition-all duration-200"
        >
          <button
            onClick={() => {
              handleDownloadPdf(item);
              setOpenDropdownId(null);
            }}
            className="block w-full text-left px-3 py-2 
            text-sm text-white hover:bg-white/10 transition"
          >
            Export as PDF
          </button>

          <button
            onClick={() => {
              handleDownloadCsv(item);
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
  </div>
</td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center px-4 sm:px-6 py-24 sm:py-36  text-gray-400 text-sm"
                      >
                        No incidents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal incident */}
          {showModal2 && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
              <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                  {editingIncidentId
                    ? "Edit Incident Report"
                    : "Add Incident Report"}
                </h2>
                <form
                  id="add-incident-form"
                  className="p-4"
                  onSubmit={handleSubmit2}
                >
                  {/* Patient Dropdown */}
      <div className="mb-4 relative">
        <label
          htmlFor="clientId"
          className="block text-gray-300 text-sm font-medium mb-2"
        >
          Patient
        </label>

        <div
          onClick={() => {
            setOpenPatient(!openPatient);
            setOpenStaff(false);
          }}
          className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 cursor-pointer select-none"
        >
          {formData2.client
            ? patient.find((c) => c._id === formData2.client)?.fullName
            : "Select Patient"}
        </div>

        {openPatient && (
          <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2">
            <input
              type="text"
              placeholder="Search patient..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="w-full rounded-md border border-gray-600 px-3 py-1 mb-2 text-sm bg-gray-700 text-white focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
            />

            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((client) => (
                  <div
                    key={client._id}
                    onClick={() => handlePatientSelect(client)}
                    className={`px-2 py-1 rounded-md hover:bg-gray-600 text-gray-200 text-sm cursor-pointer ${
                      formData2.client === client._id ? "bg-gray-700" : ""
                    }`}
                  >
                    {client.fullName}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center">
                  No patients found
                </p>
              )}
            </div>
          </div>
        )}

        <input type="hidden" name="client" value={formData2.client} />
        <input
          type="hidden"
          name="clientName"
          value={formData2.clientName || ""}
        />
      </div>


                  {/* Date */}
                  <div className="mb-4">
                    <label
                      htmlFor="incidentDate"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Incident Date
                    </label>
                    <input
                      type="date"
                      id="incidentDate"
                      name="incidentDate"
                      value={formData2.incidentDate}
                      onChange={handleChange2}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>

                  {/* Incident Type */}
                  <div className="mb-4">
                    <label
                      htmlFor="incidentType"
                      className="block  text-gray-300 text-sm font-medium mb-2"
                    >
                      Incident Type
                    </label>
                    <select
                      id="incidentType"
                      name="incidentType"
                      value={formData2.incidentType}
                      onChange={handleChange2}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    >
                      <option value="">Select Incident Type</option>
                      <option value="Fall">Fall</option>
                      <option value="Medication Error">Medication Error</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Property Damage">Property Damage</option>
                      <option value="Injury">Injury</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div className="mb-4">
                    <label
                      htmlFor="severity"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Severity
                    </label>
                    <select
                      id="severity"
                      name="severity"
                      value={formData2.severity}
                      onChange={handleChange2}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    >
                      <option value="">Select Severity</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  {/* Reported By */}
                  <div className="mb-4">
                    <label
                      htmlFor="reportedBy"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Reported By
                    </label>
                    <input
                      type="text"
                      id="reportedBy"
                      name="reportedBy"
                      value={formData2.reportedBy}
                      onChange={handleChange2}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>
                  {/* Details */}
                  <div className="mb-4">
                    <label
                      htmlFor="incidentDetails"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Incident Details
                    </label>
                    <textarea
                      id="incidentDetails"
                      name="incidentDetails"
                      rows="4"
                      value={formData2.incidentDetails}
                      onChange={handleChange2}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="immediateActions"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Immediate Actions Taken
                    </label>
                    <textarea
                      id="immediateActions"
                      name="immediateActions"
                      rows="3"
                      value={formData2.immediateActions}
                      onChange={handleChange2}
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="peopleNotified"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      People Notified (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="peopleNotified"
                      name="peopleNotified"
                      value={formData2.peopleNotified}
                      onChange={handleChange2}
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="outcomeStatus"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Outcome / Resolution Status
                    </label>
                    <input
                      type="text"
                      id="outcomeStatus"
                      name="outcomeStatus"
                      value={formData2.outcomeStatus}
                      onChange={handleChange2}
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>

               {/* Staff Dropdown */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-300">
          Staff Involved
        </label>

        <div
          onClick={() => {
            setOpenStaff(!openStaff);
            setOpenPatient(false);
          }}
          className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600 cursor-pointer select-none"
        >
          {formData2.staffInvolved
            ? staff.find((s) => s._id === formData2.staffInvolved)?.fullName
            : "Select Staff Member"}
        </div>

        {openStaff && (
          <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2">
            <input
              type="text"
              placeholder="Search staff..."
              value={searchStaff}
              onChange={(e) => setSearchStaff(e.target.value)}
              className="w-full rounded-md border border-gray-600 px-3 py-1 mb-2 text-sm bg-gray-700 text-white focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
            />

            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                  <div
                    key={member._id}
                    onClick={() => handleStaffSelect(member)}
                    className={`px-2 py-1 rounded-md hover:bg-gray-600 text-gray-200 text-sm cursor-pointer ${
                      formData2.staffInvolved === member._id
                        ? "bg-gray-700"
                        : ""
                    }`}
                  >
                    {member.fullName}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center">
                  No staff found
                </p>
              )}
            </div>
          </div>
        )}

        <input
          type="hidden"
          name="staffInvolved"
          value={formData2.staffInvolved}
        />
        <input
          type="hidden"
          name="staffName"
          value={formData2.staffName || ""}
        />
      </div>

                  {/* Attachments */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Attach Photo/Document
                    </label>
                    <input
                      type="file"
                      name="attachments"
                      onChange={handleFileChange}
                      multiple
                      className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={handleCancel11}
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
                      ) : editingIncidentId ? (
                        "Update Incident"
                      ) : (
                        "Report Incident"
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
