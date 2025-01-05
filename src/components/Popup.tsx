import React, { useState } from 'react';
import './components/Popup.css'; // File CSS opsional untuk styling

const Popup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  return isVisible ? (
    <div className="popup-overlay">
      <div className="popup">
        <p>Bahagia ya!</p>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  ) : null;
};

export default Popup;