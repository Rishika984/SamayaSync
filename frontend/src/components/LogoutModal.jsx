import React from 'react';
import { createPortal } from 'react-dom';

function LogoutModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="logout-modal">
        <h3 className="modal-title">Confirm Logout</h3>
        <p className="modal-message">
          Are you sure you want to logout? You will need to login again to access your dashboard.
        </p>
        <div className="modal-buttons">
          <button 
            className="cancel-button" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="confirm-button" 
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default LogoutModal;