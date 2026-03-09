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

          { icon: <FaUsers />, label: "HR Management", href: "/HR-Management" },
          {
            icon: <IoDocumentAttach />,
            label: "Documents Management",
            href: "/Documents-Management",
            active: true,
          },
          {
            icon: <GrDocumentPerformance />,
            label: "Performance Management",
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
  const filters = ["All Records", "Valid", "Expiring Soon", "Expired"];
  const [previewImage, setPreviewImage] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null); // track if editing
  const [loading, setLoading] = useState(false); // track loading state
  const [viewName, setViewName] = useState(null);
  const [viewExpiryDate, setViewExpiryDate] = useState(null);
  const { hasLowStock, setHasLowStock } = useAuth();
  const { hasReviews, setHasReviews } = useAuth();


  const [viewNotes, setViewNotes] = useState(null);
  const [viewAttachments, setViewAttachments] = useState([]);
  const [showModals, setShowModals] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  const [staffMembers, setStaffMembers] = useState([]); // For HR/staff members
  const emptyAttachments = {
    employmentContracts: [],
    dbsCertificates: [],
    idDocuments: [],
    trainingCertificates: [],
    appraisalsReviews: [],
    disciplinaryRecords: [],
  };
  // Define your navigation links here with proper routes
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm4, setShowForm4] = useState(false);
  const [formData4, setFormData4] = useState({
    staffName: "", // backend me "staff" hai, staffMember nahi
    expiryDate: "",
    notes: "",
  });

  const handleCancel9 = () => {
    setShowForm4(false);
    setFormData4({
      staffName: "",
      expiryDate: "",
      notes: "",
    });
    setAttachments([]);
    setEditingUserId(null);
  };

  const [attachments, setAttachments] = useState(emptyAttachments);
  const router = useRouter();

  // 1️⃣ Training data fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("https://admin-panel-backend-alpha.vercel.app/staff-documents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Fetched users:", response.data);
        setStaffData(response.data);
        console.log("Filtered users:", response.data);

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

  // 2️⃣ Filter staff on search or selection change
  useEffect(() => {
    const now = new Date();

    const filtered = StaffData.filter((staff) => {
      const expiry = staff.expiryDate ? new Date(staff.expiryDate) : null;
      if (!expiry) return false;

      const diffInDays = (expiry - now) / (1000 * 60 * 60 * 24);
      const fullName = staff.staffMember?.fullName?.toLowerCase() || "";

      const matchesSelected =
        selected === "All Records" ||
        (selected === "Valid" && expiry > now && diffInDays > 30) ||
        (selected === "Expiring Soon" && expiry > now && diffInDays <= 30) ||
        (selected === "Expired" && expiry < now);

      const matchesSearch = fullName.includes(searchQuery.toLowerCase());

      return matchesSelected && matchesSearch;
    });

    setFilteredStaff(filtered);
  }, [selected, StaffData, searchQuery]);

  // 3️⃣ HR data fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("https://admin-panel-backend-alpha.vercel.app/hr", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setStaffMembers(response.data.allHr);
        setMessage("Staff fetched successfully");
      })
      .catch((error) => {
        setError(error.response?.data?.msg || "Failed to fetch staff");
      });
  }, []);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setAttachments({
      ...attachments,
      [name]: Array.from(files), // multiple files
    });
  };

  const handleEdit = (doc) => {
    setFormData4({
      staff: doc.staff?._id, // backend field
      expiryDate: doc.expiryDate?.slice(0, 10) || "",
      notes: doc.notes || "",
    });
    setAttachments({
      employmentContracts: doc.employmentContracts || [],
      dbsCertificates: doc.dbsCertificates || [],
      idDocuments: doc.idDocuments || [],
      trainingCertificates: doc.trainingCertificates || [],
      appraisalsReviews: doc.appraisalsReviews || [],
      disciplinaryRecords: doc.disciplinaryRecords || [],
    });
    setShowForm4(true);
    setEditingUserId(doc._id);
  };

  // Function to handle PDF download
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // ✅ PDF Download (same as your version)
  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Staff Document Details", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Field", "Value"]],
      body: [
        ["Staff Name", item.staffName?.fullName || "N/A"],
        ["Expiry Date", item.expiryDate ? item.expiryDate.slice(0, 10) : "N/A"],
        ["Notes", item.notes || "N/A"],
      ],
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    const allFiles = [
      ...(item.employmentContracts || []),
      ...(item.dbsCertificates || []),
      ...(item.idDocuments || []),
      ...(item.trainingCertificates || []),
      ...(item.appraisalsReviews || []),
      ...(item.disciplinaryRecords || []),
    ];
    async function addAttachments() {
      if (allFiles.length > 0) {
        doc.setFontSize(14);
        doc.text("Attachments:", 14, currentY);
        currentY += 10;

        for (let i = 0; i < allFiles.length; i++) {
          const url = allFiles[i];
          const ext = url.split(".").pop().toLowerCase();

          // 🖼️ IMAGES
          if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
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
            } catch {
              doc.setTextColor(200, 0, 0);
              doc.text(`Image failed to load`, 14, currentY);
              currentY += 10;
            }
          }

          // 📄 PDF FILES
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
                doc.textWithLink("PDF Attachment", 34, currentY + 12, { url });
                currentY += 25;
                resolve();
              };
            });
          }

          // 🎥 VIDEOS
          else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
            const playIcon = "https://cdn-icons-png.flaticon.com/512/0/375.png";
            const res = await fetch(playIcon);
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
                doc.link(14, currentY, 18, 18, { url });
                doc.textWithLink("Video Attachment", 38, currentY + 12, {
                  url,
                });
                currentY += 25;
                resolve();
              };
            });
          }

          // ⚠️ OTHER FILE TYPES
          else {
            doc.setTextColor(255, 165, 0);
            doc.text(`Unsupported file type: ${ext}`, 14, currentY);
            currentY += 10;
          }
        }
      }
    }

    await addAttachments();
    const fileName = `${item.staffName?.fullName || "staff"}_document.pdf`;
    doc.save(fileName);
  };

  // ✅ CSV Download
  const handleDownloadCsv = (item) => {
    const headers = ["Field,Value"];
    const rows = [
      `Staff Name,${item.staffName?.fullName || "N/A"}`,
      `Expiry Date,${item.expiryDate ? item.expiryDate.slice(0, 10) : "N/A"}`,
      `Notes,${item.notes || "N/A"}`,
      // `Employment Contracts,${(item.employmentContracts || []).join(" | ")}`,
      // `DBS Certificates,${(item.dbsCertificates || []).join(" | ")}`,
      // `ID Documents,${(item.idDocuments || []).join(" | ")}`,
      // `Training Certificates,${(item.trainingCertificates || []).join(" | ")}`,
      // `Appraisals Reviews,${(item.appraisalsReviews || []).join(" | ")}`,
      // `Disciplinary Records,${(item.disciplinaryRecords || []).join(" | ")}`,
    ];

    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item.staffName?.fullName || "staff"}_document.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange4 = (e) => {
    const { name, value } = e.target;

    setFormData4((prev) => ({
      ...prev,
      [name]: value,
    }));

    // When staff is selected, fetch recommendations
  };
  const handleSubmit4 = (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const data = new FormData();
    data.append("staffName", formData4.staffName);
    data.append("expiryDate", formData4.expiryDate);
    data.append("notes", formData4.notes);

    // append multiple files for each category
    Object.keys(attachments).forEach((category) => {
      const files = attachments[category];
      if (Array.isArray(files) && files.length > 0) {
        files.forEach((file) => {
          // agar already url hai (edit case) to skip karo
          if (file instanceof File) {
            data.append(category, file);
          }
        });
      }
    });

    const request = editingUserId
      ? axios.put(
          `https://admin-panel-backend-alpha.vercel.app/staff-documents/${editingUserId}`,
          data,
          config
        )
      : axios.post(`https://admin-panel-backend-alpha.vercel.app/staff-documents`, data, config);

    request
      .then((res) => {
        setMessage(
          editingUserId
            ? "Record updated successfully"
            : "Record added successfully"
        );
        setEditingUserId(null);
        setFormData4({
          staff: "",
          expiryDate: "",
          notes: "",
        });
        setAttachments(emptyAttachments);
        setShowForm4(false);
        setLoading(false);
        toast.success("Saved successfully");

        return axios.get(`https://admin-panel-backend-alpha.vercel.app/staff-documents`, config);
      })
      .then((res) => {
        setStaffData(res.data);
      })
      .catch((err) => {
        console.error("Error:", err.response?.data);
        setLoading(false);
        setError(err.response?.data?.msg || "An error occurred");
        toast.error(err.response?.data?.msg || "An error occurred");
      });
  };
  useEffect(() => {
    const now = new Date();
    const expiredStaff = [];
    const expiringSoonStaff = [];

    StaffData.forEach((staff) => {
      const expiry = staff.expiryDate ? new Date(staff.expiryDate) : null;
      if (!expiry) return;

      const diffInDays = (expiry - now) / (1000 * 60 * 60 * 24);

      if (expiry < now) {
        expiredStaff.push(staff.staffName?.fullName || "Unknown");
      } else if (diffInDays <= 30) {
        expiringSoonStaff.push(staff.staffName?.fullName || "Unknown");
      }
    });

    if (expiredStaff.length > 0) {
      toast.warning(`⚠️ Expired: ${expiredStaff.join(", ")}`);
    }

    if (expiringSoonStaff.length > 0) {
      toast.info(`ℹ️ Expiring Soon: ${expiringSoonStaff.join(", ")}`);
    }
  }, [StaffData]);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`https://admin-panel-backend-alpha.vercel.app/staff-documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMessage("Record deleted");
        const updated = StaffData.filter((doc) => doc._id !== id);
        setStaffData(updated);
        setFilteredStaff(updated);
        toast.success("Deleted successfully");
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.msg || "Failed to delete record");
        toast.error(err.response?.data?.msg || "Failed to delete record");
      });
  };

  const handleView = (client) => {
    setViewName(client.staffName?.fullName || "N/A");
    setViewExpiryDate(client.expiryDate?.slice(0, 10) || "N/A");
    setViewNotes(client.notes || "N/A");

    // 👉 Merge all attachment arrays into one
    const allFiles = [
      ...(client.employmentContracts || []),
      ...(client.dbsCertificates || []),
      ...(client.idDocuments || []),
      ...(client.trainingCertificates || []),
      ...(client.appraisalsReviews || []),
      ...(client.disciplinaryRecords || []),
    ];

    setViewAttachments(allFiles);
    setShowModals(true);
  };

  const data = {
    "Staff Name": viewName,
    "Expiry Date": viewExpiryDate,
    Notes: viewNotes,
  };

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
              Social Record Details
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
                    const ext = file.split(".").pop().toLowerCase();
                    const isPDF = ext === "pdf";
                    const isVideo = [
                      "mp4",
                      "mov",
                      "avi",
                      "mkv",
                      "webm",
                    ].includes(ext);

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
                          /* 🎥 VIDEO FILE */
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => setPreviewVideo(file)}
                          >
                            <video
                              src={file}
                              className="w-full h-[200px] object-cover rounded-lg border border-gray-600"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="white"
                                className="w-10 h-10"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 3l14 9-14 9V3z"
                                />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          /* 🖼️ IMAGE FILE */
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="white"
                                className="w-6 h-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 10l4.553 2.276A1 1 0 0120 13.118V14a9 9 0 11-18 0v-.882a1 1 0 01.447-.842L7 10m8-2V4a2 2 0 00-4 0v4m4 0H7"
                                />
                              </svg>
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

      {/* 🖼️ IMAGE PREVIEW */}
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

      {/* 🎥 VIDEO PREVIEW */}
      {previewVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-3xl w-full">
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
              className="w-full h-[350px] rounded-xl mx-auto"
            />
          </div>
        </div>
      )}

      {/* Mobile Navbar Toggle */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
          Training
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
            Documents
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8 h-full overflow-y-auto pr-2 my-scroll">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200">
                  Documents Management
                </h3>
                <p className="text-sm text-gray-400"></p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:border-primary-light focus:ring-primary-light bg-gray-700 text-white"
                    placeholder="Search Documents..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className=" text-gray-500" />
                  </div>
                </div>
                <button
                  onClick={() => setShowForm4(true)}
                  className="bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white px-4 py-2 rounded-md text-[10px] font-medium transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" /> Add New Document
                </button>
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
                      ? "bg-primary-light bg-gray-700 text-primary-light shadow-lg"
                      : " bg-gray-800 hover:bg-gray-700 text-gray-300  hover:text-primary-light"
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
                      "Staff name",
                      "Documents ",
                      "contracts Exp Date",
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
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white text-blue-500 flex items-center justify-center rounded-full border border-gray-600">
                              {(
                                staffMembers.find(
                                  (staff) => staff._id === item.staffName?._id
                                )?.fullName || "U"
                              )
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="text-[12px] font-medium text-white">
                                {staffMembers.find(
                                  (staff) => staff._id === item.staffName?._id
                                )?.fullName || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-400"></div>
                            </div>
                          </div>
                        </td>
                        {/* total document number  */}
                        <td className="px-4 py-4 text-sm text-white">
                          Documents
                        </td>
                        <td className="px-4 py-4 text-sm text-white">
                          {item.expiryDate.slice(0, 10)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-3 text-white items-center">
                            <button
                              className="hover:text-blue-500 transition cursor-pointer"
                              onClick={() => handleView(item)}
                            >
                              <FaEye />
                            </button>

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
                                className="hover:text-green-500 transition cursor-pointer"
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
                                    className="block w-full text-left px-4 py-2 hover:bg-white/30 rounded-lg transition cursor-pointer"
                                  >
                                    Download PDF
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDownloadCsv(item);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-white/30 rounded-lg transition cursor-pointer"
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
                        colSpan={6}
                        className="text-center px-4 sm:px-6 py-24 text-gray-400 text-sm"
                      >
                        No Documents Records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Form */}
          {showForm4 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4">
              <form
                onSubmit={handleSubmit4}
                className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                  {editingUserId
                    ? "Edit Documents Record"
                    : "Add Documents Record"}
                </h2>

                {/* Staff Member */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Staff Member
                  </label>
                  <select
                    name="staffName"
                    value={formData4.staffName}
                    onChange={handleChange4}
                    required
                    className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
                  >
                    <option value="">Select Staff Member</option>
                    {staffMembers.map((staff) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expiry Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    contracts Exp Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData4.expiryDate}
                    onChange={handleChange4}
                    required
                    className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
                  />
                </div>

                {/* Attachments */}
                {/* Attachments - Multiple Categories */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Employment Contracts
                  </label>
                  <input
                    type="file"
                    name="employmentContracts"
                    onChange={handleFileChange}
                    multiple
                    className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    DBS Certificates
                  </label>
                  <input
                    type="file"
                    name="dbsCertificates"
                    onChange={handleFileChange}
                    multiple
                    className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    ID Documents
                  </label>
                  <input
                    type="file"
                    name="idDocuments"
                    onChange={handleFileChange}
                    multiple
                    className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Training Certificates
                  </label>
                  <input
                    type="file"
                    name="trainingCertificates"
                    onChange={handleFileChange}
                    multiple
                    className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Appraisals & Reviews
                  </label>
                  <input
                    type="file"
                    name="appraisalsReviews"
                    onChange={handleFileChange}
                    multiple
                    className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Disciplinary Records
                  </label>
                  <input
                    type="file"
                    name="disciplinaryRecords"
                    onChange={handleFileChange}
                    multiple
                    className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                  />
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData4.notes}
                    onChange={handleChange4}
                    rows="4"
                    className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
                  />
                </div>
                {/* Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel9}
                    className=" bg-gray-700 hover:bg-gray-600 cursor-pointer text-gray-200 font-bold py-2 px-4 rounded"
                  >
                    {/* setShowForm4(false) */}
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
                      "Update Record"
                    ) : (
                      "Add Record"
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
