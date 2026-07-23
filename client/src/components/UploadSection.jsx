import React, { useState } from 'react';

const UploadSection = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage({ text: '', type: '' });
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: 'Please select a file to upload.', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage({ text: '', type: '' });

    try {
      const text = await file.text();
      let jsonData;
      try {
        jsonData = JSON.parse(text);
      } catch (err) {
        throw new Error('Invalid JSON format.');
      }

      if (!Array.isArray(jsonData)) {
        throw new Error('Uploaded JSON must be an array of records.');
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/logs/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed.');
      }

      setMessage({ text: result.message || 'Upload successful.', type: 'success' });
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('logUpload');
      if (fileInput) fileInput.value = '';

      onUploadSuccess();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="upload-section">
      <h2>Upload Logs</h2>
      <div className="upload-controls">
        <input
          type="file"
          id="logUpload"
          accept=".json"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          {message.text}
        </div>
      )}
    </section>
  );
};

export default UploadSection;
