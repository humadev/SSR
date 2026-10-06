// Mock database for students
// Demonstrates how the server reads data from a source (DB / memory)
// and injects it into an EJS template before sending HTML to the client.

let students = [
  {
    id: 1,
    name: "Alex Rivera",
    nim: "202401001",
    photo: null, // Will use default avatar or initial
    phone: "+62 812-3456-7801",
    email: "alex.rivera@university.edu",
    address: "Jl. Boulevard No. 12, Jakarta Selatan",
    hobby: "Robotics, Chess, Coffee Brewing",
    major: "Computer Science",
    year: "Junior (Year 3)",
    gpa: 3.85,
    status: "Active",
    bio: "Passionate about distributed systems, backend architectures, and open-source tooling.",
    skills: ["Node.js", "Express", "TypeScript", "PostgreSQL"],
    socials: {
      linkedin: "https://linkedin.com/in/alexrivera",
      instagram: "https://instagram.com/alexrivera.dev",
      tiktok: "https://tiktok.com/@alex_codes",
      x: "https://x.com/alexrivera",
      facebook: "https://facebook.com/alexrivera"
    },
    avatarBg: "#4f46e5"
  },
  {
    id: 2,
    name: "Sophia Chen",
    nim: "202401002",
    photo: null,
    phone: "+62 813-9876-5432",
    email: "sophia.chen@university.edu",
    address: "Jl. Dago Asri No. 45, Bandung",
    hobby: "UI/UX Sketching, Photography, Badminton",
    major: "Software Engineering",
    year: "Senior (Year 4)",
    gpa: 3.92,
    status: "Active",
    bio: "Focusing on fullstack web performance, web accessibility standards, and modern frontend engines.",
    skills: ["JavaScript", "HTML/CSS", "React", "Node.js"],
    socials: {
      linkedin: "https://linkedin.com/in/sophiachen",
      instagram: "https://instagram.com/sophia.ux",
      tiktok: "https://tiktok.com/@sophia_builds",
      x: "https://x.com/sophiachen",
      facebook: "https://facebook.com/sophiachen"
    },
    avatarBg: "#059669"
  },
  {
    id: 3,
    name: "Marcus Johnson",
    nim: "202401003",
    photo: null,
    phone: "+62 821-4567-8901",
    email: "marcus.j@university.edu",
    address: "Jl. Kaliurang KM 5, Yogyakarta",
    hobby: "Data Visualization, Basketball, Podcasts",
    major: "Data Science",
    year: "Sophomore (Year 2)",
    gpa: 3.48,
    status: "Active",
    bio: "Interested in machine learning pipelines, predictive analytics, and real-time data streaming.",
    skills: ["Python", "SQL", "Express API", "Pandas"],
    socials: {
      linkedin: "https://linkedin.com/in/marcusjohnson",
      instagram: "https://instagram.com/marcus.data",
      tiktok: "",
      x: "https://x.com/marcus_j",
      facebook: ""
    },
    avatarBg: "#d97706"
  },
  {
    id: 4,
    name: "Elena Rostova",
    nim: "202401004",
    photo: null,
    phone: "+62 856-7890-1234",
    email: "elena.r@university.edu",
    address: "Jl. Dharmahusada Indah No. 88, Surabaya",
    hobby: "Capture The Flag (CTF), Mountain Hiking, Synthwave",
    major: "Cybersecurity",
    year: "Senior (Year 4)",
    gpa: 3.76,
    status: "Graduated",
    bio: "Network security researcher, currently working on web application vulnerabilities and pen-testing.",
    skills: ["Linux", "Node.js", "Docker", "Security Auditing"],
    socials: {
      linkedin: "https://linkedin.com/in/elenarostova",
      instagram: "https://instagram.com/elena.sec",
      tiktok: "",
      x: "https://x.com/elena_cyber",
      facebook: "https://facebook.com/elena.rostova"
    },
    avatarBg: "#dc2626"
  },
  {
    id: 5,
    name: "Devon Miller",
    nim: "202401005",
    photo: null,
    phone: "+62 878-1122-3344",
    email: "devon.m@university.edu",
    address: "Jl. Diponegoro No. 17, Semarang",
    hobby: "Digital Illustration, Skateboarding, Gaming",
    major: "Interactive Media",
    year: "Freshman (Year 1)",
    gpa: 3.65,
    status: "On Leave",
    bio: "Creative technologist exploring UI/UX design systems and server-rendered micro-sites.",
    skills: ["Figma", "UI/UX", "HTML5", "CSS3"],
    socials: {
      linkedin: "https://linkedin.com/in/devonmiller",
      instagram: "https://instagram.com/devon.creates",
      tiktok: "https://tiktok.com/@devon_art",
      x: "",
      facebook: ""
    },
    avatarBg: "#7c3aed"
  }
];

function getAllStudents(searchQuery = '', majorFilter = '') {
  return students.filter(student => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      student.name.toLowerCase().includes(q) ||
      (student.nim && student.nim.toLowerCase().includes(q)) ||
      student.email.toLowerCase().includes(q) ||
      (student.hobby && student.hobby.toLowerCase().includes(q)) ||
      student.skills.some(skill => skill.toLowerCase().includes(q));
      
    const matchesMajor = !majorFilter || student.major === majorFilter;
    return matchesSearch && matchesMajor;
  });
}

function getStudentById(id) {
  const numericId = parseInt(id, 10);
  return students.find(s => s.id === numericId);
}

function normalizeUrl(url, platform) {
  if (!url || !url.trim()) return '';
  let clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  // If user only typed username e.g. "@johndoe" or "johndoe"
  clean = clean.replace(/^@/, '');
  switch (platform) {
    case 'linkedin':
      return clean.includes('linkedin.com') ? `https://${clean}` : `https://linkedin.com/in/${clean}`;
    case 'instagram':
      return clean.includes('instagram.com') ? `https://${clean}` : `https://instagram.com/${clean}`;
    case 'tiktok':
      return clean.includes('tiktok.com') ? `https://${clean}` : `https://tiktok.com/@${clean}`;
    case 'x':
      return clean.includes('x.com') || clean.includes('twitter.com') ? `https://${clean}` : `https://x.com/${clean}`;
    case 'facebook':
      return clean.includes('facebook.com') ? `https://${clean}` : `https://facebook.com/${clean}`;
    default:
      return `https://${clean}`;
  }
}

function addStudent(newStudentData, photoFilePath = null) {
  const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
  const colors = ["#4f46e5", "#059669", "#d97706", "#7c3aed", "#db2777", "#0284c7", "#e11d48", "#0891b2"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const skillsArray = typeof newStudentData.skills === 'string'
    ? newStudentData.skills.split(',').map(s => s.trim()).filter(Boolean)
    : (Array.isArray(newStudentData.skills) ? newStudentData.skills : ["Web Dev"]);

  const autoNim = `2024010${String(nextId).padStart(2, '0')}`;

  const student = {
    id: nextId,
    name: newStudentData.name ? newStudentData.name.trim() : "Student",
    nim: newStudentData.nim ? newStudentData.nim.trim() : autoNim,
    photo: photoFilePath || null,
    phone: newStudentData.phone ? newStudentData.phone.trim() : "+62 800-0000-0000",
    email: newStudentData.email ? newStudentData.email.trim() : `${newStudentData.name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
    address: newStudentData.address ? newStudentData.address.trim() : "Campus Dormitory, Building A",
    hobby: newStudentData.hobby ? newStudentData.hobby.trim() : "Coding & Learning",
    major: newStudentData.major ? newStudentData.major.trim() : "Computer Science",
    year: newStudentData.year || "Junior (Year 3)",
    gpa: parseFloat(newStudentData.gpa) || 3.50,
    status: newStudentData.status || "Active",
    bio: newStudentData.bio ? newStudentData.bio.trim() : "Enrolled in web architecture course.",
    skills: skillsArray.length ? skillsArray : ["General Engineering"],
    socials: {
      linkedin: normalizeUrl(newStudentData.linkedin, 'linkedin'),
      instagram: normalizeUrl(newStudentData.instagram, 'instagram'),
      tiktok: normalizeUrl(newStudentData.tiktok, 'tiktok'),
      x: normalizeUrl(newStudentData.x, 'x'),
      facebook: normalizeUrl(newStudentData.facebook, 'facebook')
    },
    avatarBg: randomColor
  };

  students.push(student);
  return student;
}

function getMajorsList() {
  const majors = [...new Set(students.map(s => s.major))];
  return majors.sort();
}

module.exports = {
  getAllStudents,
  getStudentById,
  addStudent,
  getMajorsList
};
