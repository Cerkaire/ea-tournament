// Tournament.js
import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../context/MainContext';
import { UserContext } from '../context/UserContext';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { Dialog, Container, Typography, CircularProgress, Box, Card, CardContent, Button, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, List, ListItem, ListItemText } from '@mui/material';
import MapComponent from '../components/MapComponent';

export default function Tournament() {
    const { selectedTournamentId } = useContext(MainContext);
    const { user } = useContext(UserContext);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [codexes, setCodexes] = useState([]);
    const [selectedCodex, setSelectedCodex] = useState('');
    const [inscriptionsCount, setInscriptionsCount] = useState(0);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const fetchTournament = async () => {
            if (selectedTournamentId) {
                try {
                    const docRef = doc(db, "tournois", selectedTournamentId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setTournament(docSnap.data());
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
        
        const fetchCodexes = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "codex"));
                const codexList = querySnapshot.docs.map(doc => doc.data().codex);
                setCodexes(codexList);
            } catch (error) {
                console.error("Error fetching codexes: ", error);
            }
        };

        fetchTournament();
        fetchCodexes();
        fetchInscriptionsCount();
        fetchInscriptions();

    }, [selectedTournamentId]);

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
            } catch (error) {
                console.error("Error fetching inscriptions: ", error);
            }
        }
    };

    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };
    const handleCodexChange = (event) => {
        setSelectedCodex(event.target.value);
    };

    const handleSubmit = async () => {
        if (!selectedCodex) {
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const inscriptionRef = collection(db, `tournois/${selectedTournamentId}/inscriptions`);
                await addDoc(inscriptionRef, {
                    user: user.uid,
                    codex: selectedCodex,
                    pseudo: userData.pseudo,
                    statut: (tournament.places - inscriptionsCount) <= 0 ? "attente" : "pré_inscrit",
                    inscrit: true
                });
                handleModalClose();
            } else {
                console.error("No such user document!");
            }
        } catch (error) {
            console.error("Error adding inscription: ", error);
        }
        fetchInscriptions(); // Refresh the list of players
        fetchInscriptionsCount(); // Refresh the count of inscriptions
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

    const dateStart = new Date(tournament.date_start.seconds * 1000).toLocaleDateString();
    const dateEnd = new Date(tournament.date_end.seconds * 1000).toLocaleDateString();

    const handleUnsubscribe = async () => {
        try {
            const inscriptionsRef = collection(db, `tournois/${selectedTournamentId}/inscriptions`);
            const querySnapshot = await getDocs(inscriptionsRef);
            const userInscription = querySnapshot.docs.find(doc => doc.data().user === user.uid);
            if (userInscription) {
                await updateDoc(doc(db, `tournois/${selectedTournamentId}/inscriptions`, userInscription.id), {
                    inscrit: false
                });
                fetchInscriptions(); // Refresh the list of players

            } else {
                console.error("User is not subscribed to this tournament.");
            }
        } catch (error) {
            console.error("Error unsubscribing: ", error);
        }
    };

    const handleUpdateCodex = async (playerId) => {

        if (!selectedCodex) {
            return;
        }
        try {
            const inscriptionsRef = collection(db, `tournois/${selectedTournamentId}/inscriptions`);
            const querySnapshot = await getDocs(inscriptionsRef);
            const userInscription = querySnapshot.docs.find(doc => doc.data().user === user.uid);
            if (userInscription) {
                await updateDoc(doc(db, `tournois/${selectedTournamentId}/inscriptions`, userInscription.id), {
                    codex: selectedCodex
                });
                handleModalClose();
            } else {
                console.error("User is not subscribed to this tournament.");
            }
        } catch (error) {
            console.error("Error updating codex: ", error);
        }
        fetchInscriptions(); // Refresh the list of players
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    const isUserSubscribed = players.some(player => player.user === user.uid);

    const preInscritPlayers = players.filter(player => player.statut === "pré_inscrit");
    const validePlayers = players.filter(player => player.statut === "validé");
    const payePlayers = players.filter(player => player.statut === "payé");
    const attentePlayers = players.filter(player => player.statut === "attente");

    return (
        <Container>
            <Card sx={{ width: '100%' }}>
                <CardContent>
                    <Typography variant="h4" component="div">
                        {tournament.title}
                    </Typography>
                    {user && (
                        isUserSubscribed ? (
                            <>
                                <Button variant="contained" color="secondary" onClick={handleUnsubscribe}>
                                    Se désinscrire
                                </Button>
                                <Button variant="contained" color="secondary" onClick={handleModalOpen}>
                                    Changer de codex
                                </Button>
                            </>
                        ) : (
                            <Button variant="contained" color="primary" onClick={handleModalOpen}>
                                S'inscrire
                            </Button>
                        )
                    )}
                    <Typography color="text.secondary">
                        {`Date de début: ${dateStart} - Date de fin: ${dateEnd}`}
                    </Typography>
                    <Typography color="text.secondary">
                        {`Ville: ${tournament.city} (${tournament.postal}), Pays: ${tournament.country}`}
                    </Typography>
                    <Typography color="text.secondary">
                        {`Adresse: ${tournament.address}`}
                    </Typography>
                    <Typography color="text.secondary">
                        {`Taille tournoi: ${tournament.places} places`}
                    </Typography>
                    <Typography color="text.secondary">
                        {`Nombre d'inscriptions: ${inscriptionsCount}`}
                    </Typography>
                    <Typography color="text.secondary">
                        {`Places disponibles: ${tournament.places - inscriptionsCount}`}
                    </Typography>
                    <Typography color="text.secondary">
                        {`Prix: ${tournament.price} ${tournament.device}`}
                    </Typography >
                    <Typography color="text.secondary">
                        {`Commissaires: ${tournament.commissaires.join(', ')}`}
                    </Typography>
                    <Typography color="text.secondary">
                        {`Description: ${tournament.description}`}
                    </Typography >
                    <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                        Liste des joueurs inscrits
                    </Typography>
                    <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Pré-inscrits
                    </Typography>
                    <List>
                        {preInscritPlayers.map((player, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${player.pseudo}`} secondary={`Codex: ${player.codex}`} />
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Validés
                    </Typography>
                    <List>
                        {validePlayers.map((player, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${player.pseudo}`} secondary={`Codex: ${player.codex}`} />
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Payés
                    </Typography>
                    <List>
                        {payePlayers.map((player, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${player.pseudo}`} secondary={`Codex: ${player.codex}`} />
                            </ListItem>
                        ))}
                    </List><Typography variant="subtitle1" component="div" sx={{ mt: 2 }}>
                        Liste d'attente
                    </Typography>
                    <List>
                        {attentePlayers.map((player, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${player.pseudo}`} secondary={`Codex: ${player.codex}`} />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
            <Dialog open={modalOpen} onClose={handleModalClose}>
                <DialogTitle>{isUserSubscribed ? "Changer de codex" : "Inscription au tournoi"}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Codex</InputLabel>
                        <Select
                            value={selectedCodex}
                            onChange={handleCodexChange}
                            label="Codex"
                        >
                            {codexes.map((codex, index) => (
                                <MenuItem key={index} value={codex}>
                                    {codex}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleModalClose} color="primary">Annuler</Button>
                    <Button onClick={isUserSubscribed ? handleUpdateCodex : handleSubmit} color="primary">{isUserSubscribed ? "Mettre à jour" : "Valider"}</Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
}