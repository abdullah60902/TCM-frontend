# 🔌 Resident Management API Reference

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require JWT Bearer token authentication.

**Header Format:**
```javascript
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Getting the Token:**
```javascript
const token = localStorage.getItem("token");
```

---

## 📋 Client/Resident Endpoints

### 1. Get All Residents
**Endpoint:** `GET /client`

**Description:** Retrieves all residents in the system

**Headers:**
```javascript
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Response:**
```json
{
  "clients": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "age": 75,
      "roomNumber": 101,
      "careType": "Residential",
      "admissionDate": "2024-01-15T00:00:00.000Z",
      "status": "Active"
    }
  ]
}
```

**Frontend Implementation:**
```javascript
const fetchResidents = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get("https://admin-panel-backend-alpha.vercel.app/client", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.clients;
};
```

---

### 2. Get Single Resident
**Endpoint:** `GET /client/:id`

**Description:** Retrieves detailed information for a specific resident

**Parameters:**
- `id` (path parameter) - Resident's MongoDB ObjectId

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "John Doe",
  "age": 75,
  "roomNumber": 101,
  "careType": "Residential",
  "admissionDate": "2024-01-15T00:00:00.000Z",
  "dob": "1949-03-20T00:00:00.000Z",
  "gender": "Male",
  "niNo": "AB123456C",
  "nhsNumber": "1234567890",
  "ethnicity": "White British",
  "religion": "Christian",
  "primaryDiagnosis": "Dementia",
  "allergies": "Penicillin",
  "nokName": "Jane Doe",
  "nokPhone": "07700900000",
  "nokEmail": "jane@example.com",
  "nokAddress": "123 Main St, London",
  "gpDoctor": "Dr. Smith",
  "gpSurgery": "City Medical Centre",
  "profileImage": "https://cloudinary.com/image.jpg"
}
```

**Frontend Implementation:**
```javascript
const fetchResident = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`https://admin-panel-backend-alpha.vercel.app/client/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await response.json();
};
```

---

### 3. Create New Resident
**Endpoint:** `POST /client`

**Description:** Creates a new resident record

**Request Body:**
```json
{
  "fullName": "John Doe",
  "age": 75,
  "roomNumber": 101,
  "careType": "Residential",
  "admissionDate": "2024-01-15"
}
```

**Response:**
```json
{
  "message": "Client created successfully",
  "client": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "age": 75,
    "roomNumber": 101,
    "careType": "Residential",
    "admissionDate": "2024-01-15T00:00:00.000Z"
  }
}
```

**Frontend Implementation:**
```javascript
const createResident = async (formData) => {
  const token = localStorage.getItem("token");
  const payload = {
    fullName: formData.name,
    age: formData.age,
    roomNumber: formData.room,
    careType: formData.careType,
    admissionDate: formData.admitDate
  };
  
  const response = await axios.post(
    "https://admin-panel-backend-alpha.vercel.app/client",
    payload,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
```

---

### 4. Update Resident
**Endpoint:** `PUT /client/:id`

**Description:** Updates an existing resident record

**Parameters:**
- `id` (path parameter) - Resident's MongoDB ObjectId

**Request Body:**
```json
{
  "fullName": "John Doe",
  "age": 76,
  "roomNumber": 102,
  "careType": "Nursing",
  "admissionDate": "2024-01-15"
}
```

**Response:**
```json
{
  "message": "Client updated successfully",
  "client": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "age": 76,
    "roomNumber": 102,
    "careType": "Nursing"
  }
}
```

**Frontend Implementation:**
```javascript
const updateResident = async (id, formData) => {
  const token = localStorage.getItem("token");
  const payload = {
    fullName: formData.name,
    age: formData.age,
    roomNumber: formData.room,
    careType: formData.careType,
    admissionDate: formData.admitDate
  };
  
  const response = await axios.put(
    `https://admin-panel-backend-alpha.vercel.app/client/${id}`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
```

---

### 5. Delete Resident
**Endpoint:** `DELETE /client/:id`

**Description:** Deletes a resident record

**Parameters:**
- `id` (path parameter) - Resident's MongoDB ObjectId

**Response:**
```json
{
  "message": "Client deleted successfully"
}
```

**Frontend Implementation:**
```javascript
const deleteResident = async (id) => {
  const token = localStorage.getItem("token");
  await axios.delete(`https://admin-panel-backend-alpha.vercel.app/client/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

---

## 📄 Resident Documents Endpoints

### 1. Get Resident Documents
**Endpoint:** `GET /resident-documents/client/:clientId`

**Description:** Retrieves all documents for a specific resident

**Parameters:**
- `clientId` (path parameter) - Resident's MongoDB ObjectId

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "client": "507f1f77bcf86cd799439011",
    "category": "Medical Report",
    "expiryDate": "2025-12-31T00:00:00.000Z",
    "notes": "Annual health check",
    "fileUrl": "https://cloudinary.com/document.pdf",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Frontend Implementation:**
```javascript
const fetchDocuments = async (clientId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `https://admin-panel-backend-alpha.vercel.app/resident-documents/client/${clientId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return await response.json();
};
```

---

### 2. Upload Document
**Endpoint:** `POST /resident-documents`

**Description:** Uploads a new document for a resident

**Content-Type:** `multipart/form-data`

**Form Data:**
```javascript
{
  client: "507f1f77bcf86cd799439011",  // Resident ID
  category: "Medical Report",
  expiryDate: "2025-12-31",
  notes: "Annual health check",
  file: File object
}
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "_id": "507f1f77bcf86cd799439012",
    "client": "507f1f77bcf86cd799439011",
    "category": "Medical Report",
    "fileUrl": "https://cloudinary.com/document.pdf"
  }
}
```

**Frontend Implementation:**
```javascript
const uploadDocument = async (clientId, formData) => {
  const token = localStorage.getItem("token");
  
  const fd = new FormData();
  fd.append("client", clientId);
  fd.append("category", formData.category);
  fd.append("expiryDate", formData.expiryDate);
  fd.append("notes", formData.notes);
  fd.append("file", formData.file);
  
  const response = await fetch("https://admin-panel-backend-alpha.vercel.app/resident-documents", {
    method: "POST",
    body: fd,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

### 3. Delete Document
**Endpoint:** `DELETE /resident-documents/:id`

**Description:** Deletes a resident document

**Parameters:**
- `id` (path parameter) - Document's MongoDB ObjectId

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

**Frontend Implementation:**
```javascript
const deleteDocument = async (id) => {
  const token = localStorage.getItem("token");
  await fetch(`https://admin-panel-backend-alpha.vercel.app/resident-documents/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

---

## 🩺 Care Planning Endpoints

### Get Care Plans
**Endpoint:** `GET /carePlanning/client/:clientId`

**Description:** Retrieves all care plans for a resident

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "client": "507f1f77bcf86cd799439011",
    "planType": "Personal Care",
    "creationDate": "2024-01-15T00:00:00.000Z",
    "reviewDate": "2024-07-15T00:00:00.000Z",
    "careSetting": "Residential",
    "carePlanData": {
      "communicationNeeds": "Clear and simple language",
      "mobilityNeeds": "Requires walking frame",
      "dietaryNeeds": "Diabetic diet"
    }
  }
]
```

---

## 🛡️ PBS Plan Endpoints

### Get PBS Plans
**Endpoint:** `GET /pbs-plan/client/:clientId`

**Description:** Retrieves all PBS (Positive Behaviour Support) plans

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "client": "507f1f77bcf86cd799439011",
    "planTitle": "Anxiety Management",
    "type": "Behaviour Support",
    "targetBehaviours": "Agitation, pacing",
    "hypothesisedFunction": "Seeking comfort",
    "earlyWarningSigns": "Increased pacing, restlessness",
    "step1Response": "Gentle redirection",
    "step2Intervention": "Calming activities",
    "step3HighRisk": "Contact supervisor"
  }
]
```

---

## ⚠️ Risk Assessment Endpoints

### Get Risk Assessments
**Endpoint:** `GET /risk-assessment/client/:clientId`

**Description:** Retrieves all risk assessments for a resident

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "client": "507f1f77bcf86cd799439011",
    "dateOfAssessment": "2024-01-15T00:00:00.000Z",
    "overallRiskLevel": "Medium",
    "assessedBy": "Dr. Smith",
    "categories": {
      "falls": {
        "checked": true,
        "severity": "High",
        "frequency": "Occasional",
        "mitigations": "Walking frame, non-slip mats"
      }
    }
  }
]
```

---

## 🎯 Goals & Outcomes Endpoints

### Get Goals
**Endpoint:** `GET /goals/client/:clientId`

**Description:** Retrieves all goals for a resident

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "client": "507f1f77bcf86cd799439011",
    "title": "Improve mobility",
    "metric": "Walk 50 meters independently",
    "startDate": "2024-01-15T00:00:00.000Z",
    "targetDate": "2024-06-15T00:00:00.000Z",
    "status": "In Progress",
    "statusHistory": [
      {
        "status": "Started",
        "changedAt": "2024-01-15T00:00:00.000Z"
      }
    ]
  }
]
```

---

## 📖 Daily Log Endpoints

### Get Daily Logs
**Endpoint:** `GET /daily-log/client/:clientId`

**Description:** Retrieves all daily logs for a resident

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439017",
    "client": "507f1f77bcf86cd799439011",
    "dateTime": "2024-01-15T14:30:00.000Z",
    "staffName": "Sarah Johnson",
    "moodEmoji": "happy",
    "bristolScore": 4,
    "heartRate": 72,
    "healthQuick": "Good",
    "notes": "Resident in good spirits, participated in activities"
  }
]
```

---

## 💊 Medication Endpoints

### Get Medications
**Endpoint:** `GET /medications/client/:clientId`

**Description:** Retrieves all medications for a resident

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439018",
    "client": "507f1f77bcf86cd799439011",
    "medicationName": "Aspirin",
    "schedule": {
      "frequency": "Daily",
      "times": ["08:00", "20:00"]
    },
    "stock": {
      "quantity": 50
    },
    "status": "Active"
  }
]
```

### Get Administration Records
**Endpoint:** `GET /medication-administration`

**Description:** Retrieves all medication administration records

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439019",
    "client": "507f1f77bcf86cd799439011",
    "medication": {
      "medicationName": "Aspirin"
    },
    "date": "2024-01-15T00:00:00.000Z",
    "time": "08:00",
    "given": true,
    "caregiverName": "Sarah Johnson"
  }
]
```

---

## 📝 Consent Endpoints

### Get Consent Forms
**Endpoint:** `GET /consent/client/:clientId`

**Description:** Retrieves all consent forms for a resident

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd79943901a",
    "client": "507f1f77bcf86cd799439011",
    "dolsInPlace": "Yes",
    "authorizationEndDate": "2025-01-15T00:00:00.000Z",
    "conditions": "Standard care restrictions"
  }
]
```

---

## 🔄 Handover Endpoints

### Get Handovers
**Endpoint:** `GET /handover/client/:clientId`

**Description:** Retrieves all handover records for a resident

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd79943901b",
    "client": "507f1f77bcf86cd799439011",
    "date": "2024-01-15T00:00:00.000Z",
    "time": "14:00",
    "handingOver": "Sarah Johnson",
    "takingOver": "Mike Smith",
    "summaryNotes": "Resident had good day, ate well"
  }
]
```

---

## 🔒 Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Client not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation Error",
  "message": "Missing required fields"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server Error",
  "message": "An unexpected error occurred"
}
```

### Frontend Error Handling Example:
```javascript
try {
  const response = await axios.get(`https://admin-panel-backend-alpha.vercel.app/client/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error("Error:", error.response.data.message);
    alert(error.response.data.message);
  } else if (error.request) {
    // No response received
    console.error("No response from server");
    alert("Unable to connect to server");
  } else {
    // Other error
    console.error("Error:", error.message);
  }
}
```

---

## 📊 Data Models

### Client/Resident Model
```javascript
{
  _id: ObjectId,
  fullName: String (required),
  age: Number (required),
  roomNumber: Number (required),
  careType: String (required, enum: ["Residential", "Nursing", "Memory Care", "Respite"]),
  admissionDate: Date (required),
  dob: Date,
  gender: String,
  niNo: String,
  nhsNumber: String,
  ethnicity: String,
  religion: String,
  mentalHealthStatus: String,
  primaryDiagnosis: String,
  diagnosisDate: Date,
  allergies: String,
  dailyLifeImpact: String,
  nokName: String,
  nokPhone: String,
  nokEmail: String,
  nokAddress: String,
  gpDoctor: String,
  gpSurgery: String,
  gpPhone: String,
  gpAddress: String,
  consultantName: String,
  hospitalName: String,
  hospitalAddress: String,
  specialistPhone: String,
  importantToMe: String,
  pleaseDo: String,
  pleaseDont: String,
  profileImage: String,
  status: String (default: "Active"),
  createdAt: Date,
  updatedAt: Date
}
```

### Document Model
```javascript
{
  _id: ObjectId,
  client: ObjectId (ref: "Client", required),
  category: String (required),
  expiryDate: Date,
  notes: String,
  fileUrl: String (required),
  uploadedAt: Date (default: Date.now)
}
```

---

## 🚀 Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting in production:

**Recommended Limits:**
- 100 requests per minute per user
- 1000 requests per hour per user

---

## 🔐 Security Best Practices

1. **Always use HTTPS in production**
2. **Never expose tokens in URLs**
3. **Implement CORS properly**
4. **Validate all input data**
5. **Sanitize file uploads**
6. **Use environment variables for sensitive data**

---

## 📝 Example: Complete Workflow

### Creating and Managing a Resident

```javascript
// 1. Create a new resident
const newResident = await createResident({
  name: "John Doe",
  age: 75,
  room: 101,
  careType: "Residential",
  admitDate: "2024-01-15"
});

const residentId = newResident.client._id;

// 2. Upload a document
await uploadDocument(residentId, {
  category: "Medical Report",
  expiryDate: "2025-12-31",
  notes: "Annual health check",
  file: selectedFile
});

// 3. Fetch complete resident data
const resident = await fetchResident(residentId);
const documents = await fetchDocuments(residentId);
const carePlans = await fetchCarePlans(residentId);

// 4. Update resident information
await updateResident(residentId, {
  name: "John Doe",
  age: 76,
  room: 102,
  careType: "Nursing",
  admitDate: "2024-01-15"
});
```

---

**Last Updated:** January 28, 2026  
**API Version:** 1.0  
**Base URL:** http://localhost:3000
