import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;

function initializeFirebase() {
  if (db) return db;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      db = admin.firestore();
      return db;
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON", e);
    }
  }
  return null;
}

// Initial attempt
initializeFirebase();

async function seedDatabase() {
  const currentDb = initializeFirebase();
  if (!currentDb) return;

  try {
    const usersSnapshot = await currentDb.collection("users").limit(1).get();
    if (usersSnapshot.empty) {
      console.log("Seeding database...");

      // Seed Super Admin User
      await currentDb.collection("users").doc("super_admin").set({
        email: "super@college.edu",
        password: "super123",
        name: "Super Administrator",
        role: "super_admin",
        department: "Management",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Seed Admin User
      await currentDb.collection("users").doc("admin_user").set({
        email: "admin@college.edu",
        password: "admin123",
        name: "System Administrator",
        role: "admin",
        department: "IT",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Seed Faculty User
      await currentDb.collection("users").doc("faculty_user").set({
        email: "faculty@college.edu",
        password: "faculty123",
        name: "Dr. Smith",
        role: "faculty",
        department: "CS",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Seed Student User
      await currentDb.collection("users").doc("student_user").set({
        email: "student@college.edu",
        password: "student123",
        name: "John Student",
        role: "student",
        department: "CS",
        cgpa: 3.85,
        credits: 120,
        semester: 6,
        id_number: "CS2023001",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Seed Parent User
      await currentDb.collection("users").doc("parent_user").set({
        email: "parent@gmail.com",
        password: "parent123",
        name: "Mr. Doe",
        role: "parent",
        student_id: "student_user",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Seed Announcements
      const announcements = [
        { title: "Welcome to CampusConnect", content: "We are excited to launch our new college management system!", author_id: "admin_user", author_name: "System Admin" },
        { title: "Annual Sports Meet", content: "The annual sports meet will be held next month. Register now!", author_id: "admin_user", author_name: "System Admin" }
      ];
      for (const ann of announcements) {
        await currentDb.collection("announcements").add({
          ...ann,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Seed Library Books
      const books = [
        { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", status: "available" },
        { title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "978-0201616224", status: "available" },
        { title: "Design Patterns", author: "Erich Gamma", isbn: "978-0201633610", status: "available" }
      ];
      for (const book of books) {
        await currentDb.collection("library_books").add(book);
      }

      // Seed Placements
      const placements = [
        { company: "Google", role: "Software Engineer", package: "45 LPA", deadline: "2026-05-01", description: "Looking for talented engineers." },
        { company: "Microsoft", role: "Product Manager", package: "38 LPA", deadline: "2026-04-15", description: "Join our product team." }
      ];
      for (const p of placements) {
        await currentDb.collection("placements").add(p);
      }

      // Seed Events
      const events = [
        { title: "Hackathon 2026", date: "2026-03-20", location: "Main Hall", description: "24-hour coding challenge." },
        { title: "Tech Symposium", date: "2026-04-10", location: "Auditorium", description: "Explore the latest in tech." }
      ];
      for (const e of events) {
        await currentDb.collection("events").add(e);
      }

      // Seed Timetable
      const timetable = [
        { day: "Monday", time_slot: "09:00 - 10:00", subject: "Data Structures", room: "Room 101" },
        { day: "Monday", time_slot: "10:00 - 11:00", subject: "Operating Systems", room: "Room 102" },
        { day: "Tuesday", time_slot: "11:00 - 12:00", subject: "Computer Networks", room: "Room 103" }
      ];
      for (const t of timetable) {
        await currentDb.collection("timetable").add(t);
      }

      // Seed Attendance
      const attendance = [
        { student_id: "student_user", subject: "Data Structures", date: "2026-03-01", status: "present" },
        { student_id: "student_user", subject: "Operating Systems", date: "2026-03-01", status: "absent" }
      ];
      for (const a of attendance) {
        await currentDb.collection("attendance").add(a);
      }

      // Seed Assignments
      const assignments = [
        { title: "Linked List Implementation", subject: "Data Structures", deadline: "2026-03-10", status: "pending", description: "Implement a doubly linked list in C++." },
        { title: "Process Scheduling", subject: "Operating Systems", deadline: "2026-03-15", status: "submitted", description: "Simulate FCFS and SJF scheduling algorithms." }
      ];
      for (const asgn of assignments) {
        await currentDb.collection("assignments").add({ ...asgn, student_id: "student_user" });
      }

      // Seed Hostel
      await currentDb.collection("hostel").doc("student_user").set({
        block: "A",
        room_no: "302",
        type: "Double Sharing",
        mess_plan: "Standard",
        warden: "Mr. Sharma"
      });

      // Seed Transport
      await currentDb.collection("transport").add({
        route_no: "12",
        bus_no: "KA-01-F-1234",
        driver: "Ramesh",
        contact: "9876543210",
        pickup_point: "Central Mall",
        pickup_time: "07:30 AM"
      });

      // Seed Grievances
      await currentDb.collection("grievances").add({
        student_id: "student_user",
        category: "Infrastructure",
        subject: "Wi-Fi not working in Library",
        description: "The Wi-Fi signal is very weak in the second-floor reading room.",
        status: "open",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Seed Departments
      const depts = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];
      for (const d of depts) {
        await currentDb.collection("departments").add({ name: d, head: "Dr. " + d.split(' ')[0] });
      }

      // Seed Audit Logs
      await currentDb.collection("audit_logs").add({
        user_id: "admin_user",
        action: "Updated Fee Structure",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: "Changed tuition fee for Semester 7"
      });

      // Seed Fees
      const fees = [
        { description: "Tuition Fee - Sem 6", amount: 45000, status: "paid", due_date: "2026-01-15", student_id: "student_user" },
        { description: "Exam Fee - Sem 6", amount: 2500, status: "unpaid", due_date: "2026-04-10", student_id: "student_user" },
        { description: "Library Fine", amount: 50, status: "unpaid", due_date: "2026-03-20", student_id: "student_user" }
      ];
      for (const f of fees) {
        await currentDb.collection("fees").add(f);
      }

      console.log("Database seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Seed database on startup (background)
seedDatabase();

// Helper to check if DB is ready
const checkDb = (req: any, res: any, next: any) => {
  const currentDb = initializeFirebase();
  if (!currentDb) return res.status(500).json({ 
    success: false,
    error: "Firebase not configured", 
    message: "Please set FIREBASE_SERVICE_ACCOUNT_JSON in environment variables." 
  });
  next();
};

  // Auth API
  app.post("/api/auth/login", checkDb, async (req, res) => {
    const { email, password } = req.body;
    try {
      const snapshot = await db!.collection("users")
        .where("email", "==", email)
        .where("password", "==", password)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const user = snapshot.docs[0].data();
        res.json({ success: true, user: { id: snapshot.docs[0].id, ...user } });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Departments API
  app.get("/api/departments", checkDb, async (req, res) => {
    const snapshot = await db!.collection("departments").get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });

  // Audit Logs API
  app.get("/api/audit_logs", checkDb, async (req, res) => {
    const snapshot = await db!.collection("audit_logs").orderBy("timestamp", "desc").limit(50).get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });

  // Performance API
  app.get("/api/student/performance/:id", checkDb, async (req, res) => {
    res.json([
      { semester: "Sem 1", gpa: 3.5 },
      { semester: "Sem 2", gpa: 3.6 },
      { semester: "Sem 3", gpa: 3.7 },
      { semester: "Sem 4", gpa: 3.8 },
      { semester: "Sem 5", gpa: 3.9 },
    ]);
  });

  // Library API
  app.get("/api/library/books", checkDb, async (req, res) => {
    const snapshot = await db!.collection("library_books").get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(books);
  });

  // Fees API
  app.get("/api/student/fees/:id", checkDb, async (req, res) => {
    const snapshot = await db!.collection("fees").where("student_id", "==", req.params.id).get();
    const fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(fees);
  });

  // Placements API
  app.get("/api/placements", checkDb, async (req, res) => {
    const snapshot = await db!.collection("placements").get();
    const placements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(placements);
  });

  // Events API
  app.get("/api/events", checkDb, async (req, res) => {
    const snapshot = await db!.collection("events").get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  });

  // Timetable API
  app.get("/api/timetable", checkDb, async (req, res) => {
    const snapshot = await db!.collection("timetable").get();
    const timetable = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(timetable);
  });

  // Attendance API
  app.get("/api/student/attendance/:id", checkDb, async (req, res) => {
    const snapshot = await db!.collection("attendance").where("student_id", "==", req.params.id).get();
    const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(attendance);
  });

  // Assignments API
  app.get("/api/student/assignments/:id", checkDb, async (req, res) => {
    const snapshot = await db!.collection("assignments").where("student_id", "==", req.params.id).get();
    const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(assignments);
  });

  // Hostel API
  app.get("/api/student/hostel/:id", checkDb, async (req, res) => {
    const doc = await db!.collection("hostel").doc(req.params.id).get();
    if (doc.exists) {
      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ message: "Hostel record not found" });
    }
  });

  // Transport API
  app.get("/api/transport", checkDb, async (req, res) => {
    const snapshot = await db!.collection("transport").get();
    const transport = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(transport);
  });

  // Grievances API
  app.get("/api/student/grievances/:id", checkDb, async (req, res) => {
    const snapshot = await db!.collection("grievances").where("student_id", "==", req.params.id).get();
    const grievances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(grievances);
  });

  app.post("/api/student/grievances", checkDb, async (req, res) => {
    const { student_id, category, subject, description } = req.body;
    await db!.collection("grievances").add({
      student_id,
      category,
      subject,
      description,
      status: "open",
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  });

  app.get("/api/announcements", checkDb, async (req, res) => {
    const snapshot = await db!.collection("announcements").orderBy("created_at", "desc").get();
    const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(announcements);
  });

  app.post("/api/announcements", checkDb, async (req, res) => {
    const { title, content, author_id, author_name } = req.body;
    await db!.collection("announcements").add({
      title,
      content,
      author_id,
      author_name,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  });

// Vite middleware for development
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
