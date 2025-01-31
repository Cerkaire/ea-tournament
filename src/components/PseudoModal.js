// PseudoModal.js
import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Typography } from '@mui/material';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase-config';

export default function PseudoModal({ open, handleClose, userId }) {
    const [pseudo, setPseudo] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePseudoChange = (event) => {
        setPseudo(event.target.value);
    };

    const handleCityChange = (event) => {
        setCity(event.target.value);
    };

    const fetchCityData = async (city) => {
        const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${city}&fields=departement,centre,codesPostaux&boost=population&limit=1`);
        const data = await response.json();
        if (data.length > 0) {
            const result = data[0];
            return {
                postal: result.codesPostaux[0],
                country: "France",
                coord: {
                    latitude: result.centre.coordinates[1],
                    longitude: result.centre.coordinates[0]
                }
            };
        }
        return null;
    };

    const handleSubmit = async () => {
        if (pseudo.trim() === '' || city.trim() === '') {
            setError('Pseudo et ville sont requis.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const cityData = await fetchCityData(city);
            if (!cityData) {
                setError('Ville non valide.');
                setLoading(false);
                return;
            }

            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, {
                pseudo: pseudo,
                city: city,
                postal: cityData.postal,
                country: cityData.country,
                coord: cityData.coord
            });
            handleClose();
        } catch (error) {
            console.error("Error updating user data: ", error);
            setError('Erreur lors de la mise à jour des données.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Pseudo</DialogTitle>
            <DialogContent>
                <TextField
                    label="Pseudo"
                    fullWidth
                    margin="normal"
                    value={pseudo}
                    onChange={handlePseudoChange}
                />
                <TextField
                    label="City"
                    fullWidth
                    margin="normal"
                    value={city}
                    onChange={handleCityChange}
                />
                {error && <Typography color="error">{error}</Typography>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Close</Button>
                <Button onClick={handleSubmit} color="primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}