"use client";
import React, { useEffect, useState } from "react";


import Image from "next/image";
import { TbClockRecord } from "react-icons/tb";

import { AiOutlineDownload } from "react-icons/ai";
import { MdOutlineSchool } from "react-icons/md";

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
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Optional for table format
import { MdMedicationLiquid } from "react-icons/md";
import { BsArrowsFullscreen } from "react-icons/bs";
import { use } from "react";

const StafProfileTraning = ({trainings, staff2}) => {
  
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [StaffData, setStaffData] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selected, setSelected] = useState("All Records");
    const filters = ["All Records", "Valid", "Expiring Soon", "Expired"];
    const [previewImage, setPreviewImage] = useState(null);
    const [recommendedTrainings, setRecommendedTrainings] = useState([]);
    const { hasLowStock, setHasLowStock } = useAuth();
      const { hasReviews, setHasReviews } = useAuth();
  
    const [editingUserId, setEditingUserId] = useState(null); // track if editing
    const [loading, setLoading] = useState(false); // track loading state
  
    // 👇 Training view fields
    const [viewName, setViewName] = useState(null);
    const [viewTrainingType, setViewTrainingType] = useState(null);
    const [viewCompletionDate, setViewCompletionDate] = useState(null);
  
    const [viewExpiryDate, setViewExpiryDate] = useState(null);
    const [viewNotes, setViewNotes] = useState(null);
    const [viewOther, setViewOther] = useState(null);
    const [viewAttachments, setViewAttachments] = useState([]);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
  
    // 🆕 Add status field for viewing training status
    const [viewStatus, setViewStatus] = useState(null);
  
    const [showModals, setShowModals] = useState(false);
  
    const [staffMembers, setStaffMembers] = useState([]); // For HR/staff members
  
    // Define your navigation links here with proper routes
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showForm4, setShowForm4] = useState(false);
    const [formData4, setFormData4] = useState({
      staffName: "",
      trainingType: "",
      completionDate: "",
      expiryDate: "",
      other: "",
      status: "", // 🆕 added field
    });
  
    const handleCancel9 = () => {
      setShowForm4(false);
      setFormData4({
        staffName: "",
        trainingType: "",
        completionDate: "",
        expiryDate: "",
        other: "",
        status: "", // 🆕 added reset for status
      });
      setAttachments([]);
      setEditingUserId(null);
      setLoading(false);
    };
  
    const [attachments, setAttachments] = useState([]);
    const router = useRouter();
  
    // 1️⃣ Training data fetch
   // 1️⃣ Fetch & Refresh Training Data Automatically
   
useEffect(() => {
  const token = localStorage.getItem("token");

  fetch(`https://admin-panel-backend-alpha.vercel.app/training/staff/${staff2}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      // data ko do state me pass karna
      setStaffData(data);       // staff info
      setFilteredStaff(data); // trainings info
    })
    .catch((err) => console.log("Training Fetch Error:", err));
  }, [staff2]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    const refreshAndFetch = async () => {
      try {
        // ✅ First: Ask backend to refresh all statuses
        await axios.put("https://admin-panel-backend-alpha.vercel.app/training/refresh-status", {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // ✅ Then: Fetch all updated trainings
        const response = await axios.get("https://admin-panel-backend-alpha.vercel.app/training", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("Fetched users:", response.data);
        setStaffData(trainings);
        setFilteredStaff(trainings);
        setMessage("Users fetched successfully");
        setError("");
      } catch (error) {
        // console.error(
        //   "Error fetching users:",
        //   error.response?.data || error.message
        // );
        setError(error.response?.data?.msg || "Failed to fetch users");
      }
    };
  
    refreshAndFetch();
  }, [trainings]);
  
  
    // 2️⃣ Filter staff on search or selection change
    useEffect(() => {
      const now = new Date();
  console.log("hssjhj",trainings);
  
      const filtered = trainings.filter((staff) => {
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
    }, [selected, StaffData, searchQuery, trainings]);
  
    // 3️⃣ HR data fetch
 useEffect(() => {
  const token = localStorage.getItem("token");

  axios
    .get(`https://admin-panel-backend-alpha.vercel.app/hr/${staff2._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      setStaffMembers([response.data]); // FIX ✔️
      console.log("STAFF FOUND:", response.data);
    })
    .catch((error) => {
      setError(error.response?.data?.msg || "Failed to fetch staff");
    });
  }, [staff2._id]);


  
    const trainingRecommendations = {
      "Residential Care": ["Safeguarding", "Dementia Care", "Fire Safety"],
      "Nursing Homes": [
        "First Aid",
        "Medication Administration",
        "Infection Control",
      ],
      "Learning Disabilities": ["Autism & Learning Disabilities", "Epilepsy"],
      "Supported Living": ["Fire Safety", "Diabetes", "Moving & Handling"],
      "Mental Health Support": ["Mental Health", "Safeguarding", "GDPR"],
      "Domiciliary Care": ["Infection Control", "Moving & Handling", "GDPR"],
      "Other Services": ["First Aid", "Fire Safety", "Safeguarding"],
    };
    const handleFileChange = (e) => {
      setAttachments(Array.from(e.target.files));
    };
  
    const getRecommendedTrainings = (staffId) => {
      const staff = staffMembers.find((s) => s._id === staffId);
      if (!staff || !staff.careSetting) return [];
      return trainingRecommendations[staff.careSetting] || [];
    };
  
    const handleEdit = (training) => {
      setFormData4({
        staffName: training.staffMember?._id,
        trainingType: training.trainingType,
        completionDate: training.completionDate.slice(0, 10),
        expiryDate: training.expiryDate.slice(0, 10),
        notes: training.notes,
        other: training.other || "",
        status: training.status || "Valid",
      });
      setAttachments(training.attachments || []);
      setShowForm4(true);
      setEditingUserId(training._id);
    };
  
    // Function to handle PDF download
  
    const [openDropdownId, setOpenDropdownId] = useState(null);
  
    // ✅ PDF Download
    const handleDownloadPdf = async (item) => {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
  
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Training Record Details", 14, 15);
  
      autoTable(doc, {
        startY: 25,
        head: [["Field", "Value"]],
        body: [
          ["Staff Name", item.staffMember?.fullName || "N/A"],
          ["Training Type", item.trainingType || "N/A"],
          [
            "Completion Date",
            item.completionDate ? item.completionDate.slice(0, 10) : "N/A",
          ],
          ["Expiry Date", item.expiryDate ? item.expiryDate.slice(0, 10) : "N/A"],
          ["Status", item.status || "N/A"], // 🆕 added status field
          ["Notes", item.notes || "N/A"],
          ["Other", item.other || "N/A"],
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
                doc.setTextColor(255, 0, 0);
                doc.text("Image failed to load", 14, currentY);
                doc.setTextColor(0, 0, 0);
                currentY += 10;
              }
            }
  
            // 📄 PDF
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
  
            // 🎬 VIDEOS
            else if (["mp4", "mov", "avi", "webm"].includes(ext)) {
              const videoIcon =
                "https://cdn-icons-png.flaticon.com/512/727/727245.png";
              const res = await fetch(videoIcon);
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
          }
        }
      }
  
      await addAttachments();
      const fileName = `${item.staffMember?.fullName || "training"}_record.pdf`;
      doc.save(fileName);
    };
    // ✅ CSV Download
    const handleDownloadCsv = (item) => {
      const headers = ["Field,Value"];
      const rows = [
        `Staff Name,${item.staffMember?.fullName || "N/A"}`,
        `Training Type,${item.trainingType || "N/A"}`,
        `Completion Date,${
          item.completionDate ? item.completionDate.slice(0, 10) : "N/A"
        }`,
        `Expiry Date,${item.expiryDate ? item.expiryDate.slice(0, 10) : "N/A"}`,
        `Status,${item.status || "N/A"}`, // 🆕 added status field
        `Notes,${item.notes || "N/A"}`,
        `Other,${item.other || "N/A"}`,
      ];
  
      const csvContent = [...headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${item.staffMember?.fullName || "training"}_record.csv`;
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
      if (name === "staffName") {
        const rec = getRecommendedTrainings(value);
        setRecommendedTrainings(rec);
      }
    };
    const handleSubmit4 = (e) => {
      e.preventDefault();
      setLoading(true); // Set loading state to true
      const {
        staffName,
        trainingType,
        completionDate,
        expiryDate,
        notes,
        other,
        status,
      } = formData4;
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      // 🧮 Automatically calculate status if not manually set
      const today = new Date();
      const expiry = new Date(expiryDate);
      let calculatedStatus = "Valid";
      const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
  
      if (diffDays < 0) {
        calculatedStatus = "Expired";
      } else if (diffDays <= 30) {
        calculatedStatus = "Expiring Soon";
      }
      const formData = new FormData();
      formData.append("staffMember", staffName);
      formData.append("trainingType", trainingType);
      formData.append("completionDate", completionDate);
      formData.append("expiryDate", expiryDate);
      formData.append("notes", notes);
      formData.append("other", other);
      formData.append("status", status);
  
      attachments.forEach((file) => {
        formData.append("attachments", file); // same name used in backend
      });
  
      const request = editingUserId
        ? axios.put(
            `https://admin-panel-backend-alpha.vercel.app/training/${editingUserId}`,
            formData,
            config
          )
        : axios.post(`https://admin-panel-backend-alpha.vercel.app/training`, formData, config);
  
      request
        .then((res) => {
          setMessage(
            editingUserId
              ? "Training updated successfully"
              : "Training added successfully"
          );
          setEditingUserId(null);
          setFormData4({
            staffName: "",
            trainingType: "",
            completionDate: "",
            expiryDate: "",
            notes: "",
            other: "",
            status: "", // reset status too
          });
          setAttachments([]);
          setShowForm4(false);
          setLoading(false); // Reset loading state
          toast.success("Added successfully");
  
          return axios.get(`https://admin-panel-backend-alpha.vercel.app/training`, config);
        })
        .then((res) => {
          setStaffData(trainings);
        })
        .catch((err) => {
          console.error("Error:", err.response?.data);
          setLoading(false);
          setError(err.response?.data?.msg || "An error occurred");
          toast.error(err.response?.data?.msg || "An error occurred");
        });
    };
  
    const handleDelete = (id) => {
      if (!window.confirm("Are you sure you want to delete this user?")) return;
  
      const token = localStorage.getItem("token");
      axios
        .delete(`https://admin-panel-backend-alpha.vercel.app/training/${id}`, {
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
    const handleView = (client) => {
      console.log("Viewing client:", client);
    setViewName(client.staffMember?.fullName);
    setViewTrainingType(client.trainingType);
    setViewCompletionDate(client.completionDate.slice(0, 10));
    setViewExpiryDate(client.expiryDate.slice(0, 10));
    setViewNotes(client.notes);
    setViewOther(client.other);
    setViewAttachments(client.attachments || []);
    setViewStatus(client.status);

    setShowModals(true);
  };
    const data = {
      "Staff Name": viewName,
      "Training Type": viewTrainingType,
      "Completion Date": viewCompletionDate,
      "Expiry Date": viewExpiryDate,
      Notes: viewNotes,
      Other: viewOther,
      Status: viewStatus || "N/A", // 🆕 Added line
    };

  return (
<div className="bg-[#111827] min-h-screen">

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
              Training Record Details
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
                    const lowerFile = file.toLowerCase();
                    const isPDF = lowerFile.endsWith(".pdf");
                    const isVideo = [
                      ".mp4",
                      ".mov",
                      ".avi",
                      ".mkv",
                      ".webm",
                    ].some((ext) => lowerFile.endsWith(ext));
                    const isImage = [
                      ".jpg",
                      ".jpeg",
                      ".png",
                      ".gif",
                      ".webp",
                    ].some((ext) => lowerFile.endsWith(ext));

                    return (
                      <div
                        key={index}
                        className="relative bg-[#1e212a] p-3 rounded-2xl border border-gray-700 shadow-md hover:shadow-xl transition-all overflow-hidden"
                      >
                        {/* 📄 PDF */}
                        {isPDF && (
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
                        )}

                        {/* 🖼️ Image */}
                        {isImage && (
                          <div className="relative group cursor-zoom-in">
                            <Image
                              src={file}
                              alt={`Attachment ${index + 1}`}
                              width={400}
                              height={200}
                              className="w-full h-[200px] object-cover rounded-lg border border-gray-600"
                              onClick={() => {
                                setPreviewFile({ type: "image", src: file });
                              }}
                            />
                            <div
                              onClick={() =>
                                setPreviewFile({ type: "image", src: file })
                              }
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                            >
                              <BsArrowsFullscreen className="text-white w-6 h-6" />
                            </div>
                          </div>
                        )}

                        {/* 🎬 Video */}
                        {isVideo && (
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => {
                              setPreviewFile({ type: "video", src: file });
                            }}
                          >
                            <video
                              src={file}
                              className="w-full h-[200px] object-cover rounded-lg border border-gray-600"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
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

      {/* 🔍 Image/Video Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-4xl w-full">
            <button
              onClick={() => setPreviewFile(null)}
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

            {previewFile.type === "image" ? (
              <Image
                src={previewFile.src}
                alt="Full View"
                width={800}
                height={600}
                className="w-full h-auto object-contain rounded-xl max-h-[80vh] mx-auto"
              />
            ) : (
              <video
                src={previewFile.src}
                controls
                autoPlay
                className="w-full h-auto rounded-xl max-h-[80vh] mx-auto"
              />
            )}
          </div>
        </div>
      )}


<main className="flex-1 h-auto overflow-hidden">
  <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 md:p-6 mb-8 h-auto overflow-y-auto pr-2 my-scroll">
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
      <div>
        <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-200 flex items-center">
          <MdOutlineSchool className="inline mr-2 text-sm sm:text-base md:text-lg" /> 
          Training Tracker
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
        <button
          onClick={() => setShowForm4(true)}
          className="bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white 
          px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-md 
          text-[11px] sm:text-[12px] md:text-sm lg:text-base font-medium 
          transition-colors flex items-center justify-center"
        >
          <FaPlus className="mr-2 text-xs sm:text-sm md:text-base" /> 
          Upload Training
        </button>
      </div>
    </div>

    {/* Filters */}
    <div className="mb-4 md:mb-6 flex text-white flex-wrap gap-2">
      {filters.map((label, index) => (
        <button
          key={index}
          onClick={() => setSelected(label)}
          className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full 
          text-[10px] sm:text-sm md:text-base font-medium transition-all cursor-pointer backdrop-blur-sm ${
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
      <table className="min-w-[700px] md:min-w-full divide-y divide-gray-700 text-xs sm:text-sm md:text-base">
        <thead className="bg-gray-700">
          <tr>
            {[
              "Staff Member",
              "Training Type",
              "Completion Date",
              "Expiry Date",
              "Status",
              "Actions",
            ].map((col, i) => (
              <th
                key={i}
                className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-gray-300 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((item, i) => (
              <tr key={item._id}>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-blue-500 flex items-center justify-center rounded-full border border-gray-600 text-[10px] sm:text-sm md:text-base">
                      {(
                        staffMembers?.find(
                          (staff) => staff._id === item.staffMember?._id
                        )?.fullName || "U"
                      )
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-sm md:text-base font-medium text-white">
                        {staffMembers?.find(
                          (staff) => staff._id === item.staffMember?._id
                        )?.fullName || "Unknown"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-[7px] sm:text-sm md:text-base text-white">
                  {item.trainingType}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-[7px] sm:text-sm md:text-base text-white">
                  {item.completionDate?.slice(0, 10)}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-[7px] sm:text-sm md:text-base text-white">
                  {item.expiryDate?.slice(0, 10)}
                </td>
                <td
                  className={`px-1 mt-5 rounded text-[10px] sm:text-[11px] md:text-[12px] ${
                    item.status === "Expired"
                      ? "bg-red-500 text-white"
                      : item.status === "Expiring Soon"
                      ? "bg-yellow-500 text-black"
                      : "bg-green-500 text-white"
                  } inline-block`}
                >
                  {item.status || "Valid"}
                </td>

                <td className="px-3 sm:px-4 py-3 sm:py-4">
                  <div className="flex space-x-2 sm:space-x-3 text-white relative text-[12px] sm:text-sm md:text-base">
                    {/* 👁️ View */}
                    <button
                      className="hover:text-blue-500 transition cursor-pointer"
                      onClick={() => handleView(item)}
                    >
                      <FaEye />
                    </button>

                    {/* ✏️ Edit */}
                    <button
                      className="hover:text-yellow-500 transition cursor-pointer"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </button>

                    {/* 🗑️ Delete */}
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
                            openDropdownId === item._id ? null : item._id
                          )
                        }
                        className="hover:text-green-500 transition cursor-pointer"
                      >
                        <FaDownload />
                      </button>

                      {openDropdownId === item._id && (
                        <div
                          className="absolute right-0 mt-2 bg-white/20 backdrop-blur-xl border border-white/30 
                          rounded-xl shadow-lg p-2 z-10 w-36 sm:w-40 transition-all duration-300 cursor-pointer"
                        >
                          <button
                            onClick={() => {
                              handleDownloadPdf(item);
                              setOpenDropdownId(null);
                            }}
                            className="block w-full text-left px-3 py-2 text-[11px] sm:text-sm text-white hover:bg-white/10 transition"
                          >
                            Download PDF
                          </button>
                          <button
                            onClick={() => {
                              handleDownloadCsv(item);
                              setOpenDropdownId(null);
                            }}
                            className="block w-full text-left px-3 py-2 text-[11px] sm:text-sm text-white hover:bg-white/10 transition"
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
                className="text-center px-4 sm:px-6 py-24 text-gray-400 text-[12px] sm:text-sm md:text-base"
              >
                No Training Records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Modal Form */}
  {showForm4 && (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-gray-800 rounded-lg w-full max-w-lg p-5 shadow-lg max-h-[90vh] overflow-y-auto relative">
      <form
        onSubmit={handleSubmit4}
        className="flex flex-col w-full"
      >
        <h2 className="text-center text-white font-semibold mb-4 text-xl">
          {editingUserId ? "Edit Training Record" : "Add Training Record"}
        </h2>

        {/* Staff Member */}
     <div className="mb-4">
  <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-300">
    Staff Member
  </label>
  <select
  
  required
  name="staffName"
  onChange={handleChange4}
  value={formData4.staffName}
  className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600 text-xs sm:text-sm md:text-base"
>

    <option value="">Select Staff Member</option>
    {staffMembers
      .map(staff => (
        <option key={staff._id} value={staff._id}>
          {staff.fullName || "No Name"}
        </option>
      ))}
  </select>
</div>


        {/* Training Type */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-300">
            Training Type
          </label>
          <select
            name="trainingType"
            value={formData4.trainingType}
            onChange={handleChange4}
            required
            className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600 text-xs sm:text-sm md:text-base"
          >
            <option value="">Select Training Type</option>
            {recommendedTrainings.length > 0
              ? recommendedTrainings.map((type, i) => (
                  <option key={i} value={type}>
                    {type}
                  </option>
                ))
              : [
                  "First Aid",
                  "Fire Safety",
                  "Moving & Handling",
                  "Safeguarding",
                  "GDPR",
                  "Infection Control",
                  "Medication Administration",
                  "Dementia Care",
                  "Autism & Learning Disabilities",
                  "Epilepsy",
                  "Mental Health",
                  "Diabetes",
                ].map((type, i) => (
                  <option key={i} value={type}>
                    {type}
                  </option>
                ))}
          </select>
        </div>

        {/* Completion Date */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-300">
            Completion Date
          </label>
          <input
            type="date"
            name="completionDate"
            value={formData4.completionDate}
            onChange={handleChange4}
            required
            className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600 text-xs sm:text-sm md:text-base"
          />
        </div>

        {/* Expiry Date */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-300">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData4.expiryDate}
            onChange={handleChange4}
            required
            className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600 text-xs sm:text-sm md:text-base"
          />
        </div>

        {/* Attachments */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm md:text-base text-gray-300 font-medium mb-1">
            Attach Photo/Document
          </label>
          <input
            type="file"
            name="attachments"
            onChange={handleFileChange}
            multiple
            className="w-full px-3 py-2 border rounded bg-gray-700 text-white text-xs sm:text-sm md:text-base"
          />
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-300">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData4.notes}
            onChange={handleChange4}
            rows="4"
            className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600 text-xs sm:text-sm md:text-base"
          />
        </div>
        

        {/* Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleCancel9}
            className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-gray-200 font-bold py-2 px-4 rounded text-xs sm:text-sm md:text-base"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white font-bold py-2 px-4 rounded text-xs sm:text-sm md:text-base ${
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
      <p className="text-gray-400 mt-2 text-[11px] sm:text-sm md:text-base">
        ℹ️ Auto-reminders are set for expiring training/certifications.
      </p>
    </div>
        </div>

  )}
</main>
</div>
          )
}
export default StafProfileTraning