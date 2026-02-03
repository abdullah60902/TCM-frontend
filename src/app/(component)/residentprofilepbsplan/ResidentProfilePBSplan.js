"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaBrain,
  FaEye,
  FaDownload,
  FaTimes,
  FaArchive,
} from "react-icons/fa";

import { MdOutlineHealthAndSafety } from "react-icons/md";

const ResidentProfilePBSplan = ({ clientId }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plans, setPlans] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [viewPlan, setViewPlan] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedPlans, setArchivedPlans] = useState([]);

  const [formData, setFormData] = useState({
    notes: "",
    frequency: "",
    assistanceLevel: "",
    dietType: "",
    sleepRoutine: "",
  });

  const planTypes = [
    "Core Behaviour Support Plan",
    "Specialised Epilepsy Plan",
    "Focused Risk Assessment",
    "Generic Care Plan",
  ];

  // ✅ Fetch PBS Plans from Backend
  useEffect(() => {
    if (!clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/pbs-plan/client/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("PBS Plans fetched:", data);
        setPlans(data);
      })
      .catch((err) => console.error("Error fetching PBS plans:", err));
  }, [clientId]);

  // ✅ Fetch Archived PBS Plans (older than 6 months)
  useEffect(() => {
    if (!showArchived || !clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/pbs-plan/older-than-six-months`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Archived PBS Plans fetched:", data);
        // Filter by clientId on frontend
        const clientPlans = (data.plans || []).filter(
          (plan) => plan.client && (plan.client._id === clientId || plan.client === clientId)
        );
        setArchivedPlans(clientPlans);
      })
      .catch((err) => console.error("Error fetching archived PBS plans:", err));
  }, [showArchived, clientId]);

  // Use the local state `selectedPlan` and `plans` (fallbacks) for filtering.
  // The previous code referenced `selected` and `carePlans` which are not defined
  // in this component and caused a reference error.
  const _plans = Array.isArray(plans) ? plans : [];
  // Filter by `type` so selecting a plan type shows relevant PBS plans
  const filteredData =
    selectedPlan === "All" || selectedPlan === ""
      ? _plans
      : _plans.filter((item) => item.type === selectedPlan);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const payload = {
      clientId,
      type: selectedPlan,
      ...formData,
    };

    try {
      if (editingPlanId) {
        // ✅ Update existing plan
        const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/pbs-plan/${editingPlanId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updatedPlan = await res.json();
          setPlans((prev) =>
            prev.map((plan) => (plan._id === editingPlanId ? updatedPlan : plan))
          );
          alert("PBS Plan updated successfully!");
        } else {
          alert("Failed to update PBS plan");
        }
      } else {
        // ✅ Create new plan
        const res = await fetch("https://admin-panel-backend-alpha.vercel.app/pbs-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newPlan = await res.json();
          setPlans((prev) => [...prev, newPlan]);
          alert("PBS Plan created successfully!");
        } else {
          alert("Failed to create PBS plan");
        }
      }

      // Reset form
      setShowForm(false);
      setSelectedPlan("");
      setEditingPlanId(null);
      setFormData({
        notes: "",
        frequency: "",
        assistanceLevel: "",
        dietType: "",
        sleepRoutine: "",
      });
    } catch (error) {
      console.error("Error saving PBS plan:", error);
      alert("An error occurred while saving the plan");
    }
  };

  const handleEdit = (plan) => {
    setEditingPlanId(plan._id); // ✅ Use MongoDB _id
    setSelectedPlan(plan.type);
    setFormData({
      planTitle: plan.planTitle || "",
      hypothesisedFunction: plan.hypothesisedFunction || "",
      nextReviewDate: plan.nextReviewDate ? plan.nextReviewDate.slice(0, 10) : "",
      targetBehaviours: plan.targetBehaviours || "",
      settingEvents: plan.settingEvents || "",
      generalApproach: plan.generalApproach || "",
      skillDevelopment: plan.skillDevelopment || "",
      earlyWarningSigns: plan.earlyWarningSigns || "",
      step1Response: plan.step1Response || "",
      step1: plan.step1 || "",
      step2Intervention: plan.step2Intervention || "",
      step2: plan.step2 || "",
      step3HighRisk: plan.step3HighRisk || "",
      step3: plan.step3 || "",
      notes: plan.notes || "",
      frequency: plan.frequency || "",
      assistanceLevel: plan.assistanceLevel || "",
      dietType: plan.dietType || "",
      sleepRoutine: plan.sleepRoutine || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this PBS plan?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/pbs-plan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPlans((prev) => prev.filter((plan) => plan._id !== id));
        alert("PBS Plan deleted successfully!");
      } else {
        alert("Failed to delete PBS plan");
      }
    } catch (error) {
      console.error("Error deleting PBS plan:", error);
      alert("An error occurred while deleting the plan");
    }
  };

  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("PBS Plan Details", 14, 15);

    // Build main rows
    const mainRows = [];
    if (item.planTitle) mainRows.push(["Plan Title", item.planTitle]);
    if (item.type) mainRows.push(["Plan Type", item.type]);
    if (item.nextReviewDate) 
      mainRows.push(["Next Review Date", new Date(item.nextReviewDate).toLocaleDateString()]);
    if (item.status) mainRows.push(["Status", item.status]);
    if (item.hypothesisedFunction) 
      mainRows.push(["Hypothesised Function", item.hypothesisedFunction]);
    if (item.targetBehaviours) 
      mainRows.push(["Target Behaviours", item.targetBehaviours]);
    if (item.settingEvents) 
      mainRows.push(["Setting Events & Triggers", item.settingEvents]);
    if (item.generalApproach) 
      mainRows.push(["General Approach", item.generalApproach]);
    if (item.skillDevelopment) 
      mainRows.push(["Skill Development", item.skillDevelopment]);
    if (item.earlyWarningSigns) 
      mainRows.push(["Early Warning Signs", item.earlyWarningSigns]);
    if (item.step1Response || item.step1) 
      mainRows.push(["Step 1: First Response", item.step1Response || item.step1]);
    if (item.step2Intervention || item.step2) 
      mainRows.push(["Step 2: Intervention", item.step2Intervention || item.step2]);
    if (item.step3HighRisk || item.step3) 
      mainRows.push(["Step 3: High Risk Response", item.step3HighRisk || item.step3]);
    if (item.notes) mainRows.push(["Notes", item.notes]);
    if (item.frequency) mainRows.push(["Frequency", item.frequency]);
    if (item.assistanceLevel) mainRows.push(["Assistance Level", item.assistanceLevel]);
    if (item.dietType) mainRows.push(["Diet Type", item.dietType]);
    if (item.sleepRoutine) mainRows.push(["Sleep Routine", item.sleepRoutine]);

    if (mainRows.length) {
      autoTable(doc, {
        startY: 25,
        head: [["Field", "Value"]],
        body: mainRows,
        styles: { cellPadding: 3, fontSize: 10 },
        headStyles: { fillColor: [74, 73, 212] },
      });
    }

    // Timestamps
    let currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 35;
    
    if (item.createdAt) {
      doc.setFontSize(10);
      doc.text(`Created: ${new Date(item.createdAt).toLocaleString()}`, 14, currentY);
      currentY += 6;
    }
    
    if (item.updatedAt) {
      doc.setFontSize(10);
      doc.text(`Last Updated: ${new Date(item.updatedAt).toLocaleString()}`, 14, currentY);
    }

    // Save PDF
    const filename = item.planTitle 
      ? `${item.planTitle.replace(/\s+/g, '_')}_PBS_Plan.pdf`
      : `PBS_Plan_${item._id}.pdf`;
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
            <FaBrain className="w-5 h-5" />
            <span className="whitespace-normal">PBS Plans & Complex Behaviour Profile</span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
            >
              <FaPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">Create New Behaviour Plan</span>
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
          <h3 className="text-white font-semibold mb-3 text-lg">
            Active Behaviour Support Plans
          </h3>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-700">
                <tr>
                  {[
                    "PBS Plan Title",
                    "Type",
                    "Last Review Date",
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
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    // Determine status color based on hypothesisedFunction
                    const getStatusColor = () => {
                      const fn = item.hypothesisedFunction || "";
                      if (fn.toLowerCase().includes("risk"))
                        return "bg-red-500 text-white";
                      if (fn.toLowerCase().includes("health"))
                        return "bg-blue-500 text-white";
                      if (fn.toLowerCase().includes("due"))
                        return "bg-yellow-500 text-black";
                      return "bg-blue-500 text-white"; // default
                    };
                    return (
                      <tr key={item._id}>
                        <td className="px-4 py-3 text-white">
                          {item.planTitle || "PBS Plan"}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {item.type || ""}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {item.nextReviewDate 
                            ? new Date(item.nextReviewDate).toLocaleDateString('en-CA') 
                            : ""}
                        </td>

                        <td>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getStatusColor()}`}
                          >
                            {item.hypothesisedFunction || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex space-x-3 text-white text-sm relative">
                            <button 
                              onClick={() => handleView(item)}
                              className="hover:text-blue-500 cursor-pointer"
                              title="View"
                            >
                              <FaEye />
                            </button>

                            <button
                              onClick={() => handleDelete(item._id)}
                              className="hover:text-red-500 cursor-pointer"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center px-4 py-20 text-gray-400"
                    >
                      No PBS Plans Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-xl rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">
                {editingPlanId
                  ? "Edit Behaviour Support Plan"
                  : "Create Behaviour Support Plan"}
              </h2>

              {/* Close (X) button top-right */}
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
                <label className="text-white text-sm">
                  Select Behaviour Support Plan Type
                </label>
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
                  {/* Create New Core Behaviour Support Plan/////////////////////////////////////////////////////////////// */}

                  {/* Specific Fields */}
                  {selectedPlan === "Core Behaviour Support Plan" && (
                    <div className="space-y-4 text-white max-h-[70vh] overflow-y-auto p-2">
                      <h3 className="text-lg font-semibold">
                        Create New Core Behaviour Support Plan
                      </h3>

                      {/* Plan Title */}
                      {/* Plan Title */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Plan Title
                        </label>
                        <input
                          type="text"
                          name="planTitle"
                          placeholder="e.g., Core Behaviour Support – John Smith (Q1 2025)"
                          value={formData.planTitle || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                        />
                      </div>

                      {/* Next Review Date */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Next Review Date
                        </label>
                        <input
                          type="date"
                          name="nextReviewDate"
                          value={formData.nextReviewDate || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                        />
                      </div>

                      {/* Target Behaviours */}
                      <textarea
                        name="targetBehaviours"
                        placeholder="e.g., Physical aggression when asked to complete tasks, self-injury during transitions"
                        value={formData.targetBehaviours || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={3}
                      />

                      {/* Setting Events */}
                      <textarea
                        name="settingEvents"
                        placeholder="e.g., Loud environments, lack of sleep, changes in routine before incidents"
                        value={formData.settingEvents || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={3}
                      />

                      {/* Function Select */}
                      <select
                        name="hypothesisedFunction"
                        value={formData.hypothesisedFunction || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded text-white"
                      >
                        <option value="">Select Primary Function</option>
                        <option value="Risk - Access to Attention">
                          Risk - Access to Attention
                        </option>
                        <option value="Risk - Escape/Avoidance of Demand/Task">
                          Risk - Escape/Avoidance of Demand/Task
                        </option>
                        <option value="Health - Access to Tangible Items/Activities">
                          Health - Access to Tangible Items/Activities
                        </option>
                        <option value="Health - Automatic/Sensory Stimulation">
                          Health - Automatic/Sensory Stimulation
                        </option>
                        <option value="Due Soon - Review Required">
                          Due Soon - Review Required
                        </option>
                      </select>

                      {/* General Approach */}
                      <textarea
                        name="generalApproach"
                        placeholder="e.g., Provide calm environment, reduce background noise, use visual schedules"
                        value={formData.generalApproach || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={3}
                      />

                      {/* Skill Development */}
                      <textarea
                        name="skillDevelopment"
                        placeholder="e.g., Teach communication using picture cards, role-play social skills"
                        value={formData.skillDevelopment || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={3}
                      />

                      {/* Early Warning Signs */}
                      <textarea
                        name="earlyWarningSigns"
                        placeholder="e.g., Pacing, clenched fists, verbal refusal, increased breathing rate"
                        value={formData.earlyWarningSigns || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={3}
                      />

                      {/* Step 1 */}
                      <textarea
                        name="step1Response"
                        placeholder="e.g., Use calm voice, give clear simple instructions, offer support"
                        value={formData.step1Response || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={2}
                      />

                      {/* Step 2 */}
                      <textarea
                        name="step2Intervention"
                        placeholder="e.g., Remove triggers, guide to quiet area, provide sensory tools"
                        value={formData.step2Intervention || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={2}
                      />

                      {/* Step 3 */}
                      <textarea
                        name="step3HighRisk"
                        placeholder="e.g., Call for additional staff, follow safety protocol, ensure physical safety"
                        value={formData.step3HighRisk || ""}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Specialised Epilepsy Plan///////////////////////////////////////// */}

                  {selectedPlan === "Specialised Epilepsy Plan" && (
                    <div className="space-y-4 text-white max-h-[70vh] overflow-y-auto p-2">
                      <h3 className="text-lg font-semibold">
                        Create New Specialised Epilepsy Plan
                      </h3>

                      {/* Plan Title */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Plan Title
                        </label>
                        <input
                          type="text"
                          name="planTitle"
                          placeholder="e.g., PBS Core Plan - Q4 2025"
                          value={formData.planTitle || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                        />
                      </div>

                      {/* Next Review Date */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Next Review Date
                        </label>
                        <input
                          type="date"
                          name="nextReviewDate"
                          value={formData.nextReviewDate || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                        />
                      </div>

                      {/* SECTION 1 */}
                      <h4 className="font-semibold text-primary-light">
                        1. Functional Assessment Summary
                      </h4>

                      <div>
                        <label className="text-sm text-gray-400">
                          Target Behaviour(s) (e.g., Aggression, Self-injury)
                        </label>
                        <textarea
                          name="targetBehaviours"
                          placeholder="List the specific challenging behaviours this plan addresses."
                          value={formData.targetBehaviours || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-400">
                          Setting Events & Triggers (A - Antecedents)
                        </label>
                        <textarea
                          name="settingEvents"
                          placeholder="What often precedes the behaviour..."
                          value={formData.settingEvents || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-400">
                          Hypothesised Function (F - Function)
                        </label>
                        <select
                          name="hypothesisedFunction"
                          value={formData.hypothesisedFunction || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                        >
                          <option value="">Select Primary Function</option>
                          <option value="Risk - Access to Attention">
                            Risk - Access to Attention
                          </option>
                          <option value="Risk - Escape/Avoidance of Demand/Task">
                            Risk - Escape/Avoidance of Demand/Task
                          </option>
                          <option value="Health - Access to Tangible Items/Activities">
                            Health - Access to Tangible Items/Activities
                          </option>
                          <option value="Health - Automatic/Sensory Stimulation">
                            Health - Automatic/Sensory Stimulation
                          </option>
                          <option value="Due Soon - Review Required">
                            Due Soon - Review Required
                          </option>
                        </select>
                      </div>

                      {/* SECTION 2 */}
                      <h4 className="font-semibold text-primary-light">
                        2. Proactive Strategies
                      </h4>

                      <div>
                        <label className="text-sm text-gray-400">
                          General Approach & Environmental Supports
                        </label>
                        <textarea
                          name="generalApproach"
                          placeholder="How staff prevent incidents..."
                          value={formData.generalApproach || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-400">
                          Skill Development Focus
                        </label>
                        <textarea
                          name="skillDevelopment"
                          placeholder="Skills being taught to replace the behaviour..."
                          value={formData.skillDevelopment || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                          rows={3}
                        />
                      </div>

                      {/* SECTION 3 */}
                      <h4 className="font-semibold text-primary-light">
                        3. Reactive Strategies (Management)
                      </h4>

                      <div>
                        <label className="text-sm text-gray-400">
                          Early Warning Signs (Pre-cursor Behaviours)
                        </label>
                        <textarea
                          name="earlyWarningSigns"
                          placeholder="List subtle behaviours..."
                          value={formData.earlyWarningSigns || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-400">
                          Step 1: First Response
                        </label>
                        <textarea
                          name="step1"
                          placeholder="Remain calm, increase space..."
                          value={formData.step1 || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-400">
                          Step 2: Intervention
                        </label>
                        <textarea
                          name="step2"
                          placeholder="Offer a choice, redirect activity..."
                          value={formData.step2 || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-400">
                          Step 3: High Risk Response
                        </label>
                        <textarea
                          name="step3"
                          placeholder="Call for 2:1 support..."
                          value={formData.step3 || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {/* Focused Risk Assessment////////////////////////////////////////////////////////////////////// */}

                  {selectedPlan === "Focused Risk Assessment" && (
                    <div className="space-y-4 text-white max-h-[70vh] overflow-y-auto p-2">
                      <h3 className="text-lg font-semibold">
                        Create New Focused Risk Assessment Plan
                      </h3>

                      {/* Plan Title */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Plan Title
                        </label>
                        <input
                          type="text"
                          name="planTitle"
                          placeholder="e.g., PBS Core Plan - Q4 2025"
                          value={formData.planTitle || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                        />
                      </div>

                      {/* Next Review Date */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Next Review Date
                        </label>
                        <input
                          type="date"
                          name="nextReviewDate"
                          value={formData.nextReviewDate || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                        />
                      </div>

                      {/* Section 1 */}
                      <h4 className="text-md font-semibold pt-2 border-t border-gray-600">
                        1. Functional Assessment Summary
                      </h4>

                      {/* Target Behaviours */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Target Behaviour(s) (e.g., Aggression, Self-injury)
                        </label>
                        <textarea
                          name="targetBehaviours"
                          placeholder="List the specific challenging behaviours this plan addresses."
                          value={formData.targetBehaviours || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* Setting Events */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Setting Events & Triggers (A - Antecedents)
                        </label>
                        <textarea
                          name="settingEvents"
                          placeholder="e.g., Change in routine, refusal of demand, loud noises, perceived loss of control."
                          value={formData.settingEvents || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* Hypothesised Function */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Hypothesised Function (F - Function)
                        </label>
                        <select
                          name="hypothesisedFunction"
                          value={formData.hypothesisedFunction || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                        >
                          <option value="">Select Primary Function</option>
                          <option value="Risk - Access to Attention">
                            Risk - Access to Attention
                          </option>
                          <option value="Risk - Escape/Avoidance of Demand/Task">
                            Risk - Escape/Avoidance of Demand/Task
                          </option>
                          <option value="Health - Access to Tangible Items/Activities">
                            Health - Access to Tangible Items/Activities
                          </option>
                          <option value="Health - Automatic/Sensory Stimulation">
                            Health - Automatic/Sensory Stimulation
                          </option>
                          <option value="Due Soon - Review Required">
                            Due Soon - Review Required
                          </option>
                        </select>
                      </div>

                      {/* Section 2 */}
                      <h4 className="text-md font-semibold pt-2 border-t border-gray-600">
                        2. Proactive Strategies
                      </h4>

                      {/* General Approach */}
                      <div>
                        <label className="text-sm text-gray-400">
                          General Approach & Environmental Supports
                        </label>
                        <textarea
                          name="generalApproach"
                          placeholder="How staff prevent incidents: maintain predictable schedule, use visual timetable, offer choices, use 'first/then' prompts, use robust furniture."
                          value={formData.generalApproach || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* Skill Development */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Skill Development Focus
                        </label>
                        <textarea
                          name="skillDevelopment"
                          placeholder="Skills being taught to replace the target behaviour (e.g., communication skills to ask for a break)."
                          value={formData.skillDevelopment || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* Section 3 */}
                      <h4 className="text-md font-semibold pt-2 border-t border-gray-600">
                        3. Reactive Strategies (Management)
                      </h4>

                      {/* Early Warning Signs */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Early Warning Signs (Pre-cursor Behaviours)
                        </label>
                        <textarea
                          name="earlyWarningSigns"
                          placeholder="List the subtle behaviours that indicate an incident is likely to occur."
                          value={formData.earlyWarningSigns || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* De-escalation Protocol */}
                      <h5 className="text-sm font-semibold text-gray-300 mt-2">
                        De-escalation Protocol (Step-by-Step)
                      </h5>

                      {/* Step 1 */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Step 1: First Response
                        </label>
                        <textarea
                          name="step1Response"
                          placeholder="e.g., Remain calm, increase space (refer to Section 3.2 of Active PBS Plan)."
                          value={formData.step1Response || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={2}
                        />
                      </div>

                      {/* Step 2 */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Step 2: Intervention
                        </label>
                        <textarea
                          name="step2Intervention"
                          placeholder="e.g., Offer a choice, redirect to a preferred activity."
                          value={formData.step2Intervention || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={2}
                        />
                      </div>

                      {/* Step 3 */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Step 3: High Risk Response
                        </label>
                        <textarea
                          name="step3HighRisk"
                          placeholder="e.g., Call for 2:1 support, use safety holding technique (if trained and authorized)."
                          value={formData.step3HighRisk || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {/* Generic Care Plan///////////////////////////////////////////////////////////////////// */}

                  {selectedPlan === "Generic Care Plan" && (
                    <div className="space-y-4 text-white max-h-[70vh] overflow-y-auto p-2">
                      <h3 className="text-lg font-semibold">
                        Create New Generic Care Plan (e.g., Mental Health,
                        Continence)
                      </h3>

                      {/* Plan Title */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Plan Title
                        </label>
                        <input
                          type="text"
                          name="planTitle"
                          placeholder="e.g., Care Plan - Mental Health Support"
                          value={formData.planTitle || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                        />
                      </div>

                      {/* Next Review Date */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Next Review Date
                        </label>
                        <input
                          type="date"
                          name="nextReviewDate"
                          value={formData.nextReviewDate || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                        />
                      </div>

                      {/* Section 1 */}
                      <h4 className="text-md font-semibold pt-2 border-t border-gray-600">
                        1. Functional Assessment Summary
                      </h4>

                      {/* Target Behaviours */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Target Behaviour(s) (e.g., Aggression, Self-injury)
                        </label>
                        <textarea
                          name="targetBehaviours"
                          placeholder="List the specific challenging behaviours this care plan addresses."
                          value={formData.targetBehaviours || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* Setting Events */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Setting Events & Triggers (A - Antecedents)
                        </label>
                        <textarea
                          name="settingEvents"
                          placeholder="e.g., Change in routine, refusal of demand, loud noises, perceived loss of control."
                          value={formData.settingEvents || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* Hypothesised Function */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Hypothesised Function (F - Function)
                        </label>
                        <select
                          name="hypothesisedFunction"
                          value={formData.hypothesisedFunction || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded text-white"
                        >
                          <option value="">Select Primary Function</option>
                          <option value="Access to Attention">
                            Access to Attention
                          </option>
                          <option value="Escape/Avoidance of Demand/Task">
                            Escape/Avoidance of Demand/Task
                          </option>
                          <option value="Access to Tangible Items/Activities">
                            Access to Tangible Items/Activities
                          </option>
                          <option value="Automatic/Sensory Stimulation">
                            Automatic/Sensory Stimulation
                          </option>
                        </select>
                      </div>

                      {/* Section 2 */}
                      <h4 className="text-md font-semibold pt-2 border-t border-gray-600">
                        2. Proactive Strategies
                      </h4>

                      {/* General Approach */}
                      <div>
                        <label className="text-sm text-gray-400">
                          General Approach & Environmental Supports
                        </label>
                        <textarea
                          name="generalApproach"
                          placeholder="How staff prevent incidents: maintain predictable schedule, use visual timetable, offer choices, use 'first/then' prompts, use robust furniture."
                          value={formData.generalApproach || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* Skill Development */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Skill Development Focus
                        </label>
                        <textarea
                          name="skillDevelopment"
                          placeholder="Skills being taught to replace the target behaviour (e.g., communication skills to ask for help)."
                          value={formData.skillDevelopment || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* Section 3 */}
                      <h4 className="text-md font-semibold pt-2 border-t border-gray-600">
                        3. Reactive Strategies (Management)
                      </h4>

                      {/* Early Warning Signs */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Early Warning Signs (Pre-cursor Behaviours)
                        </label>
                        <textarea
                          name="earlyWarningSigns"
                          placeholder="List the subtle behaviours that indicate a situation may escalate."
                          value={formData.earlyWarningSigns || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={3}
                        />
                      </div>

                      {/* De-escalation Protocol */}
                      <h5 className="text-sm font-semibold text-gray-300 mt-2">
                        De-escalation Protocol (Step-by-Step)
                      </h5>

                      {/* Step 1 */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Step 1: First Response
                        </label>
                        <textarea
                          name="step1Response"
                          placeholder="e.g., Remain calm, increase space, use a soft tone of voice."
                          value={formData.step1Response || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={2}
                        />
                      </div>

                      {/* Step 2 */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Step 2: Intervention
                        </label>
                        <textarea
                          name="step2Intervention"
                          placeholder="e.g., Offer choices, redirect to a safe or preferred activity."
                          value={formData.step2Intervention || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={2}
                        />
                      </div>

                      {/* Step 3 */}
                      <div>
                        <label className="text-sm text-gray-400">
                          Step 3: High Risk Response
                        </label>
                        <textarea
                          name="step3HighRisk"
                          placeholder="e.g., Call for additional support, follow safeguarding procedures."
                          value={formData.step3HighRisk || ""}
                          onChange={handleChange}
                          className="w-full p-2 bg-gray-700 rounded"
                          rows={2}
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
                    >
                      {editingPlanId ? "Update Plan" : "Save Care Plan"}
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
            <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">
                {viewPlan.type} Details
              </h2>
              <div className="space-y-2 text-white text-sm">
                <p>
                  <strong>Notes:</strong> {viewPlan.notes || "N/A"}
                </p>
                {viewPlan.frequency && (
                  <p>
                    <strong>Frequency:</strong> {viewPlan.frequency}
                  </p>
                )}
                {viewPlan.assistanceLevel && (
                  <p>
                    <strong>Assistance Level:</strong>{" "}
                    {viewPlan.assistanceLevel}
                  </p>
                )}
                {viewPlan.dietType && (
                  <p>
                    <strong>Diet Type:</strong> {viewPlan.dietType}
                  </p>
                )}
                {viewPlan.sleepRoutine && (
                  <p>
                    <strong>Sleep Routine:</strong> {viewPlan.sleepRoutine}
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={closeView}
                  className="bg-gray-600 px-4 py-2 rounded text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Archived Modal */}
        {showArchived && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">
                Archived Behaviour Support Plans
              </h2>

              {/* Close */}
              <button
                type="button"
                onClick={() => setShowArchived(false)}
                aria-label="Close archived"
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <FaTimes />
              </button>

              <div className="text-white text-sm max-h-[60vh] overflow-y-auto">
                {archivedPlans && archivedPlans.length > 0 ? (
                  <div className="space-y-3">
                    {archivedPlans.map((plan) => (
                      <div key={plan._id} className="bg-gray-700 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">
                              {plan.planTitle || plan.type || "PBS Plan"}
                            </div>
                            <div className="text-gray-300 text-sm">
                              Created: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "N/A"}
                              {plan.nextReviewDate && ` — Review: ${new Date(plan.nextReviewDate).toLocaleDateString()}`}
                            </div>
                            {plan.type && (
                              <div className="text-gray-400 text-xs mt-1">
                                Type: {plan.type}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                handleView(plan);
                                setShowArchived(false);
                              }}
                              className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this archived plan?")) {
                                  handleDelete(plan._id);
                                  setArchivedPlans(prev => prev.filter(p => p._id !== plan._id));
                                }
                              }}
                              className="text-red-400 hover:text-red-300 px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No archived plans found (older than 6 months).
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowArchived(false)}
                  className="bg-gray-600 px-4 py-2 rounded text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewPlan && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-3xl rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh]"
              style={{ backgroundColor: "#111827", color: "#ffffff" }}
            >
              <h2 className="text-2xl font-semibold mb-6">
                {viewPlan.type || "PBS Plan"} - Details
              </h2>

              <div className="space-y-4 text-sm">
                {/* Plan Title */}
                {viewPlan.planTitle && (
                  <div>
                    <strong>Plan Title:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewPlan.planTitle}</p>
                  </div>
                )}

                {/* Plan Type */}
                {viewPlan.type && (
                  <div>
                    <strong>Plan Type:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewPlan.type}</p>
                  </div>
                )}

                {/* Next Review Date */}
                {viewPlan.nextReviewDate && (
                  <div>
                    <strong>Next Review Date:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {new Date(viewPlan.nextReviewDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Status */}
                {viewPlan.status && (
                  <div>
                    <strong>Status:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewPlan.status}</p>
                  </div>
                )}

                {/* Hypothesised Function */}
                {viewPlan.hypothesisedFunction && (
                  <div>
                    <strong>Hypothesised Function:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewPlan.hypothesisedFunction}</p>
                  </div>
                )}

                {/* Target Behaviours */}
                {viewPlan.targetBehaviours && (
                  <div>
                    <strong>Target Behaviours:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewPlan.targetBehaviours}</p>
                  </div>
                )}

                {/* Setting Events */}
                {viewPlan.settingEvents && (
                  <div>
                    <strong>Setting Events & Triggers:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewPlan.settingEvents}</p>
                  </div>
                )}

                {/* General Approach */}
                {viewPlan.generalApproach && (
                  <div>
                    <strong>General Approach:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewPlan.generalApproach}</p>
                  </div>
                )}

                {/* Skill Development */}
                {viewPlan.skillDevelopment && (
                  <div>
                    <strong>Skill Development:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewPlan.skillDevelopment}</p>
                  </div>
                )}

                {/* Early Warning Signs */}
                {viewPlan.earlyWarningSigns && (
                  <div>
                    <strong>Early Warning Signs:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewPlan.earlyWarningSigns}</p>
                  </div>
                )}

                {/* Step 1 Response */}
                {(viewPlan.step1Response || viewPlan.step1) && (
                  <div>
                    <strong>Step 1: First Response:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">
                      {viewPlan.step1Response || viewPlan.step1}
                    </p>
                  </div>
                )}

                {/* Step 2 Intervention */}
                {(viewPlan.step2Intervention || viewPlan.step2) && (
                  <div>
                    <strong>Step 2: Intervention:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">
                      {viewPlan.step2Intervention || viewPlan.step2}
                    </p>
                  </div>
                )}

                {/* Step 3 High Risk */}
                {(viewPlan.step3HighRisk || viewPlan.step3) && (
                  <div>
                    <strong>Step 3: High Risk Response:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">
                      {viewPlan.step3HighRisk || viewPlan.step3}
                    </p>
                  </div>
                )}

                {/* Additional Fields */}
                {viewPlan.notes && (
                  <div>
                    <strong>Notes:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewPlan.notes}</p>
                  </div>
                )}

                {viewPlan.frequency && (
                  <div>
                    <strong>Frequency:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewPlan.frequency}</p>
                  </div>
                )}

                {viewPlan.assistanceLevel && (
                  <div>
                    <strong>Assistance Level:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewPlan.assistanceLevel}</p>
                  </div>
                )}

                {viewPlan.dietType && (
                  <div>
                    <strong>Diet Type:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewPlan.dietType}</p>
                  </div>
                )}

                {viewPlan.sleepRoutine && (
                  <div>
                    <strong>Sleep Routine:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewPlan.sleepRoutine}</p>
                  </div>
                )}

                {/* Timestamps */}
                {viewPlan.createdAt && (
                  <div>
                    <strong>Created:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {new Date(viewPlan.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {viewPlan.updatedAt && (
                  <div>
                    <strong>Last Updated:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {new Date(viewPlan.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 flex-wrap">
                <button
                  onClick={closeView}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                >
                  Close
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

                <button
                  onClick={() => handleDelete(viewPlan._id)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete Plan
                </button>

                <button
                  onClick={() => {
                    handleEdit(viewPlan);
                    closeView();
                  }}
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResidentProfilePBSplan;
