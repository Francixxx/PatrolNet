import React, { useState, useEffect } from "react";
import GISMapping from "./GISmapping";
import "./Announcements.css";

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("http://10.170.82.215:3001/api/announcements");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="announcement-page">
      {/* Main Announcements Section */}
      <section className="announcements-section">
        <h1>Community Announcements</h1>
        <div className="announcements-grid">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div key={announcement._id} className="announcement-card">
                <h2>{announcement.title}</h2>
                <p className="announcement-date">{new Date(announcement.date).toLocaleDateString()}</p>
                <p>{announcement.description}</p>
                {announcement.image && (
                  <img
                    src={`http://10.170.82.215:3001/uploads/${announcement.image}`}
                    alt={announcement.title}
                    className="announcement-card-image"
                  />
                )}
                <a href="#" className="read-more">Read More</a>
              </div>
            ))
          ) : (
            <p>No announcements available yet.</p>
          )}
        </div>
      </section>

      {/* GIS Map Section */}
      <div className="announcement-gis-section">
        <h2>Incident Map</h2>
        <p className="incident-info">
          A road accident occurred earlier today near the barangay crossing. Several residents
          reported delays in traffic and minor injuries. Authorities have been dispatched to secure
          the area and assist those affected.
        </p>
        <p className="incident-info">
          The map below shows the exact location of the incident so that residents can be aware
          of the affected zone and plan their routes accordingly. This is part of our ongoing
          effort to keep the community safe and informed.
        </p>
        <img
          src="/images/incident.jpg"
          alt="Incident Location"
          className="incident-image"
        />
        <GISMapping showOnlyMap={true} />
      </div>

      {/* Announcement Images Section */}
      <section className="announcement-images-section">
        <h2>Visual Announcements</h2>
        <div className="announcement-image-grid">
          {/* These images are static, consider making them dynamic if they are related to announcements */}
          <img src="/Alert.png" alt="Announcement Image 1" />
          <img src="Alert2.jpg" alt="Announcement Image 2" />
          <img src="Alert3.jpg" alt="Announcement Image 3" />
          <img src="Medical.jpg" alt="Announcement Image 4" />
          <img src="slide1.jpg" alt="Announcement Image 5" />
          <img src="slide2.jpg" alt="Announcement Image 6" />
          <img src="slide3.jpg" alt="Announcement Image 7" />
          <img src="/slide.jpg" alt="Announcement Image 8" />
        </div>
      </section>

      {/* Footer Section */}
      <footer className="announcement-footer">
        <p>&copy; {new Date().getFullYear()} PatrolNet. All rights reserved.</p>
        <p>Contact us: info@patrolnet.com</p>
      </footer>
    </div>
  );
}