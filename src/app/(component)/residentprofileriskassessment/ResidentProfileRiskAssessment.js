"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaTimes,
  FaArchive,
} from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";

const ResidentProfileRiskAssessment = ({ clientId }) => {
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [plans, setPlans] = useState([]);
  const [archivedPlans, setArchivedPlans] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [viewPlan, setViewPlan] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const [riskForm, setRiskForm] = useState({
    riskTitle: "",
    dateOfAssessment: "",
    assessedBy: "",
    overallRiskLevel: "",
    categories: {
      falls: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Check mobility aids, medication side-effects affecting balance, footwear, environment hazards. Consider scheduled repositioning, supervised transfers, and referral for physiotherapy." },
      selfNeglect: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Ensure regular welfare checks, meal support, safeguarding checks, monitoring of hygiene and housing conditions, and involve family/advocates as needed." },
      suicide: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Assess ideation, access to means; increase observation, crisis plan, urgent mental health referral if active ideation present." },
      aggression: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Use de-escalation strategies, review triggers, consider 1:1 supervision for outings, ensure staff training and clear behaviour support plan." },
      other: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Assess for arson risk, sexualised behaviour, risk to children, risk of property damage; mitigate via environmental safety checks and tailored monitoring." },
    },
    clinicalSummary: "",
  });

  // ✅ Fetch Active Risk Assessments
  useEffect(() => {
    if (!clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/risk-assessment/client/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPlans(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching Risk Assessments:", err));
  }, [clientId]);

  // ✅ Fetch Archived Risk Assessments (older than 6 months)
  useEffect(() => {
    if (!showArchived || !clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/risk-assessment/older-than-six-months`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Filter by clientId on frontend (since endpoint is generic)
        const clientArchived = (data.assessments || []).filter(
          (item) => item.client && (item.client._id === clientId || item.client === clientId)
        );
        setArchivedPlans(clientArchived);
      })
      .catch((err) => console.error("Error fetching archived Risk Assessments:", err));
  }, [showArchived, clientId]);

  const resetForm = () => {
    setRiskForm({
      riskTitle: "",
      dateOfAssessment: "",
      assessedBy: "",
      overallRiskLevel: "",
      categories: {
        falls: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Check mobility aids, medication side-effects affecting balance, footwear, environment hazards. Consider scheduled repositioning, supervised transfers, and referral for physiotherapy." },
        selfNeglect: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Ensure regular welfare checks, meal support, safeguarding checks, monitoring of hygiene and housing conditions, and involve family/advocates as needed." },
        suicide: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Assess ideation, access to means; increase observation, crisis plan, urgent mental health referral if active ideation present." },
        aggression: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Use de-escalation strategies, review triggers, consider 1:1 supervision for outings, ensure staff training and clear behaviour support plan." },
        other: { checked: false, recency: "", frequency: "", severity: "", comments: "", mitigations: "Assess for arson risk, sexualised behaviour, risk to children, risk of property damage; mitigate via environmental safety checks and tailored monitoring." },
      },
      clinicalSummary: "",
    });
    setEditingPlanId(null);
    setShowRiskForm(false);
  };

  const handleEdit = (plan) => {
    setEditingPlanId(plan._id);
    setRiskForm({
      riskTitle: plan.planTitle || "",
      dateOfAssessment: plan.dateOfAssessment ? plan.dateOfAssessment.slice(0, 10) : "",
      assessedBy: plan.assessedBy || "",
      overallRiskLevel: plan.overallRiskLevel || "",
      categories: plan.categories || riskForm.categories,
      clinicalSummary: plan.clinicalSummary || "",
    });
    setShowRiskForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Risk Assessment?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/risk-assessment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPlans((prev) => prev.filter((p) => p._id !== id));
        alert("Risk Assessment deleted successfully!");
      } else {
        alert("Failed to delete Risk Assessment");
      }
    } catch (error) {
      console.error("Error deleting Risk Assessment:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      clientId,
      planTitle: riskForm.riskTitle,
      dateOfAssessment: riskForm.dateOfAssessment,
      assessedBy: riskForm.assessedBy,
      overallRiskLevel: riskForm.overallRiskLevel,
      categories: riskForm.categories,
      clinicalSummary: riskForm.clinicalSummary,
    };

    try {
      if (editingPlanId) {
        // Update
        const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/risk-assessment/${editingPlanId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updated = await res.json();
          setPlans((prev) => prev.map((p) => (p._id === editingPlanId ? updated : p)));
          alert("Risk Assessment updated successfully!");
          resetForm();
        } else {
          alert("Failed to update Risk Assessment");
        }
      } else {
        // Create
        const res = await fetch("https://admin-panel-backend-alpha.vercel.app/risk-assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newItem = await res.json();
          setPlans((prev) => [newItem, ...prev]);
          alert("Risk Assessment created successfully!");
          resetForm();
        } else {
          alert("Failed to create Risk Assessment");
        }
      }
    } catch (error) {
      console.error("Error saving Risk Assessment:", error);
      alert("An error occurred while saving.");
    }
  };

  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Risk Assessment Details", 14, 15);

    const mainRows = [];
    if (item.planTitle) mainRows.push(["Risk Title", item.planTitle]);
    if (item.dateOfAssessment) mainRows.push(["Date", new Date(item.dateOfAssessment).toLocaleDateString()]);
    if (item.assessedBy) mainRows.push(["Assessed By", item.assessedBy]);
    if (item.overallRiskLevel) mainRows.push(["Overall Risk Level", item.overallRiskLevel]);
    if (item.clinicalSummary) mainRows.push(["Clinical Summary", item.clinicalSummary]);

    if(item.categories) {
      Object.entries(item.categories).forEach(([key, cat]) => {
        if(cat.checked) {
          const name = key.charAt(0).toUpperCase() + key.slice(1);
          mainRows.push([`Category: ${name}`, `Severity: ${cat.severity || '-'}, Frequency: ${cat.frequency || '-'}`]);
          if(cat.comments) mainRows.push([`${name} Notes`, cat.comments]);
          if(cat.mitigations) mainRows.push([`${name} Mitigations`, cat.mitigations]);
        }
      });
    }

    if (mainRows.length) {
      autoTable(doc, {
        startY: 25,
        head: [["Field", "Value"]],
        body: mainRows,
        styles: { cellPadding: 3, fontSize: 10 },
        headStyles: { fillColor: [220, 53, 69] }, // Red for Risk
      });
    }

    // Save PDF
    const filename = item.planTitle 
      ? `${item.planTitle.replace(/\s+/g, '_')}_Risk_Assessment.pdf`
      : `Risk_Assessment_${item._id}.pdf`;
    doc.save(filename);
  };

  const handleView = (plan) => {
    setViewPlan(plan);
  };

  const closeView = () => setViewPlan(null);

  return (
    <main className="flex-1 h-auto overflow-hidden">
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-white text-base sm:text-lg md:text-xl flex items-center gap-2 leading-tight">
            <IoWarningOutline className="w-5 h-5" />
            <span className="whitespace-normal"> Formal Risk Assessments</span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowRiskForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
            >
              <FaPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">Create New Risk Assessment</span>
            </button>

            <button
              onClick={() => setShowArchived(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
            >
              <FaArchive className="w-4 h-4" />
              <span className="whitespace-nowrap">View Archived</span>
            </button>
          </div>
        </div>

        {/* Active Plans List */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-3 text-lg">
            Active Risk Assessments
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-700">
                <tr>
                  {["Risk Title", "Date", "Overall Level", "Assessed By", "Actions"].map((col, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {plans.length > 0 ? (
                  plans.map((item) => {
                    const getLevelColor = (level) => {
                      if (level === "High") return "bg-red-500 text-white";
                      if (level === "Medium") return "bg-yellow-500 text-black";
                      if (level === "Low") return "bg-green-500 text-white";
                      return "bg-gray-500 text-white";
                    };

                    return (
                      <tr key={item._id}>
                        <td className="px-4 py-3 text-white">{item.planTitle || "Risk Assessment"}</td>
                        <td className="px-4 py-3 text-white">{item.dateOfAssessment ? new Date(item.dateOfAssessment).toLocaleDateString() : ""}</td>
                        <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${getLevelColor(item.overallRiskLevel)}`}>
                                {item.overallRiskLevel || "N/A"}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-white">{item.assessedBy || ""}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-3 text-white text-sm relative">
                            <button onClick={() => handleView(item)} className="hover:text-blue-500 cursor-pointer" title="View"><FaEye /></button>
                            <button onClick={() => handleEdit(item)} className="hover:text-yellow-400 cursor-pointer" title="Edit"><FaEdit /></button>
                            <button onClick={() => handleDelete(item._id)} className="hover:text-red-500 cursor-pointer" title="Delete"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={5} className="text-center px-4 py-20 text-gray-400">No Risk Assessments Found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Form Modal */}
        {showRiskForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-2xl rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">{editingPlanId ? "Edit Risk Assessment" : "Create New Risk Assessment"}</h2>
              <button type="button" onClick={resetForm} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>
              
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-2 text-white">
                 <div className="grid sm:grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm text-gray-300">Risk Title / Summary</label>
                     <input name="riskTitle" value={riskForm.riskTitle} onChange={(e)=>setRiskForm({...riskForm, riskTitle:e.target.value})} className="w-full p-2 bg-gray-700 rounded text-white" required />
                   </div>
                   <div>
                     <label className="text-sm text-gray-300">Date of Assessment</label>
                     <input type="date" name="dateOfAssessment" value={riskForm.dateOfAssessment} onChange={(e)=>setRiskForm({...riskForm, dateOfAssessment:e.target.value})} className="w-full p-2 bg-gray-700 rounded text-white" required />
                   </div>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm text-gray-300">Assessed By</label>
                     <input name="assessedBy" value={riskForm.assessedBy} onChange={(e)=>setRiskForm({...riskForm, assessedBy:e.target.value})} className="w-full p-2 bg-gray-700 rounded text-white" />
                   </div>
                   <div>
                     <label className="text-sm text-gray-300">Overall Risk Level</label>
                     <select value={riskForm.overallRiskLevel} onChange={(e)=>setRiskForm({...riskForm, overallRiskLevel:e.target.value})} className="w-full p-2 bg-gray-700 rounded text-white">
                       <option value="">Select</option>
                       <option value="Low">Low</option>
                       <option value="Medium">Medium</option>
                       <option value="High">High</option>
                     </select>
                   </div>
                 </div>

                 <div>
                   <label className="text-sm text-gray-300 font-semibold">Risk Categories</label>
                   {Object.entries(riskForm.categories).map(([key, cat]) => (
                     <div key={key} className="mt-3 border-t border-gray-700 pt-3">
                       <label className="flex items-center gap-2">
                         <input type="checkbox" checked={cat.checked} onChange={(e)=>setRiskForm({...riskForm, categories:{...riskForm.categories, [key]:{...cat, checked:e.target.checked}}})} />
                         <span className="font-semibold text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                       </label>
                       {cat.checked && (
                         <div className="grid sm:grid-cols-3 gap-3 mt-2">
                            <div>
                                <label className="text-xs text-gray-400">Recency</label>
                                <select value={cat.recency} onChange={(e)=>setRiskForm({...riskForm, categories:{...riskForm.categories, [key]:{...cat, recency:e.target.value}}})} className="w-full p-2 bg-gray-700 rounded text-white text-sm">
                                    <option value="">Select</option><option value="Recent">Recent</option><option value="Past">Past</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Frequency</label>
                                <select value={cat.frequency} onChange={(e)=>setRiskForm({...riskForm, categories:{...riskForm.categories, [key]:{...cat, frequency:e.target.value}}})} className="w-full p-2 bg-gray-700 rounded text-white text-sm">
                                    <option value="">Select</option><option value="Rare">Rare</option><option value="Occasional">Occasional</option><option value="Frequent">Frequent</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Severity</label>
                                <select value={cat.severity} onChange={(e)=>setRiskForm({...riskForm, categories:{...riskForm.categories, [key]:{...cat, severity:e.target.value}}})} className="w-full p-2 bg-gray-700 rounded text-white text-sm">
                                    <option value="">Select</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                                </select>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="text-xs text-gray-400">Comments</label>
                                <textarea value={cat.comments} onChange={(e)=>setRiskForm({...riskForm, categories:{...riskForm.categories, [key]:{...cat, comments:e.target.value}}})} className="w-full p-2 bg-gray-700 rounded text-white" rows={2}/>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="text-xs text-gray-400">Mitigations</label>
                                <textarea value={cat.mitigations} onChange={(e)=>setRiskForm({...riskForm, categories:{...riskForm.categories, [key]:{...cat, mitigations:e.target.value}}})} className="w-full p-2 bg-gray-700 rounded text-white" rows={2}/>
                            </div>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
                 
                 <div>
                    <label className="text-sm text-gray-300">Clinical Summary</label>
                    <textarea value={riskForm.clinicalSummary} onChange={(e)=>setRiskForm({...riskForm, clinicalSummary:e.target.value})} className="w-full p-2 bg-gray-700 rounded text-white" rows={4} />
                 </div>

                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
                    <button type="submit" className="bg-indigo-600 px-4 py-2 rounded text-white">{editingPlanId ? "Update" : "Save"}</button>
                 </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewPlan && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-white text-xl font-semibold mb-4">{viewPlan.planTitle || "Risk Details"}</h2>
              <div className="space-y-3 text-white text-sm">
                <p><strong>Date:</strong> {viewPlan.dateOfAssessment ? new Date(viewPlan.dateOfAssessment).toLocaleDateString() : "N/A"}</p>
                <p><strong>Assessed By:</strong> {viewPlan.assessedBy || "N/A"}</p>
                <p><strong>Overall Risk:</strong> <span className="font-bold">{viewPlan.overallRiskLevel}</span></p>
                <p><strong>Clinical Summary:</strong> {viewPlan.clinicalSummary || "N/A"}</p>
                
                {viewPlan.categories && (
                   <div className="border-t border-gray-700 pt-2 mt-2">
                     <h3 className="font-semibold mb-2">Identified Risks:</h3>
                     {Object.entries(viewPlan.categories).map(([key, cat]) => cat.checked && (
                       <div key={key} className="mb-2 bg-gray-700 p-2 rounded">
                          <p className="font-bold capitalize">{key}</p>
                          <p className="text-xs text-gray-300">Severity: {cat.severity}, Frequency: {cat.frequency}</p>
                          {cat.comments && <p className="text-xs mt-1">Note: {cat.comments}</p>}
                       </div>
                     ))}
                   </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 flex-wrap">
                <button onClick={closeView} className="bg-gray-600 px-4 py-2 rounded text-white">Close</button>
                <button onClick={() => window.print()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Print</button>
                <button onClick={() => handleDownloadPdf(viewPlan)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Export PDF</button>
                <button onClick={() => { handleDelete(viewPlan._id); closeView(); }} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded">Delete</button>
                <button onClick={() => { handleEdit(viewPlan); closeView(); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Edit</button>
              </div>
            </div>
          </div>
        )}

        {/* Archived Modal */}
        {showArchived && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">Archived Risk Assessments</h2>
              <button type="button" onClick={() => setShowArchived(false)} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <div className="text-white text-sm max-h-[60vh] overflow-y-auto space-y-2">
                {archivedPlans.length > 0 ? (
                  archivedPlans.map((plan) => (
                    <div key={plan._id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                        <div>
                            <p className="font-bold">{plan.planTitle}</p>
                            <p className="text-xs text-gray-400">{new Date(plan.dateOfAssessment).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { handleView(plan); setShowArchived(false); }} className="text-blue-400 hover:text-blue-300">View</button>
                            <button onClick={() => handleDelete(plan._id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No archived risk assessments found.</p>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={() => setShowArchived(false)} className="bg-gray-600 px-4 py-2 rounded text-white">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResidentProfileRiskAssessment;