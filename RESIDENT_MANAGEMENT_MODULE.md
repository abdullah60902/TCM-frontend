# 🏥 Resident Management Module - Complete Documentation

## Overview
The Resident Management module is a comprehensive system for managing resident profiles, information, and care documentation within the facility. This module covers all core requirements for maintaining structured resident records.

---

## 📋 Core Features

### 1. **Adding and Managing Resident Profiles**

#### Location: `/Client-Management`
**File:** `src/app/Client-Management/page.js`

#### Features:
- ✅ **Add New Resident** - Create new resident profiles with essential information
- ✅ **Edit Resident** - Update existing resident information
- ✅ **Delete Resident** - Remove resident records (with confirmation)
- ✅ **View Resident** - Quick view of resident details in modal
- ✅ **Search Functionality** - Search residents by name
- ✅ **Filter by Care Type** - Filter residents by:
  - All Patients
  - Nursing
  - Residential
  - Memory Care
  - Respite

#### Resident Profile Fields:
```javascript
{
  fullName: String,        // Full name of the resident
  age: Number,             // Age in years
  roomNumber: Number,      // Assigned room number
  careType: String,        // Type of care (Nursing, Residential, Memory Care, Respite)
  admissionDate: Date,     // Date of admission
  status: String           // Active/Inactive status
}
```

#### User Interface Features:
- **Responsive Table View** - Displays all residents with key information
- **Avatar Initials** - Auto-generated initials for each resident
- **Status Badges** - Visual indicators for resident status
- **Action Buttons** - Quick access to View, Edit, Delete, and Download functions
- **Export Options** - Download resident data as PDF or CSV

---

### 2. **Viewing and Updating Resident Information**

#### Location: `/Resident-Profile?id={residentId}`
**File:** `src/app/Resident-Profile/page.js`

This comprehensive profile page includes **10 major sections** organized in tabs:

#### 📑 Tab Structure:

##### **Tab 1: About Me** 
**Component:** `ResidentProfileAboutMe`
- Personal Information (Name, DOB, Gender, NI Number, NHS Number)
- Medical Information (Ethnicity, Religion, Mental Health Status)
- Primary Diagnosis and Diagnosis Date
- Allergies and Daily Life Impact
- Next of Kin Details (Name, Phone, Email, Address)
- GP Details (Doctor, Surgery, Phone, Address)
- Specialist/Consultant Information
- Personal Preferences (Important to Me, Please DO, Please DON'T)

##### **Tab 2: Care Plans**
**Component:** `ResidentProfileCarePlan`
- Create and manage multiple care plans
- Plan Type selection
- Care Setting and Legal Status
- Communication, Mobility, Dietary, and Personal Care Needs
- Social Interests
- Review dates and tracking
- Attachment support for care plan documents

##### **Tab 3: PBS Plans (Positive Behaviour Support)**
**Component:** `ResidentProfilePBSplan`
- Behaviour Support Profiles
- Target Behaviours identification
- Hypothesised Function analysis
- Triggers and Antecedents
- General Approach strategies
- Skill Development plans
- Early Warning Signs
- 3-Step Response Protocol:
  - Step 1: Initial Response
  - Step 2: Intervention
  - Step 3: High Risk Management
- Frequency tracking
- Assistance Level documentation
- Diet Type and Sleep Routine

##### **Tab 4: Risk Assessments**
**Component:** `ResidentProfileRiskAssessment`
- Comprehensive risk assessment forms
- Date of Assessment tracking
- Overall Risk Level categorization
- Assessed By (staff member)
- Clinical Summary
- Risk Categories with:
  - Severity levels
  - Frequency tracking
  - Comments and notes
  - Mitigation strategies
- Attachment support for evidence

##### **Tab 5: Goals & Outcomes**
**Component:** `ResidentProfileGoalsOutcome`
- Goal Title and Description
- Target Metrics
- Start Date and Target Date
- Current Status tracking
- Status History log
- Progress monitoring

##### **Tab 6: Daily Logs**
**Component:** `ResidentProfileDailyLog`
- Date and Time logging
- Staff Name recording
- Mood Emoji tracking (Happy, Neutral, Sad, Agitated)
- Health Indicators:
  - Bristol Stool Score
  - Heart Rate (BPM)
  - Quick Health Check
- Detailed Notes
- Photo/Document attachments

##### **Tab 7: Medication (eMAR)**
**Component:** `ResidentProfileMedicationEMAR`
- Current Active Medication Orders
- Medication Name and Frequency
- Scheduled Times
- Stock Quantity tracking
- Medication Status
- Administration History Log:
  - Date and Time
  - Administered (Yes/No)
  - Caregiver Name
  - Notes

##### **Tab 8: Consent Forms**
**Component:** `ResidentProfileConsentForm`
- DoLS (Deprivation of Liberty Safeguards) Status
- Authorization End Date
- Conditions Applied
- Legal documentation

##### **Tab 9: Handovers**
**Component:** `ResidentProfileHandOver`
- Shift handover documentation
- Date and Time
- Handing Over (staff name)
- Taking Over (staff name)
- Summary Notes
- Attachment support

##### **Tab 10: Documents** 📄
**Component:** `ResidentProfileDocuments`
**File:** `src/app/(component)/residentprofiledocuments/ResidentProfileDocuments.js`

**Features:**
- ✅ Upload documents with custom categories
- ✅ Set expiry dates for documents
- ✅ Add notes to documents
- ✅ Automatic expiry tracking:
  - **Valid** - Green indicator
  - **Expiring Today** - Yellow indicator
  - **Expired** - Red indicator
- ✅ Download documents
- ✅ Delete documents
- ✅ Group documents by category
- ✅ Visual status indicators

**Document Fields:**
```javascript
{
  client: ObjectId,           // Reference to resident
  category: String,           // Custom category (e.g., "Medical Report")
  expiryDate: Date,          // Optional expiry date
  notes: String,             // Additional notes
  fileUrl: String,           // URL to uploaded file
  uploadedAt: Date           // Upload timestamp
}
```

---

## 🎯 How It Meets Requirements

### Requirement 1: Adding and Managing Resident Profiles ✅

**Implementation:**
- **Add New Resident:** Modal form in Client Management page with all essential fields
- **Edit Resident:** Click edit icon to populate form with existing data
- **Delete Resident:** Click delete icon with confirmation dialog
- **Validation:** All required fields validated before submission
- **API Integration:** Full CRUD operations with backend at `https://admin-panel-backend-alpha.vercel.app/client`

**User Flow:**
1. Navigate to `/Client-Management`
2. Click "Add New Resident" button
3. Fill in the form (Name, Age, Room, Care Type, Admission Date)
4. Click "Add Resident" to save
5. Resident appears in the table immediately

### Requirement 2: Viewing and Updating Resident Information ✅

**Implementation:**
- **Comprehensive Profile View:** 10-tab interface with all resident information
- **Quick View:** Modal popup from Client Management table
- **Full Profile:** Dedicated page at `/Resident-Profile?id={residentId}`
- **Edit Capabilities:** Each section has its own edit functionality
- **Real-time Updates:** Changes reflect immediately across the system

**User Flow:**
1. From Client Management, click "View Profile" on any resident
2. Navigate through 10 tabs to view/edit different aspects
3. Each tab loads relevant data from the backend
4. Make changes and save within each section
5. Export complete profile as PDF with selected modules

### Requirement 3: Organizing Residents Within the Facility System ✅

**Implementation:**
- **Room Assignment:** Each resident assigned to a specific room number
- **Care Type Classification:** Residents organized by care type (Nursing, Residential, Memory Care, Respite)
- **Status Tracking:** Active/Inactive status for each resident
- **Search & Filter:** Quick access to specific residents or groups
- **Hierarchical Organization:** Residents linked to care plans, medications, logs, etc.

**Organizational Features:**
- Filter by care type
- Search by name
- Sort by room number
- View by status
- Export capabilities for reporting

---

## 🔐 Security & Access Control

### Role-Based Access:
- **Admin:** Full access to all features
- **Staff:** Full access to all features
- **Client Role:** Limited to assigned residents only
- **External Users:** Access based on allowed pages configuration

### Implementation:
```javascript
// In Client-Management page
if (user.role === "Client") {
  // Filter to show only assigned residents
  const matchedClients = allClients.filter((client) =>
    user.clients.includes(client._id)
  );
}
```

---

## 📊 Export & Reporting Features

### Individual Resident Export:
- **PDF Export:** Formatted PDF with resident details
- **CSV Export:** Spreadsheet-compatible format
- **Dropdown Menu:** Easy access from each resident row

### Bulk Profile Export:
- **Modular Selection:** Choose which sections to include
- **10 Available Modules:**
  1. Personal & Medical Profile
  2. Care Planning
  3. PBS Plans
  4. Risk Assessments
  5. Medication (eMAR)
  6. Goals & Outcomes
  7. Daily Progress Logs
  8. Consent & Legal
  9. Shift Handovers
  10. General Documents

### Export Features:
- Professional PDF formatting
- Automatic page breaks
- Embedded images and attachments
- Clickable links for external documents
- Complete audit trail

---

## 🔄 Data Flow Architecture

### Backend API Endpoints:
```
GET    /client                    - Get all residents
GET    /client/:id                - Get specific resident
POST   /client                    - Create new resident
PUT    /client/:id                - Update resident
DELETE /client/:id                - Delete resident

GET    /resident-documents/client/:id  - Get resident documents
POST   /resident-documents             - Upload document
DELETE /resident-documents/:id         - Delete document

GET    /carePlanning/client/:id   - Get care plans
GET    /pbs-plan/client/:id       - Get PBS plans
GET    /risk-assessment/client/:id - Get risk assessments
GET    /goals/client/:id          - Get goals
GET    /daily-log/client/:id      - Get daily logs
GET    /medications/client/:id    - Get medications
GET    /consent/client/:id        - Get consent forms
GET    /handover/client/:id       - Get handovers
```

### Frontend State Management:
- React hooks for local state
- useAuth context for user authentication
- useSearchParams for URL parameters
- Real-time data fetching with useEffect

---

## 🎨 User Interface Design

### Design Principles:
- **Dark Theme:** Professional dark mode (#111827, #243041 color scheme)
- **Responsive Layout:** Works on desktop, tablet, and mobile
- **Icon Integration:** React Icons for visual clarity
- **Color-Coded Status:** Green (valid), Yellow (warning), Red (expired)
- **Modal Overlays:** Non-intrusive forms and confirmations
- **Loading States:** Visual feedback during operations

### Accessibility:
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast text
- Clear visual hierarchy

---

## 📱 Responsive Features

### Mobile Optimization:
- Collapsible sidebar with hamburger menu
- Horizontal scrolling for tables
- Touch-friendly buttons and inputs
- Optimized modal sizes
- Adaptive text sizing

### Desktop Features:
- Fixed sidebar navigation
- Full table view
- Multi-column layouts
- Hover effects and tooltips
- Keyboard shortcuts

---

## 🚀 Technical Stack

### Frontend:
- **Framework:** Next.js 13+ (App Router)
- **Language:** JavaScript (React)
- **Styling:** Tailwind CSS (utility classes)
- **Icons:** React Icons
- **PDF Generation:** jsPDF + jsPDF-AutoTable
- **HTTP Client:** Axios
- **Notifications:** React Toastify

### Backend Integration:
- **API Base URL:** http://localhost:3000
- **Authentication:** JWT Bearer tokens
- **File Upload:** FormData with multipart/form-data
- **Data Format:** JSON

---

## 📈 Future Enhancements

### Potential Additions:
1. **Advanced Search:** Multi-field search with filters
2. **Bulk Operations:** Import/export multiple residents
3. **Analytics Dashboard:** Resident statistics and trends
4. **Notifications:** Alerts for expiring documents, upcoming reviews
5. **Audit Logs:** Track all changes to resident records
6. **Photo Gallery:** Multiple photos per resident
7. **Family Portal:** Limited access for family members
8. **Integration:** Connect with external healthcare systems

---

## 🛠️ Maintenance & Support

### Regular Tasks:
- Monitor document expiry dates
- Review and update care plans
- Backup resident data
- Update medication records
- Archive inactive residents

### Data Integrity:
- Required field validation
- Date format consistency
- Unique room number enforcement
- Referential integrity checks

---

## 📝 Summary

The Resident Management module provides a **complete, professional-grade solution** for managing resident profiles and information. It successfully covers all core requirements:

✅ **Adding and managing resident profiles** - Full CRUD operations with intuitive UI  
✅ **Viewing and updating resident information** - Comprehensive 10-tab profile system  
✅ **Organizing residents within the facility** - Search, filter, and categorization features  

The system is **production-ready**, **scalable**, and **user-friendly**, providing staff with all the tools needed to maintain accurate, up-to-date resident records while ensuring compliance with care standards.

---

## 🔗 Quick Links

- **Client Management:** `/Client-Management`
- **Resident Profile:** `/Resident-Profile?id={residentId}`
- **Documents Component:** `src/app/(component)/residentprofiledocuments/ResidentProfileDocuments.js`

---

**Last Updated:** January 28, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
