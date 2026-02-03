"use client";

import React, { useState ,useEffect} from "react";
import axios from "axios";
import Image from "next/image";
import { FaPlus, FaTrash, FaEye, FaDownload, FaTimes, FaArchive } from "react-icons/fa";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Optional for table format
const initialFormData = {
  preparedBy: "MDS IT SUPPORT (Current User)",
  currentAbility: "",
  careAims: "",
  supportSteps: "",
  medicalDetails: "",
  sleepRoutine: "",
  dateCreated: "",
  nextReviewDate: "",
  notes: "",
  frequency: "",
  assistanceLevel: "",
  dietType: "",
};

const ResidentProfileCarePlan = React.forwardRef(({ clientId }, ref) => {
ResidentProfileCarePlan.displayName = "ResidentProfileCarePlan";

  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plans, setPlans] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [viewPlan, setViewPlan] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedPlans, setArchivedPlans] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingView, setIsEditingView] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleView = (plan) => {
    setViewPlan(plan);
    setIsEditingView(false);

    // Keep selected plan in sync so edits include planType
    setSelectedPlan(plan.planType || "");

    setFormData({
      ...initialFormData,
      ...plan.carePlanData,
    });

    setAttachments(plan.attachments || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();

      // Append all formData as carePlanData
      const carePlanData = { ...formData };
      for (let key in carePlanData) {
        if (carePlanData[key] !== undefined && carePlanData[key] !== null) {
          fd.append(`carePlanData[${key}]`, carePlanData[key]);
        }
      }

      // IMPORTANT: include required top-level fields the backend expects
      // client (from prop), planType (from selectedPlan), and top-level dates
      if (clientId) fd.append("client", clientId);
      const planTypeValue = selectedPlan || formData.planType;
      if (planTypeValue) fd.append("planType", planTypeValue);
      if (formData.dateCreated) fd.append("creationDate", formData.dateCreated);
      if (formData.nextReviewDate) fd.append("reviewDate", formData.nextReviewDate);

      // Attachments
      attachments.forEach((att) => {
        if (typeof att !== "string") fd.append("attachments", att);
      });

      let res;
      if (editingPlanId) {
        res = await axios.put(
          `https://admin-panel-backend-alpha.vercel.app/carePlanning/${editingPlanId}`,
          fd,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlans((prev) =>
          prev.map((p) =>
            p._id === editingPlanId ? res.data : p
          )
        );
      } else {
        res = await axios.post(
          "https://admin-panel-backend-alpha.vercel.app/carePlanning",
          fd,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlans((prev) => [res.data, ...prev]);
      }

      // Reset form
      setShowForm(false);
      setEditingPlanId(null);
      setFormData(initialFormData);
      setAttachments([]);
    } catch (err) {
      console.error(err);
      alert("Failed to save care plan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Modal Edit from View
  const handleEditFromView = () => setIsEditingView(true);

  const handleUpdateFromView = async () => {
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();

      const carePlanData = { ...formData };
      for (let key in carePlanData) {
        fd.append(`carePlanData[${key}]`, carePlanData[key]);
      }

      attachments.forEach((att) => {
        if (typeof att === "string") fd.append("oldAttachments", att);
        else fd.append("attachments", att);
      });

      // Ensure required top-level fields are included for updates
      if (viewPlan?.client) fd.append("client", viewPlan.client._id || viewPlan.client);
      const planTypeVal = selectedPlan || viewPlan?.planType || formData.planType;
      if (planTypeVal) fd.append("planType", planTypeVal);
      if (formData.dateCreated) fd.append("creationDate", formData.dateCreated);
      if (formData.nextReviewDate) fd.append("reviewDate", formData.nextReviewDate);

      const res = await axios.put(
        `https://admin-panel-backend-alpha.vercel.app/carePlanning/${viewPlan._id}`,
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPlans((prev) =>
        prev.map((p) => (p._id === res.data._id ? res.data : p))
      );
      setViewPlan(res.data);
      setIsEditingView(false);
      alert("Care Plan Updated Successfully");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

const planTypes = [
    "Personal Hygiene Care Plan",
    "Moving and Handling Care Plan",
    "Nutrition and Hydration Plan",
    "Mental Health Care Plan",
    "Oral Care Plan",
    "Health Care Plan",
    "Continence Care Plan",
    "Sleeping Care Plan",
  ];


  // Use the local state `selectedPlan` and `plans` (fallbacks) for filtering.
  // The previous code referenced `selected` and `carePlans` which are not defined
  // in this component and caused a reference error.
  const _plans = Array.isArray(plans) ? plans : [];
  // Filter plans by the selected plan type (previously compared against `status` which hid items)
  const filteredData =
    selectedPlan === "All" || selectedPlan === ""
      ? _plans
      : _plans.filter((item) => item.planType === selectedPlan);



  const handleDownloadPdf = async (item) => {
    console.log('ResidentProfileCarePlan: download PDF requested for', item?._id || item?.id, 'attachments:', item?.attachments);
  const jsPDF = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();

  const patientName = item.client?.fullName || item.fullName || "Unknown";
  const moodMap = { "😊":"Happy","😐":"Neutral","😔":"Sad","😡":"Angry","😴":"Tired" };
  const moodText = moodMap[item.mood] || "";

  doc.setFontSize(16);
  doc.text("Care Plan Details", 14, 15);

  // Build main rows only from fields that are actually visible in the View modal
  const mainRows = [];
  if (item.client?.fullName || item.fullName) mainRows.push(["Patient", item.client?.fullName || item.fullName]);
  if (item.planType) mainRows.push(["Plan Type", item.planType]);
  if (item.creationDate) mainRows.push(["Creation Date", item.creationDate?.slice(0,10)]);
  if (item.reviewDate) mainRows.push(["Review Date", item.reviewDate?.slice(0,10)]);
  if (item.carePlanDetails) mainRows.push(["Care Plan Details", item.carePlanDetails]);
  if (item.bristolStoolChart) mainRows.push(["Bristol Stool Chart", item.bristolStoolChart]);
  if (item.mustScore) mainRows.push(["MUST Score", item.mustScore]);
  if (item.heartRate) mainRows.push(["Heart Rate", item.heartRate]);
  if (moodText) mainRows.push(["Mood", moodText]);
  if (item.dailyLog) mainRows.push(["Daily Log", item.dailyLog]);
  if (item.status) mainRows.push(["Status", item.status]);
  if (item.careSetting) mainRows.push(["Care Setting", item.careSetting]);

  if (mainRows.length) {
    autoTable(doc, {
      startY: 25,
      head: [["Field", "Value"]],
      body: mainRows,
    });
  }
  // Track current Y position after the initial table so subsequent content is placed correctly
  let currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 35;

  // Include nested carePlanData fields (if present) using same visibility rules as view modal
  if (item.carePlanData && typeof item.carePlanData === 'object') {
    const careRows = Object.entries(item.carePlanData)
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        if (/date/i.test(k)) return [label, (new Date(v)).toLocaleDateString()];
        return [label, typeof v === 'object' ? JSON.stringify(v) : String(v)];
      });

    if (careRows.length) {
      autoTable(doc, {
        startY: currentY,
        head: [["Care Plan Field", "Value"]],
        body: careRows,
      });
      currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : currentY + 8;
    }
  }


  // Decline Reason
  if(item.status==="Declined" && item.declineReason){
    doc.setFontSize(12);
    doc.setTextColor(200,0,0);
    doc.text("Decline Reason:",14,currentY);
    doc.setTextColor(0,0,0);
    doc.text(item.declineReason,14,currentY+6);
    currentY+=14;
  }

  // Signature
  if(item.status==="Accepted" && item.signature){
    try{
      const res = await fetch(item.signature);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function(){
        doc.addImage(reader.result,"PNG",14,currentY,60,20);
        currentY += 30;
        addAttachments();
      }
    } catch{ doc.text("Signature not loaded",14,currentY); currentY+=15; addAttachments(); }
  } else addAttachments();

  // Attachments
  async function addAttachments(){
    if(!item.attachments?.length){
      doc.save(`${patientName}_careplan.pdf`);
      return;
    }

    doc.setFontSize(12);
    doc.text("Attachments:",14,currentY);
    currentY+=6;

    for (let att of item.attachments || []) {
      const url = typeof att === 'string' ? att : (att?.secure_url || att?.url || att?.path || '');
      if (!url) continue;
      const cleanUrl = url.split('?')[0];
      const ext = cleanUrl.includes('.') ? cleanUrl.split('.').pop().toLowerCase() : '';

      // Image (by extension first, but we also check blob MIME type when available)
      if (["jpg","jpeg","png","webp"].includes(ext)) {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          await new Promise(resolve => {
            reader.onloadend = function () {
              try {
                if (currentY + 60 > 280) { doc.addPage(); currentY = 20; }

                // Choose image format for jsPDF based on MIME or extension
                let imgFormat = "JPEG";
                if (blob.type === "image/png" || ext === "png") imgFormat = "PNG";
                // some browsers/servers return webp; jsPDF may not support webp - fallback to JPEG
                if (blob.type === "image/webp" || ext === "webp") imgFormat = "JPEG";

                doc.addImage(reader.result, imgFormat, 14, currentY, 50, 50);
                currentY += 60;
              } catch (e) {
                console.warn('addImage failed for', url, e);
                const iconUrl = ["pdf","doc","docx"].includes(ext)
                  ? "https://cdn-icons-png.flaticon.com/512/337/337946.png"
                  : "https://cdn-icons-png.flaticon.com/512/727/727245.png";
                // fallback: show icon + link
                (async () => { await addIcon(url, iconUrl, 20, 20); })();
              }
              resolve();
            };
          });
        } catch (e) {
          console.warn('Failed to fetch/embed image', url, e);
          const iconUrl = ["pdf","doc","docx"].includes(ext)
            ? "https://cdn-icons-png.flaticon.com/512/337/337946.png"
            : "https://cdn-icons-png.flaticon.com/512/727/727245.png";
          await addIcon(url, iconUrl, 20, 20);
        }
      }
      // Video / PDF / other
      else {
        const iconUrl = ["pdf","doc","docx"].includes(ext)
          ? "https://cdn-icons-png.flaticon.com/512/337/337946.png"
          : "https://cdn-icons-png.flaticon.com/512/727/727245.png"; // video/file icon
        await addIcon(url, iconUrl, 20, 20);
      }
    }
    doc.save(`${patientName}_careplan.pdf`);
  }

  async function addIcon(url,iconUrl,width,height){
    try{
      const res = await fetch(iconUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise(resolve=>{
        reader.onloadend=function(){
          if(currentY+height+4>280){ doc.addPage(); currentY=20; }
          doc.addImage(reader.result,"PNG",14,currentY,width,height);
          doc.link(14,currentY,width,height,{url});
          currentY+=height+6;
          resolve();
        }
      });
    }catch(e){
      console.warn('Failed to fetch icon', iconUrl, e);
      if(currentY+6>280){ doc.addPage(); currentY=20; }
      doc.text(url,14,currentY);
      doc.link(14,currentY,100,6,{url});
      currentY+=10;
    }
  }
}
  


const handleDelete = async (id) => {
  const token = localStorage.getItem("token");

  await fetch(`https://admin-panel-backend-alpha.vercel.app/carePlanning/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  setPlans(prev => prev.filter(plan => plan._id !== id));
};


  useEffect(() => {
  if (!clientId) return;

  const token = localStorage.getItem("token");

  fetch(`https://admin-panel-backend-alpha.vercel.app/carePlanning/client/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setPlans(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Care Plan Fetch Error:", err);
      setPlans([]);
      setLoading(false);
    });
}, [clientId]);

// Fetch archived (older-than-six-months) plans for this client when requested
useEffect(() => {
  if (!showArchived || !clientId) return;

  const token = localStorage.getItem("token");

  const fetchArchived = async () => {
    try {
      // Prefer client-specific endpoint if backend provides it, otherwise fallback to general endpoint and filter
      const url = `https://admin-panel-backend-alpha.vercel.app/carePlanning/older-than-six-months/client/${clientId}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      // Expect { plans } or an array directly depending on backend
      const data = res.data.plans || res.data;
      setArchivedPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to fetch archived care plans, trying fallback...", err.message);
      try {
        // Fallback: fetch general older-than-six-months and filter by client
        const res2 = await axios.get("https://admin-panel-backend-alpha.vercel.app/carePlanning/older-than-six-months", { headers: { Authorization: `Bearer ${token}` } });
        const data2 = res2.data.plans || res2.data;
        setArchivedPlans((Array.isArray(data2) ? data2 : []).filter(p => p.client && (p.client._id === clientId || String(p.client) === String(clientId))));
      } catch (e) {
        console.error("Archived fallback fetch failed:", e.message);
        setArchivedPlans([]);
      }
    }
  };

  fetchArchived();
}, [showArchived, clientId]);






  const closeView = () => setViewPlan(null);


  return (
    <main ref={ref} className="flex-1 h-auto overflow-hidden">
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">

        {/* Header */}
      

         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
                  <h2 className="text-white text-base sm:text-lg md:text-xl flex items-center gap-2 leading-tight">
                 
                    <span className="whitespace-normal"> Care Plans</span>
                  </h2>
        
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
                    >
                      <FaPlus className="w-4 h-4" />
                      <span className="whitespace-nowrap">Create New Care Plans</span>
                    </button>
        
                    <button
                      onClick={() => setShowArchived(true)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
                    >
                      <FaArchive className="w-4 h-4" />
                      <span className="whitespace-nowrap">View Archived Plans</span>
                    </button>
                  </div>
                </div>
        

        {/* Active Plans List */}
        <div className="mb-8">
  <h3 className="text-white font-semibold mb-3 text-lg">Active Care Plans</h3>

       {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-700">
              <tr>
                {[
                  "Care Type",
                  "Start Date",
                  "Review Date",
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
  {loading ? (
    <tr>
      <td colSpan={5} className="text-center py-10 text-gray-400">
        Loading Care Plans...
      </td>
    </tr>
  ) : filteredData.length > 0 ? (
    filteredData.map((item) => (
      <tr key={item._id}>
        <td className="px-4 py-3 text-white">{item.planType}</td>
        <td className="px-4 py-3 text-white">
          {item.creationDate?.slice(0, 10)}
        </td>
        <td className="px-4 py-3 text-white">
          {item.reviewDate?.slice(0, 10) || "—"}
        </td>
        <td className="px-4 py-3">
          <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white">
            {item.status || "Active"}
          </span>
        </td>
       <td className="px-4 py-3 flex gap-4 text-white">
  <button onClick={() => handleView(item)} title="View">
    <FaEye className="hover:text-blue-400" />
  </button>

  {/* Edit moved to View modal - removed inline edit button */}

  <button onClick={() => handleDelete(item._id)} title="Delete">
    <FaTrash className="hover:text-red-400" />
  </button>
</td>

      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5} className="text-center py-20 text-gray-400">
        No Care Plans Found for this Client
      </td>
    </tr>
  )}
</tbody>

          </table>
        </div>
      </div>

      {/* Archived Modal */}
      {showArchived && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-3xl rounded-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Archived Care Plans</h3>
              <button onClick={() => setShowArchived(false)} className="text-white">Close</button>
            </div>

            {archivedPlans && archivedPlans.length > 0 ? (
              <div className="space-y-3">
                {archivedPlans.map((a) => (
                  <div key={a._id} className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold">{a.planType || "Care Plan"}</div>
                        <div className="text-gray-300 text-sm">{a.creationDate ? new Date(a.creationDate).toLocaleDateString() : ''} — {a.reviewDate ? new Date(a.reviewDate).toLocaleDateString() : ''}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleView(a)} className="text-blue-400">View</button>
                        <button onClick={() => handleDelete(a._id)} className="text-red-400">Delete</button>
                      </div>
                    </div>
                    {a.carePlanData && a.carePlanData.preparedBy && (
                      <p className="text-gray-300 mt-2">Prepared By: {a.carePlanData.preparedBy}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No archived plans found for this client.</p>
            )}
          </div>
        </div>
      )}

        {/* Modal Form */}
{showForm && (
<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 w-full max-w-xl rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      

              <h2 className="text-white text-xl font-semibold mb-4">
                {editingPlanId ? "Edit Care Plan" : "Create Care Plan"}
              </h2>

               <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              aria-label="Close form"
                              className="absolute top-4 right-4 text-white hover:text-gray-300"
                            >
                              <FaTimes className="hover:text-red-800 cursor-pointer" />
                            </button>

              {/* Select Type */}
              <div className="mb-4">
                <label className="text-white text-sm">Select Care Plan Type</label>
                <select
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  <option value="">Select Type</option>
                  {planTypes.map((type, i) => (
                    <option key={i} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlan && (
                <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Attachments Field */}
                            


{/* Create New Personal Hygiene Care Plan/////////////////////////////////////////////////////////////// */}
                 
                  {/* Specific Fields */}
                  {selectedPlan === "Personal Hygiene Care Plan" && (
  <div className="space-y-4 text-white  p-2">
    <h3 className="text-lg font-semibold">Create New Personal Hygiene Care Plan</h3>

    {/* Dates and Prepared By */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label>Date Plan Created</label>
        <input
          type="date"
          name="dateCreated"
          value={formData.dateCreated || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label>Next Review Date</label>
        <input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
    </div>

    <div>
      <label>Prepared By</label>
      <input
        type="text"
        name="preparedBy"
        value={formData.preparedBy || ""}
        placeholder="(Current User)"
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* My Current Ability & Support Needs */}
    <div>
      <label>My Current Ability &amp; Support Needs (&apos;What I can do&apos;)</label>
      <textarea
        name="currentAbility"
        placeholder="Describe the individual's current abilities and preferences related to this care area."
        value={formData.currentAbility || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Can walk short distances with a frame; Prefers to wash hands independently.
      </p>
    </div>

    {/* Care Plan Aims & Outcomes */}
    <div>
      <label>Care Plan Aims &amp; Outcomes (&apos;Aims&apos;)</label>
      <textarea
        name="careAims"
        placeholder="What are the specific, measurable goals for this care plan?"
        value={formData.careAims || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Maintain current skin integrity; Increase independent oral care to twice daily.
      </p>
    </div>

    {/* Detailed Personal Care Instructions */}
    <div>
      <label>Washing / Bathing / Showering</label>
      <textarea
        name="washingInstructions"
        placeholder="Assist with shower on Monday, Wednesday, Friday at 9am."
        value={formData.washingInstructions || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Dressing / Undressing</label>
      <textarea
        name="dressingInstructions"
        placeholder="Full assistance with socks and shoes. Verbal prompts for all other items."
        value={formData.dressingInstructions || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Personal Grooming (Hair/Nails/Shaving)</label>
      <textarea
        name="groomingInstructions"
        placeholder="Shave only with electric shaver, supervised by 2 staff."
        value={formData.groomingInstructions || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Skin Care / Pressure Area Management</label>
      <textarea
        name="skinCareInstructions"
        placeholder="Check heels and coccyx daily. Apply barrier cream to skin folds."
        value={formData.skinCareInstructions || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Use of Products &amp; COSHH Assessment Notes</label>
      <textarea
        name="productsNotes"
        placeholder="Only use unscented soap/shampoo. Products must be in original, readable containers."
        value={formData.productsNotes || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>
  </div>
)}

{/* Moving and Handling Care Plan///////////////////////////////////////// */}


                 {selectedPlan === "Moving and Handling Care Plan" && (
  <div className="space-y-4 text-white  p-2">
    <h3 className="text-lg font-semibold">Create New Moving and Handling Care Plan</h3>

    {/* Dates and Prepared By */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label>Date Plan Created</label>
        <input
          type="date"
          name="dateCreated"
          value={formData.dateCreated || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label>Next Review Date</label>
        <input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
    </div>

    <div>
      <label>Prepared By</label>
      <input
        type="text"
        name="preparedBy"
        value={formData.preparedBy || ""}
                placeholder="(Current User)"
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* My Current Ability & Support Needs */}
    <div>
      <label>My Current Ability &amp; Support Needs (&apos;What I can do&apos;)</label>
      <textarea
        name="currentAbility"
        placeholder="Describe the individual's current abilities and preferences related to this care area."
        value={formData.currentAbility || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Can walk short distances with a frame; Prefers to wash hands independently.
      </p>
    </div>

    {/* Care Plan Aims & Outcomes */}
    <div>
      <label>Care Plan Aims &amp; Outcomes (&apos;Aims&apos;)</label>
      <textarea
        name="careAims"
        placeholder="What are the specific, measurable goals for this care plan?"
        value={formData.careAims || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Maintain current skin integrity; Increase independent oral care to twice daily.
      </p>
    </div>

    {/* Moving and Handling Risk Assessment & Support */}
    <div>
      <label>Required Equipment / Support</label>
      <input
        type="text"
        name="assistanceLevel"
        placeholder="Required Equipment / Support"
        value={formData.assistanceLevel || ""}
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Body Shape/Size/Limbs/Restrictions</label>
      <textarea
        name="bodyShape"
        placeholder="E.g., Heavy build. Right leg has limited weight bearing ability due to old injury."
        value={formData.bodyShape || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Ability to Weight Bear / Walk</label>
      <textarea
        name="weightBear"
        placeholder="E.g., Can partially weight bear for short transfers. Requires stand-aid or full hoist for long transfers."
        value={formData.weightBear || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Standing From Sitting/Lying Down</label>
      <textarea
        name="standing"
        placeholder="E.g., Requires 2-person assist & stand-aid."
        value={formData.standing || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Transferring (Chair, Bed, Wheelchair)</label>
      <textarea
        name="transferring"
        placeholder="E.g., Full use of Sara Stedy Hoist with sling type X."
        value={formData.transferring || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Using Steps and Stairs</label>
      <textarea
        name="stairs"
        placeholder="E.g., Cannot use stairs, use elevator only."
        value={formData.stairs || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Mobilising Outside the Home / Rolling Technique</label>
      <textarea
        name="mobilising"
        placeholder="E.g., Use heavy duty wheelchair for all outings. Only use rolling technique for repositioning in bed."
        value={formData.mobilising || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Equipment Required &amp; Next Service Date</label>
      <textarea
        name="equipment"
        placeholder="E.g., Stand-Aid (Serial #1234), Full-Body Sling (Size M). Service due: 2026-03-01"
        value={formData.equipment || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>
  </div>
)}


{/* Nutrition and Hydration Plan////////////////////////////////////////////////////////////////////// */}

               {selectedPlan === "Nutrition and Hydration Plan" && (
  <div className="space-y-4 text-white p-2">
    <h3 className="text-lg font-semibold">Create New Nutrition and Hydration Plan</h3>

    {/* Dates and Prepared By */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label>Date Plan Created</label>
        <input
          type="date"
          name="dateCreated"
          value={formData.dateCreated || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label>Next Review Date</label>
        <input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
    </div>

    <div>
      <label>Prepared By</label>
      <input
        type="text"
        name="preparedBy"
        value={formData.preparedBy || ""}
                placeholder="(Current User)"

        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* My Current Ability & Support Needs */}
    <div>
      <label>My Current Ability &amp; Support Needs (&apos;What I can do&apos;)</label>
      <textarea
        name="currentAbility"
        placeholder="Describe the individual's current abilities and preferences related to this care area."
        value={formData.currentAbility || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Can walk short distances with a frame; Prefers to wash hands independently.
      </p>
    </div>

    {/* Care Plan Aims & Outcomes */}
    <div>
      <label>Care Plan Aims &amp; Outcomes (&apos;Aims&apos;)</label>
      <textarea
        name="careAims"
        placeholder="What are the specific, measurable goals for this care plan?"
        value={formData.careAims || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Maintain current skin integrity; Increase independent oral care to twice daily.
      </p>
    </div>

    {/* Specific Support Interventions & Routines */}
    <div>
      <label>Dietary Requirements &amp; Consistency</label>
      <input
        type="text"
        name="dietType"
        placeholder="Diet Type"
        value={formData.dietType || ""}
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Pureed diet (Level 4), no nuts or peanuts.
      </p>
    </div>

    <div>
      <label>Fluid Requirements &amp; Preferred Drinks</label>
      <textarea
        name="fluidRequirements"
        placeholder="Describe fluid requirements & preferred drinks"
        value={formData.fluidRequirements || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., 1.5L minimum per day. Prefers water and decaf tea.
      </p>
    </div>

    <div>
      <label>Mealtime Support Instructions</label>
      <textarea
        name="mealtimeSupport"
        placeholder="Describe mealtime support instructions"
        value={formData.mealtimeSupport || ""}
        onChange={handleChange}
        rows={2}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Requires full staff assistance (1:1) with feeding. Needs to be seated upright for 30 minutes after meal.
      </p>
    </div>

    <div>
      <label>Monitoring Requirements (J1 Weight Record)</label>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label>Weighing Frequency</label>
          <input
            type="text"
            name="weighingFrequency"
            placeholder="Weekly (Every Monday)"
            value={formData.weighingFrequency || ""}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded text-white"
          />
        </div>
        <div>
          <label>Preferred Scale / Method</label>
          <input
            type="text"
            name="preferredScale"
            placeholder="Standing Scale / Hoist Weighing Scale"
            value={formData.preferredScale || ""}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded text-white"
          />
        </div>
      </div>
    </div>
  </div>
)}


  {/* Mental Health Care Plan///////////////////////////////////////////////////////////////////// */}

                  {selectedPlan === "Mental Health Care Plan" && (
  <div className="space-y-4 text-white  p-2">
    <h3 className="text-lg font-semibold">Create New Mental Health Care Plan</h3>

    {/* Dates and Prepared By */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label>Date Plan Created</label>
        <input
          type="date"
          name="dateCreated"
          value={formData.dateCreated || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label>Next Review Date</label>
        <input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
    </div>

    <div>
      <label>Prepared By</label>
      <input
        type="text"
        name="preparedBy"
        value={formData.preparedBy || ""}
        onChange={handleChange}
        placeholder="(Current User)"
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* My Current Ability & Support Needs */}
    <div>
      <label>My Current Ability &amp; Support Needs (&apos;What I can do&apos;)</label>
      <textarea
        name="currentAbility"
        placeholder="Describe the individual's current abilities and preferences related to this care area."
        value={formData.currentAbility || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Can walk short distances with a frame; Prefers to wash hands independently.
      </p>
    </div>

    {/* Care Plan Aims & Outcomes */}
    <div>
      <label>Care Plan Aims &amp; Outcomes (&apos;Aims&apos;)</label>
      <textarea
        name="careAims"
        placeholder="What are the specific, measurable goals for this care plan?"
        value={formData.careAims || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Maintain current skin integrity; Increase independent oral care to twice daily.
      </p>
    </div>

    {/* Specific Support Interventions & Routines */}
    <div>
      <label>Detailed Steps to Achieve Aims (How to support me)</label>
      <textarea
        name="supportSteps"
        placeholder="Detail the specific routine, schedule, or protocol staff must follow for this care area."
        value={formData.supportSteps || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* Relevant Medical/Recording Details */}
    <div>
      <label>Relevant Medical/Recording Details</label>
      <textarea
        name="medicalDetails"
        placeholder="E.g., For Continence: Document fluid intake and output (F/O) chart. For Health: Monitoring blood pressure daily at 8am."
        value={formData.medicalDetails || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* Sleep Routine Input */}
    <div>
      <label>Sleep Routine</label>
      <input
        type="text"
        name="sleepRoutine"
        placeholder="Sleep Routine"
        value={formData.sleepRoutine || ""}
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>
  </div>
)}


{/* Oral Care Plan///////////////////////////////////////////////////////////////////// */}

  {selectedPlan === "Oral Care Plan" && (
  <div className="space-y-4 text-white  p-2">
    <h3 className="text-lg font-semibold">Create New Oral Care Plan</h3>

    {/* Dates and Prepared By */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label>Date Plan Created</label>
        <input
          type="date"
          name="dateCreated"
          value={formData.dateCreated || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label>Next Review Date</label>
        <input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
    </div>

    <div>
      <label>Prepared By</label>
      <input
        type="text"
        name="preparedBy"
        value={formData.preparedBy || ""}
        onChange={handleChange}
        placeholder="(Current User)"
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* My Current Ability & Support Needs */}
    <div>
      <label>My Current Ability &amp; Support Needs (&apos;What I can do&apos;)</label>
      <textarea
        name="currentAbility"
        placeholder="Describe the individual's current abilities and preferences related to this care area."
        value={formData.currentAbility || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Can walk short distances with a frame; Prefers to wash hands independently.
      </p>
    </div>

    {/* Care Plan Aims & Outcomes */}
    <div>
      <label>Care Plan Aims &amp; Outcomes (&apos;Aims&apos;)</label>
      <textarea
        name="careAims"
        placeholder="What are the specific, measurable goals for this care plan?"
        value={formData.careAims || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Maintain current skin integrity; Increase independent oral care to twice daily.
      </p>
    </div>

    {/* Oral Care Instructions & Schedule */}
    <div>
      <label>Dentures / Natural Teeth / Other Aids</label>
      <input
        type="text"
        name="dentalAids"
        placeholder="E.g., Full upper and lower dentures"
        value={formData.dentalAids || ""}
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Dental Contact / Next Check-up</label>
      <input
        type="text"
        name="dentalContact"
        placeholder="E.g., Dr. Patel at Local Clinic. Appointment: 2026-04-10"
        value={formData.dentalContact || ""}
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Oral Hygiene Schedule &amp; Specific Instructions</label>
      <textarea
        name="oralHygieneSchedule"
        placeholder="E.g., Brush natural teeth/clean dentures twice daily. Requires verbal prompts only."
        value={formData.oralHygieneSchedule || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Monitoring Notes</label>
      <textarea
        name="monitoringNotes"
        placeholder="Staff to check for sore spots or signs of infection daily and record in daily log."
        value={formData.monitoringNotes || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>
  </div>
)}







{/* Health Care Plan////////////////////////////////////////////////////////////// */}


{selectedPlan === "Health Care Plan" && (
  <div className="space-y-4 text-white  p-2">
    <h3 className="text-lg font-semibold">Create New Health Care Plan</h3>

    {/* Dates and Prepared By */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label>Date Plan Created</label>
        <input
          type="date"
          name="dateCreated"
          value={formData.dateCreated || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label>Next Review Date</label>
        <input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
    </div>

    <div>
      <label>Prepared By</label>
      <input
        type="text"
        name="preparedBy"
        value={formData.preparedBy || ""}

        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
        placeholder="(Current User)"
      />
    </div>

    {/* My Current Ability & Support Needs */}
    <div>
      <label>My Current Ability &amp; Support Needs (&apos;What I can do&apos;)</label>
      <textarea
        name="currentAbility"
        placeholder="Describe the individual's current abilities and preferences related to this care area."
        value={formData.currentAbility || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Can walk short distances with a frame; Prefers to wash hands independently.
      </p>
    </div>

    {/* Care Plan Aims & Outcomes */}
    <div>
      <label>Care Plan Aims &amp; Outcomes (&apos;Aims&apos;)</label>
      <textarea
        name="careAims"
        placeholder="What are the specific, measurable goals for this care plan?"
        value={formData.careAims || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Maintain current skin integrity; Increase independent oral care to twice daily.
      </p>
    </div>

    {/* Specific Support Interventions & Routines */}
    <div>
      <label>Detailed Steps to Achieve Aims (How to support me)</label>
      <textarea
        name="supportSteps"
        placeholder="Detail the specific routine, schedule, or protocol staff must follow for this care area."
        value={formData.supportSteps || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    <div>
      <label>Relevant Medical/Recording Details</label>
      <textarea
        name="medicalDetails"
        placeholder="E.g., For Health: Monitoring blood pressure daily at 8am."
        value={formData.medicalDetails || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>
  </div>
)}



{/* Continence Care Plan//////////////////////////////////////////////////// */}

 {selectedPlan === "Continence Care Plan" && (
  <div className="space-y-4 text-white  p-2">
    <h3 className="text-lg font-semibold">Create New Continence Care Plan</h3>

    {/* Dates and Prepared By */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label>Date Plan Created</label>
        <input
          type="date"
          name="dateCreated"
          value={formData.dateCreated || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label>Next Review Date</label>
        <input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
    </div>

    <div>
      <label>Prepared By</label>
      <input
        type="text"
        name="preparedBy"
        value={formData.preparedBy || ""}
        placeholder="(Current User)"
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* Current Ability & Support Needs */}
    <div>
      <label>My Current Ability &amp; Support Needs (&apos;What I can do&apos;)</label>
      <textarea
        name="currentAbility"
        placeholder="Describe the individual's current abilities and preferences related to this care area."
        value={formData.currentAbility || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Can walk short distances with a frame; Prefers to wash hands independently.
      </p>
    </div>

    {/* Care Plan Aims & Outcomes */}
    <div>
      <label>Care Plan Aims &amp; Outcomes (&apos;Aims&apos;)</label>
      <textarea
        name="careAims"
        placeholder="What are the specific, measurable goals for this care plan?"
        value={formData.careAims || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Maintain current skin integrity; Increase independent oral care to twice daily.
      </p>
    </div>

    {/* Specific Support Interventions & Routines */}
    <div>
      <label>Detailed Steps to Achieve Aims (How to support me)</label>
      <textarea
        name="supportSteps"
        placeholder="Detail the specific routine, schedule, or protocol staff must follow for this care area."
        value={formData.supportSteps || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* Relevant Medical/Recording Details */}
    <div>
      <label>Relevant Medical/Recording Details</label>
      <textarea
        name="medicalDetails"
        placeholder="E.g., Document fluid intake and output (F/O) chart."
        value={formData.medicalDetails || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>
  </div>
)}



{/* Sleeping Care Plan///////////////////////////////////////////////////////// */}


{selectedPlan === "Sleeping Care Plan" && (
  <div className="space-y-4 text-white  p-2">
    <h3 className="text-lg font-semibold">Create New Sleeping Care Plan</h3>

    {/* Dates and Prepared By */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label>Date Plan Created</label>
        <input
          type="date"
          name="dateCreated"
          value={formData.dateCreated || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label>Next Review Date</label>
        <input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
    </div>

    <div>
      <label>Prepared By</label>
      <input
        type="text"
        name="preparedBy"
        value={formData.preparedBy || ""}
        
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* Current Ability & Support Needs */}
    <div>
      <label>My Current Ability &amp; Support Needs (&apos;What I can do&apos;)</label>
      <textarea
        name="currentAbility"
        placeholder="Describe the individual's current abilities and preferences related to this care area."
        value={formData.currentAbility || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Can walk short distances with a frame; Prefers to wash hands independently.
      </p>
    </div>

    {/* Care Plan Aims & Outcomes */}
    <div>
      <label>Care Plan Aims &amp; Outcomes (&apos;Aims&apos;)</label>
      <textarea
        name="careAims"
        placeholder="What are the specific, measurable goals for this care plan?"
        value={formData.careAims || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
      <p className="text-gray-400 text-xs mt-1">
        E.g., Maintain current skin integrity; Increase independent oral care to twice daily.
      </p>
    </div>

    {/* Specific Support Interventions & Routines */}
    <div>
      <label>Detailed Steps to Achieve Aims (How to support me)</label>
      <textarea
        name="supportSteps"
        placeholder="Detail the specific routine, schedule, or protocol staff must follow for this care area."
        value={formData.supportSteps || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>

    {/* Relevant Medical/Recording Details */}
    <div>
      <label>Relevant Medical/Recording Details</label>
      <textarea
        name="medicalDetails"
        placeholder="E.g., Monitoring sleep patterns, night-time checks, or medication administration."
        value={formData.medicalDetails || ""}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 bg-gray-700 rounded text-white"
      />
    </div>
  </div>
)}





                   
                  {/* Buttons */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-gray-600 px-4 py-2 rounded text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 px-4 py-2 rounded text-white"
                      disabled={submitting}
                    >
                      {submitting ? (editingPlanId ? "Updating..." : "Saving...") : (editingPlanId ? "Update Plan" : "Save Care Plan")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* View Modal */}
       {viewPlan && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div
      id="care-plan-preview"
      className="w-full max-w-3xl rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh]"
      style={{ backgroundColor: "#111827", color: "#ffffff" }}
    >
      <h2 className="text-2xl font-semibold mb-6">
        {viewPlan.planType || "Care Plan"} - Details
      </h2>

      <div className="space-y-4 text-sm">

        {/* Patient Name */}
        {viewPlan.client?.fullName && (
          <div>
            <strong>Patient:</strong>
            <p className="bg-gray-800 p-3 rounded mt-1">{viewPlan.client.fullName}</p>
          </div>
        )}

        {/* Patient Image */}
        {viewPlan.client?.avatar && (
          <div>
            <strong>Profile Image:</strong>
            <Image
              src={viewPlan.client.avatar}
              alt="Patient"
              width={96}
              height={96}
              className="w-24 h-24 object-cover rounded mt-1"
            />
          </div>
        )}

        {/* Signature */}
        {viewPlan.status === "Accepted" && viewPlan.signature && (
          <div>
            <strong>Signature:</strong>
            <Image
              src={viewPlan.signature}
              alt="Signature"
              width={160}
              height={80}
              className="w-40 h-20 object-contain mt-1"
            />
          </div>
        )}

        {/* Dynamic Fields */}
        {Object.entries(viewPlan).map(([key, value]) => {
          const hiddenFields = ["_id", "clientId", "createdAt", "updatedAt", "__v", "client", "signature", "attachments"];
          if (value === undefined || value === null || hiddenFields.includes(key)) return null;

          const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

          // If the value is an object (like carePlanData), render its subfields nicely
          if (typeof value === "object") {
            if (Array.isArray(value)) {
              // Arrays: join primitives, or list items for objects
              return (
                <div key={key}>
                  <strong>{formattedKey}:</strong>
                  <div className="bg-gray-800 p-3 rounded mt-1">
                    {value.length === 0 ? (
                      <em className="text-gray-400">No items</em>
                    ) : (
                      value.map((v, i) => (
                        <div key={i} className="mb-2">
                          {typeof v === "object" ? (
                            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(v, null, 2)}</pre>
                          ) : (
                            <div>{String(v)}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            }

            // Plain object: render key-value pairs
            return (
              <div key={key}>
                <strong>{formattedKey}:</strong>
                <div className="bg-gray-800 p-3 rounded mt-1 space-y-2">
                          {Object.entries(value)
                            .filter(([, subVal]) => subVal !== undefined && subVal !== null && String(subVal).trim() !== "")
                            .map(([subKey, subVal]) => {
                              const label = subKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (s) => s.toUpperCase());

                              // Date detection and formatting helpers
                              const isDateField = /date/i.test(subKey);
                              const formatDateDisplay = (v) => {
                                try {
                                  return v ? new Date(v).toLocaleDateString() : "";
                                } catch {
                                  return String(v);
                                }
                              };

                              // Values for inputs when editing
                              const currentVal = formData[subKey] ?? subVal;
                              const dateInputVal = (val) => {
                                if (!val) return "";
                                try {
                                  return new Date(val).toISOString().slice(0, 10);
                                } catch {
                                  return String(val).slice(0, 10) || "";
                                }
                              };

                              return (
                                <div key={subKey} className="flex gap-3 items-start">
                                  <span className="text-sm text-gray-300 w-44">{label}:</span>
                                  <div className="text-sm w-full">
                                    {isEditingView ? (
                                      isDateField ? (
                                        <input
                                          type="date"
                                          value={dateInputVal(currentVal)}
                                          onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, [subKey]: e.target.value }))
                                          }
                                          className="bg-gray-700 p-2 rounded w-48 text-white"
                                        />
                                      ) : (
                                        <textarea
                                          value={currentVal === undefined ? "" : String(currentVal)}
                                          onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, [subKey]: e.target.value }))
                                          }
                                          className="bg-gray-700 p-2 rounded w-full text-white"
                                        />
                                      )
                                    ) : (
                                      <div>{isDateField ? formatDateDisplay(subVal) : String(subVal)}</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                </div>
              </div>
            );
          }

          // Primitive values
          return (
            <div key={key}>
              <strong>{formattedKey}:</strong>
              {isEditingView ? (
                <input
                  value={formData[key] ?? value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="bg-gray-700 p-3 rounded mt-1 w-full text-white"
                />
              ) : (
                <p className="bg-gray-800 p-3 rounded mt-1">{String(value)}</p>
              )}
            </div>
          );
        })}

        {/* Attachments */}
        {viewPlan.attachments?.length > 0 && (
          <div>
            <strong>Attachments:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {viewPlan.attachments.map((att, i) => {
                const src = typeof att === 'string' ? att : (att?.secure_url || att?.url || att?.path || '');
                if (!src) return null;
                const cleanSrc = src.split('?')[0];
                const ext = cleanSrc.includes('.') ? cleanSrc.split('.').pop().toLowerCase() : '';

                // Image attachments
                if (["jpg","jpeg","png","webp"].includes(ext)) {
                  return <Image key={i} src={src} alt="attachment" width={96} height={96} className="w-24 h-24 object-cover rounded" />;
                }

                // Video attachments
                if (["mp4","mov","avi","mkv","webm"].includes(ext)) {
                  return (
                    <video key={i} src={src} controls className="w-40 h-24 rounded" />
                  );
                }

                // PDF or other file attachments
                return (
                  <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    {cleanSrc.split("/").pop()}
                  </a>
                );
              })}
            </div>
          </div>
        )}

      </div>
{/* Action Buttons */}
<div className="flex justify-end gap-3 mt-6 flex-wrap">
  <button
    onClick={closeView}
    className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
  >
    Back to Plans List
  </button>

  <button
    onClick={() => window.print()}
    className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
  >
    Print Plan
  </button>

  <button
    onClick={() => handleDownloadPdf(viewPlan)}
    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
  >
    Export Plan (PDF)
  </button>

  {/* 👇 EDIT / UPDATE TOGGLE */}
  {!isEditingView ? (
    <button
      onClick={handleEditFromView}
      className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
    >
      Edit Plan
    </button>
  ) : (
    <button
      onClick={handleUpdateFromView}
      className="bg-indigo-600 text-white px-4 py-2 rounded"
    >
      Update Care Plan
    </button>
  )}
</div>

    </div>
  </div>
)}




      </div>
    </main>
  );
});

export default ResidentProfileCarePlan;


