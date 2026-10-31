// Mock sample data for Campus Pulse UI demonstration (Phase 2)
// Strictly client-side mock data; will connect to real API in subsequent phases.

export const MOCK_NOTICES = [
  {
    id: 1,
    title: "Final Year Project Submission & Code Review",
    description: "Submit all finalized source code and documentation reports to the CS department head. Late submissions will receive grade deductions.",
    category: "Assignment",
    event_date: "2026-11-02",
    event_time: "10:00:00",
    venue: "Lab 2, Computer Science Block",
    priority: "Urgent",
    status: "Urgent",
  },
  {
    id: 2,
    title: "Mid-Semester Examinations Commencement",
    description: "Semester examination hall tickets are available for download. Report with valid student ID card 15 minutes before exam start.",
    category: "Examination",
    event_date: "2026-11-05",
    event_time: "09:30:00",
    venue: "Main Auditorium Hall A",
    priority: "Important",
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Annual Inter-College Hackathon 2026",
    description: "Registration deadline for teams participating in the 24-hour campus hackathon. Cash prizes and mentor sessions included.",
    category: "Event",
    event_date: "2026-11-08",
    event_time: "17:00:00",
    venue: "Tech Park, Seminar Hall 3",
    priority: "Normal",
    status: "Upcoming",
  },
  {
    id: 4,
    title: "Founder's Day Campus Holiday",
    description: "The college campus and administrative offices will remain closed on account of Founder's Day.",
    category: "Holiday",
    event_date: "2026-11-14",
    event_time: null,
    venue: "Campus Wide",
    priority: "Normal",
    status: "Upcoming",
  },
  {
    id: 5,
    title: "Central Library Overdue Book Clearance",
    description: "All borrowed library books for semester clearance must be returned to avoid daily overdue fines.",
    category: "General",
    event_date: "2026-10-25",
    event_time: "16:00:00",
    venue: "Central Library Desk 1",
    priority: "Normal",
    status: "Expired",
  },
  {
    id: 6,
    title: "AI & Machine Learning Guest Lecture",
    description: "Distinguished guest lecture on Agentic AI Systems by visiting research scientist. Attendance mandatory for CS 4th year.",
    category: "Event",
    event_date: "2026-11-02",
    event_time: "14:00:00",
    venue: "Seminar Hall 1",
    priority: "Important",
    status: "Upcoming",
  },
];

export const CATEGORIES = [
  "All",
  "Assignment",
  "Examination",
  "Event",
  "Holiday",
  "General",
];

export const PRIORITIES = [
  "All",
  "Normal",
  "Important",
  "Urgent",
];

