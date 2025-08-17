// src/components/Contact.jsx
import React from "react";
import "./Contact.css"; // ✅ Import CSS

function Contact() {
  return (
    <section className="contact-page">
      <div className="contact-container">
        <h2>Contact Us</h2>
        <p className="contact-subtitle">
          Have questions or suggestions? We’d love to hear from you. Fill out the form below or reach out using the contact details provided.
        </p>

        <div className="contact-info">
          <h3>Our Details</h3>
          <div className="contact-item">
            <strong>Email:</strong> patrolnet@example.com
          </div>
          <div className="contact-item">
            <strong>Phone:</strong> +63 912 345 6789
          </div>
          <div className="contact-item">
            <strong>Address:</strong> Barangay Hall, Example City
          </div>
        </div>

        <div className="contact-form">
          <h3>Send Us a Message</h3>
          <form>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
