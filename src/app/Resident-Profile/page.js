"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import { SiSimpleanalytics } from "react-icons/si";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoDocumentAttach, IoDocuments } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";
import { TbClockRecord } from "react-icons/tb";
import { AiOutlineDownload } from "react-icons/ai";
import { FiAlertCircle } from "react-icons/fi";
import { FaArrowLeft, FaFilePdf } from "react-icons/fa";
import Image from "next/image";

import {
  FaThLarge,
  FaUser,
  FaClipboardList,
  FaExclamationTriangle,
  FaFileAlt,
  FaBullseye,
 FaBook,
  FaPills,
  FaCheckCircle,
  FaExchangeAlt,
  FaFolderOpen,
  FaChartBar,
  FaUsers,
  FaGraduationCap,
  FaShieldAlt,
  FaUserCog,
  FaSearch,
  FaBars,
  FaTimes,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

import {  MdMedicationLiquid } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

import ResidentProfileDocuments from "@/app/(component)/residentprofiledocuments/ResidentProfileDocuments";
import ResidentProfileAboutMe from "@/app/(component)/residentprofileaboutme/ResidentProfileAboutMe"

import { useSearchParams } from "next/navigation";
import ResidentProfileCarePlan from "@/app/(component)/residentprofilecareplan/residentprofilecareplan";
import ResidentProfilePBSplan from "../(component)/residentprofilepbsplan/ResidentProfilePBSplan";
import ResidentProfileRiskAssessment from "../(component)/residentprofileriskassessment/ResidentProfileRiskAssessment";
import ResidentProfileGoalsOutcome from "../(component)/residentprofilegoalsoutcome/ResidentProfileGoalsOutcome";
import ResidentProfileDailyLog from "../(component)/residentprofiledailylog/ResidentProfileDailyLog";
import ResidentProfileMedicationEMAR from "../(component)/residentprofilemedicationemar/ResidentProfileMedicationEMAR";
import ResidentProfileConsentForm from "../(component)/residentprofileconsentform/ResidentProfileConsentForm";
import ResidentProfileHandOver from "../(component)/residentprofilehandover/ResidentProfileHandOver";

const Page = () => {const { hasClients, user } = useAuth();
const router = useRouter();
const params = useSearchParams();
const id = params.get("id");

const [client, setClient] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [sidebarOpen, setSidebarOpen] = useState(false);
const [clientcareplane, setClientcareplane] = useState(null);
const [showExportModal, setShowExportModal] = useState(false);
const [selectedExportModules, setSelectedExportModules] = useState([]);
const [isExporting, setIsExporting] = useState(false);
// Fetch data
useEffect(() => {
  if (!id) return;

  const token = localStorage.getItem("token");

  fetch(`https://admin-panel-backend-alpha.vercel.app/client/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setClient(data))
    .catch(err => console.log(err));

     fetch(`https://admin-panel-backend-alpha.vercel.app/carePlanning/client/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      setClientcareplane(data);
      console.log("hhjdhj", data);
    })
    .catch(err => console.log(err));
}, [id]);

console.log(clientcareplane?.[0]?.careSetting);

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
      active: true,
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

  // Tabs
  const [activeTab, setActiveTab] = useState("about");
const tabs = [
  { id: "about", label: "About Me", icon: <FaUser /> },
  { id: "care", label: "Care Plans", icon: <FaClipboardList /> },
  { id: "pbs", label: "PBS Plans", icon: <FaFileAlt /> },
  { id: "risk", label: "Risk Assessments", icon: <FaShieldAlt /> },
  { id: "goals", label: "Goals & Outcomes", icon: <FaBullseye /> },
  { id: "logs", label: "Daily Logs", icon: <FaBook /> },
  { id: "medication", label: "Medication (eMAR)", icon: <FaPills /> },
  { id: "consent", label: "Consent", icon: <FaCheckCircle /> },
  { id: "handovers", label: "Handovers", icon: <FaExchangeAlt /> },
  { id: "documents", label: "Documents", icon: <FaFolderOpen /> },
];
  // Image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const handleEditClick = () => document.getElementById("fileInput").click();

  const handleExportClick = () => {
    setSelectedExportModules(tabs.map(t => t.id)); // Default all selected
    setShowExportModal(true);
  };

  const toggleExportModule = (id) => {
    setSelectedExportModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

    const executeBulkExport = async () => {
    if (!client || selectedExportModules.length === 0) return;
    
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
            doc.text("Associated Evidence / Attachments:", 14, yPos);
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
                                    doc.text(`[View Attachment Image]`, 14, yPos);
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
        doc.text("Resident Comprehensive Profile", 14, yPos);
        yPos += 12;

        // Add Profile Image if exists
        try {
            const profileUrl = client.profileImage;
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
        doc.text(`Patient: ${client.fullName}`, 14, yPos);
        yPos += 8;
        doc.text(`Room: ${client.roomNumber || "N/A"} | Date of Export: ${new Date().toLocaleDateString()}`, 14, yPos);
        yPos += 15;

        // --- SECTION: ABOUT ME ---
        if (selectedExportModules.includes("about")) {
            doc.setFontSize(18);
            doc.setTextColor(0);
            doc.text("1. Personal & Medical Profile", 14, yPos);
            yPos += 6;
            
            const aboutRows = [
                ["Full Name", client.fullName || "N/A"],
                ["Date of Birth", client.dob ? new Date(client.dob).toLocaleDateString() : (client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "N/A")],
                ["Gender", client.gender || "N/A"],
                ["NI Number", client.niNo || "N/A"],
                ["NHS Number", client.nhsNo || client.nhsNumber || "N/A"],
                ["Ethnicity", client.ethnicity || "N/A"],
                ["Religion", client.religion || "N/A"],
                ["Mental Health Status", client.mentalHealthStatus || "N/A"],
                ["Primary Diagnosis", client.primaryDiagnosis || "N/A"],
                ["Diagnosis Date", client.diagnosisDate ? new Date(client.diagnosisDate).toLocaleDateString() : "N/A"],
                ["Allergies", client.allergies || "None Reported"],
                ["Daily Life Impact", client.dailyLifeImpact || "N/A"]
            ];

            autoTable(doc, {
                startY: yPos,
                body: aboutRows,
                theme: 'grid',
                headStyles: { fillColor: [74, 73, 176] },
                styles: { fontSize: 9 }
            });
            yPos = doc.lastAutoTable.finalY + 12;
            checkPageBreak();

            // NOK & Professionals
            doc.setFontSize(14);
            doc.text("Contacts & Professionals", 14, yPos);
            yPos += 5;
            autoTable(doc, {
                startY: yPos,
                head: [["Type", "Name", "Phone", "Email/Address"]],
                body: [
                    ["Next of Kin", client.nokName || "-", client.nokPhone || "-", `${client.nokEmail || ""}\n${client.nokAddress || ""}`],
                    ["GP Details", client.gpDoctor || "-", client.gpPhone || "-", `${client.gpSurgery || ""}\n${client.gpAddress || ""}`],
                    ["Specialist", client.consultantName || "-", client.specialistPhone || "-", `${client.hospitalName || ""}\n${client.hospitalAddress || ""}`]
                ],
                theme: 'striped',
                styles: { fontSize: 8 }
            });
            yPos = doc.lastAutoTable.finalY + 12;
            checkPageBreak();

            // Preferences
            doc.setFontSize(14);
            doc.text("Personal Preferences", 14, yPos);
            yPos += 5;
            autoTable(doc, {
                startY: yPos,
                body: [
                    ["Important To Me", client.importantToMe || "N/A"],
                    ["Please DO", client.pleaseDo || "N/A"],
                    ["Please DON'T", client.pleaseDont || "N/A"]
                ],
                theme: 'grid',
                styles: { fontSize: 9 },
                columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
            });
            yPos = doc.lastAutoTable.finalY + 15;
            checkPageBreak();
        }

        // --- SECTION: CARE PLAN ---
        if (selectedExportModules.includes("care") && clientcareplane && clientcareplane.length > 0) {
            checkPageBreak();
            doc.setFontSize(18);
            doc.text("2. Care Planning", 14, yPos);
            yPos += 6;
            let idx = 1;
            for (let care of clientcareplane) {
                const body = [
                    ["Plan Type", care.planType || "N/A"],
                    ["Start Date", care.creationDate ? new Date(care.creationDate).toLocaleDateString() : (care.carePlanData?.dateCreated ? new Date(care.carePlanData.dateCreated).toLocaleDateString() : "N/A")],
                    ["Review Date", care.reviewDate ? new Date(care.reviewDate).toLocaleDateString() : (care.carePlanData?.nextReviewDate ? new Date(care.carePlanData.nextReviewDate).toLocaleDateString() : "N/A")]
                ];

                // Add all fields from carePlanData (Actual data)
                if (care.carePlanData) {
                    Object.entries(care.carePlanData).forEach(([k, v]) => {
                        if (v && k !== 'dateCreated' && k !== 'nextReviewDate' && k !== 'preparedBy') {
                            const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                            // Ensure we don't duplicate fields already added
                            if (!body.some(row => row[0].toLowerCase() === label.toLowerCase())) {
                                body.push([label, typeof v === 'object' ? JSON.stringify(v) : String(v)]);
                            }
                        }
                    });
                    if (care.carePlanData.preparedBy) {
                        body.push(["Prepared By", care.carePlanData.preparedBy]);
                    }
                }

                // Add top-level fields if they exist and aren't duplicated
                ['careSetting', 'legalStatus', 'communicationNeeds', 'mobilityNeeds', 'dietaryNeeds', 'personalCareNeeds', 'socialInterests'].forEach(f => {
                    if (care[f] && !body.some(row => row[0].toLowerCase() === f.toLowerCase())) {
                        const label = f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                        body.push([label, String(care[f])]);
                    }
                });

                doc.setFontSize(12);
                doc.setTextColor(74, 73, 176);
                doc.text(`Plan #${idx}: ${care.planType || "Care Plan"}`, 14, yPos);
                yPos += 5;
                idx++;

                autoTable(doc, {
                    startY: yPos,
                    head: [['Field', 'Value']],
                    body: body,
                    theme: 'grid',
                    headStyles: { fillColor: [74, 73, 176] },
                    styles: { fontSize: 8 },
                    columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
                });
                yPos = doc.lastAutoTable.finalY + 10;
                checkPageBreak(20);
                if (care.attachments && care.attachments.length > 0) {
                    await addAttachmentsToPdf(care.attachments);
                }
            }
            yPos += 5;
        }

        // --- SECTION: PBS PLANS ---
        if (selectedExportModules.includes("pbs")) {
            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/pbs-plan/client/${id}`, config);
            const records = await res.json();
            if (records && records.length > 0) {
                checkPageBreak();
                doc.setFontSize(18);
                doc.text("3. Behaviour Support Profile (PBS)", 14, yPos);
                yPos += 8;
                
                let idx = 1;
                for (let r of records) {
                    doc.setFontSize(12);
                    doc.text(`${idx++}. ${r.planTitle || r.type}`, 14, yPos);
                    yPos += 5;
                    autoTable(doc, {
                        startY: yPos,
                        body: [
                            ["Type", r.type],
                            ["Hypothesised Function", r.hypothesisedFunction || "N/A"],
                            ["Next Review Date", r.nextReviewDate ? new Date(r.nextReviewDate).toLocaleDateString() : "N/A"],
                            ["Target Behaviours", r.targetBehaviours || "N/A"],
                            ["Triggers/Antecedents", r.settingEvents || "N/A"],
                            ["General Approach", r.generalApproach || "N/A"],
                            ["Skill Development", r.skillDevelopment || "N/A"],
                            ["Early Warning Signs", r.earlyWarningSigns || "N/A"],
                            ["Step 1 (Response)", r.step1Response || r.step1 || "N/A"],
                            ["Step 2 (Intervention)", r.step2Intervention || r.step2 || "N/A"],
                            ["Step 3 (High Risk)", r.step3HighRisk || r.step3 || "N/A"],
                            ["Notes", r.notes || "N/A"],
                            ["Frequency", r.frequency || "N/A"],
                            ["Assistance Level", r.assistanceLevel || "N/A"],
                            ["Diet Type", r.dietType || "N/A"],
                            ["Sleep Routine", r.sleepRoutine || "N/A"]
                        ],
                        theme: 'grid',
                        styles: { fontSize: 8 },
                        columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
                    });
                    yPos = doc.lastAutoTable.finalY + 12;
                    checkPageBreak(50);
                    if (r.attachments && r.attachments.length > 0) {
                        await addAttachmentsToPdf(r.attachments);
                    }
                }
            }
        }

        // --- SECTION: RISK ASSESSMENTS ---
        if (selectedExportModules.includes("risk")) {
            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/risk-assessment/client/${id}`, config);
            const records = await res.json();
            if (records && records.length > 0) {
                checkPageBreak();
                doc.setFontSize(18);
                doc.text("4. Risk Management Assessments", 14, yPos);
                yPos += 8;
                
                let idx = 1;
                for (let r of records) {
                    doc.setFontSize(12);
                    doc.text(`${idx++}. ${r.planTitle || "Risk Assessment"}`, 14, yPos);
                    yPos += 5;
                    const body = [
                        ["Date", new Date(r.dateOfAssessment).toLocaleDateString()],
                        ["Overall Risk", r.overallRiskLevel || "N/A"],
                        ["Assessed By", r.assessedBy || "N/A"],
                        ["Summary", r.clinicalSummary || "N/A"]
                    ];
                    
                    if (r.categories) {
                        Object.entries(r.categories).forEach(([key, cat]) => {
                            if (cat.checked) {
                                let val = `Severity: ${cat.severity}, Freq: ${cat.frequency}`;
                                if (cat.comments) val += `\nNotes: ${cat.comments}`;
                                if (cat.mitigations) val += `\nMitigations: ${cat.mitigations}`;
                                body.push([`Risk: ${key.toUpperCase()}`, val]);
                            }
                        });
                    }

                    autoTable(doc, {
                        startY: yPos,
                        body: body,
                        theme: 'grid',
                        styles: { fontSize: 8 },
                        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
                    });
                    yPos = doc.lastAutoTable.finalY + 12;
                    checkPageBreak(50);
                    if (r.attachments && r.attachments.length > 0) {
                        await addAttachmentsToPdf(r.attachments);
                    }
                }
            }
        }

        // --- SECTION: MEDICATION (eMAR) ---
        if (selectedExportModules.includes("medication")) {
            const resMeds = await fetch(`https://admin-panel-backend-alpha.vercel.app/medications/client/${id}`, config);
            const meds = await resMeds.json();
            const resAdmin = await fetch(`https://admin-panel-backend-alpha.vercel.app/medication-administration`, config);
            const allAdmin = await resAdmin.json();
            const myAdmin = allAdmin.filter(a => (a.client?._id || a.client) === id);

            if (meds.length > 0 || myAdmin.length > 0) {
                checkPageBreak();
                doc.setFontSize(18);
                doc.text("5. Medication (eMAR) Records", 14, yPos);
                yPos += 8;

                if (meds.length > 0) {
                    doc.setFontSize(12);
                    doc.text("Current Active Orders", 14, yPos);
                    yPos += 5;
                    autoTable(doc, {
                        startY: yPos,
                        head: [["Medication", "Frequency", "Scheduled Times", "Stock", "Status"]],
                        body: meds.map(m => [
                            m.medicationName,
                            m.schedule?.frequency || "N/A",
                            m.schedule?.times?.join(", ") || "N/A",
                            m.stock?.quantity || 0,
                            m.status
                        ]),
                        theme: 'striped',
                        headStyles: { fillColor: [74, 73, 176] },
                        styles: { fontSize: 8 }
                    });
                    yPos = doc.lastAutoTable.finalY + 10;
                }

                if (myAdmin.length > 0) {
                    checkPageBreak();
                    doc.setFontSize(12);
                    doc.text("Administration History Log", 14, yPos);
                    yPos += 5;
                    autoTable(doc, {
                        startY: yPos,
                        head: [["Date", "Time", "Medication", "Administered?", "Caregiver"]],
                        body: myAdmin.map(m => [
                            new Date(m.date || m.createdAt).toLocaleDateString(),
                            m.time,
                            m.medication?.medicationName || m.medicationName || "Unknown",
                            m.given ? "Yes" : "No",
                            m.caregiverName
                        ]),
                        theme: 'striped',
                        headStyles: { fillColor: [16, 185, 129] },
                        styles: { fontSize: 8 }
                    });
                    yPos = doc.lastAutoTable.finalY + 15;
                }
            }
        }

        // --- SECTION: GOALS ---
        if (selectedExportModules.includes("goals")) {
            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/goals/client/${id}`, config);
            const records = await res.json();
            if (records && records.length > 0) {
                checkPageBreak();
                doc.setFontSize(18);
                doc.text("6. Goals & Outcomes", 14, yPos);
                yPos += 8;
                
                let idx = 1;
                for (let g of records) {
                    doc.setFontSize(12);
                    doc.text(`${idx++}. ${g.title}`, 14, yPos);
                    yPos += 5;
                    const rows = [
                        ["Target Metric", g.metric || "N/A"],
                        ["Start Date", g.startDate ? new Date(g.startDate).toLocaleDateString() : "N/A"],
                        ["Target Date", g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "N/A"],
                        ["Current Status", g.status]
                    ];
                    if (g.statusHistory) {
                        const historyStr = g.statusHistory.map(h => `${h.status} (${new Date(h.changedAt).toLocaleDateString()})`).join(", ");
                        rows.push(["Status History", historyStr]);
                    }

                    autoTable(doc, {
                        startY: yPos,
                        body: rows,
                        theme: 'grid',
                        styles: { fontSize: 8 },
                        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
                    });
                    yPos = doc.lastAutoTable.finalY + 12;
                    checkPageBreak(40);
                }
            }
        }

        // --- SECTION: DAILY LOGS ---
        if (selectedExportModules.includes("logs")) {
            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/daily-log/client/${id}`, config);
            const records = await res.json();
            if (records && records.length > 0) {
                checkPageBreak();
                doc.setFontSize(18);
                doc.text("7. Daily Progress Logs", 14, yPos);
                yPos += 8;
                const moodMap = { happy: "🙂 Happy", neutral: "😐 Neutral", sad: "☹️ Sad", agitated: "😣 Agitated" };
                autoTable(doc, {
                    startY: yPos,
                    head: [["Date/Time", "Staff", "Mood", "Indicators", "Notes"]],
                    body: records.map(r => [
                        new Date(r.dateTime).toLocaleString(),
                        r.staffName,
                        moodMap[r.moodEmoji] || r.moodEmoji || "-",
                        `Bristol: ${r.bristolScore || "-"}\nHR: ${r.heartRate || "-"} BPM\nQuick: ${r.healthQuick || "-"}`,
                        r.notes
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [74, 73, 176] },
                    styles: { fontSize: 8 }
                });
                yPos = doc.lastAutoTable.finalY + 15;
                for (let r of records) {
                    if (r.attachments && r.attachments.length > 0) {
                        checkPageBreak(10);
                        doc.text(`Attachments for log on ${new Date(r.dateTime).toLocaleDateString()}:`, 14, yPos);
                        yPos += 5;
                        await addAttachmentsToPdf(r.attachments);
                    }
                }
            }
        }

        // --- SECTION: CONSENT ---
        if (selectedExportModules.includes("consent")) {
            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/consent/client/${id}`, config);
            const records = await res.json();
            if (records && records.length > 0) {
                checkPageBreak();
                doc.setFontSize(18);
                doc.text("8. Consent & Legal (DoLS)", 14, yPos);
                yPos += 8;
                autoTable(doc, {
                    startY: yPos,
                    head: [["Status (DoLS)", "End Date", "Conditions Applied"]],
                    body: records.map(r => [
                        r.dolsInPlace,
                        r.authorizationEndDate ? new Date(r.authorizationEndDate).toLocaleDateString() : "Permanent",
                        r.conditions || "None"
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [55, 65, 81] },
                    styles: { fontSize: 9 }
                });
                yPos = doc.lastAutoTable.finalY + 15;
            }
        }

        // --- SECTION: HANDOVERS ---
        if (selectedExportModules.includes("handovers")) {
            const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/handover/client/${id}`, config);
            const records = await res.json();
            if (records && records.length > 0) {
                checkPageBreak();
                doc.setFontSize(18);
                doc.text("9. Shift Handovers", 14, yPos);
                yPos += 8;
                autoTable(doc, {
                    startY: yPos,
                    head: [["Date", "Time", "From", "To", "Summary Notes"]],
                    body: records.map(r => [
                        new Date(r.date).toLocaleDateString(),
                        r.time,
                        r.handingOver,
                        r.takingOver,
                        r.summaryNotes
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 }
                });
                yPos = doc.lastAutoTable.finalY + 15;
                for (let r of records) {
                   if (r.attachments && r.attachments.length > 0) {
                       await addAttachmentsToPdf(r.attachments);
                   }
                }
            }
        }

        // --- SECTION: DOCUMENTS ---
        if (selectedExportModules.includes("documents")) {
            checkPageBreak();
            doc.setFontSize(18);
            doc.text("10. General Documents", 14, yPos);
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

        doc.save(`${client.fullName.replace(/\s+/g, '_')}_Complete_Profile.pdf`);
        setShowExportModal(false);
    } catch (error) {
        console.error("Export Error:", error);
        alert("An error occurred while generating the PDF. Please try again.");
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
              Resident Management / Resident Profile
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
        ) : client?.profileImage ? (
          <Image src={client.profileImage} alt="Client Profile" width={96} height={96} className="w-full h-full object-cover" />
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

          const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/client/${id}/photo`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData,
          });
// bcnbcnc
          const data = await res.json();
          setClient(data);
        }}
        className="hidden"
      />
    </div>

    {/* Dynamic Name + Position + Status */}
    <div className="flex flex-col items-center sm:items-start">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
{client?.fullName}      </h2>

      <p className="text-xs sm:text-sm md:text-base text-gray-400 mt-1">
        Care Type: {clientcareplane?.[0]?.careSetting} - Room {client?.roomNumber || "N/A"}
      </p>

      <div className="mt-2">
        <span className="bg-[#53AF50] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 py-1 rounded whitespace-nowrap">
           Complex Behavioral Needs (SBS)
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


 <Link href="/Client-Management">
    <button
      className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium 
      transition-all duration-300 active:scale-95 shadow-md"
    >
      <FaArrowLeft />
      <span>Exit</span>
    </button>
  </Link>
  <button
    onClick={handleExportClick}
    className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md 
    bg-blue-600 hover:bg-blue-700 text-white font-medium 
    transition-all duration-300 active:scale-95 shadow-md"
  >
    <FaFilePdf />
    <span>Export Profile</span>
  </button>




   <button
  className="bg-[#2A2A40] hover:bg-[#3A3A55] cursor-pointer text-white px-2 py-1 rounded-md flex items-center space-x-2 border border-[#4A49B0]/40"
  onClick={async () => {
    if (!confirm("Are you sure you want to delete this resident profile? This action will permanently remove all associated records and cannot be undone.")) return;

    const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/client/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    alert(data.message);

    router.push("/Client-Management"); // redirect back
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

{/* About Me */}
{activeTab === "about" && (
  <ResidentProfileAboutMe 
    clientId={id}
    isEditing={isEditing}
    onClientChange={(updatedClient) => setClient(updatedClient)}
  />
  
)}

{/* Care Plans */}

{activeTab === "care" && 
<ResidentProfileCarePlan clientId={id} />

}

{/* PBS Plans */}

{activeTab === "pbs" && 
<ResidentProfilePBSplan clientId={id} />
}

{/* Risk Assessments */}

{activeTab === "risk" && 
<ResidentProfileRiskAssessment clientId={id}/>
 }

{/* Goals & Outcomes */}

{activeTab === "goals" && 
<ResidentProfileGoalsOutcome clientId={id} />
 }

{/* Daily Logs */}

{activeTab === "logs" && 
<ResidentProfileDailyLog clientId={id} />
}

{/* Medication (eMAR) */}

{activeTab === "medication" && 
<ResidentProfileMedicationEMAR clientId={id} />
}

{/* Consent */}

{activeTab === "consent" && 
<ResidentProfileConsentForm clientId={id}/>
}

{/* Handovers */}

{activeTab === "handovers" && 
<ResidentProfileHandOver clientId={id} />
}

{/* Documents */}

{activeTab === "documents" && 
<ResidentProfileDocuments clientId={id} />
}

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
                Export Resident Profile
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white transition">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-400 text-sm mb-4">Select the modules you wish to include in the export:</p>
              
              <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {tabs.map((tab) => (
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
