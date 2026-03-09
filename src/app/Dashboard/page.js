"use client";
import React, { useState } from "react";
import Navbar from "../(component)/navbar/Navbar";
import axios from "axios";
import { SiSimpleanalytics } from "react-icons/si";
import { IoDocumentAttach } from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OccupancyChart from "@/app/(component)/occupancyChart/OccupancyChart";

import {
  FaThLarge,
  FaUser,
  FaClipboardList,
  FaExclamationTriangle, // ✅ Keep only once
  FaUsers,
  FaGraduationCap,
  FaShieldAlt,
  FaUserCog,
  FaClipboardCheck,
  FaExclamationCircle,
  FaUserPlus,
  FaFileMedical,
  FaUserTie,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import Link from "next/link";
import { GrDocumentPerformance } from "react-icons/gr";
// const { hasLowStock, setHasLowStock } = useAuth();
import { TbClockRecord } from "react-icons/tb";

import { inc, set } from "nprogress";
import { toast } from "react-toastify";
import { MdMedicationLiquid } from "react-icons/md";
import ChangePasswordPrompt from "../(component)/changepassword/Changepassword";
import IncidentChart from "../(component)/charts/IncidentChart";
import { Chart } from "chart.js";
const Page = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasLowStock, setHasLowStock, hasClients, user } = useAuth();

  const { totalLowStock, setTotalLowStock } = useAuth();
  const [showBox, setShowBox] = useState(false);
  const { todayReviews, setTodayReviews } = useAuth();
  const { overdueReviews, setOverdueReviews } = useAuth();
  const { totalToday, setTotalToday } = useAuth();
  const { totalOverdue, setTotalOverdue } = useAuth();
  const { hasReviews, setHasReviews } = useAuth();
  const navItems = [
    {
      icon: <FaThLarge />,
      label: "Dashboard",
      href: "/Dashboard",
      active: true,
    },
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

  // care plane ------------------------------------------------------------------------------------------------
  const [carePlans, setCarePlans] = useState([]);

  const [formDataCare, setFormDataCare] = useState({
    client: "",
    planType: "",
    creationDate: "",
    reviewDate: "",
    carePlanDetails: "",
    bristolStoolChart: "",
    mustScore: "",
    heartRate: "",
    mood: "",
    dailyLog: "",
    careSetting: "", // ✅ NEW FIELD
  });

  const hansleCloseFormCare = () => {
    setShowFormCare(false);
    setAttachments([]);
    setFormDataCare({
      client: "",
      planType: "",
      creationDate: "",
      reviewDate: "",
      carePlanDetails: "",
      bristolStoolChart: "",
      mustScore: "",
      heartRate: "",
      mood: "",
      dailyLog: "",
      careSetting: "", // Reset new field
    });
  };

  // care plane ------------------------------------------------------------------------------------------------

  const [showFormCare, setShowFormCare] = useState(false);
  const handleChangeCare = (e) => {
    const { name, value } = e.target;
    setFormDataCare((prev) => ({ ...prev, [name]: value }));
  };

  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const [staffMembers, setStaffMembers] = useState([]); // For HR/staff members

  // Optional: Handle form submit
  const handleSubmitCare = (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    for (let key in formDataCare) {
      formData.append(key, formDataCare[key]);
    }

    // Check if editing: add Cloudinary URLs (old ones) and new files

    // New upload
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    axios
      .post(
        `https://admin-panel-backend-alpha.vercel.app/carePlanning`,
        formData,
        config
      )
      .then((res) => {
        toast.success("Care plan saved successfully");
        setShowFormCare(false);
        setLoading(false);
        setAttachments([]);
        setFormDataCare({
          client: "",
          planType: "",
          creationDate: "",
          reviewDate: "",
          carePlanDetails: "",
          bristolStoolChart: "",
          mustScore: "",
          heartRate: "",
          mood: "",
          dailyLog: "",
          careSetting: "",
          attachments: [],
        });
        console.log("Care plan saved successfully:", res.data);
      })
      .catch((err) => {
        console.error("Error:", err.response?.data || err.message);
        setError(err.response?.data?.msg || "An error occurred");
        toast.error(err.response?.data?.msg || "An error occurred");
        setLoading(false); // Reset loading state on error
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
        setStaffMembers(response.data.clients); // Staff data set
        setMessage("Staff fetched successfully");
      })
      .catch((error) => {
        setError(error.response?.data?.msg || "Failed to fetch staff");
      });
  }, []);

  // incidient -------------------------------------------------------------------------------------------------------------
  const [inci, setinci] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://admin-panel-backend-alpha.vercel.app/client", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setinci(response.data.clients); // Staff data set
        setMessage("Staff fetched successfully");
      })
      .catch((error) => {
        setError(error.response?.data?.msg || "Failed to fetch staff");
      });
  }, []);

  // staff deshbord statu

  const [trainingStats, setTrainingStats] = useState({
    upToDate: 0,
    expiringSoon: 0,
    expired: 0,
  });
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchTrainingAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://admin-panel-backend-alpha.vercel.app/training",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data;
        const now = new Date();
        const soon = new Date();
        soon.setDate(now.getDate() + 30);

        let upToDate = 0;
        let expiringSoon = 0;
        let expired = 0;

        data.forEach((t) => {
          const expiry = new Date(t.expiryDate);
          if (expiry < now) expired++;
          else if (expiry <= soon) expiringSoon++;
          else upToDate++;
        });

        const stats = { upToDate, expiringSoon, expired };
        setTrainingStats(stats);

        const total = upToDate + expiringSoon + expired;
        const percent = total ? Math.round((upToDate / total) * 100) : 0;
        setPercentage(percent);

        const ctx = document.getElementById("trainingChart");
        if (ctx) {
          if (window.trainingChartInstance) {
            window.trainingChartInstance.destroy();
          }

          window.trainingChartInstance = new Chart(ctx, {
            type: "doughnut",
            data: {
              labels: ["Up to Date", "Expiring Soon", "Expired"],
              datasets: [
                {
                  data: [upToDate, expiringSoon, expired],
                  backgroundColor: [
                    "rgba(34,197,94,0.9)", // green
                    "rgba(250,204,21,0.9)", // yellow
                    "rgba(239,68,68,0.9)", // red
                  ],
                  borderColor: "#1c2434",
                  borderWidth: 4,
                },
              ],
            },
            options: {
              cutout: "70%",
              plugins: { legend: { display: false } },
            },
          });
        }
      } catch (error) {
        console.error("❌ Error fetching training analytics:", error);
      }
    };

    fetchTrainingAnalytics();
  }, []);

  // incedent deshbord stats 

  const [sixmont, setSixmont] = useState(0);
  const [open, setOpen] = useState(0);
  const [underInvestigation, setUnderInvestigation] = useState(0);
  const [resolved, setResolved] = useState(0);
  // const [incmessage, setIncemessage] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://admin-panel-backend-alpha.vercel.app/incident/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ Set all stats from backend response
        setSixmont(res.data.recentIncidentsCount);
        setOpen(res.data.openIncidentsCount);
        setUnderInvestigation(res.data.underInvestigationCount);
        setResolved(res.data.resolvedIncidentsCount);
        // setMessage("Incidents fetched successfully");
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || "Failed to fetch incidents");
      }
    };

    fetchIncidents();
  }, []);

  const [incidentData, setIncidentData] = useState([]);
  const [attachmentsincident, setAttachmentsincidebt] = useState([]);
  const handleFileChangeincident = (e) => {
    setAttachmentsincidebt(Array.from(e.target.files));
  };
  const handleChange2incident = (e) => {
    const { name, value } = e.target;
    setFormData2((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setFormData2((prev) => ({ ...prev, [name]: value }));
  };

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
    attachmentsincident.forEach((file) => {
      data.append("attachments", file);
    });

    axios
      .post(
        `https://admin-panel-backend-alpha.vercel.app/incident/`,
        data,
        config
      )
      .then((res) => {
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
        console.log("Incident added successfully:", res.data);

        setAttachmentsincidebt([]);
        setShowModal2(false);
        toast.success("Add successfuly");
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setError(err.response?.data?.msg || "Error occurred");
        toast.error(err.response?.data?.msg || "Error occurred");
      });
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
    setAttachments([]); // Reset attachments
    setError(""); // Clear any error messages
  };

  // add staf -------------------------------------------------------------------------------------------------------------
  const [showModal3, setShowModal3] = useState(false);
  const [formData3, setFormData3] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    careSetting: "", // <-- Added this
    startDate: "",
  });

  const handleCancel10 = () => {
    setShowModal3(false);
    setFormData3({
      name: "",
      department: "",
      email: "",
      position: "",
      startDate: "",
      careSetting: "", // Reset new field
    });
  };

  const [totalStaffno, setTotalStaffno] = useState(0);
  const [error, setError] = useState(null); // optional error state

  useEffect(() => {
    const fetchHR0 = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://admin-panel-backend-alpha.vercel.app/hr",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTotalStaffno(res.data.totalstaff);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch HR data");
      }
    };
    fetchHR0();
  }, []);

  const [staffData, setStaffData] = useState([]);

  const handleChange3 = (e) => {
    const { name, value } = e.target;
    setFormData3((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitStaff = (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
    const { name, email, position, department, startDate } = formData3;

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const payload = {
      fullName: name,
      email: email,
      position: position,
      department: department,
      careSetting: formData3.careSetting, // <-- Add this line
      startDate: startDate,
    };

    axios
      .post(`https://admin-panel-backend-alpha.vercel.app/hr`, payload, config)

      .then((res) => {
        setLoading(false); // Reset loading state
        setFormData3({
          name: "",
          department: "",
          email: "",
          position: "",
          startDate: "",
          careSetting: "", // Reset new field
        });
        console.log("Staff added successfully:", res.data);
        setStaffData(res.data); // Update staff data
        setShowModal3(false);
        toast.success("Add successfuly");
      })
      .catch((err) => {
        setLoading(false); // Reset loading statelog
        console.error("Error:", err.response?.data || err.message);
        toast.error(err.response?.data?.msg || "An error occurred");
      });
  };

  // add client  --------------------------------------------------------------------------------------------------------------

  const [showModal, setShowModal] = useState(false);
  const [totalClients, setTotalClients] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [occupiedRooms0, setOccupiedRooms0] = useState(0);
  const [occupancyPercentage, setOccupancyPercentage] = useState(0);
  useEffect(() => {
    const fetchHR = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://admin-panel-backend-alpha.vercel.app/client",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTotalClients(res.data.totalClients);
        setAvailableRooms(res.data.totalAvailableRooms);
        setOccupiedRooms0(res.data.currentOccupancy);
        setOccupancyPercentage(res.data.occupancyPercentage);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch HR data");
      }
    };
    fetchHR();
  }, []);

  // Form data state

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    room: "",
    careType: "",
    admitDate: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [loading, setLoading] = useState(false); // Loading state for form submission

  // Optional: Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true when form is submitted
    const { name, age, room, careType, admitDate } = formData;

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const payload = {
      fullName: name,
      age: age,
      roomNumber: room,
      careType: careType,
      admissionDate: admitDate,
    };

    axios
      .post(
        `https://admin-panel-backend-alpha.vercel.app/client`,
        payload,
        config
      )
      .then((res) => {
        setFormData({
          name: "",
          age: "",
          room: "",
          careType: "",
          admitDate: "",
        });
        setLoading(false); // Reset loading state after submission
        setShowModal(false);
        toast.success("Add successfuly");

        return axios.get(
          "https://admin-panel-backend-alpha.vercel.app/client",
          config
        );
      })
      .then((res) => {
        console.log("Updated Client Data:", res.data.clients);
        setTotalClients(res.data.totalClients);
        setAvailableRooms(res.data.totalAvailableRooms);
        setOccupiedRooms0(res.data.currentOccupancy);
        setOccupancyPercentage(res.data.occupancyPercentage);
      })
      .catch((err) => {
        console.error("Error:", err.response?.data || err.message);
        setLoading(false); // Reset loading state on error
        setError(err.response?.data?.msg || "An error occurred");
        toast.error(err.response?.data?.msg || "An error occurred");
      });
  };

  // shedule staff training-------------------------------------------------------------------------------------------------------------------
  const [attachmentsTraining, setAttachmentsTraining] = useState([]);

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

  const handleFileChangeTraining = (e) => {
    setAttachmentsTraining(Array.from(e.target.files));
  };

  const handleCancel9 = () => {
    setShowForm4(false);
    setFormData4({
      staffName: "",
      trainingType: "",
      completionDate: "",
      expiryDate: "",
      notes: "",
    });
    setAttachmentsTraining([]);
  };

  const [recommendedTrainings, setRecommendedTrainings] = useState([]);

  const getRecommendedTrainings = (staffId) => {
    const staff = staffMembers2.find((s) => s._id === staffId);
    if (!staff || !staff.careSetting) return [];
    return trainingRecommendations[staff.careSetting] || [];
  };

  const [showForm4, setShowForm4] = useState(false);
  const [formData4, setFormData4] = useState({
    staffName: "",
    trainingType: "",
    completionDate: "",
    expiryDate: "",
    notes: "",
  });

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

  const { staffName, trainingType, completionDate, expiryDate, notes } =
    formData4;

  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  const formData = new FormData();
  formData.append("staffMember", staffName);
  formData.append("trainingType", trainingType);
  formData.append("completionDate", completionDate);
  formData.append("expiryDate", expiryDate);
  formData.append("notes", notes);

  attachmentsTraining.forEach((file) => {
    formData.append("attachments", file); // same name used in backend
  });
  axios
    .post(`https://admin-panel-backend-alpha.vercel.app/training`, formData, config)
    .then((res) => {
      setFormData4({
        staffName: "",
        trainingType: "",
        completionDate: "",
        expiryDate: "",
        notes: "",
      });
      setAttachmentsTraining([]);
      setShowForm4(false);
      setLoading(false); // Reset loading state
      toast.success("Added successfully");
      console.log("Training scheduled successfully:", res.data); // ✅ Fixed here
    })
    .catch((err) => {
      setLoading(false); // Reset loading state
      setError(err.response?.data?.msg || "An error occurred");
      console.log(err); // ✅ Make sure it's console.log
      toast.error(err.response?.data?.msg || "An error occurred");
    });
};


  const [staffMembers2, setStaffMembers2] = useState([]); // For HR/staff members

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://admin-panel-backend-alpha.vercel.app/hr", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setStaffMembers2(response.data.allHr); // Staff data set
      })
      .catch((error) => {
        setError(error.response?.data?.msg || "Failed to fetch staff");
      });
  }, []);

  //  ---------------------------------------------------------------------------------------------------------
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/Login");
  }, [user, router]);

  if (!user) return null;
  return (
    <div className="bg-[#111827] min-h-screen">
      <ChangePasswordPrompt user={user} />
      <Navbar />
      {/* Mobile Header - visible only on screens < lg */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-800 shadow">
        <h1 className="text-lg text-white font-semibold">Dashboard</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white text-2xl"
        >
          <FaBars />
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - responsive behavior */}
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

        {/* Main Dashboard Content */}
        <main className="flex-1  overflow-y-hidden bg-gray-900 p-6">
          {/* Welcome Banner */}
          <div className="mb-8 bg-gradient-to-r from-[#1c2434] via-[#273142] to-[#1c2434] rounded-2xl p-6 border border-gray-700 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
                </h2>
                <p className="text-gray-400 text-sm md:text-base">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#273142] px-4 py-2 rounded-lg border border-gray-700">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm text-gray-300">System Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 - Total Patients */}
            <Link href="/Client-Management">
              <div
                className="group relative bg-gradient-to-br from-[#1c2434] to-[#273142] p-6 rounded-xl shadow-lg 
                   flex items-center cursor-pointer overflow-hidden
                   hover:shadow-2xl hover:-translate-y-2 border border-gray-700 hover:border-[#4a48d4] 
                   transition-all duration-300 ease-out"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4a48d4]/0 via-[#4a48d4]/5 to-[#4a48d4]/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#4a48d4] to-[#6366f1] 
                  shadow-lg group-hover:shadow-[#4a48d4]/50 transition-shadow duration-300">
                  <HiUsers className="text-2xl text-white" />
                </div>
                <div className="ml-4 relative z-10">
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Total Residents
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-[#4a48d4] transition-colors">
                    {totalClients}
                  </p>
                </div>
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#4a48d4]/10 rounded-bl-full 
                  group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </Link>

            {/* Card 2 - Staff Members */}
            <Link href="/HR-Management">
              <div
                className="group relative bg-gradient-to-br from-[#1c2434] to-[#273142] p-6 rounded-xl shadow-lg  
                   flex items-center cursor-pointer overflow-hidden
                   hover:shadow-2xl hover:-translate-y-2 border border-gray-700 hover:border-[#10b981] 
                   transition-all duration-300 ease-out"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/0 via-[#10b981]/5 to-[#10b981]/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] 
                  shadow-lg group-hover:shadow-[#10b981]/50 transition-shadow duration-300">
                  <FaUsers className="text-2xl text-white" />
                </div>
                <div className="ml-4 relative z-10">
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Staff Members
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-[#10b981] transition-colors">
                    {totalStaffno}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#10b981]/10 rounded-bl-full 
                  group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </Link>

            {/* Card 3 - Open Incidents */}
            <Link href="/Incident-Reports">
              <div
                className="group relative bg-gradient-to-br from-[#1c2434] to-[#273142] p-6 rounded-xl shadow-lg  
                   flex items-center cursor-pointer overflow-hidden
                   hover:shadow-2xl hover:-translate-y-2 border border-gray-700 hover:border-[#ef4444] 
                   transition-all duration-300 ease-out"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ef4444]/0 via-[#ef4444]/5 to-[#ef4444]/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#dc2626] 
                  shadow-lg group-hover:shadow-[#ef4444]/50 transition-shadow duration-300
                  animate-pulse">
                  <FaExclamationCircle className="text-2xl text-white" />
                </div>
                <div className="ml-4 relative z-10">
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Open Incidents
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-[#ef4444] transition-colors">
                    {open}
                  </p>
                </div>
                {open > 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                )}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#ef4444]/10 rounded-bl-full 
                  group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </Link>

            {/* Card 4 - Tasks Due Today */}
            <div className="relative">
              <div
                className="group relative bg-gradient-to-br from-[#1c2434] to-[#273142] p-6 rounded-xl shadow-lg  
                   flex items-center cursor-pointer overflow-hidden
                   hover:shadow-2xl hover:-translate-y-2 border border-gray-700 hover:border-[#f59e0b] 
                   transition-all duration-300 ease-out"
                onClick={() => setShowBox(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#f59e0b]/0 via-[#f59e0b]/5 to-[#f59e0b]/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] 
                  shadow-lg group-hover:shadow-[#f59e0b]/50 transition-shadow duration-300">
                  <FaClipboardCheck className="text-2xl text-white" />
                </div>
                <div className="ml-4 relative z-10">
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Tasks Due Today
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-[#f59e0b] transition-colors">
                    {totalLowStock +
                      trainingStats.expired +
                      totalToday +
                      totalOverdue}
                  </p>
                </div>
                {(totalLowStock + trainingStats.expired + totalToday + totalOverdue) > 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                  </div>
                )}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#f59e0b]/10 rounded-bl-full 
                  group-hover:scale-150 transition-transform duration-500"></div>
              </div>

              {/* Popup + Background Blur */}
              {showBox && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-2 sm:p-4">
                  {/* Popup Box */}
                  <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-[450px] sm:max-w-[500px] md:max-w-[550px] p-4 sm:p-6 text-center relative transition-all duration-300">
                    {/* Close Button */}
                    <button
                      onClick={() => setShowBox(false)}
                      className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-red-500 text-lg sm:text-xl"
                    >
                      ✖
                    </button>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-4 sm:mb-6">
                      Tasks Due Today
                    </h3>

                    {/* Alert Section */}
                    {/* Alert Section */}
                    <div className="space-y-3 sm:space-y-4">
                      {/* Medication Alert */}
                      <div className="flex justify-between items-center bg-gray-800 px-4 sm:px-5 py-3 sm:py-4 rounded-lg">
                        <Link href="/Medication-Management">
                          <span className="text-gray-200 font-medium text-sm sm:text-base md:text-lg hover:text-blue-400 hover:underline cursor-pointer transition">
                            Medication stock low alert
                          </span>
                        </Link>
                        <span className="text-blue-400 font-bold text-sm sm:text-lg md:text-xl">
                          {totalLowStock}
                        </span>
                      </div>

                      {/* Training Alert */}
                      <div className="flex justify-between items-center bg-gray-800 px-4 sm:px-5 py-3 sm:py-4 rounded-lg">
                        <Link href="/Training">
                          <span className="text-gray-200 font-medium text-sm sm:text-base md:text-lg hover:text-blue-400 hover:underline cursor-pointer transition">
                            Training Expired Alert
                          </span>
                        </Link>
                        <span className="text-red-400 font-bold text-sm sm:text-lg md:text-xl">
                          {trainingStats.expired}
                        </span>
                      </div>

                      {/* Care Plan Review Alert */}
                      <div className="flex justify-between items-center bg-gray-800 px-4 sm:px-5 py-3 sm:py-4 rounded-lg">
                        <Link href="/Care-Planning">
                          <span className="text-gray-200 font-medium text-sm sm:text-base md:text-lg hover:text-blue-400 hover:underline cursor-pointer transition">
                            Care Plan Review Alert
                          </span>
                        </Link>
                        <div className="flex gap-3">
                          <span className="text-red-400 font-bold text-sm sm:text-lg md:text-xl">
                            Overdue: {totalOverdue}
                          </span>
                          <span className="text-yellow-400 font-bold text-sm sm:text-lg md:text-xl">
                            Today: {totalToday}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-br from-[#1c2434] to-[#273142] p-6 mb-8 rounded-2xl shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#4a48d4]"></span>
                Quick Actions
              </h3>
              <p className="text-sm text-gray-400">Frequently used actions</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Add Resident */}
              <button
                onClick={() => setShowModal(hasClients ? false : true)}
                className="group relative flex flex-col items-center p-5 bg-gradient-to-br from-[#273142] to-[#1c2434] 
                  rounded-xl hover:from-[#4a48d4] hover:to-[#6366f1] transition-all duration-300 
                  border border-gray-700 hover:border-[#4a48d4] hover:shadow-lg hover:shadow-[#4a48d4]/20
                  hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-3 rounded-xl bg-[#1c2434] group-hover:bg-white/10 
                  transition-colors duration-300 mb-3">
                  <FaUserPlus className="text-2xl text-[#4a48d4] group-hover:text-white transition-colors" />
                </div>
                <span className="relative text-sm font-medium text-gray-300 group-hover:text-white 
                  transition-colors text-center">
                  Add Resident
                </span>
              </button>

              {/* New Care Plan */}
              <button
                onClick={() => setShowFormCare(hasClients ? false : true)}
                className="group relative flex flex-col items-center p-5 bg-gradient-to-br from-[#273142] to-[#1c2434] 
                  rounded-xl hover:from-[#10b981] hover:to-[#059669] transition-all duration-300 
                  border border-gray-700 hover:border-[#10b981] hover:shadow-lg hover:shadow-[#10b981]/20
                  hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-3 rounded-xl bg-[#1c2434] group-hover:bg-white/10 
                  transition-colors duration-300 mb-3">
                  <FaFileMedical className="text-2xl text-[#10b981] group-hover:text-white transition-colors" />
                </div>
                <span className="relative text-sm font-medium text-gray-300 group-hover:text-white 
                  transition-colors text-center">
                  New Care Plan
                </span>
              </button>

              {/* Report Incident */}
              <button
                onClick={() => setShowModal2(hasClients ? false : true)}
                className="group relative flex flex-col items-center p-5 bg-gradient-to-br from-[#273142] to-[#1c2434] 
                  rounded-xl hover:from-[#ef4444] hover:to-[#dc2626] transition-all duration-300 
                  border border-gray-700 hover:border-[#ef4444] hover:shadow-lg hover:shadow-[#ef4444]/20
                  hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-3 rounded-xl bg-[#1c2434] group-hover:bg-white/10 
                  transition-colors duration-300 mb-3">
                  <FaExclamationTriangle className="text-2xl text-[#ef4444] group-hover:text-white transition-colors" />
                </div>
                <span className="relative text-sm font-medium text-gray-300 group-hover:text-white 
                  transition-colors text-center">
                  Report Incident
                </span>
              </button>

              {/* Add Staff */}
              <button
                onClick={() => setShowModal3(hasClients ? false : true)}
                className="group relative flex flex-col items-center p-5 bg-gradient-to-br from-[#273142] to-[#1c2434] 
                  rounded-xl hover:from-[#8b5cf6] hover:to-[#7c3aed] transition-all duration-300 
                  border border-gray-700 hover:border-[#8b5cf6] hover:shadow-lg hover:shadow-[#8b5cf6]/20
                  hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-3 rounded-xl bg-[#1c2434] group-hover:bg-white/10 
                  transition-colors duration-300 mb-3">
                  <FaUserTie className="text-2xl text-[#8b5cf6] group-hover:text-white transition-colors" />
                </div>
                <span className="relative text-sm font-medium text-gray-300 group-hover:text-white 
                  transition-colors text-center">
                  Add Staff
                </span>
              </button>

              {/* Staff Schedule */}
              <button
                onClick={() => setShowForm4(hasClients ? false : true)}
                className="group relative flex flex-col items-center p-5 bg-gradient-to-br from-[#273142] to-[#1c2434] 
                  rounded-xl hover:from-[#f59e0b] hover:to-[#d97706] transition-all duration-300 
                  border border-gray-700 hover:border-[#f59e0b] hover:shadow-lg hover:shadow-[#f59e0b]/20
                  hover:-translate-y-1 cursor-pointer overflow-hidden"
                data-module="hr"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-3 rounded-xl bg-[#1c2434] group-hover:bg-white/10 
                  transition-colors duration-300 mb-3">
                  <FaCalendarAlt className="text-2xl text-[#f59e0b] group-hover:text-white transition-colors" />
                </div>
                <span className="relative text-sm font-medium text-gray-300 group-hover:text-white 
                  transition-colors text-center">
                  Staff Schedule
                </span>
              </button>
            </div>
          </div>

          <div>
            {/* Add Client Button */}

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0   bg-black/50  flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-8">
                  <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                    Add Resident
                  </h2>
                  <form onSubmit={handleSubmit} className="p-2">
                    <div className="mb-2">
                      <label
                        htmlFor="name"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="age"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        id="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="room"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Room Number
                      </label>
                      <input
                        type="text"
                        name="room"
                        id="room"
                        value={formData.room}
                        onChange={handleChange}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="careType"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Care Type
                      </label>
                      <select
                        name="careType"
                        id="careType"
                        value={formData.careType}
                        onChange={handleChange}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Care Type</option>
                        <option value="Residential">Residential</option>
                        <option value="Nursing">Nursing</option>
                        <option value="Memory Care">Memory Care</option>
                        <option value="Respite">Respite</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="admitDate"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Admission Date
                      </label>
                      <input
                        type="date"
                        name="admitDate"
                        id="admitDate"
                        value={formData.admitDate}
                        onChange={handleChange}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-700">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="bg-gray-700 cursor-pointer hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded mr-2"
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
                          "Add Resident"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal care plan form */}
            {showFormCare && (
              <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
                <div className="bg-gray-800 rounded-lg pt-4 shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                    {/* Care Planning */}
                    {"Add New Care Plan"}
                  </h2>
                  <form
                    id="add-care-plan-form"
                    className="p-4"
                    onSubmit={handleSubmitCare}
                    encType="multipart/form-data"
                  >
                    {/* Client ID */}
                    <div className="mb-4">
                      <label
                        htmlFor="clientId"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Patient
                      </label>
                      <select
                        id="client"
                        name="client"
                        value={formDataCare.client}
                        onChange={handleChangeCare}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Patient</option>
                        {staffMembers
                          .filter(
                            (client) =>
                              user?.role !== "Client" ||
                              user.clients.includes(client._id)
                          )
                          .map((client) => (
                            <option key={client._id} value={client._id}>
                              {client.fullName}
                            </option>
                          ))}
                      </select>
                      <input
                        type="hidden"
                        name="clientName"
                        id="clientName"
                        value={formDataCare.client.fullName}
                      />
                    </div>

                    {/* Plan Type */}
                    <div className="mb-4">
                      <label
                        htmlFor="planType"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Plan Type
                      </label>
                      <select
                        id="planType"
                        name="planType"
                        value={formDataCare.planType}
                        onChange={handleChangeCare}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Plan Type</option>
                        <option value="Nursing">Nursing</option>
                        <option value="Nutrition">Nutrition</option>
                        <option value="Mobility">Mobility</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Social">Social</option>
                        <option value="routine">Routine</option>
                        <option value="safety">Safety</option>
                        <option value="communication">Communication</option>
                      </select>
                    </div>

                    {/* Creation Date */}
                    <div className="mb-4">
                      <label
                        htmlFor="createDate"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Creation Date
                      </label>
                      <input
                        id="creationDate"
                        name="creationDate"
                        type="date"
                        value={formDataCare.creationDate}
                        onChange={handleChangeCare}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>

                    {/* Review Date */}
                    <div className="mb-4">
                      <label
                        htmlFor="reviewDate"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Review Date
                      </label>
                      <input
                        id="reviewDate"
                        name="reviewDate"
                        type="date"
                        value={formDataCare.reviewDate}
                        onChange={handleChangeCare}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="careSetting"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Care Setting / Service Type
                      </label>
                      <select
                        id="careSetting"
                        name="careSetting"
                        value={formDataCare.careSetting}
                        onChange={handleChangeCare}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Care Setting</option>
                        <option value="Residential Care">
                          Residential Care
                        </option>
                        <option value="Nursing Homes">Nursing Homes</option>
                        <option value="Learning Disabilities">
                          Learning Disabilities
                        </option>
                        <option value="Supported Living">
                          Supported Living
                        </option>
                        <option value="Mental Health Support">
                          Mental Health Support
                        </option>
                        <option value="Domiciliary Care">
                          Domiciliary Care Organisations
                        </option>
                        <option value="Other Services">Other Services</option>
                      </select>
                    </div>
                    {/* Details */}
                    <div className="mb-4">
                      <label
                        htmlFor="details"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Care Plan Details
                      </label>
                      <textarea
                        id="carePlanDetails"
                        name="carePlanDetails"
                        rows="4"
                        value={formDataCare.carePlanDetails}
                        onChange={handleChangeCare}
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      ></textarea>
                    </div>
                    {/* Care Setting */}

                    {/* Health & Wellbeing Recordings Section */}
                    <div className="mb-6 border-t border-gray-700 pt-4 ">
                      <h3 className="text-lg font-semibold text-gray-200 mb-4">
                        Health & Wellbeing Recordings
                      </h3>

                      {/* Bristol Stool Chart */}
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Bristol Stool Chart
                        </label>
                        <input
                          type="text"
                          name="bristolStoolChart"
                          value={formDataCare.bristolStoolChart}
                          onChange={handleChangeCare}
                          placeholder="Type or score..."
                          className="w-full px-3 py-2  rounded bg-gray-700 text-white"
                        />
                      </div>

                      {/* MUST Score */}
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          MUST Score
                        </label>
                        <input
                          type="text"
                          name="mustScore"
                          value={formDataCare.mustScore}
                          onChange={handleChangeCare}
                          placeholder="e.g., 0, 1, 2..."
                          className="w-full px-3 py-2  rounded bg-gray-700 text-white"
                        />
                      </div>

                      {/* Heart Rate */}
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Heart Rate (bpm)
                        </label>
                        <input
                          type="number"
                          name="heartRate"
                          value={formDataCare.heartRate}
                          onChange={handleChangeCare}
                          placeholder="e.g., 72"
                          className="w-full px-3 py-2  rounded bg-gray-700 text-white"
                        />
                      </div>

                      {/* Mood Tracker */}
                      <div className="mb-4">
                        <label className="block  text-gray-300 text-sm font-medium mb-2">
                          Mood Tracker
                        </label>
                        <select
                          name="mood"
                          value={formDataCare.mood}
                          onChange={handleChangeCare}
                          className="w-full px-3 py-2  rounded bg-gray-700 text-white"
                        >
                          <option value="">Select mood</option>
                          <option value="😊">😊 Happy</option>
                          <option value="😐">😐 Neutral</option>
                          <option value="😔">😔 Sad</option>
                          <option value="😡">😡 Angry</option>
                          <option value="😴">😴 Tired</option>
                        </select>
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
                      {/* Daily Log */}
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Daily Log
                        </label>
                        <textarea
                          name="dailyLog"
                          value={formDataCare.dailyLog}
                          onChange={handleChangeCare}
                          rows="3"
                          placeholder="Write log with timestamp and caregiver info..."
                          className="w-full px-3 py-2  rounded bg-gray-700 text-white"
                        />
                      </div>

                      {/* Attach File */}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end pt-4 border-t border-gray-700">
                      <button
                        type="button"
                        onClick={hansleCloseFormCare}
                        className="bg-gray-700 cursor-pointer hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded mr-2"
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
                          "Create Care Plan"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal incident */}
            {showModal2 && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
                <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-lg max-h-[90vh] overflow-y-auto">
                  <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                    Add Incident Report
                  </h2>
                  <form
                    id="add-incident-form"
                    className="p-4"
                    onSubmit={handleSubmit2}
                  >
                    {/* Client */}
                    <div className="mb-4">
                      <label
                        htmlFor="clientId"
                        className="block text-gray-300 text-sm font-medium mb-2"
                      >
                        Patient
                      </label>
                      <select
                        id="client"
                        name="client"
                        value={formData2.client}
                        onChange={handleChange2}
                        required
                        className="shadow-sm border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Patient</option>
                        {inci
                          .filter(
                            (client) =>
                              user?.role !== "Client" ||
                              user.clients.includes(client._id)
                          )
                          .map((client) => (
                            <option key={client._id} value={client._id}>
                              {client.fullName}
                            </option>
                          ))}
                      </select>
                      <input
                        type="hidden"
                        name="clientName"
                        id="clientName"
                        value={formData2.client.fullName}
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
                        <option value="Medication Error">
                          Medication Error
                        </option>
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

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300">
                        Staff Involved
                      </label>
                      <select
                        name="staffInvolved"
                        value={formData2.staffInvolved}
                        onChange={handleChange2}
                        required
                        className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
                      >
                        <option value="">Select Staff Member</option>
                        {staffMembers2.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.fullName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Attachments */}
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Attach Photo/Document
                      </label>
                      <input
                        type="file"
                        name="attachments"
                        onChange={handleFileChangeincident}
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
                        ) : (
                          "Report Incident"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Form add staf */}
            {showModal3 && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-auto p-4">
                <form
                  onSubmit={handleSubmitStaff}
                  className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto"
                >
                  <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                    Add Staff Member
                  </h2>
                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData3.name}
                      onChange={handleChange3}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData3.email}
                      onChange={handleChange3}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>

                  {/* Position */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Position
                    </label>
                    <input
                      name="position"
                      type="text"
                      value={formData3.position}
                      onChange={handleChange3}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600  text-gray-300 focus:outline-none"
                    />
                  </div>

                  {/* Department */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData3.department}
                      onChange={handleChange3}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600  text-gray-300 focus:outline-none"
                    >
                      <option value="">Select Department</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Care">Care</option>
                      <option value="Administration">Administration</option>
                      <option value="Management">Management</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                  {/* Care Setting / Service Type */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Care Setting / Service Type
                    </label>
                    <select
                      name="careSetting"
                      value={formData3.careSetting}
                      onChange={handleChange3}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    >
                      <option value="">Select Care Setting</option>
                      <option value="Residential Care">Residential Care</option>
                      <option value="Nursing Homes">Nursing Homes</option>
                      <option value="Learning Disabilities">
                        Learning Disabilities
                      </option>
                      <option value="Supported Living">Supported Living</option>
                      <option value="Mental Health Support">
                        Mental Health Support
                      </option>
                      <option value="Domiciliary Care">Domiciliary Care</option>
                      <option value="Other Services">Other Services</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Start Date
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      value={formData3.startDate}
                      onChange={handleChange3}
                      required
                      className="shadow-sm border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-gray-300 focus:outline-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={handleCancel10}
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
                      ) : (
                        "Add Member"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* training----------------------------------------------------------------------------- */}

            {showForm4 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4">
                <form
                  onSubmit={handleSubmit4}
                  className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto"
                >
                  <h2 className="text-center text-white font-semibold mb-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl">
                    Add Training Record
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
                      {staffMembers2.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Training Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Training Type
                    </label>
                    <select
                      name="trainingType"
                      value={formData4.trainingType}
                      onChange={handleChange4}
                      required
                      className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
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

                  {/* Suggested Trainings Section */}
                  {recommendedTrainings.length > 0 && (
                    <div className="mt-2 text-sm text-gray-300 bg-gray-700 p-3 rounded mb-4">
                      <p className="font-medium text-primary-light mb-1">
                        Recommended Trainings for this Care Setting:
                      </p>
                      <ul className="list-disc list-inside text-green-400">
                        {recommendedTrainings.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Completion Date */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium  text-gray-300">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      name="completionDate"
                      value={formData4.completionDate}
                      onChange={handleChange4}
                      required
                      className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Expiry Date
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
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Attach Photo/Document
                    </label>
                    <input
                      type="file"
                      name="attachments"
                      onChange={handleFileChangeTraining}
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
                      ) : (
                        "Add Record"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
            {/* Facility Occupancy */}
            <div className="bg-[#1c2434] p-6 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#4a48d4]"></span>
                Facility Occupancy
              </h3>

              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#136EFF]">
                    {occupancyPercentage}%
                  </p>
                  <p className="text-sm text-gray-400">Current Occupancy</p>
                </div>
                <div className="w-32 h-32">
                  <OccupancyChart occupancyPercentage={occupancyPercentage} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[#273142] rounded-lg shadow-inner">
                  <p className="text-2xl font-semibold text-white">
                    {occupiedRooms0}
                  </p>
                  <p className="text-xs text-gray-400">Occupied Rooms</p>
                </div>
                <div className="text-center p-3 bg-[#273142] rounded-lg shadow-inner">
                  <p className="text-2xl font-semibold text-white">
                    {availableRooms}
                  </p>
                  <p className="text-xs text-gray-400">Available Rooms</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1c2434] p-4 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#4a48d4]"></span>
                Incident Overview
              </h3>

              {/* Top Summary */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#4a48d4]">{sixmont}</p>
                  <p className="text-sm text-gray-400">
                    Incidents (Last 6 Months)
                  </p>
                </div>

                <div className="w-32 h-32">
                  <IncidentChart
                    open={open}
                    underInvestigation={underInvestigation}
                    resolved={resolved}
                  />
                </div>
              </div>

              {/* Incident Stats Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
                {/* Open */}
                <div className="text-center p-2 sm:p-3 bg-[#273142] rounded-lg shadow-inner border border-gray-700 hover:border-[#4a48d4]/50 transition">
                  <p className="text-lg sm:text-2xl font-semibold text-[#4a48d4]">
                    {open}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                    Open
                  </p>
                </div>

                {/* Under Investigation */}
                <div className="text-center p-2 sm:p-3 bg-[#273142] rounded-lg shadow-inner border border-gray-700 hover:border-[#facc15]/50 transition">
                  <p className="text-lg sm:text-2xl font-semibold text-[#facc15]">
                    {underInvestigation}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 leading-tight">
                    Under{" "}
                    <span className="block sm:inline text-[10px] sm:text-xs text-gray-400">
                      Investigation
                    </span>
                  </p>
                </div>

                {/* Resolved */}
                <div className="text-center p-2 sm:p-3 bg-[#273142] rounded-lg shadow-inner border border-gray-700 hover:border-[#22c55e]/50 transition">
                  <p className="text-lg sm:text-2xl font-semibold text-[#22c55e]">
                    {resolved}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                    Resolved
                  </p>
                </div>
              </div>
              {/* Footer */}
              <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
                <span>
                  Updated:{" "}
                  <span className="text-[#4a48d4] font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </span>
                <a
                  href="/Incident-Reports"
                  className="text-[#4a48d4] hover:text-[#6a6dfc] font-medium transition"
                >
                  View Details →
                </a>
              </div>
            </div>

            <div className="bg-[#1c2434] p-4 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#4a48d4]"></span>
                Training Overview
              </h3>

              {/* Summary Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#4a48d4]">
                    {percentage}%
                  </p>
                  <p className="text-sm text-gray-400">Up to Date Completion</p>
                </div>

                <div className="w-32 h-32">
                  <canvas id="trainingChart" width="120" height="120"></canvas>
                </div>
              </div>

              {/* Stats Boxes */}
              <div className="grid grid-cols-3 gap-4">
                {/* Up to Date */}
                <div className="text-center p-3 bg-[#273142] rounded-lg shadow-inner border border-gray-700 hover:border-green-500/50 transition">
                  <p className="text-2xl font-semibold text-green-400">
                    {trainingStats.upToDate}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Up to Date</p>
                </div>

                {/* Expiring Soon */}
                <div className="text-center p-3 bg-[#273142] rounded-lg shadow-inner border border-gray-700 hover:border-yellow-400/50 transition">
                  <p className="text-2xl font-semibold text-yellow-300">
                    {trainingStats.expiringSoon}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Expiring Soon</p>
                </div>

                {/* Expired */}
                <div className="text-center p-3 bg-[#273142] rounded-lg shadow-inner border border-gray-700 hover:border-red-400/50 transition">
                  <p className="text-2xl font-semibold text-red-400">
                    {trainingStats.expired}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Expired</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
                <span>
                  Updated:{" "}
                  <span className="text-[#4a48d4] font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </span>
                <a
                  href="/Training"
                  className="text-[#4a48d4] hover:text-[#6a6dfc] font-medium transition"
                >
                  View Details →
                </a>
              </div>
            </div>
          </div>

          {/* Core Modules///////////// */}
          <div>
            <h3 className="text-xl font-semibold text-gray-200 my-6">
              Core Modules
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Client Management */}
              <Link href="/Client-Management">
                <div
                  className=" bg-[#1c2434] p-6 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300 cursor-pointer"
                  data-module="client"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg">
                      <FaUser className="text-lg text-primary-light text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-200">
                        Resident Management
                      </h3>
                      <p className="text-sm text-gray-400">
                        Manage Resident records
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
              {/* Care Planning */}
              <Link href="/Care-Planning">
                <div
                  className="bg-[#1c2434] p-6 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300 cursor-pointer"
                  data-module="care"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg">
                      <FaClipboardList className="text-lg text-primary-light text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-200">
                        Care Planning
                      </h3>
                      <p className="text-sm text-gray-400">
                        Create and manage care plans
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Incident Reports */}
              <Link href="/Incident-Reports">
                <div
                  className=" bg-[#1c2434] p-6 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300 cursor-pointer"
                  data-module="incident"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg">
                      <FaExclamationTriangle className="text-lg text-primary-light text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-200">
                        Incident Reports
                      </h3>
                      <p className="text-sm text-gray-400">
                        Record and track incidents
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
              {!hasClients && (
                <Link href="/HR-Management">
                  {/* HR Management */}
                  <div
                    className="bg-[#1c2434] p-6 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300 cursor-pointer"
                    data-module="hr"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg">
                        <FaUsers className="text-lg text-primary-light text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-200">
                          HR Management
                        </h3>
                        <p className="text-sm text-gray-400">
                          Manage staff and schedules
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
              {/* Training */}
              {!hasClients && (
                <Link href="Training">
                  <div
                    className="bg-[#1c2434] p-6 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300 cursor-pointer"
                    data-module="training"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg">
                        <FaGraduationCap className="text-lg text-primary-light text-white" />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-lg font-semibold text-gray-200">
                          Training
                        </h3>
                        <p className="text-sm text-gray-400">
                          Track staff training and certifications
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
              {/* Compliance */}
              {!hasClients && (
                <Link href="Compliance">
                  <div
                    className=" bg-[#1c2434] p-6 rounded-xl shadow-lg border border-gray-700 hover:border-[#4a48d4] transition-colors duration-300 cursor-pointer"
                    data-module="compliance"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg">
                        <FaShieldAlt className="text-lg text-primary-light text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-200">
                          Compliance
                        </h3>
                        <p className="text-sm text-gray-400">
                          Monitor regulatory compliance
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
