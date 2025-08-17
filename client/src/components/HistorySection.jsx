import React, { useEffect } from 'react';
import './HistorySection.css';

const HistorySection = () => {
  useEffect(() => {
    const isInViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
      );
    };

    const handleScrollAnimation = () => {
      const timelineItems = document.querySelectorAll('.timeline-item');
      timelineItems.forEach((block) => {
        if (isInViewport(block) && !block.classList.contains('animated')) {
          block.classList.add('animated');
        }
      });
    };

    handleScrollAnimation();
    window.addEventListener('scroll', handleScrollAnimation);
    return () => window.removeEventListener('scroll', handleScrollAnimation);
  }, []);

  return (
    <div className="history-section">
      <h2>Our History</h2>
      <div className="timeline">
        <div className="timeline-item">
          <div className="timeline-content">
            <span className="year">2025</span>
            <p>PatrolNet was launched to address the growing need for faster, tech-driven community safety tools.</p>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-content">
            <span className="year">2026</span>
            <p>First partnerships formed with multiple barangays, leading to improved emergency response rates.</p>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-content">
            <span className="year">Today</span>
            <p>PatrolNet continues to expand, serving communities with cutting-edge solutions for public safety.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorySection;
