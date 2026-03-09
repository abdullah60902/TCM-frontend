import axios from "axios";

// In-memory Database
const db = {
  user: [
    { _id: "admin1", fullName: "Admin User", email: "tcm@gmail.com", password: "tcm123", role: "admin", clients: [] }
  ],
  client: [],
  incident: [],
  carePlanning: [],
  "pbs-plan": [],
  "risk-assessment": [],
  goals: [],
  "daily-log": [],
  consent: [],
  handover: [],
  "staff-documents": [],
  hr: [],
  training: [],
  performance: [],
  inventory: [],
  medications: [],
  "medication-administration": []
};

const generateId = () => Math.random().toString(36).substring(2, 9);

function saveDb() {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_db", JSON.stringify(db));
  }
}

function loadDb() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("mock_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(db, parsed);
        
        // Ensure tcm@gmail.com user is always there for the first session or if deleted
        if (!db.user.find(u => u.email === "tcm@gmail.com")) {
            db.user.push({ _id: "admin1", fullName: "Admin User", email: "tcm@gmail.com", password: "tcm123", role: "admin", clients: [] });
        }
      } catch (e) {}
    }
  }
}

loadDb();

function handleGenericMockRequest(method, pathname, dataText) {
  const parts = pathname.split('/').filter(Boolean);
  const resource = parts[0];
  const isClientResourceList = parts.length >= 3 && parts[1] === "client"; // like /carePlanning/client/:id
  const isResourceById = parts.length === 2 && parts[1] !== "all" && parts[1] !== "login" && parts[1] !== "signup";

  let responseData = {};
  let status = 200;

  // 1. LOGIN
  if (pathname === "/user/login" && method === "post") {
    let body = {};
    try { body = JSON.parse(dataText || "{}"); } catch(e){}
    
    // Search in db.user and check password
    const user = db.user.find(u => 
      u.email?.toLowerCase() === body.email?.toLowerCase() && 
      (u.password === body.password)
    );

    if (user) {
      return { status, data: { msg: "Login successful", token: "fake-jwt-token-123", user } };
    }
    return { status: 401, data: { msg: "Invalid credentials" } };
  }

  // 2. GET
  if (method === "get") {
    if (pathname === "/medications/low-stock") {
      return { status, data: { hasLowStock: false, totalLowStock: 0 } };
    }
    if (pathname === "/carePlanning/alerts") {
      return { status, data: { todayReviews: [], overdueReviews: [], totalToday: 0, totalOverdue: 0, hasAlerts: false } };
    }
    if (pathname.includes("/incident/all")) {
       return { status, data: {
         recentIncidentsCount: db.incident.length,
         openIncidentsCount: db.incident.filter(i => i.status === "Open").length,
         underInvestigationCount: db.incident.filter(i => i.status === "Under Investigation").length,
         resolvedIncidentsCount: db.incident.filter(i => i.status === "Resolved").length,
         incidents: db.incident
       }};
    }
    if (resource === "client") {
        if (isResourceById) {
            const client = db.client.find(c => c._id === parts[1]);
            return { status, data: client || {} };
        }
        return { status, data: {
            clients: db.client,
            totalClients: db.client.length,
            totalAvailableRooms: 100 - db.client.length,
            currentOccupancy: db.client.length,
            occupancyPercentage: db.client.length
        }};
    }
    if (resource === "hr") {
        return { status, data: { allHr: db.hr, totalstaff: db.hr.length } };
    }
    if (isClientResourceList) {
        // e.g. /carePlanning/client/:id, returns array usually
        return { status, data: (db[resource] || []).filter(item => item.client === parts[2] || item.clientId === parts[2]) };
    }
    
    // Fallback for getting list
    return { status, data: db[resource] || [] };
  }

  // 3. POST
  if (method === "post") {
    let body = {};
    if (dataText) {
        try { body = JSON.parse(dataText); } catch(e){}
    }
    const newItem = { _id: generateId(), ...body, createdAt: new Date().toISOString() };
    if (!db[resource]) db[resource] = [];
    db[resource].push(newItem);
    saveDb();

    // Some special cases where response format needs to be specific:
    if (resource === "client") return { status, data: { msg: "Created", client: newItem } };
    if (resource === "user") return { status, data: { msg: "User created", user: newItem } };
    if (resource === "hr") return { status, data: { msg: "HR added", hr: newItem } };
    if (resource === "incident") return { status, data: { msg: "Incident created", incident: newItem } };
    return { status, data: { msg: "Success", item: newItem } };
  }

  // 4. PUT
  if (method === "put") {
    const id = parts[1];
    let body = {};
    try { body = JSON.parse(dataText || "{}"); } catch(e){}
    if (db[resource]) {
      const idx = db[resource].findIndex((i) => i._id === id);
      if (idx !== -1) Object.assign(db[resource][idx], body);
      saveDb();
    }
    return { status, data: { msg: "Updated successfully" } };
  }

  // 5. DELETE
  if (method === "delete") {
    const id = parts[1];
    if (db[resource]) {
      db[resource] = db[resource].filter((i) => i._id !== id);
      saveDb();
    }
    return { status, data: { msg: "Deleted successfully" } };
  }

  return { status, data: { msg: "OK" } };
}

// Interceptor for Axios
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes("admin-panel-backend-alpha.vercel.app")) {
    config.adapter = async () => {
      const url = new URL(config.url);
      const method = config.method.toLowerCase();
      const path = url.pathname; 
      
      console.log(`[MOCK AXIOS] ${method.toUpperCase()} ${path}`);

      let dataText = typeof config.data === "string" ? config.data : '';
      if (config.data instanceof FormData) {
         // rough approximation for FormData
         dataText = "{}";
      }

      const { status, data } = handleGenericMockRequest(method, path, dataText);

      if (status >= 400) {
          return Promise.reject({ response: { status, data, statusText: "Error" } });
      }

      return {
        data,
        status,
        statusText: "OK",
        headers: {},
        config,
        request: {}
      };
    };
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for window.fetch
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (urlStr && urlStr.includes("admin-panel-backend-alpha.vercel.app")) {
      const parsedUrl = new URL(urlStr, typeof window !== 'undefined' ? window.location.origin : undefined);
      const method = (init?.method || "GET").toLowerCase();
      const path = parsedUrl.pathname;
      
      console.log(`[MOCK FETCH] ${method.toUpperCase()} ${path}`);

      let dataText = "";
      if (init?.body) {
         if (typeof init.body === "string") dataText = init.body;
      }

      const { status, data } = handleGenericMockRequest(method, path, dataText);

      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
      });
    }
    return originalFetch(input, init);
  };
}

console.log("[MOCK BACKEND] Axios & Fetch intercepted. Temporary in-memory DB active.");

