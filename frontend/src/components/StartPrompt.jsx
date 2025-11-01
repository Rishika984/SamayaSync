import React from 'react';

export default function StartPrompt({ open, onConfirm, onCancel, message = 'Set your goals and start studying!' }) {
  if (!open) return null;

  return (
    <div className="prompt-backdrop">
      <div className="prompt-modal">
        <p className="prompt-message">{message}</p>
        <div className="prompt-actions">
          <button className="prompt-btn prompt-cancel" onClick={onCancel}>Cancel</button>
          <button className="prompt-btn prompt-ok" onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
}
