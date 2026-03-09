"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import { BsArrowsFullscreen } from "react-icons/bs";
import { SiSimpleanalytics } from "react-icons/si";
import { GrDocumentPerformance } from "react-icons/gr";
import Image from "next/image";
import { IoDocumentAttach } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";
import { TbClockRecord } from "react-icons/tb";

import Link from "next/link"; // <-- import Next.js Link
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
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Optional for table format
import { MdMedicationLiquid } from "react-icons/md";

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
    {
      icon: <LuLayoutTemplate />,
      label: "Template",
      href: "/Template",
      active: true,
    },
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
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState("All Records");
  const { hasLowStock, setHasLowStock} = useAuth();
  const { hasReviews, setHasReviews} = useAuth();

  const filters = ["All Records"];
  const [showForm5, setShowForm5] = useState(false);
  // Define your navigation links here with proper routes
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData5, setFormData5] = useState({
    title: "",
    visibility: "Admin Only",
    attachments: [],
  });

  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const handleEdit = (comp) => {
    setFormData5({
      title: comp.title || "",
      visibility: comp.visibility || "Admin Only",
      attachments: comp.attachments || [], // existing Cloudinary file URLs (optional)
    });

    setAttachments([]); // user may upload new files while editing
    setShowForm5(true);
    setEditingUserId(comp._id);
  };

  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Function to toggle dropdown for a specific client

  // ✅ PDF Download Function (your original code)
  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Template Record", 14, 15);

    // 🧾 Table with template data
    autoTable(doc, {
      startY: 25,
      head: [["Field", "Value"]],
      body: [
        ["Title", item.title || ""],
        ["Visibility", item.visibility || ""],

        [
          "Created At",
          item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
        ],
        [
          "Updated At",
          item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "",
        ],
      ],
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // ✅ Handle attachments (images + PDFs + videos)
    async function addAttachments() {
      if (item.attachments?.length > 0) {
        doc.setFontSize(14);
        doc.text("Attachments:", 14, currentY);
        currentY += 10;

        for (let i = 0; i < item.attachments.length; i++) {
          const url = item.attachments[i];
          const ext = url.split(".").pop().toLowerCase();

          // 🖼️ Image preview
          if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
            try {
              const res = await fetch(url);
              const blob = await res.blob();
              const reader = new FileReader();
              reader.readAsDataURL(blob);

              await new Promise((resolve) => {
                reader.onloadend = function () {
                  const base64data = reader.result;

                  if (currentY + 60 > 280) {
                    doc.addPage();
                    currentY = 20;
                  }

                  doc.addImage(base64data, "JPEG", 14, currentY, 50, 50);
                  currentY += 60;
                  resolve();
                };
              });
            } catch (err) {
              doc.setTextColor(200, 0, 0);
              doc.text(`Image failed to load`, 14, currentY);
              currentY += 10;
            }
          }

          // 📄 PDF icon + link
          else if (ext === "pdf") {
            const iconUrl =
              "https://cdn-icons-png.flaticon.com/512/337/337946.png";
            const res = await fetch(iconUrl);
            const blob = await res.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            await new Promise((resolve) => {
              reader.onloadend = function () {
                const iconBase64 = reader.result;

                if (currentY + 22 > 280) {
                  doc.addPage();
                  currentY = 20;
                }

                doc.addImage(iconBase64, "PNG", 14, currentY, 16, 16);
                doc.link(14, currentY, 16, 16, { url });
                currentY += 22;
                resolve();
              };
            });
          }

          // 🎥 Video icon + link
          else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
            const videoIconUrl =
              "https://cdn-icons-png.flaticon.com/512/711/711245.png"; // video play icon
            const res = await fetch(videoIconUrl);
            const blob = await res.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            await new Promise((resolve) => {
              reader.onloadend = function () {
                const iconBase64 = reader.result;

                if (currentY + 22 > 280) {
                  doc.addPage();
                  currentY = 20;
                }

                doc.addImage(iconBase64, "PNG", 14, currentY, 18, 18);
                doc.link(14, currentY, 18, 18, { url });
                currentY += 24;
                resolve();
              };
            });
          }

          // ❓ Unknown file types
          else {
            doc.setTextColor(150, 150, 150);
            doc.text(`Unsupported file: ${ext}`, 14, currentY);
            currentY += 10;
          }
        }
      }
    }

    await addAttachments();

    const fileName = `${item.title || "template"}_record.pdf`;
    doc.save(fileName);
  };

  // ✅ CSV Download Function (new)
  const handleDownloadCsv = (item) => {
    const headers = ["Field", "Value"];

    const rows = [
      ["Title", item.title || ""],
      ["Visibility", item.visibility || ""],
      [
        "Created At",
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
      ],
      [
        "Updated At",
        item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "",
      ],
      ["Uploaded By", item.uploadedBy?.email || item.uploadedBy || ""],
    ];

    // ✅ Include attachments (if any)
    if (item.attachments && item.attachments.length > 0) {
      item.attachments.forEach((url, i) => {
        rows.push([`Attachment ${i + 1}`, url]);
      });
    }

    // ✅ Generate CSV string
    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");

    // ✅ Create file and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item.title || "template"}_record.csv`;
    link.click();
  };

  const handleChange5 = (e) => {
    const { name, value } = e.target;
    setFormData5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleForm5 = () => {
    setShowForm5(!showForm5);
  };
  const [editingUserId, setEditingUserId] = useState(null); // track if editing

  const handleCancel5 = () => {
    setShowForm5(false);
    setFormData5({
      title: "",
      visibility: "Admin Only",
      attachments: [],
    });
    setAttachments([]);
    setEditingUserId(null);
    setLoading(false);
  };

  const [loading, setLoading] = useState(false); // track loading state
  // === SUBMIT FUNCTION (with FILE UPLOAD support) ===
  const handleSubmit5 = async (e) => {
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
      const data = new FormData();
      data.append("title", formData5.title);
      data.append("visibility", formData5.visibility);

      // ✅ Append attachments (images, pdf, etc.)
      attachments.forEach((file) => {
        data.append("attachments", file);
      });

      let response;

      if (editingUserId) {
        // 🟢 Update existing template
        response = await axios.put(
          `https://admin-panel-backend-alpha.vercel.app/templates/${editingUserId}`,
          data,
          config
        );
      } else {
        // 🟢 Create new template
        response = await axios.post(
          "https://admin-panel-backend-alpha.vercel.app/templates",
          data,
          config
        );
      }

      toast.success(
        editingUserId
          ? "Template updated successfully ✅"
          : "Template added successfully ✅"
      );

      // Reset form
      setEditingUserId(null);
      setShowForm5(false);
      setFormData5({
        title: "",
        visibility: "Admin Only",
        attachments: [],
      });
      setAttachments([]);

      // 🔄 Refresh the list of templates
      const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/templates", config);
      setStaffData(res.data);
    } catch (err) {
      console.error("❌ Full Error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.msg ||
          err.message ||
          "An error occurred"
      );
      toast.error("Failed to save template ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = StaffData;

    // 🔹 Filter by selected visibility (if not "All Records")
    if (selected !== "All Records") {
      filtered = filtered.filter(
        (template) => template.visibility === selected
      );
    }

    // 🔹 Filter by search query (title or visibility)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.title?.toLowerCase().includes(query) ||
          template.visibility?.toLowerCase().includes(query) ||
          template.attachments?.some((att) => att.toLowerCase().includes(query))
      );
    }

    // 🔹 Update filtered data state
    setFilteredStaff(filtered);
  }, [selected, searchQuery, StaffData]);

  useEffect(() => {
    const fetchHR = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/templates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStaffData(res.data); // no .users needed, your backend returns an array
        setFilteredStaff(res.data);
        setMessage("Users fetched successfully");
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch HR data");
      }
    };
    fetchHR();
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`https://admin-panel-backend-alpha.vercel.app/templates/${id}`, {
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
        toast.success("Deleted successfuly");
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.msg || "Failed to delete user");
        toast.error(err.response?.data?.msg || "Failed to delete user");
      });
  };

  // ["Requirement", item.requirement],
  //     ["Category", item.category],
  //     ["LastReviewDate", item.lastReviewDate.slice(0, 10)],
  //     ["NextReview", item.nextReviewDate.slice(0, 10)],
  //     ["Status", item.status],
  //     ["Notes", item.notes],
  // 🧾 View States
  const [viewTitle, setViewTitle] = useState(null);
  const [viewVisibility, setViewVisibility] = useState(null);
  const [viewUploadedBy, setViewUploadedBy] = useState(null);
  const [viewAttachments, setViewAttachments] = useState([]); // ✅ for files

  const [showModals, setShowModals] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  // 🧾 Handle View Function
  const handleView = (template) => {
    setViewTitle(template.title);
    setViewVisibility(template.visibility);
    setViewUploadedBy(template.uploadedBy?.email || "Unknown");
    setViewAttachments(template.attachments || []); // ✅ Set file attachments
    setShowModals(true);
  };

  // 🧾 Data for modal view
  const data = {
    Title: viewTitle,
    Visibility: viewVisibility,
    "Uploaded By": viewUploadedBy,
  };

  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/Login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="bg-[#111827] min-h-screen">
      <Navbar />

      {/* view data /////////////////////////////////////////////// */}

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

            {/* 💡 Heading */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
              Template Details
            </h2>

            {/* 💠 Info Fields */}
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
                    const isVideo = /\.(mp4|mov|avi|mkv|webm)$/.test(lower);

                    return (
                      <div
                        key={index}
                        className="relative bg-[#1e212a] p-3 rounded-2xl border border-gray-700 shadow-md hover:shadow-xl transition-all overflow-hidden"
                      >
                        {/* 📄 PDF FILE */}
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
                          /* 🎥 VIDEO FILE with THUMBNAIL */
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => setPreviewVideo(file)}
                          >
                            <video
                              src={file}
                              className="w-full h-[200px] object-cover rounded-lg border border-gray-600"
                              poster="https://cdn-icons-png.flaticon.com/512/711/711245.png" // ✅ Default video thumbnail
                            >
                              Your browser does not support the video tag.
                            </video>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="white"
                                className="w-12 h-12"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5.25 5.25v13.5l13.5-6.75L5.25 5.25z"
                                />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          /* 🖼️ IMAGE FILE */
                          <div className="relative group cursor-zoom-in">
                            <Image
                              src={file}
                              alt={`Attachment ${index + 1}`}
                              width={400}
                              height={200}
                              className="w-full h-[200px] object-cover rounded-lg border border-gray-600"
                              onClick={() => setPreviewImage(file)}
                            />
                            <div
                              onClick={() => setPreviewImage(file)}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                            >
                              <BsArrowsFullscreen />
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

      {/* 🖼️ Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-4xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-10 h-10 bg-gray-800 text-white hover:bg-red-600 rounded-full flex items-center justify-center shadow"
            >
              <svg
                className="w-5 h-5"
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

      {/* 🎥 Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-4xl w-full">
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
              className="w-full h-auto rounded-xl max-h-[80vh] mx-auto"
            />
          </div>
        </div>
      )}

      {/* Mobile Navbar Toggle */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg  text-white font-semibold absolute left-4">
          Template
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
          {/* <div className="h-full overflow-y-auto pr-2"></div> */}
          <h2 className="text-xl font-semibold text-gray-200 mb-6 hidden md:block">
            Template
          </h2>

          <div className="bg-gray-800 rounded-lg  shadow-md p-6 mb-8 h-full overflow-y-auto pr-2 my-scroll">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200">
                  Template Records
                </h3>
                <p className="text-sm text-gray-400">
                  Monitor regulatory Template
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:border-primary-light focus:ring-primary focus:ring-primary-light bg-gray-700 text-white"
                    placeholder="Search Template..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                  </div>
                </div>
                {!hasClients && (
                  <button
                    onClick={handleToggleForm5}
                    className="bg-[#4a48d4] cursor-pointer hover:bg-[#4A49B0] text-white px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Template Record
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex text-white flex-wrap gap-2">
              {filters.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(label)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer backdrop-blur-sm ${
                    selected === label
                      ? "bg-gray-700 text-primary-light shadow-lg"
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
                      "Title",
                      "Document",
                      "Visibility",
                      "Status",
                      "Actions",
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
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
                        {/* 🏷️ Title */}
                        <td className="px-4 py-4 text-sm text-white">
                          {item.title || "N/A"}
                        </td>

                        {/* 📄 Document (show attachments if available) */}
                        <td className="px-4 py-4 text-sm text-white">
                          {item.attachments && item.attachments.length > 0 ? (
                            <ul>
                              {item.attachments.map((file, idx) => (
                                <li key={idx}>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline"
                                  >
                                    {file.name || `Document ${idx + 1}`}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "No Document"
                          )}
                        </td>

                        {/* 👁️ Visibility */}
                        <td className="px-4 py-4 text-sm text-white">
                          {item.visibility || "Private"}
                        </td>

                        {/* 📊 Status */}
                        <td className="px-4 py-4 text-sm text-white">Active</td>

                        {/* ⚙️ Actions */}
                        <td className="px-4 py-4">
                          <div className="flex space-x-2 text-white relative">
                            {/* 👁️ View */}
                            <button
                              className="hover:text-blue-500 transition cursor-pointer"
                              onClick={() => handleView(item)}
                            >
                              <FaEye />
                            </button>

                            {/* ✏️ Edit */}
                            {!hasClients && (
                              <button
                                className="hover:text-yellow-500 transition cursor-pointer"
                                onClick={() => handleEdit(item)}
                              >
                                <FaEdit />
                              </button>
                            )}

                            {/* /* 🗑️ Delete */}
                            {!hasClients && (
                              <button
                                className="hover:text-red-500 transition cursor-pointer"
                                onClick={() => handleDelete(item._id)}
                              >
                                <FaTrash />
                              </button>
                            )}

                            {/* 📥 Download Dropdown */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === item._id
                                      ? null
                                      : item._id
                                  )
                                }
                                className="hover:text-green-600 transition cursor-pointer"
                              >
                                <FaDownload />
                              </button>

                              {openDropdownId === item._id && (
                                <div
                                  className="absolute right-0 mt-2 bg-white/20 backdrop-blur-xl border border-white/30 
                      rounded-xl shadow-lg p-2 z-10 w-40 transition-all duration-300 cursor-pointer"
                                >
                                  <button
                                    onClick={() => {
                                      handleDownloadPdf(item);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-3 py-2 
                        text-sm text-white hover:bg-white/10 transition cursor-pointer"
                                  >
                                    Download PDF
                                  </button>

                                  <button
                                    onClick={() => {
                                      handleDownloadCsv(item);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-3 py-2 
                        text-sm text-white hover:bg-white/10 transition cursor-pointer"
                                  >
                                    Download CSV
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
                        colSpan={5}
                        className="text-center px-4 sm:px-6 py-24 text-gray-400 text-sm"
                      >
                        No Template found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Modal Form */}

          {showForm5 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4">
              <form
                onSubmit={handleSubmit5}
                className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-center text-white font-semibold mb-4 text-lg">
                  {editingUserId ? "Edit Template" : "Add Template"}
                </h2>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData5.title}
                    onChange={handleChange5}
                    required
                    className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none"
                  />
                </div>

                {/* Visibility */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData5.visibility}
                    onChange={handleChange5}
                    required
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded p-2"
                  >
                    <option value="Admin Only">Admin Only</option>
                    <option value="Staff and Admin">Staff and Admin</option>
                    <option value="Everyone">Everyone</option>
                  </select>
                </div>

                {/* Attachments */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Attachments
                  </label>
                  <input
                    type="file"
                    name="attachments"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel5}
                    className=" cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={` cursor-pointer flex items-center justify-center bg-[#4a48d4] hover:bg-[#4A49B0] text-white font-bold py-2 px-4 rounded ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading
                      ? "Please wait..."
                      : editingUserId
                      ? "Update "
                      : "Add "}
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
