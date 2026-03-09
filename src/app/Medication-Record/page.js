"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import SignaturePad from "react-signature-canvas";
import { SiSimpleanalytics } from "react-icons/si";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoDocumentAttach } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";

import Image from "next/image";
import { useRef } from "react";
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
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Optional for table format
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { MdMedicationLiquid } from "react-icons/md";

const medications = [
  {
    Client: "Noman developer",
    PlanType: "Nursing",
    Created: "02/21/2222",
    ReviewDate: "02/21/2222",
    status: "Current",
  },
];

const Page = () => {
  const { hasClients } = useAuth();
  const { user, logout } = useAuth();

  const { hasLowStock, setHasLowStock } = useAuth();
  const { hasReviews, setHasReviews } = useAuth();

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
        { icon: <TbClockRecord />, label: "Medication-Record", href: "/Medication-Record",active: true, },
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

  const [medications, setMedications] = useState([]);
  const [formDataCare, setFormDataCare] = useState({
     client: "",
    medication: "",
    caregiverName: "",
    time: "",
    given: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [editingCareId, setEditingCareId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showFormCare, setShowFormCare] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]); // For HR/staff members
  const [patients, setPatients] = useState([]);
  const [medicationsn, setMedicationsn] = useState([]);

  // serche Patient form data
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/client", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data.clients);
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };

    fetchPatients();
  }, []);
  
    
    const fetchMedications = async (id) => {
      const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const res = await axios.get(`https://admin-panel-backend-alpha.vercel.app/medications/client/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicationsn(res.data);
    } catch (err) {
      console.error("Error fetching medications:", err);
    } finally {
      setLoading(false);
    }
  };
const handleChangeCare = (e) => {
  const { name, value } = e.target;
  setFormDataCare((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  // Filtered list
  const filteredPatients = patients.filter(
    (client) =>
      (user?.role !== "Client" || user.clients.includes(client._id)) &&
      client.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (client) => {
    setFormDataCare((prev) => ({
      ...prev,
      client: client._id,
      clientName: client.fullName,
    }));
    setOpen(false);
  };

  // ViewData.apply...............................................................

  // const [attachments, setAttachments] = useState([]);

  // const handleFileChange = (e) => {
  //   setAttachments(Array.from(e.target.files));
  // };


  const [selected, setSelected] = useState("All Plans");
  const filters = ["All Plans"];
 const handleEditCare = (plan) => {
  setFormDataCare({
    client: plan.client?._id || plan.client || "",
    medication: plan.medication?._id || plan.medication || "",
    caregiverName: plan.caregiverName || "",
    time: plan.time || "",
    given: plan.given === true ? true : false,
  });

  setEditingCareId(plan._id);
  setShowFormCare(true);
};


  // 📦 State for dropdown toggle
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // 📥 Toggle dropdown
  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  // ✅ PDF Download (already from your code)

  const handleDownloadPdf = async (item) => {
  try {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const patientName =
      staffMembers.find((staff) => staff._id === (item.client?._id || item.client))?.fullName ||
      item.client?.name ||
      "Unknown Patient";

    const doc = new jsPDF();
    const marginLeft = 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Medication Administration Details", marginLeft, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);

    autoTable(doc, {
      startY: 35,
      head: [["Field", "Value"]],
      body: [
        ["Patient", patientName],
        ["Caregiver Name", item.caregiverName || "N/A"],
        ["Medication", item.medication?.medicationName || "N/A"],
        ["Time", item.time || "N/A"],
        ["Given", item.given ? "Yes" : "No"],
      ],
    });

    let yPos = doc.lastAutoTable.finalY + 15;

    if (item.attachments && item.attachments.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(30);
      doc.text("Attachments:", marginLeft, yPos);
      yPos += 10;

      for (const file of item.attachments) {
        const lower = file.toLowerCase();
        const ext = lower.split(".").pop();

        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
          try {
            const res = await fetch(file);
            const blob = await res.blob();
            const reader = new FileReader();

            const base64 = await new Promise((resolve) => {
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });

            if (yPos + 50 > 280) {
              doc.addPage();
              yPos = 20;
            }

            doc.addImage(base64, "JPEG", marginLeft, yPos, 50, 40);
            yPos += 50;
          } catch {
            doc.setTextColor(200, 0, 0);
            doc.text("Image failed to load", marginLeft, yPos);
            yPos += 10;
          }
        } else if (ext === "pdf") {
          const iconUrl = "https://cdn-icons-png.flaticon.com/512/337/337946.png";
          const res = await fetch(iconUrl);
          const blob = await res.blob();
          const reader = new FileReader();

          const iconBase64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          if (yPos + 20 > 280) {
            doc.addPage();
            yPos = 20;
          }

          doc.addImage(iconBase64, "PNG", marginLeft, yPos, 16, 16);
          doc.link(marginLeft, yPos, 16, 16, { url: file });
          yPos += 22;
        } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
          const videoIconUrl = "https://cdn-icons-png.flaticon.com/512/711/711245.png";
          const res = await fetch(videoIconUrl);
          const blob = await res.blob();
          const reader = new FileReader();

          const videoIconBase64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          if (yPos + 20 > 280) {
            doc.addPage();
            yPos = 20;
          }

          doc.addImage(videoIconBase64, "PNG", marginLeft, yPos, 18, 18);
          doc.link(marginLeft, yPos, 18, 18, { url: file });
          yPos += 24;
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text(`Unsupported file type: ${ext}`, marginLeft, yPos);
          yPos += 10;
        }
      }
    }

    const safeName = patientName.replace(/\s+/g, "_");
    doc.save(`${safeName}_Medication_Admin_Record.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
};


  // ✅ CSV Download
 const handleDownloadCsv = (item) => {
  const patientName =
    staffMembers.find((staff) => staff._id === (item.client?._id || item.client))?.fullName ||
    item.client?.name ||
    "Unknown Patient";

  const headers = ["Field,Value"];
  const rows = [
    `Patient,${patientName}`,
    `Caregiver Name,${item.caregiverName || "N/A"}`,
    `Medication,${item.medication || "N/A"}`,
    `Time,${item.time || "N/A"}`,
    `Given,${item.given === true ? "Yes" : item.given === false ? "No" : "N/A"}`,
  ];

  const csvContent = [...headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${patientName.replace(/\s+/g, "_")}_Medication.csv`;
  link.click();
  URL.revokeObjectURL(url);
};


  // 🧩 Add this above your return statement (inside the component)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // 🔹 Update only the status field
      await axios.put(
        `https://admin-panel-backend-alpha.vercel.app/medications/${id}`,
        { status: newStatus },
        config
      );

      toast.success(`Status updated to ${newStatus}`);

      // 🔁 Refresh medications after update
      const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/medications", config);
      setMedications(res.data);
    } catch (err) {
      console.error("❌ Status Update Error:", err);
      toast.error("Failed to update status");
    }
  };

  const handleCancel12 = () => {
    setShowFormCare(false);
    setEditingCareId(null);
    setFormDataCare({
      client: "",
      caregiverName: "",
      medicationName: "",
      schedule: { times: [], frequency: "" },
      stock: { quantity: 0, threshold: 5 },
      status: "Pending", // ✅ Added status (default)
    });
    setError("");
    setMessage("");
    // setAttachments([]);
  };

  const [loading, setLoading] = useState(false);
const handleSubmitCare = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  const token = localStorage.getItem("token");
  if (!token) {
    setError("User not authenticated");
    setLoading(false);
    return;
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    // ✅ Ensure we send correct key "given" and it's a boolean
    const data = {
      client: formDataCare.client,
      caregiverName: formDataCare.caregiverName,
      medication: formDataCare.medication,
      time: formDataCare.time,
      given:
        formDataCare.given === true ||
        formDataCare.given === "Yes" ||
        formDataCare.given === "true",
      notes: formDataCare.notes || "",
    };

    let response;
    if (editingCareId) {
      response = await axios.put(
        `https://admin-panel-backend-alpha.vercel.app/medication-administration/${editingCareId}`,
        data,
        config
      );
    } else {
      response = await axios.post(
        "https://admin-panel-backend-alpha.vercel.app/medication-administration",
        data,
        config
      );
    }

    toast.success(
      editingCareId
        ? "Medication record updated successfully"
        : "Medication record added successfully"
    );

    // ✅ Reset form
    setEditingCareId(null);
    setShowFormCare(false);
    setFormDataCare({
      client: "",
      caregiverName: "",
      medication: "",
      time: "",
      given: "", // fixed key
      notes: "",
    });

    // ✅ Refresh list
    const res = await axios.get(
      "https://admin-panel-backend-alpha.vercel.app/medication-administration",
      config
    );
    setMedications(res.data);
    setMessage("Medications fetched successfully");
  } catch (err) {
    console.error("❌ Full Error:", err);
    setError(
      err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        "An error occurred"
    );
    toast.error("Failed to save medication record");
  } finally {
    setLoading(false);
  }
};

  const handleDeleteCare = async (id) => {
    if (!confirm("Are you sure you want to delete this medication record?"))
      return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://admin-panel-backend-alpha.vercel.app/medication-administration/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedications((prev) => prev.filter((med) => med._id !== id));
      toast.success("Medication record deleted");
    } catch (err) {
      console.error("Error deleting medication:", err);
      toast.error("Failed to delete medication record");
    }
  };useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      setError("Authentication token missing");
      return;
    }

    if (!user || (user.role === "Client" && !Array.isArray(user.clients))) return;

    axios
      .get("https://admin-panel-backend-alpha.vercel.app/medication-administration", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let records = res.data;

        if (user.role === "Client") {
          const clientIds = user.clients.map(
            (c) => c._id?.toString() || c.toString()
          );
          records = records.filter((r) =>
            clientIds.includes(
              r.client?._id?.toString() || r.client?.toString()
            )
          );
        }

        setMedications(records);
        setMessage("Medication Administration records fetched successfully");
      })
      .catch((err) => {
        console.error("Error fetching medication administration:", err);
        setError(err.response?.data?.error || "Failed to fetch records");
      });
  }, [user]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://admin-panel-backend-alpha.vercel.app/client", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setStaffMembers(response.data.clients); // Staff data set
        setMessage("Staff fetched successfully");
      })
      .catch((error) => {
        setError(error.response?.data?.msg || "Failed to fetch staff");
      });
  }, []);

  useEffect(() => {
    const filtered = medications.filter((plan) => {
      const client =
        staffMembers.find((staff) => staff._id === (plan.client?._id || plan.client))?.fullName || "";
      const matchesType =
        selected === "All Plans" || plan.planType === selected;
      const matchesSearch = client
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });

    setFilteredStaff(filtered);
  }, [selected, searchQuery, medications, staffMembers]);

  {
    /* view data /////////////////////////////////////////////// */
  }
// ✅ Updated states according to new structure
const [viewClient, setViewClient] = useState(null);
const [viewMedication, setViewMedication] = useState(null);
const [viewCaregiverName, setViewCaregiverName] = useState(null);
const [viewTime, setViewTime] = useState(null);
const [viewGiven, setViewGiven] = useState(null);
const [showModal, setShowModal] = useState(false);

const handleView = (item) => {
  const patient =
    staffMembers.find((staff) => staff._id === (item.client?._id || item.client))?.fullName ||
    item.client?.name ||
    "Unknown";

  setViewClient(patient);
  setViewCaregiverName(item.caregiverName || "N/A");
  setViewMedication(`( ${item.medication?.medicationName  ?? "NN"})`);
  setViewTime(item.time || "N/A");
  setViewGiven(
    item.given === true ? "Yes" : item.given === false ? "No" : "N/A"
  );

  setShowModal(true);
};

// ✅ Updated data object
const data = {
  Patient: viewClient,
  "Caregiver Name": viewCaregiverName,
  Medication: viewMedication,
  Time: viewTime,
  Given: viewGiven,
};


  const isLowStock = (med) => {
    return med.stock?.quantity <= med.stock?.threshold;
  };

  useEffect(() => {
    const shownToasts = new Set();

    medications.forEach((med) => {
      const key = `${med.medicationName}_${med.client}`;
      if (isLowStock(med) && !shownToasts.has(key)) {
        shownToasts.add(key);
        toast.warn(`⚠️ Low stock: ${med.medicationName}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    });
  }, [medications]); // ✅ clean and static dependency

  useEffect(() => {
    // your fetch logic here
  }, []);

  useEffect(() => {
    const lowStock = medications.some(
      (med) =>
        med?.stock?.quantity !== undefined &&
        med.stock.quantity <= (med.stock.threshold || 0)
    );
    setHasLowStock(lowStock);
  }, [medications, setHasLowStock]);

  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/Login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="bg-[#111827] min-h-screen flex flex-col">
      <Navbar />
      {/* veiwdata................................................................................. */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-auto">
          <div className="relative w-full max-w-3xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] border border-gray-700 bg-gradient-to-br from-[#1b1e25] to-[#111319] text-white px-8 py-10 max-h-[90vh] overflow-y-auto">
            {/* ❌ Close Button */}
            <button
              onClick={() => setShowModal(false)}
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
              Medication Record Details
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

            {/* 📎 Attachments Preview */}
            
          </div>
        </div>
      )}

      {/* Mobile Navbar Toggle - only for smaller than lg */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
          Medication Record
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className=" text-white text-xl"
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
            Medication Record{" "}
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-8 h-full overflow-y-auto pr-2 my-scroll">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-200">
                  Record
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  Create and manage Medication Record
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:min-w-[200px] rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:border-primary-light focus:ring-primary-light bg-gray-700 text-white text-sm"
                    placeholder="Search Record..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                  </div>
                </div>
                {!hasClients && (
                  <button
                    onClick={() => setShowFormCare(true)}
                    className="bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <FaPlus className="mr-2" /> Create New medi Record
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex text-white flex-wrap gap-2 ">
              {filters.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(label)}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer backdrop-blur-sm ${
                    selected === label
                      ? "bg-primary-light text-primary bg-gray-700 text-primary-light shadow-lg"
                      : " bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-primary-light"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              {/* Table */}
              <table className="min-w-[800px] md:min-w-full divide-y divide-gray-700 text-xs sm:text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    {[
                      "Patient",
                      "Caregiver Name",
                      "Medication Name",
                      "Time",
                      "Medication Given",
                      "Actions",
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredStaff.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-blue-500 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold">
                            {(
                              staffMembers.find(
                                (staff) => staff._id === (item.client?._id || item.client)
                              )?.fullName || "U"
                            )
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {staffMembers.find(
                                (staff) => staff._id === (item.client?._id || item.client)
                              )?.fullName || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-sm text-white">
                        {item.caregiverName}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-sm text-white">
        {item.medication?.medicationName || "N/A"}{" "}
        <span className="text-gray-400">
          (Stock: {item.medication?.stock?.quantity ?? "0"})
        </span>
      </td>
                      <td className="px-3 sm:px-4 py-3 text-sm text-gray-400">
                        {item.time}
                       
                      </td>

  <td className="px-3 sm:px-4 py-3 text-sm text-gray-400">
  {item.given ? "Yes" : "No"}
                       
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                        <div className="flex items-center space-x-2 relative">
                          <FaEye
                            className="hover:text-blue-500 transition cursor-pointer"
                            onClick={() => handleView(item)}
                          />
                          {!hasClients && (
                            <FaEdit
                              className="hover:text-yellow-500 transition cursor-pointer"
                              onClick={() => handleEditCare(item)}
                            />
                          )}
                          {!hasClients && (
                            <FaTrash
                              className="hover:text-red-500 transition cursor-pointer"
                              onClick={() => handleDeleteCare(item._id)}
                            />
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
                  ))}
                </tbody>
              </table>

              {filteredStaff.length === 0 && (
                <p className="text-center px-4 sm:px-6 py-24 sm:py-36 text-sm text-gray-400">
                  No medicationsfound.
                </p>
              )}
            </div>
          </div>

          {/* Modal care plan form */}
        {showFormCare && (
  <div className="fixed inset-0 bg-black/50 z-50 overflow-auto flex justify-center items-center">
    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
      <h2 className="text-center text-white font-semibold mb-4 text-xl sm:text-2xl">
        {editingCareId ? "Edit Medication Record" : "Add Medication Record"}
      </h2>

      <form
        encType="multipart/form-data"
        id="add-care-plan-form"
        className="space-y-4"
        onSubmit={handleSubmitCare}
      >
        {/* Patient Dropdown */}
        <div className="relative">
  <label className="block text-gray-300 text-sm font-medium mb-2">
    Patient
  </label>

  <div
    onClick={() => setOpen(!open)}
    className="w-full border border-gray-600 bg-gray-700 text-gray-300 rounded-md px-3 py-2 cursor-pointer select-none focus:ring-2 focus:ring-[#4a48d4]"
  >
    {formDataCare.client
      ? patients.find((p) => p._id === formDataCare.client)?.fullName
      : "Select Patient"}
  </div>

  {open && (
    <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2">
      <input
        type="text"
        placeholder="Search patient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#4a48d4] focus:outline-none mb-2"
      />

      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((client) => (
            <div
              key={client._id}
              onClick={() => {
                setFormDataCare({ ...formDataCare, client: client._id });
                setOpen(false);
                fetchMedications(client._id); // ✅ Fetch medications of this patient
              }}
              className={`px-2 py-1 rounded-md text-gray-200 text-sm cursor-pointer hover:bg-gray-600 ${
                formDataCare.client === client._id
                  ? "bg-gray-700"
                  : "bg-transparent"
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

  <input type="hidden" name="client" value={formDataCare.client} />
</div>
        {/* Medication Given */}
      <div>
  <label className="block text-gray-300 text-sm mb-1">
    Medication Given
  </label>
  <select
    name="given"
    value={
      formDataCare.given === true
        ? "Yes"
        : formDataCare.given === false
        ? "No"
        : ""
    }
    onChange={(e) =>
      setFormDataCare((prev) => ({
        ...prev,
        given: e.target.value === "Yes" ? true : false,
      }))
    }
    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>


        {/* Caregiver Name */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">
            Caregiver Name
          </label>
          <input
            type="text"
            name="caregiverName"
            value={formDataCare.caregiverName}
            onChange={handleChangeCare}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
            placeholder="Enter caregiver name"
            required
          />
        </div>

        {/* Medication Name */}
       <div>
  <label className="block text-gray-300 text-sm mb-1">
    Medication Name
  </label>

  <select
    name="medication"
    value={formDataCare.medication}
    onChange={handleChangeCare}
    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
    required
  >
    <option value="">Select Medication</option>

  {medicationsn.length > 0 ? (
  medicationsn.map((med) => (
    <option key={med._id} value={med._id}>
      {med.medicationName} (Stock: {med.stock?.quantity ?? 0})
    </option>
  ))
) : (
  <option disabled>No Medications Found</option>
)}

  </select>
</div>

        {/* Time */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={formDataCare.time || ""}
            onChange={handleChangeCare}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">Notes</label>
          <textarea
            name="notes"
            value={formDataCare.notes}
            onChange={handleChangeCare}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
            rows="3"
            placeholder="Enter any notes here..."
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleCancel12}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center bg-[#4a48d4] hover:bg-[#4A49B0] text-white font-bold py-2 px-4 rounded ${
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
            ) : editingCareId ? (
              "Update Medication"
            ) : (
              "Create Medication"
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
