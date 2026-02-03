"use client";
import React, { useCallback, useEffect, useState } from "react";
import { FaEye, FaTrashAlt, FaDownload } from "react-icons/fa";
import { MdOutlineSchool } from "react-icons/md";
import { BsArrowsFullscreen } from "react-icons/bs";
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
  // FaEdit,
  // FaTrash,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
const StafProfilesPerformance  = ({performanceId, id}) => {
  console.log("performanceId props:", performanceId[0]._id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
const [performanceData, setPerformanceData] = useState(performanceId || []);
  const [filteredPerformance, setFilteredPerformance] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState("All Records");
    const { hasLowStock, setHasLowStock } = useAuth();
    const { hasReviews, setHasReviews } = useAuth();
  
  const filters = ["All Records", "Upcoming", "Overdue"];
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    staff: '',
    supervisions: '',
    appraisals: '',
    objectivesKpi: '',
    feedbackNotes: '',
    appraisalReminderDate: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewData, setViewData] = useState({});
  const [staffMembers,setStaffMembers] = useState()
  
  const handleEdit = (item) => {
    setFormData({
      staff: item.staff?._id || '',
      supervisions: item.supervisions,
      appraisals: item.appraisals,
      objectivesKpi: item.objectivesKpi,
      feedbackNotes: item.feedbackNotes,
      appraisalReminderDate: item.appraisalReminderDate.slice(0, 10),
    });
    setShowModal(true);
    setEditingId(item._id);
  };
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!id) return;

  fetch(`https://admin-panel-backend-alpha.vercel.app/performance/staff/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setPerformanceData(data)) // array of objects
    .catch(err => console.log(err));
}, [id]);

  
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      staff: '',
      supervisions: '',
      appraisals: '',
      objectivesKpi: '',
      feedbackNotes: '',
      appraisalReminderDate: ''
    });
    setEditingId(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form is submitting..."); // ✅ DEBUG line
    setLoading(true);
  
    const token = localStorage.getItem("token");
    if (!token) return setError("Unauthorized");
  
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = { ...formData };
    console.log("Payload:", payload); // ✅ DEBUG payload
  
    const request = editingId
      ? axios.put(`https://admin-panel-backend-alpha.vercel.app/performance/${editingId}`, payload, config)
      : axios.post(`https://admin-panel-backend-alpha.vercel.app/performance`, payload, config);
  
    request
      .then(res => {
        console.log("Success:", res.data); // ✅ DEBUG response
        setMessage(editingId ? "Updated" : "Added");
        setEditingId(null);
        setShowForm(false);
        toast.success(editingId ? "Record updated successfully" : "Record added successfully");
        setShowModal(false); // ✅ Close modal
        fetchPerformance();
        setFormData({
          staff: '',
          supervisions: '',
          appraisals: '',
          objectivesKpi: '',
          feedbackNotes: '',
          appraisalReminderDate: ''
        });
        return axios.get("https://admin-panel-backend-alpha.vercel.app/performance", config)
          .then(res => {
            setPerformanceData(performanceId);
            setFilteredPerformance(performanceId);
          });
  
      })
      .catch(err => {
        console.error("Error:", err.response?.data); // ✅ Better error logging
        setError(err.response?.data?.error || "Failed");
      })
      .finally(() => setLoading(false));
  };
  
useEffect(() => {
  fetchPerformance();
}, [fetchPerformance]);


  const fetchPerformance = useCallback(async () => {
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const res = await axios.get(`https://admin-panel-backend-alpha.vercel.app/performance/staff/${id}`, config);
    setPerformanceData(res.data); // <-- use fresh data from server
    setFilteredPerformance(res.data);
  } catch (err) {
    setError("Could not fetch data");
  }
}, [id]);
  const handleDelete = async (id) => {
    if (!window.confirm("Confirm delete?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://admin-panel-backend-alpha.vercel.app/performance/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Record deleted successfully");
      fetchPerformance();
    } catch (err) {
      toast.error("Delete failed");
      setError("Delete failed");
    }
  };
  

useEffect(() => {
  let filtered = [...performanceData]; // always use current state

  if (selected !== "All Records") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter(item => {
      const reminder = new Date(item.appraisalReminderDate);
      reminder.setHours(0, 0, 0, 0);
      if (selected === "Upcoming") return reminder > today;
      if (selected === "Overdue") return reminder <= today;
      return true;
    });
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      item.supervisions.toLowerCase().includes(q) ||
      item.appraisals.toLowerCase().includes(q) ||
      item.objectivesKpi.toLowerCase().includes(q) ||
      item.feedbackNotes.toLowerCase().includes(q)
    );
  }

  setFilteredPerformance(filtered);
}, [searchQuery, selected, performanceData]);

   useEffect(() => {
    const token = localStorage.getItem("token");
  
    axios
      .get(`https://admin-panel-backend-alpha.vercel.app/hr/${id}`, {
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
  }, [id]);
  
  
  
  // useEffect(() => {
  //   console.log("Reminder interval started");
  
  //   const token = localStorage.getItem("token");
  
  //   const checkReminders = async () => {
  //     try {
  //       const res = await axios.get("https://admin-panel-backend-alpha.vercel.app/performance/reminders/due", {
  //         headers: { Authorization: `Bearer ${token}` }
  //       });
  
  //       const dueReminders = res.data?.data || [];
  
  //       if (dueReminders.length > 0) {
  //         const names = dueReminders
  //           .map(item => item.staff?.fullName)
  //           .filter(Boolean)
  //           .join(", ");
  
  //         toast.info(`🔔 Reminder due for: ${names}`, {
  //           toastId: "reminder-toast" // ✅ No duplicates
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Reminder check failed:", error?.response?.data || error.message);
  //     }
  //   };
  
  //   checkReminders(); // Run once on mount
  
  //   const interval = setInterval(checkReminders, 5 * 60 * 1000);
  
  //   return () => clearInterval(interval); // Clean up
  // }, []);
   // Dependencies to re-run effect
  // viewData
  // staff: '',
  //   supervisions: '',
  //   appraisals: '',
  //   objectivesKpi: '',
  //   feedbackNotes: '',
  //   appraisalReminderDate
  const [viewsupervisions, setViewSupervisions] = useState('');
  const [viewappraisals, setViewAppraisals] = useState('');
  const [viewobjectivesKpi, setViewObjectivesKpi] = useState('');
  const [viewfeedbackNotes, setViewFeedbackNotes] = useState(''); 
  const [viewappraisalReminderDate, setViewAppraisalReminderDate] = useState('');
  const  [viewstaff, setViewStaff] = useState(null);
  const [showModals, setShowModals] = useState(false);
  
  const handleView = (item) => {
    setViewSupervisions(item.supervisions);
    setViewAppraisals(item.appraisals);
    setViewObjectivesKpi(item.objectivesKpi);
    setViewFeedbackNotes(item.feedbackNotes);
    setViewAppraisalReminderDate(item.appraisalReminderDate.slice(0, 10));
    setViewStaff(item.staff.fullName);
    setShowModals(true);
  
  };
  
  
  const data = {
    supervisions: viewsupervisions,
    appraisals: viewappraisals,
    objectivesKpi: viewobjectivesKpi,
    feedbackNotes: viewfeedbackNotes,
    appraisalReminderDate: viewappraisalReminderDate,
    staff: viewstaff,
  };
  
  
  
   const [openMenu, setOpenMenu] = useState(false);
  
    // 📄 PDF Download
    const handleDownloadPdf = async (item) => {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
  
      const staffName = item.staff?.fullName || "Unknown Staff";
  
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Staff Appraisal Details", 14, 15);
  
      autoTable(doc, {
        startY: 25,
        head: [["Field", "Value"]],
        body: [
          ["Staff", staffName],
          ["Supervisions", item.supervisions || "N/A"],
          ["Appraisals", item.appraisals || "N/A"],
          ["Objectives / KPIs", item.objectivesKpi || "N/A"],
          ["Feedback Notes", item.feedbackNotes || "N/A"],
          [
            "Scheduled Appraisals Reminder",
            item.appraisalReminderDate ? item.appraisalReminderDate.slice(0, 10) : "Not Set",
          ],
        ],
      });
  
      doc.save(`${staffName}_appraisal.pdf`);
    };
  
    // 📊 CSV Download (same style as PDF)
    const handleDownloadCsv = (item) => {
      const staffName = item.staff?.fullName || "Unknown Staff";
  
      const headers = ["Field,Value"];
      const rows = [
        `Staff,${staffName}`,
        `Supervisions,${item.supervisions || "N/A"}`,
        `Appraisals,${item.appraisals || "N/A"}`,
        `Objectives / KPIs,${item.objectivesKpi || "N/A"}`,
        `Feedback Notes,${item.feedbackNotes || "N/A"}`,
        `Scheduled Appraisals Reminder,${
          item.appraisalReminderDate ? item.appraisalReminderDate.slice(0, 10) : "Not Set"
        }`,
      ];
  
      const csvContent = [...headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${staffName}_appraisal.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  


  
  
  
  
  
  
const EditableField = ({ label, dbField, value: initialValue, performanceId, onUpdate }) => {
  const [value, setValue] = useState(initialValue || "");
  const [isEditing, setIsEditing] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleSave = async () => {
    try {
      const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/performance/${performanceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [dbField]: value })
      });

      const data = await res.json();
      console.log("Saved:", data);

      // Update parent state for live UI
      if (onUpdate) onUpdate(value);

      setIsEditing(false);
      toast.success(`${label} updated successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  return (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="block text-sm text-gray-400">{label}</label>
      <button
        className={`text-xs px-2 py-0.5 rounded text-white ${isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
        onClick={async () => {
          if (isEditing) {
            await handleSave();
          } else {
            setIsEditing(true);
          }
        }}
      >
        {isEditing ? "Save" : "Edit"}
      </button>
    </div>

    {isEditing ? (
      <input
        type="text"
        className="w-full bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    ) : (
      <div className="bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white">
        {value || "N/A"}
      </div>
    )}
  </div>

  );
};

  return (
    <div className="bg-[#243041] rounded-lg shadow p-3 sm:p-4 md:p-6 mb-6 h-full overflow-y-auto">
      <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold mb-4 text-white">
        Performance Management & Absence
      </h2>
     <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
  {performanceData[0] && (
  <>
    <EditableField
  label="Holiday Allowance"
  dbField="holidayAllowance"
  value={performanceData[0].holidayAllowance}
  performanceId={performanceData[0]._id}
  onUpdate={(v) =>
    setPerformanceData(prev => 
      prev.map(item => 
        item._id === performanceData[0]._id ? { ...item, holidayAllowance: v } : item
      )
    )
  }
/>

<EditableField
  label="Days Remaining"
  dbField="daysRemaining"
  value={performanceData[0].daysRemaining}
  performanceId={performanceData[0]._id}
  onUpdate={(v) =>
    setPerformanceData(prev => 
      prev.map(item => 
        item._id === performanceData[0]._id ? { ...item, daysRemaining: v } : item
      )
    )
  }
/>

<EditableField
  label="Next Appraisal Due"
  dbField="nextAppraisalDue"
  value={performanceData[0].nextAppraisalDue?.slice(0, 10)}
  performanceId={performanceData[0]._id}
  onUpdate={(v) =>
    setPerformanceData(prev => 
      prev.map(item => 
        item._id === performanceData[0]._id ? { ...item, nextAppraisalDue: v } : item
      )
    )
  }
/>

<EditableField
  label="Probation End Date"
  dbField="probationEndDate"
  value={performanceData[0].probationEndDate?.slice(0, 10)}
  performanceId={performanceData[0]._id}
  onUpdate={(v) =>
    setPerformanceData(prev => 
      prev.map(item => 
        item._id === performanceData[0]._id ? { ...item, probationEndDate: v } : item
      )
    )
  }
/>

  </>
)}

</div>
<div className="bg-[#111827] min-h-screen">
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
          Performance Management
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

           
          </div>
        </div>
      )}

      <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold mb-4 text-white">
        Supervisions & Appraisals History
      </h2>

      <main className="flex-1 h-auto overflow-hidden">
        <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 md:p-6 mb-8 h-auto overflow-y-auto pr-2 my-scroll">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
            <div></div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowModal(true)}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[800px] md:min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  {[
                    "Staff Name",
                    "Supervisions",
                    "Appraisals",
                    "Objectives / KPIs",
                    "Scheduled Reminder",
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
              <tbody className="bg-gray-800 divide-y text-gray-300 divide-gray-700">
                {filteredPerformance.map((staff) => (
                  <tr key={staff._id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {staff.staff?.fullName}
                    </td>
                    <td className="px-4 py-4">{staff.supervisions}</td>
                    <td className="px-4 py-4">{staff.appraisals}</td>
                    <td className="px-4 py-4">{staff.objectivesKpi}</td>
                    <td className="px-4 py-4">
                      {staff.appraisalReminderDate
                        ? staff.appraisalReminderDate.slice(0, 10)
                        : ""}
                    </td>
                    <td className="px-4 py-4 flex gap-3 relative">
                      {/* Action Buttons */}
                      <FaEye
                        className="cursor-pointer hover:text-blue-500"
                        onClick={() => handleView(staff)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPerformance.length === 0 && (
              <p className="text-center py-10 text-gray-400">
                No records found.
              </p>
            )}
          </div>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-lg p-5 shadow-lg max-h-[90vh] overflow-y-auto relative">
              <form onSubmit={handleSubmit} className="p-4 ">
                {/* Staff Name */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Staff Member
                  </label>
                  <select
                    name="staff"
                    value={formData.staff}
                    onChange={handleChange}
                    required
                    className="w-full rounded border py-2 px-3 bg-gray-700 text-gray-300 border-gray-600"
                  >
                    <option value="">Select Staff Member</option>
                    {staffMembers &&
                      staffMembers.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.fullName}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Supervisions */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Supervisions
                  </label>
                  <input
                    type="text"
                    name="supervisions"
                    value={formData.supervisions}
                    onChange={handleChange}
                    placeholder="e.g. 2 per month"
                    className="w-full bg-gray-700 text-white rounded p-2 mb-2"
                  />
                </div>

                {/* Scheduled Appraisals Reminder */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Scheduled Appraisals Reminder
                  </label>
                  <input
                    type="date"
                    name="appraisalReminderDate"
                    value={formData.appraisalReminderDate || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded p-2 mb-2"
                  />
                </div>

                {/* Appraisals */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Appraisals
                  </label>
                  <input
                    type="text"
                    name="appraisals"
                    value={formData.appraisals}
                    onChange={handleChange}
                    placeholder="e.g. Quarterly"
                    className="w-full bg-gray-700 text-white rounded p-2 mb-2"
                  />
                </div>

                {/* KPIs */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Objectives / KPIs
                  </label>
                  <input
                    type="text"
                    name="objectivesKpi"
                    value={formData.objectivesKpi}
                    onChange={handleChange}
                    placeholder="Enter objectives or KPIs"
                    className="w-full bg-gray-700 text-white rounded p-2 mb-2"
                  />
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Feedback Notes
                  </label>
                  <textarea
                    name="feedbackNotes"
                    value={formData.feedbackNotes}
                    onChange={handleChange}
                    placeholder="Write feedback notes here..."
                    rows="3"
                    className="w-full bg-gray-700 text-white rounded p-2"
                  ></textarea>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-500 cursor-pointer text-white px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 cursor-pointer text-white px-4 py-2 rounded"
                  >
                    Add Record
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

export default StafProfilesPerformance ;
