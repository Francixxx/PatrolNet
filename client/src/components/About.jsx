import React, { useEffect } from 'react';
import './About.css';


const About = () => {
  useEffect(() => {
    const isInViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
      );
    };

    const handleScrollAnimation = () => {
      const featureBlocks = document.querySelectorAll('.feature-block');
      
      featureBlocks.forEach((block) => {
        if (isInViewport(block) && !block.classList.contains('animated')) {
          block.classList.add('animated');
        }
      });
    };

    handleScrollAnimation();
    window.addEventListener('scroll', handleScrollAnimation);
    
    return () => {
      window.removeEventListener('scroll', handleScrollAnimation);
    };
  }, []);

  return (
    <>
      <>
  <section className="about-section">
    <div className='about'>
      <div className='feature-text'>
        <h2>About</h2>
      </div>
    </div>

    <div className="feature-block">
      <div className="feature-text">
        <h2>Instant Incident Reporting for Safer Communities</h2>
        <p>
          PatrolNet is a powerful web and mobile application designed to enhance community safety by enabling residents to instantly report accidents and incidents directly to their barangay. With just a few taps, vital information reaches local authorities, allowing them to respond quickly and effectively. This real-time communication ensures that no incident goes unnoticed, improving response times and strengthening neighborhood vigilance.
        </p>
      </div>
      <div className="feature-image">
        <div className="image-container">
          <img src="Alert.png" alt="Instant Notification" />
          <div className="image-overlay">
            <h3>Innovation</h3>
            <p>Real-time alerts</p>
          </div>
        </div>
      </div>
    </div>

    <div className="feature-block reverse">
      <div className="feature-text">
        <h2>Designed for Barangays, Powered by Technology</h2>
        <p>
          Built with the specific needs of barangays in mind, PatrolNet bridges the gap between grassroots community efforts and modern digital tools. The app empowers residents to be active participants in public safety while giving barangay officials the data they need to make informed decisions and coordinate effective responses.
        </p>
      </div>
      <div className="feature-image">
        <div className="image-container">
          <img src="Alert2.jpg" alt="Community Focused" />
          <div className="image-overlay">
            <h3>Precision</h3>
            <p>Localized solutions</p>
          </div>
        </div>
      </div>
    </div>

    <div className="feature-block">
      <div className="feature-text">
        <h2>Empowering Action Through Information</h2>
        <p>
          PatrolNet ensures that every report submitted by residents is quickly relayed to the appropriate barangay personnel. Through a user-friendly interface and automated alerts, the platform streamlines incident handling, increases awareness, and encourages a culture of community cooperation and proactive safety.
        </p>
      </div>
      <div className="feature-image">
        <div className="image-container">
          <img src="Alert3.jpg" alt="Team at Work" />
          <div className="image-overlay">
            <h3>Expertise</h3>
            <p>Community-driven design</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</>

     
    </>
  );
};

export default About;