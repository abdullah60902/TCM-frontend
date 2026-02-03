"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import Image from "next/image";
import { SiSimpleanalytics } from "react-icons/si";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoDocumentAttach, IoDocuments } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";
import { TbClockRecord } from "react-icons/tb";
import { AiOutlineDownload } from "react-icons/ai";
import axios from "axios";
import { FiAlertCircle } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";

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
  FaEdit,
  FaTrashAlt,
  FaFilePdf,
} from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { MdOutlineSchool, MdMedicationLiquid } from "react-icons/md";
import { BsClipboardCheck } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import RotaCalendar from "@/app/(component)/rotacalendar/RotaCalendar";
import StafProfileTraning from "@/app/(component)/stafprofiletraning/StafProfileTraning";
import StafProfilePersonalEmp from "@/app/(component)/stafprofilepersonalemp/StafProfilePersonalEmp";
import StafProfilePayTimeShet from "@/app/(component)/stafprofilepaytimeshet/StafProfilePayTimeShet";
import StafProfileDocuments from "@/app/(component)/stafprofiledocuments/StafProfileDocuments";
import Stafprofilesperformance from "@/app/(component)/stafprofilesperformance/StafProfilesPerformance ";

import { useSearchParams } from "next/navigation";

const Page = () => {const { hasClients, user } = useAuth();
const router = useRouter();
const params = useSearchParams();
const id = params.get("id");

const [staff, setStaff] = useState(null);
const [trainings, setTrainings] = useState([]);
const [performanceId, setPerformanceId] = useState([]);
const [isEditing, setIsEditing] = useState(false);
const [sidebarOpen, setSidebarOpen] = useState(false);
const [showExportModal, setShowExportModal] = useState(false);
const [selectedExportModules, setSelectedExportModules] = useState([]);
const [isExporting, setIsExporting] = useState(false);

// Fetch data
useEffect(() => {
  if (!id) return;

  const token = localStorage.getItem("token");

  fetch(`https://admin-panel-backend-alpha.vercel.app/hr/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setStaff(data))
    .catch(err => console.log(err));

  fetch(`https://admin-panel-backend-alpha.vercel.app/training/staff/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setTrainings(data))
    .catch(err => console.log(err));

  fetch(`https://admin-panel-backend-alpha.vercel.app/performance/staff/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setPerformanceId(data))
    .catch(err => console.log(err));
}, [id]);

// Redirect if no user
useEffect(() => {
  if (!user) router.push("/Login");
}, [user, router]);


  // Sidebar
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

  //  Training & Compliance dummy data  //////////////////////////////////////////

  const data = [
    {
      module: "Safeguarding Adults",
      category: "Mandatory",
      status: "Expiring Soon (Reminder Sent)",
      statusColor: "bg-yellow-500 text-black",
      expiry: "2026-01-15",
      action: "download",
    },
    {
      module: "Epilepsy Management",
      category: "Care Specific",
      status: "Missed Deadline",
      statusColor: "bg-red-500 text-white",
      expiry: "2025-03-01",
      action: "alert",
    },
    {
      module: "Mental Health Support",
      category: "Care Specific",
      status: "Compliant",
      statusColor: "bg-green-500 text-white",
      expiry: "N/A",
      action: "download",
    },
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

  // Tabs
  const [activeTab, setActiveTab] = useState("personal");
  const tabs = [
    { id: "personal", label: "Personal & Employment", icon: <FaUser /> },
    { id: "rota", label: "Scheduling & Rota", icon: <BsClipboardCheck /> },
    {
      id: "training",
      label: "Training",
      icon: <MdOutlineSchool />,
    },
    { id: "pay", label: "Pay & Timesheets", icon: <GiMoneyStack /> },
    { id: "performance", label: "Performance & Leave", icon: <IoDocuments /> },
    { id: "documents", label: "Documents", icon: <IoDocuments /> },
  ];

  // Image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const handleEditClick = () => document.getElementById("fileInput").click();

  const handleExportClick = () => {
    setSelectedExportModules(tabs.map(t => t.id).filter(id => id !== 'rota')); // Default all selected except rota
    setShowExportModal(true);
  };

  const toggleExportModule = (id) => {
    setSelectedExportModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const executeBulkExport = async () => {
    if (!staff || selectedExportModules.length === 0) return;
    
    setIsExporting(true);
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();
        let yPos = 20;

        const checkPageBreak = (needed = 40) => {
            if (yPos + needed > 280) {
                doc.addPage();
                yPos = 20;
                return true;
            }
            return false;
        };

        const addAttachmentsToPdf = async (attachments) => {
            if (!attachments || attachments.length === 0) return;
            
            checkPageBreak(10);
            doc.setFontSize(12);
            doc.setTextColor(74, 73, 176);
            doc.text("Attachments / Documents:", 14, yPos);
            yPos += 8;

            for (let att of attachments) {
                const url = typeof att === 'string' ? att : (att.secure_url || att.url || att.path || '');
                if (!url) continue;
                
                const ext = url.split('.').pop().toLowerCase().split('?')[0];
                const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);

                try {
                    if (isImage) {
                        const res = await fetch(url);
                        const blob = await res.blob();
                        const reader = new FileReader();
                        await new Promise((resolve) => {
                            reader.readAsDataURL(blob);
                            reader.onloadend = async () => {
                                checkPageBreak(65);
                                try {
                                    doc.addImage(reader.result, "JPEG", 14, yPos, 60, 60);
                                    yPos += 65;
                                } catch (e) {
                                    doc.setTextColor(0, 0, 255);
                                    doc.text(`[View Image]`, 14, yPos);
                                    doc.link(14, yPos - 5, 40, 10, { url });
                                    yPos += 10;
                                }
                                resolve();
                            };
                        });
                    } else {
                        checkPageBreak(10);
                        doc.setTextColor(0, 0, 255);
                        doc.text(`[View Document: ${ext.toUpperCase()}]`, 14, yPos);
                        doc.link(14, yPos - 5, 40, 10, { url });
                        yPos += 12;
                    }
                } catch (err) {
                    console.warn("Failed to embed attachment:", url);
                }
            }
            doc.setTextColor(0);
            yPos += 5;
        };

        // --- PDF HEADER ---
        doc.setFontSize(24);
        doc.setTextColor(74, 73, 176);
        doc.text("Staff Comprehensive Profile", 14, yPos);
        yPos += 12;

        // Add Profile Image if exists
        try {
            const profileUrl = staff.profileImage;
            if (profileUrl) {
                const imgRes = await fetch(profileUrl);
                const imgBlob = await imgRes.blob();
                const reader = new FileReader();
                const base64Image = await new Promise((resolve) => {
                    reader.readAsDataURL(imgBlob);
                    reader.onloadend = () => resolve(reader.result);
                });
                doc.addImage(base64Image, 'JPEG', 150, 10, 40, 40);
            }
        } catch (err) {
            console.warn("Failed to add profile image to PDF", err);
        }
        
        doc.setFontSize(14);
        doc.setTextColor(80);
        doc.text(`Employee: ${staff.fullName}`, 14, yPos);
        yPos += 8;
        doc.text(`Position: ${staff.position || "N/A"} | Date of Export: ${new Date().toLocaleDateString()}`, 14, yPos);
        yPos += 15;

        // --- SECTION: PERSONAL & EMPLOYMENT ---
        if (selectedExportModules.includes("personal")) {
            doc.setFontSize(18);
            doc.setTextColor(0);
            doc.text("1. Personal & Employment Details", 14, yPos);
            yPos += 6;
            
            const pRows = [
                ["Full Name", staff.fullName || "N/A"],
                ["Email", staff.email || "N/A"],
                ["Phone", staff.phoneNumber || staff.contactNumber || "N/A"],
                ["Date of Birth", staff.dob || "N/A"],
                ["NI Number", staff.niNumber || "N/A"],
                ["Home Address", staff.address || "N/A"],
                ["Position", staff.position || "N/A"],
                ["Department", staff.department || "N/A"],
                ["Service Setting", staff.careSetting || "N/A"],
                ["Start Date", staff.startDate ? new Date(staff.startDate).toLocaleDateString() : "N/A"],
                ["Employment Type", staff.employmentType || "N/A"],
                ["Contract Details", staff.contractDetails || "N/A"],
                ["Status", staff.status || staff.terminationStatus || "Active"]
            ];

            autoTable(doc, {
                startY: yPos,
                body: pRows,
                theme: 'grid',
                headStyles: { fillColor: [74, 73, 176] },
                styles: { fontSize: 9 }
            });
            yPos = doc.lastAutoTable.finalY + 12;
            checkPageBreak();

            // Next of Kin
            doc.setFontSize(14);
            doc.text("Next of Kin", 14, yPos);
            yPos += 5;
            autoTable(doc, {
                startY: yPos,
                body: [
                    ["Name", staff.nextOfKinName || "N/A"],
                    ["Relationship", staff.nextOfKinRelationship || "N/A"],
                    ["Contact", `${staff.nextOfKinEmail || ""}\n${staff.nextOfKinPhone || ""}`],
                    ["Address", staff.nextOfKinAddress || "N/A"]
                ],
                theme: 'striped',
                styles: { fontSize: 8 }
            });
            yPos = doc.lastAutoTable.finalY + 12;
            checkPageBreak();

            // Compliance & Documents
            doc.setFontSize(14);
            doc.text("Compliance & Eligibility", 14, yPos);
            yPos += 5;
            autoTable(doc, {
                startY: yPos,
                body: [
                    ["DBS Status", staff.dbsStatus || "N/A"],
                    ["Right to Work", staff.rightToWorkStatus || "N/A"],
                    ["Professional Reg", staff.professionalRegistration || "N/A"],
                    ["Passport No", staff.passportNumber || "N/A"],
                    ["Visa Required", staff.visaRequired || "N/A"],
                    ["Visa Expiry", staff.visaExpiry || "N/A"]
                ],
                theme: 'grid',
                styles: { fontSize: 8 }
            });
            yPos = doc.lastAutoTable.finalY + 15;
            checkPageBreak();
        }

        // --- SECTION: TRAINING ---
        if (selectedExportModules.includes("training")) {
            checkPageBreak();
            doc.setFontSize(18);
            doc.text("2. Training & Certifications", 14, yPos);
            yPos += 8;

            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/training/staff/${id}`, config);
            const tData = await res.json();
            
            if (tData && tData.length > 0) {
                for (let t of tData) {
                    const tTitle = `Training: ${t.moduleName || t.trainingType || "Unit"}`;
                    doc.setFontSize(12);
                    doc.setTextColor(74, 73, 176);
                    doc.text(tTitle, 14, yPos);
                    yPos += 5;

                    const tBody = [
                        ["Module Name", t.moduleName || t.trainingType || "-"],
                        ["Category", t.category || "N/A"],
                        ["Completion Date", t.completionDate ? new Date(t.completionDate).toLocaleDateString() : "-"],
                        ["Expiry Date", t.expiryDate ? new Date(t.expiryDate).toLocaleDateString() : "N/A"],
                        ["Status", t.status || "Completed"]
                    ];
                    
                    if (t.notes) tBody.push(["Notes", t.notes]);
                    if (t.other) tBody.push(["Other Details", t.other]);

                    autoTable(doc, {
                        startY: yPos,
                        head: [['Field', 'Value']],
                        body: tBody,
                        theme: 'grid',
                        headStyles: { fillColor: [74, 73, 176] },
                        styles: { fontSize: 8 },
                        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
                    });
                    yPos = doc.lastAutoTable.finalY + 10;
                    if (t.attachments && t.attachments.length > 0) {
                        await addAttachmentsToPdf(t.attachments);
                    }
                    checkPageBreak(50);
                }
            } else {
                doc.setFontSize(10);
                doc.text("No training records found.", 14, yPos);
                yPos += 10;
            }
            checkPageBreak();
        }

        // --- SECTION: PERFORMANCE ---
        if (selectedExportModules.includes("performance")) {
            checkPageBreak();
            doc.setFontSize(18);
            doc.text("3. Performance & Appraisals", 14, yPos);
            yPos += 8;

            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/performance/staff/${id}`, config);
            const perfData = await res.json();

            if (perfData && perfData.length > 0) {
                // High-level metrics (from the first record as per component logic)
                const first = perfData[0];
                autoTable(doc, {
                    startY: yPos,
                    head: [["Metric", "Value"]],
                    body: [
                        ["Holiday Allowance", first.holidayAllowance || "N/A"],
                        ["Days Remaining", first.daysRemaining || "N/A"],
                        ["Next Appraisal Due", first.nextAppraisalDue ? new Date(first.nextAppraisalDue).toLocaleDateString() : "N/A"],
                        ["Probation End Date", first.probationEndDate ? new Date(first.probationEndDate).toLocaleDateString() : "N/A"]
                    ],
                    theme: 'grid',
                    styles: { fontSize: 9 }
                });
                yPos = doc.lastAutoTable.finalY + 12;
                checkPageBreak(30);

                doc.setFontSize(14);
                doc.text("Appraisal History", 14, yPos);
                yPos += 5;

                let idx = 1;
                for (let p of perfData) {
                    doc.setFontSize(10);
                    doc.text(`${idx++}. Appraisal Record - ${new Date(p.date || p.createdAt).toLocaleDateString()}`, 14, yPos);
                    yPos += 5;
                    autoTable(doc, {
                        startY: yPos,
                        body: [
                            ["Supervisions", p.supervisions || "N/A"],
                            ["Appraisals", p.appraisals || "N/A"],
                            ["Objectives / KPIs", p.objectivesKpi || "N/A"],
                            ["Feedback Notes", p.feedbackNotes || "N/A"],
                            ["Reminder Date", p.appraisalReminderDate ? new Date(p.appraisalReminderDate).toLocaleDateString() : "N/A"]
                        ],
                        theme: 'grid',
                        styles: { fontSize: 8 },
                        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
                    });
                    yPos = doc.lastAutoTable.finalY + 12;
                    checkPageBreak(100);
                }
            } else {
                doc.setFontSize(10);
                doc.text("No performance records found.", 14, yPos);
                yPos += 10;
            }
        }

        // --- SECTION: PAY ---
        if (selectedExportModules.includes("pay")) {
            checkPageBreak();
            doc.setFontSize(18);
            doc.text("4. Pay & Benefits Summary", 14, yPos);
            yPos += 6;
            autoTable(doc, {
                startY: yPos,
                body: [
                    ["Bank Name", staff.bankName || "N/A"],
                    ["Sort Code", staff.sortCode || "N/A"],
                    ["Account Number", staff.accountNumber || "N/A"],
                    ["NI Number", staff.niNumber || "N/A"],
                    ["Tax Code", staff.taxCode || "N/A"]
                ],
                theme: 'grid',
                styles: { fontSize: 9 }
            });
            yPos = doc.lastAutoTable.finalY + 15;
        }

        // --- SECTION: DOCUMENTS ---
        if (selectedExportModules.includes("documents")) {
            checkPageBreak();
            doc.setFontSize(18);
            doc.text("5. General Documents", 14, yPos);
            yPos += 8;
            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/staff-documents/staff/${id}`, config);
            const docs = await res.json();
            if (docs && docs.length > 0) {
                for (let d of docs) {
                    const categories = ["employmentContracts", "dbsCertificates", "idDocuments", "trainingCertificates", "appraisalsReviews", "disciplinaryRecords"];
                    for (let cat of categories) {
                        if (d[cat] && d[cat].length > 0) {
                            doc.setFontSize(10);
                            doc.text(`Category: ${cat.replace(/([A-Z])/g, " $1")}`, 14, yPos);
                            yPos += 5;
                            await addAttachmentsToPdf(d[cat]);
                        }
                    }
                }
            } else {
                doc.setFontSize(10);
                doc.text("No additional documents found.", 14, yPos);
                yPos += 10;
            }
        }

        doc.save(`${staff.fullName.replace(/\s+/g, '_')}_Staff_Profile.pdf`);
        setShowExportModal(false);
    } catch (error) {
        console.error("Export Error:", error);
        alert("An error occurred while generating the PDF.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen">
      <Navbar />

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
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 shadow-md transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:relative lg:block`}
        >
          <nav className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <p className="text-sm text-gray-400">Navigation</p>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white text-xl lg:hidden"
              >
                <FaTimes />
              </button>
            </div>
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
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="p-4 border-t border-gray-700 mt-auto">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#EEEEFF] flex items-center justify-center text-[#4A49B0] font-medium">
                  {user.fullName
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
        <main className="flex-1 p-1 md:p-6 max-h-screen overflow-hidden">
          <div className="p-1 md:p-6 text-white mb-8 h-full overflow-y-auto my-scroll">
            <h2 className="text-xl font-semibold text-gray-200 mb-6 hidden md:block">
              HR Management / Staff Profile
            </h2>
            {/* Profile Header */}
           {/* Profile Header */}
<div className="bg-[#1D2939] text-white p-4 sm:p-5 md:p-6 rounded-lg shadow-md border border-[#4A49B0]/30 
flex flex-col lg:flex-row lg:items-center lg:justify-between w-full max-w-7xl mx-auto 
transition-all duration-300 gap-6"
>
  {/* Left Side */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-5 text-center sm:text-left w-full lg:w-auto">

    {/* Profile Image */}
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-0">
      <div className="w-full h-full rounded-full bg-[#2A2A40] overflow-hidden border-2 border-[#4A49B0] flex items-center justify-center">

        {selectedImage ? (
          <Image src={selectedImage} alt="Selected Profile" width={96} height={96} className="w-full h-full object-cover" />
        ) : staff?.profileImage ? (
          <Image src={staff.profileImage} alt="Staff Profile" width={96} height={96} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] sm:text-xs text-gray-400">No Photo</span>
        )}

      </div>

      {/* Edit Button */}
      <button
        onClick={handleEditClick}
        className="absolute bottom-0 right-0 bg-[#4A49B0] p-1.5 rounded-full hover:bg-[#5A58C9] transition"
      >
        <FaEdit className="text-white text-base sm:text-lg" />
      </button>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          setSelectedImage(URL.createObjectURL(file));

          const formData = new FormData();
          formData.append("profileImage", file);

          const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/hr/${id}/photo`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData,
          });
// bcnbcnc
          const data = await res.json();
          setStaff(data);
        }}
        className="hidden"
      />
    </div>

    {/* Dynamic Name + Position + Status */}
    <div className="flex flex-col items-center sm:items-start">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
        {staff?.fullName}
      </h2>

      <p className="text-xs sm:text-sm md:text-base text-gray-400 mt-1">
        {staff?.position} - {staff?.department}
      </p>

      <div className="mt-2">
        <span className="bg-[#53AF50] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 py-1 rounded whitespace-nowrap">
          Active Employee (Start Date: {staff?.startDate ? staff.startDate.slice(0, 10) : "N/A"})
        </span>
      </div>
    </div>
  </div>

  {/* Right Buttons */}
  <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 w-full lg:w-auto">
    {/* <button
  className="bg-[#4A49B0] hover:bg-[#5A58C9] text-white px-4 py-2 rounded-md flex items-center space-x-2"
  onClick={() => {
    if (isEditing) saveProfile(); 
    else setIsEditing(true);
  }}
>
  <FaEdit />
  <span>{isEditing ? "Save" : "Edit Profile"}</span>
</button> */}


  <button
    onClick={handleExportClick}
    className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md 
    bg-blue-600 hover:bg-blue-700 text-white font-medium 
    transition-all duration-300 active:scale-95 shadow-md h-10"
  >
    <FaFilePdf />
    <span>Export Profile</span>
  </button>

 <Link href="/HR-Management">
    <button
      className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium 
      transition-all duration-300 active:scale-95 shadow-md h-10"
    >
      <FaArrowLeft />
      <span>Exit</span>
    </button>
  </Link>


   <button
  className="bg-[#2A2A40] hover:bg-[#3A3A55] cursor-pointer text-white px-4 py-2 rounded-md flex items-center space-x-2 border border-[#4A49B0]/40 h-10"
  onClick={async () => {
    if (!confirm("Are you sure you want to delete this staff profile? This action will permanently remove all associated records and cannot be undone.")) return;

    const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/hr/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    alert(data.message);

    router.push("/HR-Management"); // redirect back
  }}
>
  <FaTrashAlt className="text-[#4A49B0]" />
  <span>Terminate</span>
</button>

  </div>
</div>


            {/* Tabs */}
            <div
              className="flex flex-wrap border-b border-gray-700 mt-3 sm:mt-4 mb-4 sm:mb-6 
text-xs sm:text-sm md:text-base lg:text-lg"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center cursor-pointer gap-1 sm:gap-2 
      px-1 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-t-sm 
      transition-all duration-200 font-medium sm:font-semibold 
      ${
        activeTab === tab.id
          ? "bg-[#5A58C9] text-white border-b-2 border-[#5A58C9]"
          : "text-gray-400 hover:bg-[#2a2a40] hover:text-[#d3d3d6]"
      }`}
                >
                  <span className="text-sm sm:text-base md:text-lg">
                    {tab.icon}
                  </span>
                  <span className="text-[11px] sm:text-sm md:text-base lg:text-[17px]">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}

            {/* Personal & Employment//////////////////////////// */}

            {activeTab === "personal" && <StafProfilePersonalEmp
  staff={id}
  isEditing={isEditing}
  onStaffChange={(updatedStaff) => setStaff(updatedStaff)}
/>

}

            {/* Scheduling & Rota////////////////////////////// */}

            {activeTab === "rota" && (
             
<RotaCalendar staffId={id} />
                
            )}
            {/* Training & Compliance Tracker////////////////////////////////////////////////////////// */}

            {activeTab === "training" && <StafProfileTraning   staff2={staff}
 trainings={trainings} />}

            {activeTab === "pay" && (
              <div>
               <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4">
  Pay Profile & Timesheet Integration
</h2>
             <StafProfilePayTimeShet id={id} />
             </div>
            )}
            {activeTab === "performance" && (
              <div>
                
                
              <Stafprofilesperformance performanceId={performanceId} id={id} />
              </div>
            )}
{/* documents//////////////// */}
            {activeTab === "documents" && (
              <StafProfileDocuments staffId={id}/>
            )}
          </div>
        </main>
      </div>

      {/* Export Selection Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="bg-gray-700 p-4 border-b border-gray-600 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FaFilePdf className="text-blue-400" />
                Export Staff Profile
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white transition">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-400 text-sm mb-4">Select the modules you wish to include in the staff profile export:</p>
              
              <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {tabs.filter(t => t.id !== 'rota').map((tab) => (
                  <label 
                    key={tab.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedExportModules.includes(tab.id) 
                        ? "bg-indigo-900/30 border-indigo-500 text-white" 
                        : "bg-gray-700/50 border-transparent text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="accent-indigo-500 w-4 h-4"
                      checked={selectedExportModules.includes(tab.id)}
                      onChange={() => toggleExportModule(tab.id)}
                    />
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-blue-400 opacity-70">{tab.icon}</span>
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-8 flex justify-between items-center bg-gray-900/40 p-3 rounded-lg">
                <div className="text-xs text-gray-500 italic">
                  {selectedExportModules.length} module(s) selected
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeBulkExport}
                    disabled={selectedExportModules.length === 0 || isExporting}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
                  >
                    {isExporting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <AiOutlineDownload />
                            Generate Export
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
