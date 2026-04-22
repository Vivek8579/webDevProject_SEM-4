"""
=============================================================
 Event Management Website — Flask Back-End
 Project : Event Management System
 File    : app.py  (Flask application entry point)
 Date    : 2026-04-02
=============================================================
"""

from flask import (
    Flask, render_template, request, redirect,
    url_for, flash, session, jsonify
)
import sqlite3, os, uuid
from datetime import datetime

app = Flask(__name__)
app.secret_key = "change-this-to-a-random-secret-key"

DB_PATH = os.path.join(os.path.dirname(__file__), "events.db")

# ── Database helpers ──────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            date        TEXT NOT NULL,
            time        TEXT NOT NULL,
            venue       TEXT NOT NULL,
            description TEXT,
            category    TEXT,
            image_url   TEXT,
            rsvp_count  INTEGER DEFAULT 0
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS registrations (
            id            TEXT PRIMARY KEY,
            full_name     TEXT NOT NULL,
            email         TEXT NOT NULL,
            phone         TEXT NOT NULL,
            event_id      TEXT NOT NULL,
            tickets       INTEGER DEFAULT 1,
            registered_at TEXT,
            FOREIGN KEY (event_id) REFERENCES events(id)
        )
    """)
    # Seed sample events if table is empty
    if c.execute("SELECT COUNT(*) FROM events").fetchone()[0] == 0:
        sample = [
            ("1","Tech Innovation Summit 2026","2026-05-15","09:00",
             "Grand Convention Center, Hall A",
             "Join industry leaders for a day of cutting-edge technology talks, workshops, and networking. Featuring keynotes on AI, blockchain, and quantum computing.",
             "Technology","",142),
            ("2","Spring Music Festival","2026-04-20","16:00",
             "Riverside Park Amphitheatre",
             "An open-air music festival featuring live bands, solo artists, and DJ sets. Food trucks and art installations throughout the venue.",
             "Music","",389),
            ("3","Startup Pitch Night","2026-04-28","18:30",
             "Innovation Hub, Floor 12",
             "Watch 10 promising startups pitch their ideas to a panel of investors. Networking reception follows the presentations.",
             "Business","",67),
            ("4","Digital Art Exhibition","2026-05-05","10:00",
             "Modern Art Gallery, West Wing",
             "Explore the intersection of technology and art with immersive digital installations, VR experiences, and NFT showcases.",
             "Art","",215),
            ("5","Community Wellness Retreat","2026-05-10","07:00",
             "Lakeside Wellness Center",
             "A full day of yoga, meditation, nutrition workshops, and mindfulness sessions. Open to all experience levels.",
             "Health","",98),
            ("6","Culinary Masters Workshop","2026-06-01","11:00",
             "The Culinary Institute, Kitchen B",
             "Learn from award-winning chefs in this hands-on cooking workshop. Includes a 3-course meal preparation and wine pairing session.",
             "Food","",45),
        ]
        c.executemany(
            "INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?)", sample
        )
    conn.commit()
    conn.close()

# ── Routes ────────────────────────────────────────────────

# Landing page
@app.route("/")
def index():
    conn = get_db()
    events = conn.execute(
        "SELECT * FROM events ORDER BY date LIMIT 3"
    ).fetchall()
    conn.close()
    return render_template("index.html", events=events)

# Events listing
@app.route("/events")
def events_page():
    conn = get_db()
    category = request.args.get("category", "All")
    search   = request.args.get("q", "")
    query = "SELECT * FROM events WHERE 1=1"
    params = []
    if category and category != "All":
        query += " AND category = ?"
        params.append(category)
    if search:
        query += " AND (name LIKE ? OR venue LIKE ? OR description LIKE ?)"
        params += [f"%{search}%"] * 3
    query += " ORDER BY date"
    events = conn.execute(query, params).fetchall()
    conn.close()
    categories = ["All","Technology","Music","Business","Art","Health","Food"]
    return render_template("events.html", events=events,
                           categories=categories,
                           selected_category=category,
                           search_query=search)

# Registration page & handler
@app.route("/register", methods=["GET","POST"])
def register():
    conn = get_db()
    events = conn.execute("SELECT id, name FROM events ORDER BY date").fetchall()
    if request.method == "POST":
        full_name = request.form.get("full_name","").strip()
        email     = request.form.get("email","").strip()
        phone     = request.form.get("phone","").strip()
        event_id  = request.form.get("event_id","")
        tickets   = int(request.form.get("tickets","1"))
        # Server-side validation
        errors = []
        if not full_name:       errors.append("Full name is required.")
        if "@" not in email:    errors.append("Valid email is required.")
        if not phone.isdigit() or len(phone) < 10:
            errors.append("Phone must be at least 10 digits.")
        if not event_id:        errors.append("Please select an event.")
        if tickets < 1:         errors.append("At least 1 ticket required.")
        if errors:
            for e in errors:
                flash(e, "error")
            conn.close()
            return render_template("register.html", events=events,
                                   form=request.form)
        reg_id = str(uuid.uuid4())[:8]
        conn.execute(
            "INSERT INTO registrations VALUES (?,?,?,?,?,?,?)",
            (reg_id, full_name, email, phone, event_id, tickets,
             datetime.now().isoformat())
        )
        conn.execute(
            "UPDATE events SET rsvp_count = rsvp_count + ? WHERE id = ?",
            (tickets, event_id)
        )
        conn.commit()
        conn.close()
        flash("Registration successful! A confirmation has been sent to " + email, "success")
        return redirect(url_for("register"))
    conn.close()
    return render_template("register.html", events=events, form={})

# ── Admin routes ──────────────────────────────────────────
ADMIN_PASSWORD = "admin123"

@app.route("/admin", methods=["GET","POST"])
def admin():
    if not session.get("is_admin"):
        if request.method == "POST":
            if request.form.get("password") == ADMIN_PASSWORD:
                session["is_admin"] = True
                return redirect(url_for("admin"))
            else:
                flash("Incorrect password.", "error")
        return render_template("admin_login.html")
    conn = get_db()
    events = conn.execute("SELECT * FROM events ORDER BY date").fetchall()
    registrations = conn.execute("""
        SELECT r.*, e.name as event_name
        FROM registrations r JOIN events e ON r.event_id = e.id
        ORDER BY r.registered_at DESC
    """).fetchall()
    conn.close()
    return render_template("admin.html", events=events,
                           registrations=registrations)

@app.route("/admin/add", methods=["POST"])
def admin_add():
    if not session.get("is_admin"):
        return redirect(url_for("admin"))
    conn = get_db()
    eid = str(uuid.uuid4())[:8]
    conn.execute(
        "INSERT INTO events VALUES (?,?,?,?,?,?,?,?,0)",
        (eid, request.form["name"], request.form["date"],
         request.form["time"], request.form["venue"],
         request.form.get("description",""),
         request.form.get("category","Technology"),
         request.form.get("image_url",""))
    )
    conn.commit(); conn.close()
    flash("Event added successfully!", "success")
    return redirect(url_for("admin"))

@app.route("/admin/edit/<eid>", methods=["POST"])
def admin_edit(eid):
    if not session.get("is_admin"):
        return redirect(url_for("admin"))
    conn = get_db()
    conn.execute("""
        UPDATE events SET name=?, date=?, time=?, venue=?,
        description=?, category=?, image_url=? WHERE id=?
    """, (request.form["name"], request.form["date"],
          request.form["time"], request.form["venue"],
          request.form.get("description",""),
          request.form.get("category",""),
          request.form.get("image_url",""), eid))
    conn.commit(); conn.close()
    flash("Event updated!", "success")
    return redirect(url_for("admin"))

@app.route("/admin/delete/<eid>")
def admin_delete(eid):
    if not session.get("is_admin"):
        return redirect(url_for("admin"))
    conn = get_db()
    conn.execute("DELETE FROM registrations WHERE event_id=?", (eid,))
    conn.execute("DELETE FROM events WHERE id=?", (eid,))
    conn.commit(); conn.close()
    flash("Event deleted.", "success")
    return redirect(url_for("admin"))

@app.route("/admin/logout")
def admin_logout():
    session.pop("is_admin", None)
    return redirect(url_for("index"))

# ── API endpoint for live search (JS fetch) ───────────────
@app.route("/api/events")
def api_events():
    conn = get_db()
    events = conn.execute("SELECT * FROM events ORDER BY date").fetchall()
    conn.close()
    return jsonify([dict(e) for e in events])

# ── Run ───────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
