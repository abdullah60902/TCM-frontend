"use client";
import React, { useState, useEffect } from "react";
import { FiEdit2, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";

const StafProfilePersonalEmp = ({ staff }) => {
const [staffInfo, setStaffInfo] = useState(null);

// Fetch staff info
useEffect(() => {
  console.log("useEffect fired, staffId:", staff);
  if (!staff) return;
  const token = localStorage.getItem("token");
  console.log("Using token:", token);

  fetch(`https://admin-panel-backend-alpha.vercel.app/hr/${staff}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async res => {
      console.log("Response status:", res.status);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      return res.json();
    })
    .then(data => {
      console.log("Fetched staff data:", data);
      setStaffInfo(data);
    })
    .catch(err => console.log("Staff Fetch Error:", err));
}, [staff]);

// Update a field in backend
const updateField = async (field, value) => {
try {
await fetch(`https://admin-panel-backend-alpha.vercel.app/hr/${staff}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`,
},
body: JSON.stringify({ [field]: value }),
});
setStaffInfo(prev => ({ ...prev, [field]: value }));
toast.success(`${field} updated successfully`);
} catch (err) {
console.error(err);
toast.error("Update failed");
}
};

// Editable field component
const EditableField = ({ label, dbField, value: initialValue }) => {
const [value, setValue] = useState(initialValue);
const [isEditing, setIsEditing] = useState(false);


const dropdownOptions = {
  department: ["Nursing","Care","Administration","Management","Support"],
  careSetting: ["Residential Care","Nursing Homes","Learning Disabilities","Supported Living","Mental Health Support","Domiciliary Care","Other Services"],
};

const isDropdown = dropdownOptions[dbField];
const isDateField = ["dob","startDate","passportExpiry","visaExpiry"].includes(dbField);

const handleSave = async () => {
  await updateField(dbField, value);
  setIsEditing(false);
};

return (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="block text-sm text-gray-400">{label}</label>
      <button
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-white ${
          isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
        }`}
        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
      >
        {isEditing ? <FiSave size={16} /> : <FiEdit2 size={16} />}
        <span className="ml-1">{isEditing ? "Save" : "Edit"}</span>
      </button>
    </div>

    {isEditing ? (
      isDropdown ? (
        <select
          className="w-full bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white"
          value={value}
          onChange={e => setValue(e.target.value)}
        >
          {dropdownOptions[dbField].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : isDateField ? (
        <input
          type="date"
          className="w-full bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="w-full bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      )
    ) : (
      <div className="bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white">{value || "N/A"}</div>
    )}
  </div>
);

};

if (!staffInfo) return <div className="text-white">Loading...</div>;

return ( <div className="space-y-6">
{/* Primary Identity */} <div className="bg-[#243041] p-4 rounded-lg"> <h2 className="text-white text-xl font-semibold mb-4">👤 Primary Identity</h2> <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
<EditableField label="Full Name" dbField="fullName" value={staffInfo.fullName || ""} />
<EditableField label="Date of Birth" dbField="dob" value={staffInfo.dob || ""} />
<EditableField label="National Insurance" dbField="niNumber" value={staffInfo.niNumber || ""} /> </div> </div>


  {/* Contact & Address */}
  <div className="bg-[#243041] p-4 rounded-lg">
    <h2 className="text-white text-xl font-semibold mb-4">📞 Contact & Home Address</h2>
    <div className="grid sm:grid-cols-2 gap-4">
      <EditableField label="Contact Number" dbField="contactNumber" value={staffInfo.contactNumber || ""} />
      <EditableField label="Email" dbField="email" value={staffInfo.email || ""} />
    </div>
    <EditableField label="Home Address" dbField="address" value={staffInfo.address || ""} />
  </div>

  {/* Next of Kin */}
  <div className="bg-[#243041] p-4 rounded-lg">
    <h2 className="text-white text-xl font-semibold mb-4">🚨 Next of Kin</h2>
    <div className="grid sm:grid-cols-2 gap-4">
      <EditableField label="Full Name" dbField="nextOfKinName" value={staffInfo.nextOfKinName || ""} />
      <EditableField label="Relationship" dbField="nextOfKinRelationship" value={staffInfo.nextOfKinRelationship || ""} />
      <EditableField label="Email" dbField="nextOfKinEmail" value={staffInfo.nextOfKinEmail || ""} />
    </div>
    <EditableField label="Address" dbField="nextOfKinAddress" value={staffInfo.nextOfKinAddress || ""} />
  </div>

  {/* Employment Details */}
  <div className="bg-[#243041] p-4 rounded-lg">
    <h2 className="text-white text-xl font-semibold mb-4">💼 Employment Details</h2>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      <EditableField label="Department" dbField="department" value={staffInfo.department || ""} />
      <EditableField label="Service Type" dbField="careSetting" value={staffInfo.careSetting || ""} />
      <EditableField label="Position" dbField="position" value={staffInfo.position || ""} />
      <EditableField label="Start Date" dbField="startDate" value={staffInfo.startDate?.slice(0,10) || ""} />
      <EditableField label="Termination Status" dbField="terminationStatus" value={staffInfo.terminationStatus || ""} />
      <EditableField label="Contract Details" dbField="contractDetails" value={staffInfo.contractDetails || ""} />
    </div>
  </div>

  {/* Compliance */}
  <div className="bg-[#243041] p-4 rounded-lg">
    <h2 className="text-white text-xl font-semibold mb-4">🛡️ Compliance & Eligibility</h2>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      <EditableField label="DBS Status" dbField="dbsStatus" value={staffInfo.dbsStatus || ""} />
      <EditableField label="Professional Registration" dbField="professionalRegistration" value={staffInfo.professionalRegistration || ""} />
      <EditableField label="Right to Work" dbField="rightToWorkStatus" value={staffInfo.rightToWorkStatus || ""} />
    </div>
  </div>

  {/* Passport & Visa */}
  <div className="bg-[#243041] p-4 rounded-lg">
    <h2 className="text-white text-xl font-semibold mb-4">📄 Passport & Visa</h2>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      <EditableField label="Passport Number" dbField="passportNumber" value={staffInfo.passportNumber || ""} />
      <EditableField label="Passport Country" dbField="passportCountry" value={staffInfo.passportCountry || ""} />
      <EditableField label="Passport Expiry" dbField="passportExpiry" value={staffInfo.passportExpiry || ""} />
      <EditableField label="Visa Required" dbField="visaRequired" value={staffInfo.visaRequired || ""} />
      <EditableField label="Visa Number" dbField="visaNumber" value={staffInfo.visaNumber || ""} />
      <EditableField label="Visa Expiry" dbField="visaExpiry" value={staffInfo.visaExpiry || ""} />
    </div>
  </div>
</div>

);
};

export default StafProfilePersonalEmp;
