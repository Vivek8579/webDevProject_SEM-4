# Project Title: Contact Management System
# Name: Rashmi Jha
# Date: April 21, 2026

from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "secret_key_for_session"

# In-memory storage for contacts
contacts = [
    {"id": 1, "name": "John Doe", "phone": "9876543210", "email": "john@example.com"},
    {"id": 2, "name": "Jane Smith", "phone": "8877665544", "email": "jane@example.com"}
]

@app.route('/')
def index():
    search_query = request.args.get('search')
    if search_query:
        filtered_contacts = [c for c in contacts if search_query.lower() in c['name'].lower() or search_query in c['phone']]
        return render_template('index.html', contacts=filtered_contacts)
    return render_template('index.html', contacts=contacts)

@app.route('/add', methods=['GET', 'POST'])
def add_contact():
    if request.method == 'POST':
        name = request.form.get('name')
        phone = request.form.get('phone')
        email = request.form.get('email')

        if not name or not phone or not email:
            flash("All fields are required!")
            return redirect(url_for('add_contact'))

        new_id = contacts[-1]['id'] + 1 if contacts else 1
        contacts.append({"id": new_id, "name": name, "phone": phone, "email": email})
        return redirect(url_for('index'))
    
    return render_template('add_contact.html')

@app.route('/edit/<int:contact_id>', methods=['GET', 'POST'])
def edit_contact(contact_id):
    contact = next((c for c in contacts if c['id'] == contact_id), None)
    if not contact:
        return "Contact not found", 404

    if request.method == 'POST':
        contact['name'] = request.form.get('name')
        contact['phone'] = request.form.get('phone')
        contact['email'] = request.form.get('email')
        return redirect(url_for('index'))

    return render_template('edit_contact.html', contact=contact)

@app.route('/delete/<int:contact_id>')
def delete_contact(contact_id):
    global contacts
    contacts = [c for c in contacts if c['id'] != contact_id]
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)