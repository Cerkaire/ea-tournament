import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainContext } from '../context/MainContext';
import { Container, Typography, List, ListItem, Card, CardContent, CardActions, Button, CircularProgress, Box } from '@mui/material';
import MapComponent from '../components/MapComponent';

export default function Home() {
  const { tournaments, loading, setSelectedTournamentId } = useContext(MainContext);
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleLearnMoreClick = (id) => {
    setSelectedTournamentId(id);
    navigate('/tournament');
  };

  return (
    <Container>
      <Typography variant="h2">Tournois à venir</Typography>
      <List>
        {tournaments.map(tournament => {
          const dateStart = new Date(tournament.date_start.seconds * 1000).toLocaleDateString();
          const dateEnd = new Date(tournament.date_end.seconds * 1000).toLocaleDateString();
          const inscrit = tournament.inscrit || 0;
          const preinscrit = tournament.preinscrit || 0;
          const remainingPlaces = tournament.places - (inscrit + preinscrit);

          return (
            <ListItem key={tournament.id}>
              <Card sx={{ width: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {tournament.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {`Date de début: ${dateStart} - Date de fin: ${dateEnd}`}
                  </Typography>
                  <Typography color="text.secondary">
                    {`Ville: ${tournament.city} (${tournament.postal}), Pays: ${tournament.country}`}
                  </Typography>
                  <Typography color="text.secondary">
                    {`Places disponibles: ${remainingPlaces}`}
                  </Typography>
                  {/*    <MapComponent latitude={tournament.coord.latitude} longitude={tournament.coord.longitude} />
                */} </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleLearnMoreClick(tournament.id)}>En savoir plus</Button>
                </CardActions>
              </Card>
            </ListItem>
          );
        })}
      </List>
    </Container>
  );
}