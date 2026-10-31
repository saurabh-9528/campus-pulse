import React from 'react';
import NoticeForm from '../components/NoticeForm.jsx';

export function AddNotice({ onNoticeSaved }) {
  return (
    <div className="page-container">
      <div className="page-intro">
        <h2 className="page-intro-title">Add New College Notice</h2>
        <p className="page-intro-description">
          Paste unstructured announcement text from emails, WhatsApp group chats, or event posters.
          Our AI parser extracts the key event details into an editable preview before saving.
        </p>
      </div>

      <NoticeForm onNoticeSaved={onNoticeSaved} />
    </div>
  );
}

export default AddNotice;

