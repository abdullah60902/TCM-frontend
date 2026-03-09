"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import SignaturePad from "react-signature-canvas";
import { SiSimpleanalytics } from "react-icons/si";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoDocumentAttach } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";

import Image from "next/image";
import { useRef } from "react";
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
import { TbClockRecord } from "react-icons/tb";

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
      active: true,
    },
    ...(hasClients
      ? []
      : [
          {
            icon: <TbClockRecord />,
            label: "Medication-Record",
            href: "/Medication-Record",
          },

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
    medicationName: "",
    schedule: { times: [], frequency: "" },
    stock: { quantity: 0, threshold: 5 },
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

  // serche Patient form data
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filtered list
  const filteredPatients = staffMembers.filter(
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

  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };
  const handleChangeCare = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("stock.")) {
      const key = name.split(".")[1];
      const numberValue = Number(value); // Convert to number
      setFormDataCare((prev) => ({
        ...prev,
        stock: { ...prev.stock, [key]: numberValue },
      }));
    } else if (name.startsWith("schedule.")) {
      const key = name.split(".")[1];
      const newValue =
        key === "times" ? value.split(",").map((t) => t.trim()) : value;

      setFormDataCare((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, [key]: newValue },
      }));
    } else {
      setFormDataCare((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [selected, setSelected] = useState("All Plans");
  const filters = ["All Plans"];
  const handleEditCare = (plan) => {
    setFormDataCare({
      client: plan.client?._id || plan.client || "",
      caregiverName: plan.caregiverName || "",
      medicationName: plan.medicationName || "",
      schedule: {
        frequency: plan.schedule?.frequency || "",
        times: plan.schedule?.times || [],
      },
      stock: {
        quantity: plan.stock?.quantity || 0,
        threshold: plan.stock?.threshold || 5,
      },
      status: plan.status || "Pending", // ✅ Add status to form
    });

    setEditingCareId(plan._id);
    setAttachments([]); // reset attachments (user may upload new ones)
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
        staffMembers.find((staff) => staff._id === item.client?._id)
          ?.fullName ||
        item.client?.name ||
        "Unknown Patient";

      const doc = new jsPDF();
      const marginLeft = 14;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Medication Details", marginLeft, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);

      autoTable(doc, {
        startY: 35,
        head: [["Field", "Value"]],
        body: [
          ["Patient", patientName],
          ["Caregiver Name", item.caregiverName || "N/A"],
          ["Medication Name", item.medicationName || "N/A"],
          ["Frequency", item.schedule?.frequency || "N/A"],
          ["Times", item.schedule?.times?.join(", ") || "N/A"],
          ["Stock Quantity", item.stock?.quantity?.toString() || "0"],
          ["Stock Threshold", item.stock?.threshold?.toString() || "0"],
          ["Status", item.status || "Pending"], // ✅ Added status line
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
            const iconUrl =
              "https://cdn-icons-png.flaticon.com/512/337/337946.png";
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
            const videoIconUrl =
              "https://cdn-icons-png.flaticon.com/512/711/711245.png";
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
      doc.save(`${safeName}_Medication.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  // ✅ CSV Download
  const handleDownloadCsv = (item) => {
    const patientName =
      staffMembers.find((staff) => staff._id === item.client?._id)?.fullName ||
      item.client?.name ||
      "Unknown Patient";

    const headers = ["Field,Value"];
    const rows = [
      `Patient,${patientName}`,
      `Caregiver Name,${item.caregiverName || "N/A"}`,
      `Medication Name,${item.medicationName || "N/A"}`,
      `Frequency,${item.schedule?.frequency || "N/A"}`,
      `Times,${item.schedule?.times?.join(" | ") || "N/A"}`,
      `Stock Quantity,${item.stock?.quantity?.toString() || "0"}`,
      `Stock Threshold,${item.stock?.threshold?.toString() || "0"}`,
      `Status,${item.status || "Pending"}`, // ✅ Added status
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
    setAttachments([]);
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
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      // ✅ Create FormData
      const data = new FormData();
      data.append("client", formDataCare.client);
      data.append("caregiverName", formDataCare.caregiverName);
      data.append("medicationName", formDataCare.medicationName);
      data.append("schedule[frequency]", formDataCare.schedule.frequency);

      // ✅ Append schedule times array
      if (Array.isArray(formDataCare.schedule.times)) {
        formDataCare.schedule.times.forEach((time, i) => {
          data.append(`schedule[times][${i}]`, time);
        });
      }

      // ✅ Append stock details
      data.append("stock[quantity]", formDataCare.stock.quantity);
      data.append("stock[threshold]", formDataCare.stock.threshold);

      // ✅ Append status (NEW)
      data.append("status", formDataCare.status || "Pending");

      // ✅ Append attachments if any selected
      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          data.append("attachments", file);
        });
      }

      let response;
      if (editingCareId) {
        response = await axios.put(
          `https://admin-panel-backend-alpha.vercel.app/medications/${editingCareId}`,
          data,
          config
        );
      } else {
        response = await axios.post(
          "https://admin-panel-backend-alpha.vercel.app/medications",
          data,
          config
        );
      }

      toast.success(
        editingCareId
          ? "Medication updated successfully"
          : "Medication added successfully"
      );

      setEditingCareId(null);
      setShowFormCare(false);
      setFormDataCare({
        client: "",
        caregiverName: "",
        medicationName: "",
        schedule: { times: [], frequency: "" },
        stock: { quantity: 0, threshold: 5 },
        status: "Pending", // ✅ Reset default
      });
      setAttachments([]);

      // ✅ Refresh all medications after submit
      const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/medications", config);
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
      toast.error("Failed to save care plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCare = async (id) => {
    if (!confirm("Are you sure you want to delete this medication record?"))
      return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://admin-panel-backend-alpha.vercel.app/medications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedications((prev) => prev.filter((med) => med._id !== id));
      toast.success("Medication record deleted");
    } catch (err) {
      console.error("Error deleting medication:", err);
      toast.error("Failed to delete medication record");
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ Only run when user is fully loaded
    if (!user || (user.role === "Client" && !Array.isArray(user.clients)))
      return;

    axios
      .get("https://admin-panel-backend-alpha.vercel.app/medications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let plans = res.data;
        console.log("All Plans from API:", res.data);

        if (user.role === "Client") {
          const clientIds = user.clients.map(
            (c) => c._id?.toString() || c.toString()
          );
          plans = plans.filter((plan) =>
            clientIds.includes(
              plan.client?._id?.toString() || plan.client?.toString()
            )
          );
        }

        setMedications(plans);
        console.log("Filtered Care Plans:", plans);
        setMessage("Care Plans fetched");
      })
      .catch((err) => {
        console.error("Error fetching plans:", err);
        setError(err.response?.data?.error || "Failed to fetch care plans");
      });
  }, [user]); // ✅ Waits until user is available

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
        staffMembers.find((staff) => staff._id === plan.client)?.fullName || "";
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

  const [viewFrequency, setViewFrequency] = useState(null);
  const [viewTimes, setViewTimes] = useState(null);
  const [viewName, setViewName] = useState(null);
  const [viewCarePlanDetails, setViewCarePlanDetails] = useState(null);
  const [viewcaregiverName, setViewcaregiverName] = useState(null);
  const [viewQuantity, setViewQuantity] = useState(null);
  const [viewStatus, setViewStatus] = useState("Pending"); // ✅ Added new state

  const [viewThreshold, setViewThreshold] = useState(null);
  const [viewAttachments, setViewAttachments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleView = (item) => {
    const patient =
      staffMembers.find((staff) => staff._id === item.client?._id)?.fullName ||
      "Unknown";

    setViewName(patient);
    setViewFrequency(item.schedule?.frequency || "N/A");
    setViewTimes(item.schedule?.times?.join(", ") || "N/A");
    setViewcaregiverName(item.caregiverName || "N/A");
    setViewCarePlanDetails(item.medicationName || "N/A");
    setViewQuantity(item.stock?.quantity || 0);
    setViewThreshold(item.stock?.threshold || 0);
    setViewAttachments(item.attachments || []); // ✅ Attachments add
    setViewStatus(item.status || "Pending"); // ✅ Added status state

    setShowModal(true);
  };

  const data = {
    Patient: viewName,
    "Caregiver Name": viewcaregiverName,
    "Medication Name": viewCarePlanDetails,
    Frequency: viewFrequency,
    Times: viewTimes,
    "Stock Quantity": viewQuantity,
    "Stock Threshold": viewThreshold,
    Status: viewStatus || "Pending", // ✅ Added status here
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
            {viewAttachments && viewAttachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {viewAttachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative bg-[#1e212a] border border-gray-700 rounded-xl p-3 flex flex-col items-center"
                  >
                    {file.endsWith(".mp4") || file.endsWith(".webm") ? (
                      <video
                        src={file}
                        controls={false}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => setPreviewVideo(file)}
                      />
                    ) : file.endsWith(".pdf") ? (
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                      >
                        View PDF
                      </a>
                    ) : (
                      <Image
                        src={file}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => setPreviewImage(file)}
                        width={300}
                        height={300}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🖼️ Image Preview Modal */}
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
              className="w-full h-auto object-contain rounded-xl max-h-[80vh] mx-auto"
              width={1000}
              height={600}
            />
          </div>
        </div>
      )}

      {/* 🎥 Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-5xl w-full">
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
            <video
              src={previewVideo}
              controls
              autoPlay
              className="w-full h-auto object-contain rounded-xl max-h-[80vh] mx-auto"
            />
          </div>
        </div>
      )}

      {/* Mobile Navbar Toggle - only for smaller than lg */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
          Medication Management
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
            Medications Management{" "}
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-8 h-full overflow-y-auto pr-2 my-scroll">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-200">
                  Medications
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  Create and manage Medications
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:min-w-[200px] rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:border-primary-light focus:ring-primary-light bg-gray-700 text-white text-sm"
                    placeholder="Search Medications..."
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
                    <FaPlus className="mr-2" /> Create New Medications
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
                      "Stock",
                      "Status",
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
                                (staff) => staff._id === item.client?._id
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
                                (staff) => staff._id === item.client?._id
                              )?.fullName || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-sm text-white">
                        {item.caregiverName}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-sm text-white">
                        {item.medicationName}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-sm text-gray-400">
                        {item.stock?.quantity}
                        {isLowStock(item) && (
                          <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                            Low
                          </span>
                        )}
                      </td>

                      <td className="px-1 sm:px-1 py-3 text-white">
                        {/* If NOT client or external — show dropdown */}
                        {!hasClients && user.role !== "External" ? (
                          <select
                            className="bg-[#1E2939] border border-gray-600 text-white lg:text-[10px] text-[8px] px-1 sm:px-1 py-1 rounded outline-none"
                            value={item.status || "Pending"}
                            onChange={(e) =>
                              handleStatusChange(item._id, e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          // ✅ Client or External — read-only badge
                          <span
                            className={`px-2 py-1 rounded text-[10px] ${
                              item.status === "Completed"
                                ? "bg-green-700 text-white"
                                : "bg-yellow-700 text-white"
                            }`}
                          >
                            {item.status || "Pending"}
                          </span>
                        )}
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
                <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                  {/* Medications Management */}
                  {editingCareId
                    ? "Edit Medication Management"
                    : "Add Medication Management"}
                </h2>
                <form
                  encType="multipart/form-data"
                  id="add-care-plan-form"
                  className="p-4"
                  onSubmit={handleSubmitCare}
                >
                  {/* Client ID */}
                  <div className="mb-4 relative">
                    <label
                      htmlFor="clientId"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Patient
                    </label>

                    {/* Dropdown toggle */}
                    <div
                      onClick={() => setOpen(!open)}
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 cursor-pointer select-none"
                    >
                      {formDataCare.client
                        ? staffMembers.find(
                            (c) => c._id === formDataCare.client
                          )?.fullName
                        : "Select Patient"}
                    </div>

                    {/* Dropdown panel */}
                    {open && (
                      <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2">
                        {/* Search input */}
                        <input
                          type="text"
                          placeholder="Search patient..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full rounded-md border border-gray-600 px-3 py-1 mb-2 text-sm bg-gray-700 text-white focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
                        />

                        {/* Scrollable filtered list */}
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredPatients.length > 0 ? (
                            filteredPatients.map((client) => (
                              <div
                                key={client._id}
                                onClick={() => handleSelect(client)}
                                className={`px-2 py-1 rounded-md hover:bg-gray-600 text-gray-200 text-sm cursor-pointer ${
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

                    {/* Hidden input fields for form submission */}
                    <input
                      type="hidden"
                      name="client"
                      value={formDataCare.client}
                    />
                    <input
                      type="hidden"
                      name="clientName"
                      value={formDataCare.clientName || ""}
                    />
                  </div>

                  {/* Plan Type */}

                  <div className="mb-4">
                    <label
                      htmlFor="Medication Name"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Caregiver Name
                    </label>
                    <input
                      type="text"
                      name="caregiverName"
                      value={formDataCare.caregiverName}
                      onChange={handleChangeCare}
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Caregiver Name"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="Medication Name"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      medication Name
                    </label>
                    <input
                      type="text"
                      name="medicationName"
                      value={formDataCare.medicationName}
                      onChange={handleChangeCare}
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="medication Name"
                      required
                    />
                  </div>

                  {/* Review Date */}
                  <div className="mb-4">
                    <label
                      htmlFor="Frequency (e.g., Daily)"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Frequency (e.g., Daily)
                    </label>
                    <input
                      type="text"
                      name="schedule.frequency"
                      value={formDataCare.schedule.frequency}
                      onChange={handleChangeCare}
                      placeholder="Frequency (e.g., Daily)"
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Details */}
                  <div className="mb-4">
                    <label
                      htmlFor="Times (comma separated)"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Times (comma separated)
                    </label>
                    <input
                      type="text"
                      name="schedule.times"
                      value={formDataCare.schedule.times.join(", ")}
                      onChange={(e) =>
                        setFormDataCare((prev) => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            times: e.target.value
                              .split(",")
                              .map((t) => t.trim()),
                          },
                        }))
                      }
                      placeholder="e.g. 08:00, 14:00, 20:00"
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="Stock Quantity"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock.quantity"
                      value={formDataCare.stock.quantity}
                      onChange={handleChangeCare}
                      placeholder="Stock Quantity"
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="Stock Threshold"
                      className="block text-gray-300 text-sm font-medium mb-2"
                    >
                      Stock Threshold
                    </label>
                    <input
                      type="number"
                      name="stock.threshold"
                      value={formDataCare.stock.threshold}
                      onChange={handleChangeCare}
                      placeholder="Stock Threshold"
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block  text-gray-300 text-sm font-medium mb-2">
                      Attach Photo/Document
                    </label>
                    <input
                      type="file"
                      name="attachments"
                      onChange={handleFileChange}
                      multiple
                      className="w-full px-3 py-2  rounded bg-gray-700 text-white"
                    />
                  </div>
                  {/* Buttons */}
                  <div className="flex justify-end pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={handleCancel12}
                      className=" bg-gray-700 cursor-pointer hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded mr-2"
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
                      ) : editingCareId ? (
                        "Update Medication "
                      ) : (
                        "Create Medication "
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
