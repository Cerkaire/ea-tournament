import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainContext } from '../context/MainContext';
import { Container, Typography, List, ListItem, Card, CardContent, CardActions, Button, CircularProgress, Box } from '@mui/material';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { UserContext } from '../context/UserContext';

const TournamentList = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const { setSelectedTournamentId } = useContext(MainContext);

    useEffect(() => {
        if (user) {
            fetchTournaments();
        }
    }, [user]);

    const fetchTournaments = async () => {
        try {
            console.log(user.uid);
            const querySnapshot = await getDocs(collection(db, "tournois"));
            const tournamentsList = querySnapshot.docs
                .filter(doc => doc.data().creatorid === user.uid)
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

            setTournaments(tournamentsList);
            setLoading(false);
            console.log('tournaments', tournaments);
        } catch (error) {
            console.error("Error fetching tournaments: ", error);
            setError(error.message);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const draftTournaments = tournaments.filter(tournament => tournament.statut === 'brouillon');
    const publishedTournaments = tournaments.filter(tournament => tournament.statut === 'publié');
    const closedTournaments = tournaments.filter(tournament => tournament.statut === 'clos');

    const handleLearnMoreClick = (id) => {
        setSelectedTournamentId(id);
        navigate('/tournamentupdate');
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Mes tournois</Typography>

            <Typography variant="h5" gutterBottom>Brouillon</Typography>
            <List>
                {draftTournaments.map(tournament => (
                    <ListItem key={tournament.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{tournament.title}</Typography>
                                <Typography variant="body2">{tournament.description}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => handleLearnMoreClick(tournament.id)}>Modifier</Button>
                            </CardActions>
                        </Card>
                    </ListItem>
                ))}
            </List>

            <Typography variant="h5" gutterBottom>Publié</Typography>
            <List>
                {publishedTournaments.map(tournament => (
                    <ListItem key={tournament.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{tournament.title}</Typography>
                                <Typography variant="body2">{tournament.description}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => handleLearnMoreClick(tournament.id)}>Modifier</Button>
                            </CardActions>
                        </Card>
                    </ListItem>
                ))}
            </List>

            <Typography variant="h5" gutterBottom>Clos</Typography>
            <List>
                {closedTournaments.map(tournament => (
                    <ListItem key={tournament.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{tournament.title}</Typography>
                                <Typography variant="body2">{tournament.description}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => handleLearnMoreClick(tournament.id)}>Modifier</Button>
                            </CardActions>
                        </Card>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default TournamentList;