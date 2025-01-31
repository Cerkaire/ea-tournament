// Development.js
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

export default function Development() {
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleJsonChange = (event) => {
    setJsonData(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        for (const item of data) {
          await addDoc(collection(db, "codex"), item);
        }
      } else {
        await addDoc(collection(db, "codex"), data);
      }
      setSuccess('Data uploaded successfully!');
    } catch (error) {
      console.error("Error uploading data: ", error);
      setError('Error uploading data. Please check the JSON format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload JSON Data to Firestore
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="JSON Data"
          fullWidth
          multiline
          rows={10}
          margin="normal"
          value={jsonData}
          onChange={handleJsonChange}
        />
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="primary">{success}</Typography>}
        <Box mt={2}>
          <Button type="submit" color="primary" variant="contained" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </Box>
      </form>
    </Container>
  );
}