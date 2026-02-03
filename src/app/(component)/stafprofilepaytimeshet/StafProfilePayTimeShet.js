"use client";
import React, { useEffect, useState } from "react";
import { FaDownload, FaTrashAlt } from "react-icons/fa";
import { FiEdit2, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";


const StafProfilePayTimeShet = ({ id }) => {
  const [payInfo, setPayInfo] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [timesheets, setTimesheets] = useState([]);

  const [showPayslipForm, setShowPayslipForm] = useState(false);
  const [newPayslip, setNewPayslip] = useState({ period: "", fileDate: "", file: null });

  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [newTimesheet, setNewTimesheet] = useState({ period: "", totalHours: "", status: "Pending Approval", file: null });

  // Fetch Pay Info
  useEffect(() => {
    if (!id) return;
    fetch(`https://admin-panel-backend-alpha.vercel.app/staffpay/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => res.json())
      .then(data => {
        setPayInfo(data || {});
        setPayslips(data?.payslips || []);
        setTimesheets(data?.timesheets || []);
      })
      .catch(err => console.log(err));
  }, [id]);

  // Save single field
const handleSaveField = async (field, value) => {
  try {
    const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/staffpay/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ [field]: value }),
    });

    const data = await res.json();

    setPayInfo(data.updated || {});

    // Toast success message
    toast.success(`${field} updated successfully`);
  } catch (err) {
    console.error(err);
    toast.error("Update failed");
  }
};

  // Upload Payslip
  const handlePayslipUpload = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("period", newPayslip.period);
    formData.append("fileDate", newPayslip.fileDate);
    formData.append("file", newPayslip.file);

    const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/staffpay/${id}/payslip`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });
    const data = await res.json();
    setPayslips(data.payslips || []);
    setNewPayslip({ period: "", fileDate: "", file: null });
    setShowPayslipForm(false);
  };

  // Upload Timesheet
  const handleTimesheetUpload = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("period", newTimesheet.period);
    formData.append("totalHours", newTimesheet.totalHours);
    formData.append("status", newTimesheet.status);
    formData.append("file", newTimesheet.file);

    const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/staffpay/${id}/timesheet`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });
    const data = await res.json();
    setTimesheets(data.timesheets || []);
    setNewTimesheet({ period: "", totalHours: "", status: "Pending Approval", file: null });
    setShowTimesheetForm(false);
  };

  const handleDeletePayslip = async (index) => {
    const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/staffpay/${id}/payslip/${index}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setPayslips(data.payslips || []);
  };

  const handleDeleteTimesheet = async (index) => {
    const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/staffpay/${id}/timesheet/${index}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setTimesheets(data.timesheets || []);
  };


  if (!payInfo) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Pay Grade */}
      <div className="bg-[#243041] p-4 rounded-lg">
        <h2 className="text-white text-xl font-semibold mb-4">💵 Pay Grade & Rates</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <EditableField label="Pay Type" field="payType" payInfo={payInfo} handleSaveField={handleSaveField} />
          <EditableField label="Pay Grade" field="payGrade" payInfo={payInfo} handleSaveField={handleSaveField} />
          <EditableField label="Hourly Rate" field="hourlyRate" payInfo={payInfo} handleSaveField={handleSaveField} />
          <EditableField label="Overtime Rate" field="overtimeRate" payInfo={payInfo} handleSaveField={handleSaveField} />
          <EditableField label="Tax Info" field="taxInfo" payInfo={payInfo} handleSaveField={handleSaveField} />
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-[#243041] p-4 rounded-lg">
        <h2 className="text-white text-xl font-semibold mb-4">🏦 Bank Account Details</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <EditableField label="Account Name" field="accountName" payInfo={payInfo} handleSaveField={handleSaveField} />
          <EditableField label="Sort Code" field="sortCode" payInfo={payInfo} handleSaveField={handleSaveField} />
          <EditableField label="Account Number" field="accountNumber" payInfo={payInfo} handleSaveField={handleSaveField} />
          <EditableField label="Bank Name" field="bankName" payInfo={payInfo} handleSaveField={handleSaveField} />
        </div>
      </div>

      {/* Payslip Section */}
      <div className="bg-[#243041] p-4 rounded-lg">
        <h2 className="text-white text-xl font-semibold mb-4">💰 Payslip Records</h2>
        <div className="flex justify-end mb-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => setShowPayslipForm(!showPayslipForm)}>
            {showPayslipForm ? "Close Form" : "Upload Payslip"}
          </button>
        </div>
        {showPayslipForm && (
          <form onSubmit={handlePayslipUpload} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="text" placeholder="Period" value={newPayslip.period} onChange={(e) => setNewPayslip({...newPayslip, period:e.target.value})} className="p-2 rounded bg-gray-700 text-white w-full sm:w-auto flex-1" required />
            <input type="date" value={newPayslip.fileDate} onChange={(e) => setNewPayslip({...newPayslip, fileDate:e.target.value})} className="p-2 rounded bg-gray-700 text-white w-full sm:w-auto" required />
            <input type="file" onChange={(e) => setNewPayslip({...newPayslip, file:e.target.files[0]})} className="p-2 rounded bg-gray-700 text-white w-full sm:w-auto" required />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add</button>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-gray-700">
              <tr><th className="p-2">Period</th><th className="p-2">File Date</th><th className="p-2">Document</th><th className="p-2">Actions</th></tr>
            </thead>
            <tbody>
              {payslips.length>0 ? payslips.map((item,i)=>(
                <tr key={i} className="border-b border-gray-700">
                  <td className="p-2">{item.period}</td>
                  <td className="p-2">{item.fileDate}</td>
                  <td className="p-2 text-blue-400">{item.fileUrl ? item.fileUrl.split("/").pop() : "File.pdf"}</td>
                {/* Payslip Table */}
<td className="p-2 flex gap-2">
  {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer"><FaDownload /></a>}
  <FaTrashAlt
    className="text-red-500 cursor-pointer"
    onClick={() => handleDeletePayslip(i)}
  />
</td>
                </tr>
              )) : <tr><td colSpan={4} className="text-center py-4 text-gray-400">No Payslips Found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timesheet Section */}
      <div className="bg-[#243041] p-4 rounded-lg">
        <h2 className="text-white text-xl font-semibold mb-4">⏱️ Timesheet Submissions</h2>
        <div className="flex justify-end mb-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={()=>setShowTimesheetForm(!showTimesheetForm)}>
            {showTimesheetForm ? "Close Form" : "Upload Timesheet"}
          </button>
        </div>
        {showTimesheetForm && (
          <form onSubmit={handleTimesheetUpload} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="text" placeholder="Period" value={newTimesheet.period} onChange={(e)=>setNewTimesheet({...newTimesheet, period:e.target.value})} className="p-2 rounded bg-gray-700 text-white w-full sm:w-auto flex-1" required />
            <input type="text" placeholder="Total Hours" value={newTimesheet.totalHours} onChange={(e)=>setNewTimesheet({...newTimesheet, totalHours:e.target.value})} className="p-2 rounded bg-gray-700 text-white w-full sm:w-auto" required />
            <input type="file" onChange={(e)=>setNewTimesheet({...newTimesheet, file:e.target.files[0]})} className="p-2 rounded bg-gray-700 text-white w-full sm:w-auto" required />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add</button>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-gray-700">
              <tr><th className="p-2">Period</th><th className="p-2">Hours</th><th className="p-2">Status</th><th className="p-2">Document</th><th className="p-2">Actions</th></tr>
            </thead>
            <tbody>
              {timesheets.length>0 ? timesheets.map((item,i)=>(
                <tr key={i} className="border-b border-gray-700">
                  <td className="p-2">{item.period}</td>
                  <td className="p-2">{item.totalHours}</td>
                  <td className="p-2">{item.status}</td>
                  <td className="p-2 text-blue-400">{item.fileUrl ? item.fileUrl.split("/").pop() : "File.pdf"}</td>
                 <td className="p-2 flex gap-2">
  {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer"><FaDownload /></a>}
  <FaTrashAlt
    className="text-red-500 cursor-pointer"
    onClick={() => handleDeleteTimesheet(i)}
  />
</td>
                </tr>
              )) : <tr><td colSpan={5} className="text-center py-4 text-gray-400">No Timesheets Found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EditableField = ({ label, field, payInfo, handleSaveField }) => {
  const [value, setValue] = useState(payInfo?.[field] || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(payInfo?.[field] || "");
  }, [payInfo, field]);

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm text-gray-300">{label}</label>
        <button
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded text-white ${
            isEditing ? "bg-green-600" : "bg-blue-600"
          }`}
          onClick={() => {
            if (isEditing) handleSaveField(field, value);
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? <FiSave size={14} /> : <FiEdit2 size={14} />}{" "}
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
      {isEditing ? (
        <input
          className="bg-[#2d3b4e] border-l-4 border-blue-500 rounded-r p-2 w-full text-white"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <div className="bg-[#2d3b4e] border-l-4 border-blue-500 rounded-r p-2 text-white">
          {value || "N/A"}
        </div>
      )}
    </div>
  );
};

export default StafProfilePayTimeShet;
