import React, { useState, useEffect, useContext } from 'react';
import { Container, TextField, Button, MenuItem, Select, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput, Typography } from '@mui/material';
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from '../firebase-config';
import { UserContext } from '../context/UserContext';

export default function TournamentOrga() {
    const { user } = useContext(UserContext);
    const [title, setTitle] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [postal, setPostal] = useState('');
    const [country, setCountry] = useState('France');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [places, setPlaces] = useState('');
    const [price, setPrice] = useState('');
    const [device, setDevice] = useState('Euro');
    const [statut, setStatut] = useState('Brouillon');
    const [commissaires, setCommissaires] = useState([]);
    const [description, setDescription] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });

    useEffect(() => {
        // Fetch users for commissaires selection
        const fetchUsers = async () => {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        };
        fetchUsers();
    }, []);

    const handleCityChange = async (event) => {
        setCity(event.target.value);
        if (event.target.value.trim() === '') {
            return;
        }

        try {
            const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${event.target.value}&fields=departement,centre,codesPostaux,mairie&boost=population&limit=1`);
            const data = await response.json();
            if (data.length > 0) {
                const result = data[0];
                setCountry('France');
                setPostal(result.codesPostaux[0]);
                setCoordinates({
                    latitude: result.mairie.coordinates[1],
                    longitude: result.mairie.coordinates[0]
                });
            } else {
                setError('Ville non valide.');
            }
        } catch (error) {
            console.error("Error fetching city data: ", error);
            setError('Erreur lors de la récupération des données de la ville.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        if (!user || !user.pseudo) {
            setError('Utilisateur non authentifié.');
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, "tournois"), {
                title,
                city,
                postal,
                address,
                country,
                date_start: new Date(dateStart),
                date_end: new Date(dateEnd),
                places: parseInt(places),
                price: parseFloat(price),
                device,
                commissaires,
                description,
                coord: coordinates,
                creator: user.pseudo,
                creator: user.id,
                date_crea: serverTimestamp(),
                statut,
            });
            setLoading(false);
            // Reset form
            setTitle('');
            setCity('');
            setPostal('');
            setAddress('');
            setCountry('France');
            setDateStart('');
            setDateEnd('');
            setPlaces('');
            setPrice('');
            setDevice('Euro');
            setCommissaires([]);
            setDescription('');
            setCoordinates({ latitude: 0, longitude: 0 });
            setStatut('');
        } catch (error) {
            console.error("Error creating tournament: ", error);
            setError('Erreur lors de la création du tournoi.');
            setLoading(false);
        }
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Créer un tournoi
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Title"
                    fullWidth
                    margin="normal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    label="City"
                    fullWidth
                    margin="normal"
                    value={city}
                    onChange={handleCityChange}
                />
                <TextField
                    label="Postal"
                    fullWidth
                    margin="normal"
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    disabled
                />
                <TextField
                    label="Address"
                    fullWidth
                    margin="normal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <TextField
                    label="Country"
                    fullWidth
                    margin="normal"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                />
                <TextField
                    label="Date Start"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="Date End"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="Places"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={places}
                    onChange={(e) => setPlaces(e.target.value)}
                />
                <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Device</InputLabel>
                    <Select
                        value={device}
                        onChange={(e) => setDevice(e.target.value)}
                        input={<OutlinedInput label="Device" />}
                    >
                        <MenuItem value="Euro">Euro</MenuItem>
                        <MenuItem value="Livre sterling">Livre sterling</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Commissaires</InputLabel>
                    <Select
                        multiple
                        value={commissaires}
                        onChange={(e) => setCommissaires(e.target.value)}
                        input={<OutlinedInput label="Commissaires" />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.pseudo}>
                                <Checkbox checked={commissaires.indexOf(user.pseudo) > -1} />
                                <ListItemText primary={user.pseudo} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Statut</InputLabel>
                    <Select
                        value={statut}
                        onChange={(e) => setStatut(e.target.value)}
                        input={<OutlinedInput label="Statut" />}
                    >
                        <MenuItem value="Brouillon">Brouillon</MenuItem>
                        <MenuItem value="Publié">Publié</MenuItem>
                    </Select>
                </FormControl>
                {error && <Typography color="error">{error}</Typography>}
                <Button type="submit" color="primary" variant="contained" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </form>
        </Container>
    );
}