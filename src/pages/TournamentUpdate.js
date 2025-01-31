import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../context/MainContext';
import { UserContext } from '../context/UserContext';
import { db } from '../firebase-config';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { Container, Typography, TextField, Button, Box, CircularProgress, Card, CardContent, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Radio, FormControlLabel, RadioGroup, FormLabel } from '@mui/material';



export default function TournamentUpdate() {
    const { selectedTournamentId } = useContext(MainContext);
    const { user } = useContext(UserContext);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [city, setCity] = useState('');
    const [adress, setAdress] = useState('');
    const [country, setCountry] = useState('France');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [places, setPlaces] = useState('');
    const [price, setPrice] = useState('');
    const [device, setDevice] = useState('Euro');
    const [description, setDescription] = useState('');
    const [inscriptionsCount, setInscriptionsCount] = useState(0);
    const [players, setPlayers] = useState([]);
    const [playerCancel, setPlayerCancel] = useState([]);
    const [preInscritPlayers, setPreInscritPlayers] = useState([]);

    useEffect(() => {
        fetchTournament();
        fetchInscriptionsCount();
        fetchInscriptions();
        fetchInscriptionCancel();
    }, [selectedTournamentId]);

    const fetchTournament = async () => {
        if (selectedTournamentId) {
            try {
                const docRef = doc(db, "tournois", selectedTournamentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTournament(data);
                    setTitle(data.title);
                    setCity(data.city);
                    setAdress(data.adress);
                    setCountry(data.country);
                    setDateStart(new Date(data.date_start.seconds * 1000).toISOString().slice(0, 16));
                    setDateEnd(new Date(data.date_end.seconds * 1000).toISOString().slice(0, 16));
                    setPlaces(data.places);
                    setPrice(data.price);
                    setDevice(data.device);
                    setDescription(data.description);
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching tournament: ", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const fetchInscriptionsCount = async () => {
        if (selectedTournamentId) {
            try {
                const inscriptionsRef = collection(db, `tournois/${selectedTournamentId}/inscriptions`);
                const inscriptionsSnapshot = await getDocs(inscriptionsRef);
                setInscriptionsCount(inscriptionsSnapshot.size);
            } catch (error) {
                console.error("Error fetching inscriptions count: ", error);
            }
        }
    };

    const fetchInscriptions = async () => {
        if (selectedTournamentId) {
            try {
                const inscriptionsRef = collection(db, `tournois/${selectedTournamentId}/inscriptions`);
                const inscriptionsSnapshot = await getDocs(inscriptionsRef);
                const playersList = inscriptionsSnapshot.docs
                    .map(doc => doc.data())
                    .filter(player => player.inscrit === true);
                setInscriptionsCount(playersList.length);
                setPlayers(playersList);
                setPreInscritPlayers(playersList.filter(player => player.statut === "pré_inscrit"));

            } catch (error) {
                console.error("Error fetching inscriptions: ", error);
            }
        }
    };

    const fetchInscriptionCancel = async () => {
        if (selectedTournamentId) {
            try {
                const inscriptionsRef = collection(db, `tournois/${selectedTournamentId}/inscriptions`);
                const inscriptionsSnapshot = await getDocs(inscriptionsRef);
                const playersList = inscriptionsSnapshot.docs
                    .map(doc => doc.data())
                    .filter(player => player.inscrit === false);
                setPlayerCancel(playersList);
            } catch (error) {
                console.error("Error fetching inscriptions: ", error);
            }
        }
    };

    const countInscriptionsByStatus = () => {
        const statusCounts = {
            pré_inscrit: 0,
            validé: 0,
            payé: 0,
            attente: 0
        };

        players.forEach(player => {
            if (statusCounts.hasOwnProperty(player.statut)) {
                statusCounts[player.statut]++;
            }
        });

        return statusCounts;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const docRef = doc(db, "tournois", selectedTournamentId);
            await updateDoc(docRef, {
                title,
                city,
                adress,
                country,
                date_start: new Date(dateStart),
                date_end: new Date(dateEnd),
                places: parseInt(places),
                price: parseFloat(price),
                device,
                description
            });
            alert('Tournament updated successfully!');
        } catch (error) {
            console.error("Error updating tournament: ", error);
        }
    };

    const handleStatusChange = async (player, newStatus) => {
        try {
            const playerRef = collection(db, `tournois/${selectedTournamentId}/inscriptions`);
            const querySnapshot = await getDocs(playerRef);
            const userUpdate = querySnapshot.docs.find(doc => doc.data().user === player.user);
            if (userUpdate) {

                const userDocRef = doc(db, `tournois/${selectedTournamentId}/inscriptions`, userUpdate.id);

                await updateDoc(userDocRef, {
                    statut: newStatus
                });
                fetchInscriptions();
            } else {
                console.error("User is not subscribed to this tournament.");
            }
        } catch (error) {
            console.error("Error updating player status: ", error);
        }
    };





    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!tournament) {
        return (
            <Container>
                <Typography variant="h5">No tournament selected or tournament not found.</Typography>
            </Container>
        );
    }

    if (!tournament) {
        return (
            <Container>
                <Typography variant="h5">No tournament selected or tournament not found.</Typography>
            </Container>
        );
    }

    const isUserSubscribed = players.some(player => player.user === user.uid);

    const validePlayers = players.filter(player => player.statut === "validé");
    const payePlayers = players.filter(player => player.statut === "payé");
    const attentePlayers = players.filter(player => player.statut === "attente");
    const annulePlayers = playerCancel.filter(player => player.statut === "attente");


    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Update Tournament
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
                    onChange={(e) => setCity(e.target.value)}
                />
                <TextField
                    label="adress"
                    fullWidth
                    margin="normal"
                    value={adress}
                    onChange={(e) => setAdress(e.target.value)}
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
                <TextField
                    label="Device"
                    fullWidth
                    margin="normal"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                />
                <TextField
                    label="Description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Button type="submit" color="primary" variant="contained" fullWidth>
                    Update Tournament
                </Button>
            </form>
            <Card sx={{ width: '100%', mt: 4 }}>
                <CardContent>
                    <Typography variant="h6" component="div">
                        Nombre d'inscriptions par statut
                    </Typography>
                    <List>
                        {Object.entries(countInscriptionsByStatus()).map(([status, count], index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${status}: ${count}`} />
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                        Liste des joueurs inscrits
                    </Typography>
                    <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Pré-inscrits
                    </Typography>
                    <List>
                        {preInscritPlayers.map((player, index) => (
                            <ListItem key={index}>
                                <FormControl component="fieldset">
                                    <FormLabel >{`${player.pseudo} (${player.codex})`}</FormLabel>
                                    <RadioGroup
                                        row
                                        value={player.statut}
                                        onChange={(e) => handleStatusChange(player, e.target.value)}
                                        name={`status-${player.id}`}>
                                        <FormControlLabel value="pré_inscrit" control={<Radio />} label="Pré-inscrit" />
                                        <FormControlLabel value="validé" control={<Radio />} label="Validé" />
                                        <FormControlLabel value="payé" control={<Radio />} label="Payé" />
                                        <FormControlLabel value="attente" control={<Radio />} label="Attente" />
                                    </RadioGroup>
                                </FormControl>
                            </ListItem>
                        ))}

                    </List>
                    <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Validés
                    </Typography>
                    <List>
                        {validePlayers.map((player, index) => (
                            <ListItem key={index}>
                                <FormControl component="fieldset">
                                    <ListItemText primary={`${player.pseudo}`} secondary={`Codex: ${player.codex}`} />
                                    <RadioGroup
                                        row
                                        value={player.statut}
                                        onChange={(e) => handleStatusChange(player, e.target.value)}
                                    >
                                        <FormControlLabel value="pré_inscrit" control={<Radio />} label="Pré-inscrit" />
                                        <FormControlLabel value="validé" control={<Radio />} label="Validé" />
                                        <FormControlLabel value="payé" control={<Radio />} label="Payé" />
                                        <FormControlLabel value="attente" control={<Radio />} label="Attente" />
                                    </RadioGroup>
                                </FormControl>
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Payés
                    </Typography>
                    <List>
                        {payePlayers.map((player, index) => (
                            <ListItem key={index}>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        row
                                        value={player.statut}
                                        onChange={(e) => handleStatusChange(player, e.target.value)}
                                    >
                                        <FormControlLabel value="pré_inscrit" control={<Radio />} label="Pré-inscrit" />
                                        <FormControlLabel value="validé" control={<Radio />} label="Validé" />
                                        <FormControlLabel value="payé" control={<Radio />} label="Payé" />
                                        <FormControlLabel value="attente" control={<Radio />} label="Attente" />
                                    </RadioGroup>
                                </FormControl>
                                <ListItemText primary={`${player.pseudo}`} secondary={`Codex: ${player.codex}`} />
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Liste d'attente
                    </Typography>
                    <List>
                        {attentePlayers.map((player, index) => (
                            <ListItem key={index}>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        row
                                        value={player.statut}
                                        onChange={(e) => handleStatusChange(player, e.target.value)}
                                    >
                                        <FormControlLabel value="pré_inscrit" control={<Radio />} label="Pré-inscrit" />
                                        <FormControlLabel value="validé" control={<Radio />} label="Validé" />
                                        <FormControlLabel value="payé" control={<Radio />} label="Payé" />
                                        <FormControlLabel value="attente" control={<Radio />} label="Attente" />
                                    </RadioGroup>
                                </FormControl>
                                <ListItemText primary={`${player.pseudo}`} secondary={`Codex: ${player.codex}`} />
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Inscription annulée
                    </Typography>
                    <List>
                        {annulePlayers.map((player, index) => (
                            <ListItem key={index}>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        row
                                        value={player.statut}
                                        onChange={(e) => handleStatusChange(player, e.target.value)}
                                    >
                                        <FormControlLabel value="pré_inscrit" control={<Radio />} label="Pré-inscrit" />
                                        <FormControlLabel value="validé" control={<Radio />} label="Validé" />
                                        <FormControlLabel value="payé" control={<Radio />} label="Payé" />
                                        <FormControlLabel value="attente" control={<Radio />} label="Attente" />
                                    </RadioGroup>
                                </FormControl>
                                <ListItemText primary={`${player.pseudo}`} secondary={`Codex: ${player.codex}`} />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Container >
    );
}
