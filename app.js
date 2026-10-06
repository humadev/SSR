const express = require('express');
const path = require('path');
const os = require('os');
const multer = require('multer');
const {
  getAllStudents,
  getStudentById,
  addStudent,
  getMajorsList
} = require('./data/students');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CONFIGURE TEMPLATE ENGINE (EJS)
// This tells Express to use EJS to compile files inside the /views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. CONFIGURE STATIC FILES (PUBLIC DIRECTORY)
// Any file inside 'public/' (CSS, client JS, uploaded images) is served directly
// Example: public/uploads/photo.jpg is accessible at /uploads/photo.jpg
app.use(express.static(path.join(__dirname, 'public')));

// 3. BODY PARSING MIDDLEWARE
// Needed to parse form submissions (POST requests)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 4. MULTER CONFIGURATION FOR STUDENT PHOTO UPLOADS
// Demonstrates to students how the server handles file uploads (multipart/form-data)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'student-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow image mimetypes only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are accepted for student photos!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Global middleware to pass common data to every template
app.use((req, res, next) => {
  // Give every template access to the current path for active navbar links
  res.locals.currentPath = req.path;
  // Track when request hit the server
  res.locals.requestTime = new Date().toLocaleTimeString();
  next();
});

// ==========================================
// ROUTES
// ==========================================

// Route: Home Page (SSR Concept & Architecture)
app.get('/', (req, res) => {
  const serverRenderTimestamp = new Date();
  
  res.render('index', {
    title: 'Understanding Server-Side Rendering (SSR)',
    renderedAt: serverRenderTimestamp.toISOString(),
    renderedAtReadable: serverRenderTimestamp.toLocaleTimeString() + ' (Server Clock)',
    totalStudents: getAllStudents().length
  });
});

// Route: Students Directory (SSR List Rendering & Search)
app.get('/students', (req, res) => {
  const searchQuery = (req.query.search || '').trim();
  const majorFilter = (req.query.major || '').trim();
  
  const filteredStudents = getAllStudents(searchQuery, majorFilter);
  const allMajors = getMajorsList();
  const serverRenderTimestamp = new Date();

  // res.render merges data (model) with the EJS template (view) on the server!
  res.render('students', {
    title: 'Student Directory (SSR Demo)',
    students: filteredStudents,
    majors: allMajors,
    searchQuery,
    majorFilter,
    totalCount: filteredStudents.length,
    renderedAt: serverRenderTimestamp.toISOString(),
    renderedAtReadable: serverRenderTimestamp.toLocaleTimeString()
  });
});

// Route: New Student Form (SSR Form Demo with Photo & Social Media)
app.get('/students/new', (req, res) => {
  const allMajors = getMajorsList();
  res.render('add-student', {
    title: 'Add New Student (Form Round-Trip)',
    majors: allMajors,
    error: null,
    formData: {},
    renderedAtReadable: new Date().toLocaleTimeString()
  });
});

// Route: Handle Student Form Submission (POST with file upload middleware)
app.post('/students', (req, res, next) => {
  // Use multer single file handler with friendly error catch
  upload.single('photo')(req, res, function (err) {
    const allMajors = getMajorsList();

    if (err instanceof multer.MulterError) {
      return res.status(400).render('add-student', {
        title: 'Add New Student (Form Round-Trip)',
        majors: allMajors,
        error: `File upload error: ${err.message}`,
        formData: req.body || {},
        renderedAtReadable: new Date().toLocaleTimeString()
      });
    } else if (err) {
      return res.status(400).render('add-student', {
        title: 'Add New Student (Form Round-Trip)',
        majors: allMajors,
        error: err.message,
        formData: req.body || {},
        renderedAtReadable: new Date().toLocaleTimeString()
      });
    }

    const {
      name,
      nim,
      phone,
      email,
      address,
      hobby,
      major,
      year,
      gpa,
      status,
      skills,
      bio,
      linkedin,
      instagram,
      tiktok,
      x,
      facebook
    } = req.body;

    // Validate that EVERY form field is filled
    const missing = [];
    if (!req.file) missing.push('Profile Photo');
    if (!name || !name.trim()) missing.push('Full Name');
    if (!nim || !nim.trim()) missing.push('NIM');
    if (!email || !email.trim()) missing.push('Email');
    if (!phone || !phone.trim()) missing.push('Phone / WhatsApp');
    if (!address || !address.trim()) missing.push('Residential Address');
    if (!major || !major.trim()) missing.push('Major');
    if (!year || !year.trim()) missing.push('Academic Year');
    if (!status || !status.trim()) missing.push('Status');
    if (!gpa || !String(gpa).trim()) missing.push('GPA');
    if (!hobby || !hobby.trim()) missing.push('Hobby');
    if (!skills || !skills.trim()) missing.push('Technical Skills');
    if (!bio || !bio.trim()) missing.push('Biography');
    if (!linkedin || !linkedin.trim()) missing.push('LinkedIn Account');
    if (!instagram || !instagram.trim()) missing.push('Instagram Account');
    if (!tiktok || !tiktok.trim()) missing.push('TikTok Account');
    if (!x || !x.trim()) missing.push('X (Twitter) Account');
    if (!facebook || !facebook.trim()) missing.push('Facebook Account');

    if (missing.length > 0) {
      return res.status(400).render('add-student', {
        title: 'Add New Student (Form Round-Trip)',
        majors: allMajors,
        error: `All fields are required! Please complete: ${missing.join(', ')}.`,
        formData: req.body || {},
        renderedAtReadable: new Date().toLocaleTimeString()
      });
    }

    // Determine uploaded photo path
    const photoFilePath = `/uploads/${req.file.filename}`;

    const created = addStudent({
      name,
      nim,
      phone,
      email,
      address,
      hobby,
      major,
      year,
      gpa,
      status,
      skills,
      bio,
      linkedin,
      instagram,
      tiktok,
      x,
      facebook
    }, photoFilePath);
    
    // Standard Post/Redirect/Get pattern: redirect to newly created student's SSR page
    res.redirect(`/students/${created.id}`);
  });
});

// Route: Student Detail View (Dynamic SSR Route)
app.get('/students/:id', (req, res) => {
  const student = getStudentById(req.params.id);

  if (!student) {
    return res.status(404).render('404', {
      title: 'Student Not Found',
      requestedUrl: req.originalUrl,
      message: `No student was found with ID #${req.params.id}.`,
      renderedAtReadable: new Date().toLocaleTimeString()
    });
  }

  const serverRenderTimestamp = new Date();
  res.render('student', {
    title: `${student.name} (${student.nim}) - Student Profile`,
    student,
    renderedAt: serverRenderTimestamp.toISOString(),
    renderedAtReadable: serverRenderTimestamp.toLocaleTimeString()
  });
});

// Route: Contrast with CSR (Client-Side Rendering) API
// Showing students what a REST API returns (raw JSON) vs SSR (finished HTML)
app.get('/api/students', (req, res) => {
  const students = getAllStudents();
  res.json({
    renderingMode: 'Client-Side (API / JSON)',
    note: 'In CSR (React/Vue/Angular), the browser fetches this raw JSON and assembles the HTML on the client.',
    count: students.length,
    timestamp: new Date().toISOString(),
    data: students
  });
});

app.get('/api/students/:id', (req, res) => {
  const student = getStudentById(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json({
    renderingMode: 'Client-Side (API / JSON)',
    data: student
  });
});

// Route: 404 Not Found Catch-All
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    requestedUrl: req.originalUrl,
    message: 'The page you requested does not exist on this server.',
    renderedAtReadable: new Date().toLocaleTimeString()
  });
});

// Helper to find your Mac's Wi-Fi IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Find IPv4 non-internal address
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start Express Server (bound to 0.0.0.0 to accept Wi-Fi connections)
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`\n======================================================`);
  console.log(`🚀 SSR Demo App is running and accessible on local Wi-Fi!`);
  console.log(`💻 On your Mac:     http://localhost:${PORT}`);
  console.log(`📱 Students (Wi-Fi): http://${localIp}:${PORT}`);
  console.log(`------------------------------------------------------`);
  console.log(`📝 Student Form:     http://${localIp}:${PORT}/students/new`);
  console.log(`👥 Directory:        http://${localIp}:${PORT}/students`);
  console.log(`======================================================\n`);
});
