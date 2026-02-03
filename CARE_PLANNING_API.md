# 🔌 Care Planning API Reference

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

---

## 📋 Care Planning Endpoints

### 1. Get All Care Plans
**Endpoint:** `GET /carePlanning`

**Description:** Retrieves all care plans in the system

**Headers:**
```javascript
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "client": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "John Doe"
    },
    "planType": "Personal Hygiene Care Plan",
    "creationDate": "2026-01-15T00:00:00.000Z",
    "reviewDate": "2026-04-15T00:00:00.000Z",
    "carePlanDetails": "Daily hygiene assistance required",
    "careSetting": "Residential",
    "bristolStoolChart": "4",
    "mustScore": "1",
    "heartRate": 72,
    "mood": "😊",
    "dailyLog": "Resident in good spirits",
    "carePlanData": {
      "preparedBy": "Sarah Johnson",
      "currentAbility": "Can wash hands independently",
      "careAims": "Maintain skin integrity",
      "washingInstructions": "Assist with shower MWF at 9am",
      "dressingInstructions": "Full assistance with socks and shoes",
      "groomingInstructions": "Electric shaver only, supervised",
      "skinCareInstructions": "Check heels and coccyx daily",
      "productsNotes": "Unscented soap only"
    },
    "attachments": [
      "https://res.cloudinary.com/example/image/upload/v1234567890/care-plan-doc.pdf"
    ],
    "status": "Current",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
]
```

**Frontend Implementation:**
```javascript
const fetchCarePlans = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get("https://admin-panel-backend-alpha.vercel.app/carePlanning", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

---

### 2. Get Care Plans for Specific Client
**Endpoint:** `GET /carePlanning/client/:clientId`

**Description:** Retrieves all care plans for a specific resident

**Parameters:**
- `clientId` (path parameter) - Client's MongoDB ObjectId

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "client": "507f1f77bcf86cd799439012",
    "planType": "Personal Hygiene Care Plan",
    "creationDate": "2026-01-15T00:00:00.000Z",
    "reviewDate": "2026-04-15T00:00:00.000Z",
    "carePlanData": {
      "preparedBy": "Sarah Johnson",
      "currentAbility": "Can wash hands independently"
    },
    "attachments": [],
    "status": "Current"
  }
]
```

**Frontend Implementation:**
```javascript
const fetchClientCarePlans = async (clientId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `https://admin-panel-backend-alpha.vercel.app/carePlanning/client/${clientId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return await response.json();
};
```

---

### 3. Create New Care Plan
**Endpoint:** `POST /carePlanning`

**Description:** Creates a new care plan

**Content-Type:** `multipart/form-data`

**Form Data:**
```javascript
{
  // Required top-level fields
  client: "507f1f77bcf86cd799439012",
  planType: "Personal Hygiene Care Plan",
  creationDate: "2026-01-15",
  reviewDate: "2026-04-15",
  
  // Optional top-level fields
  carePlanDetails: "Daily hygiene assistance required",
  careSetting: "Residential",
  
  // Health & Wellbeing Metrics
  bristolStoolChart: "4",
  mustScore: "1",
  heartRate: 72,
  mood: "😊",
  dailyLog: "Resident in good spirits",
  
  // Nested care plan data (type-specific fields)
  "carePlanData[preparedBy]": "Sarah Johnson",
  "carePlanData[currentAbility]": "Can wash hands independently",
  "carePlanData[careAims]": "Maintain skin integrity",
  "carePlanData[washingInstructions]": "Assist with shower MWF at 9am",
  
  // Attachments (File objects)
  attachments: [File, File, ...]
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "client": "507f1f77bcf86cd799439012",
  "planType": "Personal Hygiene Care Plan",
  "creationDate": "2026-01-15T00:00:00.000Z",
  "reviewDate": "2026-04-15T00:00:00.000Z",
  "carePlanData": {
    "preparedBy": "Sarah Johnson",
    "currentAbility": "Can wash hands independently"
  },
  "attachments": [
    "https://res.cloudinary.com/example/image/upload/v1234567890/care-plan-doc.pdf"
  ],
  "status": "Current",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

**Frontend Implementation:**
```javascript
const createCarePlan = async (formData, attachments, clientId) => {
  const token = localStorage.getItem("token");
  const fd = new FormData();
  
  // Top-level fields
  fd.append("client", clientId);
  fd.append("planType", formData.planType);
  fd.append("creationDate", formData.dateCreated);
  fd.append("reviewDate", formData.nextReviewDate);
  fd.append("careSetting", formData.careSetting);
  
  // Health metrics
  fd.append("bristolStoolChart", formData.bristolStoolChart);
  fd.append("mustScore", formData.mustScore);
  fd.append("heartRate", formData.heartRate);
  fd.append("mood", formData.mood);
  fd.append("dailyLog", formData.dailyLog);
  
  // Nested care plan data
  for (let key in formData) {
    if (!["planType", "dateCreated", "nextReviewDate", "careSetting", 
          "bristolStoolChart", "mustScore", "heartRate", "mood", "dailyLog"].includes(key)) {
      fd.append(`carePlanData[${key}]`, formData[key]);
    }
  }
  
  // Attachments
  attachments.forEach(file => {
    fd.append("attachments", file);
  });
  
  const response = await axios.post(
    "https://admin-panel-backend-alpha.vercel.app/carePlanning",
    fd,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data;
};
```

---

### 4. Update Care Plan
**Endpoint:** `PUT /carePlanning/:id`

**Description:** Updates an existing care plan

**Parameters:**
- `id` (path parameter) - Care Plan's MongoDB ObjectId

**Content-Type:** `multipart/form-data`

**Form Data:**
```javascript
{
  // Same structure as POST
  client: "507f1f77bcf86cd799439012",
  planType: "Personal Hygiene Care Plan",
  creationDate: "2026-01-15",
  reviewDate: "2026-07-15",  // Updated review date
  
  // For attachments:
  oldAttachments: ["url1", "url2"],  // Existing Cloudinary URLs to keep
  attachments: [File, File, ...]      // New files to upload
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "client": "507f1f77bcf86cd799439012",
  "planType": "Personal Hygiene Care Plan",
  "reviewDate": "2026-07-15T00:00:00.000Z",
  "updatedAt": "2026-01-28T10:30:00.000Z"
}
```

**Frontend Implementation:**
```javascript
const updateCarePlan = async (id, formData, attachments) => {
  const token = localStorage.getItem("token");
  const fd = new FormData();
  
  // Add all form fields
  for (let key in formData) {
    fd.append(key, formData[key]);
  }
  
  // Handle attachments
  attachments.forEach(att => {
    if (typeof att === "string") {
      fd.append("oldAttachments", att);  // Existing URLs
    } else {
      fd.append("attachments", att);      // New files
    }
  });
  
  const response = await axios.put(
    `https://admin-panel-backend-alpha.vercel.app/carePlanning/${id}`,
    fd,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data;
};
```

---

### 5. Delete Care Plan
**Endpoint:** `DELETE /carePlanning/:id`

**Description:** Deletes a care plan

**Parameters:**
- `id` (path parameter) - Care Plan's MongoDB ObjectId

**Response:**
```json
{
  "message": "Care plan deleted successfully"
}
```

**Frontend Implementation:**
```javascript
const deleteCarePlan = async (id) => {
  const token = localStorage.getItem("token");
  await axios.delete(`https://admin-panel-backend-alpha.vercel.app/carePlanning/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

---

### 6. Get Review Alerts
**Endpoint:** `GET /carePlanning/alerts`

**Description:** Retrieves care plans due for review today or overdue

**Response:**
```json
{
  "todayReviews": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "client": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "John Doe"
      },
      "planType": "Personal Hygiene Care Plan",
      "reviewDate": "2026-01-28T00:00:00.000Z"
    }
  ],
  "overdueReviews": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "client": {
        "_id": "507f1f77bcf86cd799439014",
        "fullName": "Jane Smith"
      },
      "planType": "Nutrition and Hydration Plan",
      "reviewDate": "2026-01-20T00:00:00.000Z"
    }
  ],
  "totalToday": 1,
  "totalOverdue": 1,
  "hasReviews": true
}
```

**Frontend Implementation:**
```javascript
const fetchAlerts = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "https://admin-panel-backend-alpha.vercel.app/carePlanning/alerts",
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data;
};

// Use in useEffect
useEffect(() => {
  fetchAlerts().then(data => {
    setTodayReviews(data.todayReviews);
    setOverdueReviews(data.overdueReviews);
    setHasReviews(data.hasReviews);
    
    // Show toast notifications
    if (data.todayReviews.length > 0) {
      toast.info(`📅 ${data.totalToday} review(s) due today`);
    }
    if (data.overdueReviews.length > 0) {
      toast.error(`⚠️ ${data.totalOverdue} overdue review(s)`);
    }
  });
}, []);
```

---

### 7. Mark Care Plan as Reviewed
**Endpoint:** `PUT /carePlanning/:id/mark-reviewed`

**Description:** Marks a care plan as reviewed and updates review date

**Parameters:**
- `id` (path parameter) - Care Plan's MongoDB ObjectId

**Request Body:**
```json
{
  "newReviewDate": "2026-04-28"  // Optional: new review date
}
```

**Response:**
```json
{
  "message": "Care plan marked as reviewed",
  "carePlan": {
    "_id": "507f1f77bcf86cd799439011",
    "reviewDate": "2026-04-28T00:00:00.000Z",
    "lastReviewed": "2026-01-28T10:30:00.000Z"
  }
}
```

**Frontend Implementation:**
```javascript
const markAsReviewed = async (id, newReviewDate) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `https://admin-panel-backend-alpha.vercel.app/carePlanning/${id}/mark-reviewed`,
    { newReviewDate },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  toast.success(response.data.message);
  return response.data;
};
```

---

### 8. Get Archived Care Plans
**Endpoint:** `GET /carePlanning/older-than-six-months/client/:clientId`

**Description:** Retrieves care plans older than 6 months for a specific client

**Parameters:**
- `clientId` (path parameter) - Client's MongoDB ObjectId

**Response:**
```json
{
  "plans": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "client": "507f1f77bcf86cd799439012",
      "planType": "Personal Hygiene Care Plan",
      "creationDate": "2025-06-15T00:00:00.000Z",
      "reviewDate": "2025-09-15T00:00:00.000Z",
      "status": "Current"
    }
  ]
}
```

**Alternative Endpoint (All Clients):**
```
GET /carePlanning/older-than-six-months
```

**Frontend Implementation:**
```javascript
const fetchArchivedPlans = async (clientId) => {
  const token = localStorage.getItem("token");
  
  try {
    // Try client-specific endpoint first
    const response = await axios.get(
      `https://admin-panel-backend-alpha.vercel.app/carePlanning/older-than-six-months/client/${clientId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.plans || response.data;
  } catch (err) {
    // Fallback to general endpoint and filter
    const response = await axios.get(
      "https://admin-panel-backend-alpha.vercel.app/carePlanning/older-than-six-months",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const allArchived = response.data.plans || response.data;
    return allArchived.filter(p => 
      p.client && (p.client._id === clientId || String(p.client) === String(clientId))
    );
  }
};
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
  "message": "Care plan not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation Error",
  "message": "Missing required fields: client, planType"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server Error",
  "message": "Failed to upload attachments"
}
```

### Frontend Error Handling Example:
```javascript
try {
  const response = await axios.post(
    "https://admin-panel-backend-alpha.vercel.app/carePlanning",
    formData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  toast.success("Care plan created successfully");
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error("Error:", error.response.data);
    toast.error(error.response.data.error || "Failed to create care plan");
  } else if (error.request) {
    // No response received
    console.error("No response from server");
    toast.error("Unable to connect to server");
  } else {
    // Other error
    console.error("Error:", error.message);
    toast.error("An unexpected error occurred");
  }
}
```

---

## 📊 Data Models

### Care Plan Schema:
```javascript
{
  _id: ObjectId,
  
  // Required fields
  client: {
    type: ObjectId,
    ref: "Client",
    required: true
  },
  planType: {
    type: String,
    required: true,
    enum: [
      "Personal Hygiene Care Plan",
      "Moving and Handling Care Plan",
      "Nutrition and Hydration Plan",
      "Mental Health Care Plan",
      "Oral Care Plan",
      "Health Care Plan",
      "Continence Care Plan",
      "Sleeping Care Plan"
    ]
  },
  
  // Dates
  creationDate: {
    type: Date,
    required: true
  },
  reviewDate: {
    type: Date,
    required: true
  },
  lastReviewed: Date,
  
  // Optional top-level fields
  carePlanDetails: String,
  careSetting: {
    type: String,
    enum: ["Residential", "Nursing", "Memory Care", "Respite"]
  },
  
  // Health & Wellbeing Metrics
  bristolStoolChart: String,
  mustScore: String,
  heartRate: Number,
  mood: String,
  dailyLog: String,
  
  // Nested care plan data (type-specific fields)
  carePlanData: {
    preparedBy: String,
    currentAbility: String,
    careAims: String,
    supportSteps: String,
    medicalDetails: String,
    sleepRoutine: String,
    frequency: String,
    assistanceLevel: String,
    dietType: String,
    
    // Personal Hygiene specific
    washingInstructions: String,
    dressingInstructions: String,
    groomingInstructions: String,
    skinCareInstructions: String,
    productsNotes: String,
    
    // Moving and Handling specific
    mobilityLevel: String,
    equipmentRequired: String,
    transferTechniques: String,
    staffRequired: String,
    riskNotes: String,
    
    // Nutrition specific
    dietaryRequirements: String,
    foodPreferences: String,
    allergies: String,
    textureModifications: String,
    hydrationGoals: String,
    
    // ... other type-specific fields
  },
  
  // Attachments
  attachments: [String],  // Cloudinary URLs
  
  // Status & Approval
  status: {
    type: String,
    enum: ["Current", "Accepted", "Declined"],
    default: "Current"
  },
  signature: String,
  declineReason: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

---

## 🚀 Complete Workflow Example

### Creating and Managing a Care Plan

```javascript
// 1. Fetch client list
const clients = await fetchClients();
const selectedClient = clients[0];

// 2. Create a new care plan
const newCarePlan = await createCarePlan({
  planType: "Personal Hygiene Care Plan",
  dateCreated: "2026-01-28",
  nextReviewDate: "2026-04-28",
  preparedBy: "Sarah Johnson",
  currentAbility: "Can wash hands independently",
  careAims: "Maintain skin integrity",
  washingInstructions: "Assist with shower MWF at 9am",
  dressingInstructions: "Full assistance with socks and shoes",
  groomingInstructions: "Electric shaver only, supervised",
  skinCareInstructions: "Check heels and coccyx daily",
  productsNotes: "Unscented soap only"
}, [], selectedClient._id);

const carePlanId = newCarePlan._id;

// 3. Fetch care plans for this client
const clientPlans = await fetchClientCarePlans(selectedClient._id);

// 4. Check for review alerts
const alerts = await fetchAlerts();
if (alerts.hasReviews) {
  console.log(`${alerts.totalToday} reviews due today`);
  console.log(`${alerts.totalOverdue} overdue reviews`);
}

// 5. Update care plan
await updateCarePlan(carePlanId, {
  ...newCarePlan,
  reviewDate: "2026-07-28"  // Extend review date
}, []);

// 6. Mark as reviewed
await markAsReviewed(carePlanId, "2026-10-28");

// 7. Fetch archived plans
const archived = await fetchArchivedPlans(selectedClient._id);
console.log(`${archived.length} archived plans found`);
```

---

## 📝 Best Practices

### API Usage:
1. **Always use try-catch** - Handle errors gracefully
2. **Validate before sending** - Check required fields client-side
3. **Use FormData for files** - Required for attachment uploads
4. **Store tokens securely** - Use localStorage or secure cookies
5. **Handle loading states** - Show feedback during API calls

### Performance:
1. **Debounce search** - Avoid excessive API calls
2. **Cache responses** - Store frequently accessed data
3. **Paginate large lists** - Don't fetch all plans at once
4. **Optimize file sizes** - Compress images before upload
5. **Use lazy loading** - Load attachments on demand

### Security:
1. **Never expose tokens** - Don't log or share JWT tokens
2. **Validate file types** - Check before uploading
3. **Sanitize inputs** - Prevent injection attacks
4. **Use HTTPS** - Always in production
5. **Implement rate limiting** - Prevent abuse

---

## 🔐 Authentication Flow

### Getting a Token:
```javascript
// Login
const login = async (email, password) => {
  const response = await axios.post("https://admin-panel-backend-alpha.vercel.app/auth/login", {
    email,
    password
  });
  
  const token = response.data.token;
  localStorage.setItem("token", token);
  return token;
};

// Use token in requests
const token = localStorage.getItem("token");
const config = {
  headers: { Authorization: `Bearer ${token}` }
};
```

### Token Expiration:
```javascript
// Check if token is expired
const isTokenExpired = () => {
  const token = localStorage.getItem("token");
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Refresh token if needed
if (isTokenExpired()) {
  // Redirect to login or refresh token
  window.location.href = "/Login";
}
```

---

## 📈 Rate Limiting

**Recommended Limits:**
- 100 requests per minute per user
- 1000 requests per hour per user

**Implementation:**
```javascript
// Client-side rate limiting
const rateLimiter = {
  requests: [],
  maxRequests: 100,
  timeWindow: 60000, // 1 minute
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
};

// Use before API calls
if (!rateLimiter.canMakeRequest()) {
  toast.error("Too many requests. Please wait a moment.");
  return;
}
```

---

**Last Updated:** January 28, 2026  
**API Version:** 1.0  
**Base URL:** http://localhost:3000
