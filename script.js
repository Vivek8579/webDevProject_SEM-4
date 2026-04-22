/*
=============================================================
 Event Management Website — Client-Side JavaScript
 File    : static/js/script.js
 Date    : 2026-04-02
=============================================================
*/

// ── Dark / Light Theme Toggle ─────────────────────────
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;
const savedTheme = localStorage.getItem("ems_theme") || "light";
html.setAttribute("data-theme", savedTheme);
themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("ems_theme", next);
    themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
});

// ── Mobile Menu Toggle ────────────────────────────────
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("open");
        menuBtn.textContent = navLinks.classList.contains("open") ? "✕" : "☰";
    });
}

// ── Live Search (Events Page, no reload) ──────────────
const searchInput = document.getElementById("searchInput");
const eventsGrid = document.getElementById("eventsGrid");
if (searchInput && eventsGrid) {
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        const cards = eventsGrid.querySelectorAll(".event-card");
        cards.forEach(card => {
            const name = card.getAttribute("data-name") || "";
            const cat  = card.getAttribute("data-category") || "";
            const visible = name.includes(query) || cat.includes(query);
            card.style.display = visible ? "" : "none";
        });
    });
}

// ── Registration Form Validation ──────────────────────
const regForm = document.getElementById("regForm");
if (regForm) {
    regForm.addEventListener("submit", function(e) {
        let valid = true;
        clearErrors();

        const name = document.getElementById("full_name");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        const eventId = document.getElementById("event_id");
        const tickets = document.getElementById("tickets");

        if (!name.value.trim()) {
            showError("err_name", "Full name is required", name);
            valid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            showError("err_email", "Valid email is required", email);
            valid = false;
        }
        if (!/^\d{10,15}$/.test(phone.value)) {
            showError("err_phone", "Phone must be 10–15 digits", phone);
            valid = false;
        }
        if (!eventId.value) {
            showError("err_event", "Please select an event", eventId);
            valid = false;
        }
        if (!tickets.value || parseInt(tickets.value) < 1) {
            showError("err_tickets", "At least 1 ticket required", tickets);
            valid = false;
        }

        if (!valid) e.preventDefault();
    });
}

function showError(spanId, msg, inputEl) {
    const span = document.getElementById(spanId);
    if (span) span.textContent = msg;
    if (inputEl) inputEl.classList.add("input-error");
}
function clearErrors() {
    document.querySelectorAll(".error-msg").forEach(s => s.textContent = "");
    document.querySelectorAll(".input-error").forEach(i => i.classList.remove("input-error"));
}

// ── Admin Edit Modal ──────────────────────────────────
function openEditModal(id, name, date, time, venue, desc, cat, img) {
    const modal = document.getElementById("editModal");
    const form  = document.getElementById("editForm");
    form.action = "/admin/edit/" + id;
    document.getElementById("edit_name").value = name;
    document.getElementById("edit_date").value = date;
    document.getElementById("edit_time").value = time;
    document.getElementById("edit_venue").value = venue;
    document.getElementById("edit_desc").value  = desc;
    document.getElementById("edit_category").value = cat;
    document.getElementById("edit_image").value = img;
    modal.classList.add("active");
}
function closeEditModal() {
    document.getElementById("editModal").classList.remove("active");
}
// Close modal on overlay click
const editModal = document.getElementById("editModal");
if (editModal) {
    editModal.addEventListener("click", function(e) {
        if (e.target === this) closeEditModal();
    });
}

// ── Auto-dismiss flash messages after 5s ──────────────
document.querySelectorAll(".flash").forEach(el => {
    setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(-10px)";
        setTimeout(() => el.remove(), 300);
    }, 5000);
});
