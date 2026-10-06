# ⚡ Server-Side Rendering (SSR) Demo App

A clean, interactive teaching demo designed to help students understand **Server-Side Rendering (SSR)** using **Node.js**, **Express.js**, **EJS templates**, and **static assets (`public/`)**.

---

## 🎯 The Core Concept: What is SSR?

In **Server-Side Rendering (SSR)**, the Node.js server reads the data and compiles the complete HTML document **before** sending it to the user's browser.

```text
Browser                       Express Server                       EJS Engine
   │                                │                                   │
   ├─────── GET /students ─────────>│                                   │
   │                                ├──── Fetch data (data/students.js) │
   │                                ├──── Pass data + template ────────>│
   │                                │                                   ├─ Evaluates <% loops %>
   │                                │<─── Returns compiled HTML ────────┤
   │<────── Full HTML Document ─────┤
   │
   ├─────── GET /css/style.css ────>│ (Served statically from /public)
   │<────── style.css ──────────────┤
```

### Contrast: SSR vs Client-Side Rendering (CSR)

| Feature | Server-Side Rendering (SSR) | Client-Side Rendering (CSR / SPA) |
|---|---|---|
| **Where HTML is built** | On the **Node.js server** | In the **Browser** via JavaScript |
| **Initial page payload** | Ready-to-read, complete HTML | Empty container (e.g. `<div id="root"></div>`) |
| **View Page Source** | Full content visible in HTML source | Only `<script>` tags, no content |
| **If JavaScript is disabled** | The page still displays content! | Blank screen |
| **API requirement** | Server queries DB/data directly | Browser must fetch `/api/...` JSON |

---

## 📂 Project Architecture

```
SSR/
├── app.js                 # Express server, Multer upload config, & routes
├── package.json           # Dependencies (express, ejs, multer) & scripts
├── data/
│   └── students.js        # Mock data source with NIM, socials, and photos
├── views/                 # EJS template files (compiled on the server)
│   ├── partials/
│   │   ├── header.ejs     # Shared HTML head, navigation, and badges
│   │   └── footer.ejs     # Shared footer, clock, and client script loader
│   ├── index.ejs          # Home: interactive SSR vs CSR guide & diagram
│   ├── students.ejs       # Directory: loops, search by NIM/hobby/name
│   ├── student.ejs        # Detail: photo, NIM, address, hobby, socials
│   ├── add-student.ejs    # Form: multipart/form-data upload & handles
│   └── 404.ejs            # Error handling: catch-all route
└── public/                # Static files (served directly untouched)
    ├── css/
    │   └── style.css      # Custom modern styling
    ├── js/
    │   └── main.js        # Client-side JS (live photo preview & clock)
    ├── images/
    │   └── default-avatar.svg
    └── uploads/           # Student uploaded profile photos
```

---

## 🚀 Running the App

### 1. Install dependencies (if not already done)
```bash
npm install
```

### 2. Start the server
```bash
# Standard start
npm start

# Or with automatic reload on file changes (Node 18+)
npm run dev
```

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Classroom Demos: 3 Tests to Prove SSR

### Test 1: View Page Source (The Definitive SSR Proof)
1. Navigate to `http://localhost:3000/students`.
2. Right-click and choose **"View Page Source"** (or press <kbd>Ctrl+U</kbd> on Windows / <kbd>Cmd+Option+U</kbd> on Mac).
3. Search for any student name (e.g., *Alex Rivera*).
4. **Observation:** The student names are baked into the raw HTML delivered by the server! In a React/Vue SPA, they would **not** appear here.

### Test 2: Contrast with the Raw JSON API
1. Open `http://localhost:3000/api/students`.
2. Notice that this route returns raw **JSON**, not HTML.
3. **Lesson:** This is what a CSR (Client-Side Rendering) framework like React fetches in the browser. In SSR, the server consumes this data internally and emits finished HTML instead.

### Test 3: Disable JavaScript Test
1. In Google Chrome, press <kbd>F12</kbd> (DevTools).
2. Press <kbd>F1</kbd> to open Settings.
3. Check the box for **"Disable JavaScript"**.
4. Refresh `http://localhost:3000/students`.
5. **Observation:** The entire student list, styling, and navigation still render completely! Only the live ticking clock in the footer stops.

---

## 💡 Key Code Explanations

### 1. Setting up EJS & Static Files in `app.js`
```javascript
// Tell Express to use EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Tell Express to serve files inside 'public' directly
// (CSS, client JS, images)
app.use(express.static(path.join(__dirname, 'public')));
```

### 2. Passing Data from Route Handler to Template
```javascript
app.get('/students', (req, res) => {
  const students = getAllStudents();
  // Merges the template with data on the server!
  res.render('students', { students, title: 'Student Directory' });
});
```

### 3. Loops and Conditionals in EJS (`views/students.ejs`)
```ejs
<!-- <% %> for control flow (loops, ifs) -->
<% students.forEach(student => { %>
  <!-- <%= %> for printing escaped HTML data -->
  <div class="student-card">
    <h3><%= student.name %></h3>
    <p><%= student.major %></p>
  </div>
<% }); %>
```

### 4. Dynamic Route Parameter (`req.params.id`)
```javascript
app.get('/students/:id', (req, res) => {
  const student = getStudentById(req.params.id);
  if (!student) return res.status(404).render('404');
  res.render('student', { student });
});
```

---

## ✍️ Student Exercises & Homework

1. **Add a new field:**
   - In `data/students.js`, add a `graduationYear` field to each student.
   - Update `views/students.ejs` and `views/student.ejs` to display it.
2. **Create an About Page:**
   - Add a route `app.get('/about', ...)` in `app.js`.
   - Create `views/about.ejs` reusing `partials/header.ejs` and `partials/footer.ejs`.
3. **Add Sorting:**
   - Add a query parameter `?sort=gpa` or `?sort=name` to `/students`.
   - Sort the array in Express before calling `res.render()`.
