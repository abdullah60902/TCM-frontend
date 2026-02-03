"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import { BsArrowsFullscreen } from "react-icons/bs";
import { SiSimpleanalytics } from "react-icons/si";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoDocumentAttach } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";
import { TbClockRecord } from "react-icons/tb";


import Image from "next/image";

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
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Optional for table format
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
      
    },
    {
      icon: <FaSearch />,
      label: "Social Activity",
      href: "/Social-Activity",active: true
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
  const [social, setSocial] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState('All Activity');
    const { hasLowStock, setHasLowStock } = useAuth();

  const [staffMembers, setStaffMembers] = useState([]); // For HR/staff members
    const [staffMembers2, setStaffMembers2] = useState([]); // For client/staff members
    const [previewImage, setPreviewImage] = useState(null);
      const { hasReviews, setHasReviews } = useAuth();



 
  // Define your navigation links here with proper routes
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm4, setShowForm4] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null); // track if editing
  const [formData4, setFormData4] = useState({
  client: '',
  caregiver: '',
  activityType: '',     // enum value: required
  description: '',      // activity details
  date: '',             // optional (or backend default)
      // optional: file URLs
});

  const filters = ['All Activity', 'family Visits', 'Hobbies', 'Game', 'Social Engagement'];


  



  const handleEdit = (activity) => {
  setFormData4({
    client: activity.client._id,
    caregiver: activity.caregiver._id,
    activityType: activity.activityType,
    description: activity.description,
    date: activity.date?.slice(0, 10),
  });
  console.log("Editing activity:", activity._id);
  
  setEditingUserId(activity._id);
  setShowForm4(true);
  setAttachments(activity.attachments || []); // Set existing attachments if any
};




const [previewVideo, setPreviewVideo] = useState(null);


const [attachments, setAttachments] = useState([]);

const handleFileChange = (e) => {
  setAttachments(Array.from(e.target.files));
};


  const handleChange4 = (e) => {
    const { name, value } = e.target;
    setFormData4(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const [loading, setLoading] = useState(false);
  
const handleSubmit4 = (e) => {
  e.preventDefault();
  setLoading(true);
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  };

  const data = new FormData();
  Object.entries(formData4).forEach(([key, value]) => {
    data.append(key, value);
  });
  attachments.forEach(file => {
    data.append('attachments', file);
  });

  const request = editingUserId
    ? axios.put(`https://admin-panel-backend-alpha.vercel.app/social/${editingUserId}`, data, config)
    : axios.post(`https://admin-panel-backend-alpha.vercel.app/social`, data, config);

  request
    .then(res => {
      toast.success(editingUserId ? "Activity updated successfully" : "Activity added successfully");
      setLoading(false);
      setShowForm4(false);
      setFormData4({
        client: '',
        caregiver: '',
        activityType: '',
        description: '',
        date: '',
      });
      setAttachments([]);

      // ✅ FETCH updated data
      return axios.get('https://admin-panel-backend-alpha.vercel.app/social', config);
    })
    .then(res => {
      setSocial(res.data); // social activity list update
      console.log(res.data);
      
    })
    .catch(err => {
      console.error("Error:", err.response?.data);
      setLoading(false);
      toast.error(err.response?.data?.msg || "Submission failed");
    });
};




  useEffect(() => {
    axios.get('https://admin-panel-backend-alpha.vercel.app/social', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
    })
      .then(response => {
        console.log('Fetched users:', response.data);
        setSocial(response.data); // no .users needed, your backend returns an array
        setFilteredStaff(response.data);
        setMessage('Users fetched successfully');
        setError('');
      })
      .catch(error => {
        // console.error('Error fetching users:', error.response?.data || error.message);
        setError(error.response?.data?.msg || 'Failed to fetch users');
      });
  }, []);

  // Filter staff whenever searchQuery or selected changes
 

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
        console.log('Fetched staff members:', response.data.allHr[0].fullName);
        
      })
      .catch(error => {
        setError(error.response?.data?.msg || 'Failed to fetch staff');
      });
  }, []);

const handleCancel12 = () => {
  setShowForm4(false);
  setEditingUserId(null);
  setFormData4({
    client: '',
    caregiver: '',
    activityType: '',
    description: '',
    date: '',
  });
  setAttachments([]);
};

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('token');
    axios.delete(`https://admin-panel-backend-alpha.vercel.app/social/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(() => {
        setMessage('User deleted');
        // Remove user from UI
        const updated = social.filter(user => user._id !== id);
        setSocial(updated);
        setFilteredStaff(updated);
        toast.success("Deleted successfuly")
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.msg || 'Failed to delete user');
        toast.error(err.response?.data?.msg || 'Failed to delete user')
      });
  };


useEffect(() => {
  const token = localStorage.getItem('token');
  axios.get('https://admin-panel-backend-alpha.vercel.app/client', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  .then(response => {
    setStaffMembers2(response.data.clients);  // Staff data set
        setMessage('Staff fetched successfully');
  })
  .catch(error => {
    setError(error.response?.data?.msg || 'Failed to fetch staff');
  });
}, []);



useEffect(() => {
    const filtered = social.filter((plan) => {
      const client = staffMembers2.find((staff) => staff._id === plan.client)?.fullName || '';
      console.log("Filtering for client:", client, "with selected type:", selected);
      
      const matchesType = selected === 'All Activity' || plan.activityType === selected;
      const matchesSearch = client.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  
    setFilteredStaff(filtered);
  }, [selected, searchQuery, social, staffMembers2]);
  
  


// view...............................................................................
  

const [viewClientName, setViewClientName] = useState(null);
const [viewCaregiverName, setViewCaregiverName] = useState(null);
const [viewActivityType, setViewActivityType] = useState(null);
const [viewActivityDate, setViewActivityDate] = useState(null);
const [viewDescription, setViewDescription] = useState(null);
const [showModals, setShowModals] = useState(false);
const [viewAttachments, setViewAttachments] = useState([]);

// 🔍 Filter Patients  // serche Patient form data 
   const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [staffSearchTerm, setStaffSearchTerm] = useState("");

  // 🔍 Filter Patients
  const visiblePatients = staffMembers2.filter(
    (p) =>
      (user?.role !== "Client" || user.clients.includes(p._id)) &&
      p.fullName.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  // 🔍 Filter Staff Members
  const visibleStaff = staffMembers.filter((s) =>
    s.fullName.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  // ✅ Handle patient selection
  const handleSelectPatient = (patient) => {
    setFormData4((prev) => ({
      ...prev,
      client: patient._id,
      clientName: patient.fullName,
    }));
    setPatientDropdownOpen(false);
  };

  // ✅ Handle staff selection
  const handleSelectStaffMember = (staff) => {
    setFormData4((prev) => ({
      ...prev,
      caregiver: staff._id,
      caregiverName: staff.fullName,
    }));
    setStaffDropdownOpen(false);
  };


const handleView = (activity) => {
  setViewClientName(activity.client?.fullName || "Unknown Client");
  setViewCaregiverName(activity.caregiver?.fullName || "Unknown Caregiver");
  setViewActivityType(activity.activityType);
  setViewActivityDate(activity.date?.slice(0, 10));
  setViewDescription(activity.description);
  setViewAttachments(activity.attachments || []); // ✅ Add this line
  setShowModals(true);
};


  const data = {
  "Client": viewClientName,
  "Caregiver": viewCaregiverName,
  "Activity Type": viewActivityType,
  "Date": viewActivityDate,
  "Description": viewDescription,
};



  
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Function to toggle dropdown for a specific client
  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };




// ✅ CSV Download Function
const handleDownloadCsv = (item) => {
  const headers = ["Field,Value"];
  const rows = [
    `Client,${item.client?.fullName || "—"}`,
    `Caregiver,${item.caregiver?.fullName || "—"}`,
    `Activity Type,${item.activityType || "—"}`,
    `Date,${item.date?.slice(0, 10) || "—"}`,
    `Description,${item.description || "—"}`,
  ];

  const csvContent = [...headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${item.client?.fullName || "activity"}_record.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ✅ PDF Download Function
const handleDownloadPdf = async (item) => {
  const jsPDF = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Social Activity Details", 14, 15);

  // ✅ Table of activity details
  autoTable(doc, {
    startY: 25,
    head: [["Field", "Value"]],
    body: [
      ["Client", item.client?.fullName || ""],
      ["Caregiver", item.caregiver?.fullName || ""],
      ["Activity Type", item.activityType || ""],
      ["Date", item.date?.slice(0, 10) || ""],
      ["Description", item.description || ""],
    ],
  });

  let currentY = doc.lastAutoTable.finalY + 10;

  // ✅ Attachments (images, pdfs, videos)
  async function addAttachments() {
    if (item.attachments?.length > 0) {
      doc.setFontSize(12);
      doc.text("Attachments:", 14, currentY);
      currentY += 6;

      for (let i = 0; i < item.attachments.length; i++) {
        const url = item.attachments[i];
        const ext = url.split(".").pop().toLowerCase();

        // 🖼️ IMAGES
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
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
          } catch (e) {
            doc.setTextColor(255, 0, 0);
            doc.text("Image failed to load", 14, currentY);
            doc.setTextColor(0, 0, 0);
            currentY += 10;
          }
        }

        // 📄 PDF ICON
        else if (ext === "pdf") {
          try {
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
          } catch (e) {
            doc.setTextColor(255, 0, 0);
            doc.text("PDF icon failed to load", 14, currentY);
            doc.setTextColor(0, 0, 0);
            currentY += 10;
          }
        }

        // 🎥 VIDEOS
        else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
          try {
            const videoIcon =
              "https://cdn-icons-png.flaticon.com/512/727/727245.png"; // 🎥 icon
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
          } catch (e) {
            doc.setTextColor(255, 0, 0);
            doc.text("Video icon failed to load", 14, currentY);
            doc.setTextColor(0, 0, 0);
            currentY += 10;
          }
        }
      }
    }
  }

  await addAttachments();

  const fileName = `${item.client?.fullName || "activity"}_record.pdf`;
  doc.save(fileName);
};
















const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/Login');
  }, [user, router]);

  if (!user) return null;




// create  a lopp  and  3 pbject get the name of father  throuhh the loop




















 



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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 💡 Heading */}
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 flex items-center justify-center gap-2 sm:gap-3">
        Social Record Details
      </h2>

      {/* Info Fields */}
      <div className="space-y-5 mb-6">
        {Object.entries(data).map(([field, value]) => (
          <div
            key={field}
            className="flex justify-between items-start bg-[#1e212a] p-4 rounded-xl border border-gray-700"
          >
            <span className="font-semibold text-gray-300">{field}</span>
            <span className="text-right text-gray-400 max-w-[60%]">{value}</span>
          </div>
        ))}
      </div>

      {/* 📎 Attachments */}
      {viewAttachments?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586M16 3a4 4 0 015.656 5.656L9.414 21H4v-5.414L16 3z" />
            </svg>
            Attachments
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {viewAttachments.map((file, index) => {
              const ext = file.split('.').pop().toLowerCase();
              const isPDF = ext === "pdf";
              const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(ext);

              return (
                <div
                  key={index}
                  className="relative bg-[#1e212a] p-3 rounded-2xl border border-gray-700 shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* 📄 PDF */}
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
                    // 🎥 VIDEO PREVIEW
                    <div className="relative group cursor-pointer">
                      <video
                        src={file}
                        className="w-full h-[200px] object-cover rounded-lg border border-gray-600"
                        onClick={() => setPreviewVideo(file)}
                      />
                      <div
                        onClick={() => setPreviewVideo(file)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                      >
                        <BsArrowsFullscreen className="text-white text-2xl" />
                      </div>
                    </div>
                  ) : (
                    // 🖼️ IMAGE PREVIEW
                    <div className="relative group cursor-pointer">
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
                        <BsArrowsFullscreen className="text-white text-2xl" />
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

{/* 🖼️ Image Full Preview */}
{previewImage && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-4xl w-full">
      <button
        onClick={() => setPreviewImage(null)}
        className="absolute cursor-pointer top-3 right-3 text-white hover:text-red-500"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

{/* 🎥 Video Full Preview */}
{previewVideo && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div className="relative bg-[#111319] border border-gray-600 p-4 rounded-2xl max-w-3xl w-full">
      <button
        onClick={() => setPreviewVideo(null)}
        className="absolute top-3 cursor-pointer right-3 z-[10000] w-9 h-9 bg-gray-800 text-white hover:bg-red-600 rounded-full flex items-center justify-center shadow transition-all duration-200"
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
        className="w-full h-auto rounded-xl max-h-[75vh] mx-auto"
      />
    </div>
  </div>
)}



      {/* Mobile Navbar Toggle */}
      <div className="lg:hidden flex items-center justify-end px-4 py-3 bg-gray-800 shadow relative">
        <h1 className="text-lg text-white font-semibold absolute left-4">
                      Social Activity

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
          <h2 className="text-xl font-semibold text-gray-200 mb-6 hidden md:block">
            Social Activity
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8 h-full overflow-y-auto pr-2 my-scroll">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-200">Social Activity Tracking</h3>
                <p className="text-sm text-gray-400">Keep a history of social activities and visits.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-600 pl-10 pr-4 py-2 focus:border-primary-light focus:ring-primary-light bg-gray-700 text-white"
                    placeholder="Search Social Act..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                  </div>
                </div>
                {!hasClients &&  <button
                  onClick={() => setShowForm4(true)}
                  className="bg-[#4a48d4] hover:bg-[#4A49B0] cursor-pointer text-white px-4 py-2 rounded-md text-[10px] font-medium transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" /> Add New Activity
                </button>}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex text-white flex-wrap gap-2">
              {filters.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(label)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer backdrop-blur-sm ${selected === label
                    ? "bg-primary-light bg-gray-700 text-primary-light shadow-lg"
                    : " hover:bg-primary-light bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-primary-light"
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
                    {["patient", "Activity", 'Date','Status',  "Actions"].map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
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
                            <div className="w-8 h-8 bg-white rounded-full text-blue-500 flex items-center justify-center border-gray-600">
    {
                        (staffMembers2.find(staff => staff._id === item.client?._id)?.fullName || "Unknown")
                          .split(" ")
                          .map(word => word[0])
                          .join("")
                          .toUpperCase()
                      }                            </div>
                            <div>
                              <div className="text-[12px] font-medium text-white">                      {staffMembers2.find(staff => staff._id === item.client?._id)?.fullName || "Unknown"}
</div>
                              <div className="text-sm text-gray-400"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-white">{item.activityType}</td>
                        <td className="px-4 py-4 text-sm text-white">{item.date.slice(0, 10)}</td>
                        <td className="px-4 py-4 text-sm text-white">Active</td>
                  <td className="px-4 py-4">
  <div className="flex space-x-3 text-white items-center">
    {/* 👁 View Button */}
    <button
      className="hover:text-blue-500 transition cursor-pointer"
      onClick={() => handleView(item)}
    >
      <FaEye />
    </button>

    {/* ✏️ Edit Button */}
    {!hasClients &&  <button
      className="cursor-pointer hover:text-yellow-500 transition"
      onClick={() => handleEdit(item)}
    >
      <FaEdit />
    </button>}

    {/* 🗑 Delete Button */}
     {!hasClients && <button
      className="cursor-pointer hover:text-red-500 transition"
      onClick={() => handleDelete(item._id)}
    >
      <FaTrash />
    </button>}

    {/* 📥 Download Dropdown (PDF + CSV) */}
    <div className="relative">
      <button
        onClick={() =>
          setOpenDropdownId(openDropdownId === item._id ? null : item._id)
        }
        className="hover:text-green-500 transition cursor-pointer"
      >
        <FaDownload />
      </button>

      {openDropdownId === item._id && (
        <div
          className="absolute right-0 mt-2 
             bg-white/20 backdrop-blur-xl border border-white/30 
             shadow-lg rounded-md z-10 w-36 
             transition-all duration-200"
                            >
          <button
            onClick={() => {
              handleDownloadPdf(item);
              setOpenDropdownId(null);
            }}
 className="block w-full text-left px-3 py-2 
               text-sm text-white hover:bg-white/10 transition"          >
            Download PDF
          </button>
          <button
            onClick={() => {
              handleDownloadCsv(item);
              setOpenDropdownId(null);
            }}
 className="block w-full text-left px-3 py-2 
               text-sm text-white hover:bg-white/10 transition"          >
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
                      <td colSpan={6} className="text-center px-4 sm:px-6 py-24 text-gray-400 text-sm">
                        No Social Activity.
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
      onSubmit={handleSubmit4} encType="multipart/form-data"
      className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto"
    >
    <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
  {editingUserId ? "Edit Social Activity" : "Add Social Activity"}
</h2>


  {/* 🧍 Patient Dropdown */}
      <div className="mb-4 relative">
        <label
          htmlFor="clientId"
          className="block text-gray-300 text-sm font-medium mb-2"
        >
          Patient
        </label>

        <div
          onClick={() => {
            setPatientDropdownOpen(!patientDropdownOpen);
            setStaffDropdownOpen(false);
          }}
          className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 cursor-pointer select-none"
        >
          {formData4.client
            ? staffMembers2.find((c) => c._id === formData4.client)?.fullName
            : "Select Patient"}
        </div>

        {patientDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2">
            <input
              type="text"
              placeholder="Search patient..."
              value={patientSearchTerm}
              onChange={(e) => setPatientSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-600 px-3 py-1 mb-2 text-sm bg-gray-700 text-white focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
            />

            <div className="max-h-48 overflow-y-auto space-y-1">
              {visiblePatients.length > 0 ? (
                visiblePatients.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleSelectPatient(p)}
                    className={`px-2 py-1 rounded-md hover:bg-gray-600 text-gray-200 text-sm cursor-pointer ${
                      formData4.client === p._id ? "bg-gray-700" : ""
                    }`}
                  >
                    {p.fullName}
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

        <input type="hidden" name="client" value={formData4.client} />
        <input
          type="hidden"
          name="clientName"
          value={formData4.clientName || ""}
        />
      </div>

      {/* 👨‍⚕️ Staff Dropdown */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-300">
          Staff Member
        </label>

        <div
          onClick={() => {
            setStaffDropdownOpen(!staffDropdownOpen);
            setPatientDropdownOpen(false);
          }}
          className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600 cursor-pointer select-none"
        >
          {formData4.caregiver
            ? staffMembers.find((s) => s._id === formData4.caregiver)?.fullName
            : "Select Staff Member"}
        </div>

        {staffDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2">
            <input
              type="text"
              placeholder="Search staff..."
              value={staffSearchTerm}
              onChange={(e) => setStaffSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-600 px-3 py-1 mb-2 text-sm bg-gray-700 text-white focus:ring-2 focus:ring-[#4a48d4] focus:outline-none"
            />

            <div className="max-h-48 overflow-y-auto space-y-1">
              {visibleStaff.length > 0 ? (
                visibleStaff.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => handleSelectStaffMember(s)}
                    className={`px-2 py-1 rounded-md hover:bg-gray-600 text-gray-200 text-sm cursor-pointer ${
                      formData4.caregiver === s._id ? "bg-gray-700" : ""
                    }`}
                  >
                    {s.fullName}
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
          name="caregiver"
          value={formData4.caregiver || ""}
        />
        <input
          type="hidden"
          name="caregiverName"
          value={formData4.caregiverName || ""}
        />
      </div>
    

      {/* Family Visits */}
      <div className="mb-4">
  <label className="block text-sm font-medium text-gray-300">Activity Type</label>
  <select
    name="activityType"
    value={formData4.activityType}
    onChange={handleChange4}
    required
    className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
  >
    <option value="">Select an activity</option>
    <option value="Family Visit">Family Visit</option>
    <option value="Game">Game</option>
    <option value="Hobby">Hobby</option>
    <option value="Social Engagement">Social Engagement</option>
    <option value="Other">Other</option>
  </select>
</div>

      {/* Activity Date */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">Activity Date</label>
        <input
          type="date"
          name="date"
          value={formData4.date}
          onChange={handleChange4}
          required
          className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">Notes</label>
        <textarea
          name="description"
          value={formData4.description}
          onChange={handleChange4}
          rows="4"
          className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
          placeholder="Add any notes..."
        />
      </div>

      {/* Media Upload */}
      <div className="mb-4">
  <label className="block text-gray-300 text-sm font-medium mb-2">
    Attach Media
  </label>
  <input
     type="file"
      name="attachments"
        onChange={handleFileChange}
      multiple
    className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
  />
</div>


      {/* Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={handleCancel12}
          className="bg-gray-700 cursor-pointer hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded"
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
        ) : (
editingUserId ? "Update Activity" : "Add Activity"
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