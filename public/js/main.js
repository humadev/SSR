// ==========================================================================
// SSR EXPLORER - CLIENT JAVASCRIPT (/public/js/main.js)
// ==========================================================================
// This script runs inside the STUDENT'S BROWSER after the initial HTML
// has already been downloaded from the Node.js server.
// It proves that:
// 1. SSR provides the complete HTML upfront.
// 2. Client-side JS can still add interactivity, animations, and widgets.

console.log("%c⚡ SSR Explorer Demo", "color: #6366f1; font-size: 16px; font-weight: bold;");
console.log(
  "%c[Client JS Loaded] This script is served statically from /public/js/main.js via app.use(express.static('public')).",
  "color: #10b981; font-size: 12px;"
);

document.addEventListener("DOMContentLoaded", () => {
  // 1. Live Client Clock
  // Contrast this ticking client time with the server-stamped render timestamp!
  const clientClock = document.getElementById("clientTimeDisplay");
  if (clientClock) {
    const updateTime = () => {
      const now = new Date();
      clientClock.textContent = now.toLocaleTimeString();
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // 2. Interactive Guide Drawer
  const toggleBtn = document.getElementById("toggleGuideBtn");
  const closeBtn = document.getElementById("closeDrawerBtn");
  const drawer = document.getElementById("ssrGuideDrawer");

  if (toggleBtn && drawer && closeBtn) {
    toggleBtn.addEventListener("click", () => {
      drawer.classList.toggle("open");
      drawer.setAttribute("aria-hidden", !drawer.classList.contains("open"));
    });

    closeBtn.addEventListener("click", () => {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        drawer.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
      }
    });
  }

  // 3. Highlight student cards micro-interaction
  const studentCards = document.querySelectorAll(".student-card");
  studentCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.borderColor = "var(--primary)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.borderColor = "";
    });
  });

  // 4. Live Photo Upload Preview
  const photoInput = document.getElementById("photoInput");
  const photoPreviewImg = document.getElementById("photoPreviewImg");

  if (photoInput && photoPreviewImg) {
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          photoPreviewImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
