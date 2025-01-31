import React, { useContext, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import { IconButton, Drawer, Button, List, ListItem, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import SignUpModal from './SignUpModal'; // Importez le composant de la modal d'inscription
import SignInModal from './SignInModal'; // Importez le composant de la modal de connexion
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // Importez le contexte utilisateur
import { auth } from '../firebase-config';
import PseudoModal from './PseudoModal';

export default function Navbar() {
  const { setOpenSignUp, openSignUp, setOpenSignIn, openSignIn,
    user, pseudo
  } = useContext(UserContext); // Récupérez les états et les fonctions depuis le contexte utilisateur

  const handleOpenSignUp = () => setOpenSignUp(true); // Fonction pour ouvrir la modal d'inscription
  const handleCloseSignUp = () => setOpenSignUp(false); // Fonction pour fermer la modal d'inscription

  const handleOpenSignIn = () => setOpenSignIn(true); // Fonction pour ouvrir la modal de connexion
  const handleCloseSignIn = () => setOpenSignIn(false); // Fonction pour fermer la modal de connexion

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  let userId = null;
  if (user) {
    userId = user.uid;
  }
  const navigate = useNavigate()

  const logOut = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch {
      alert("Pour une raison inconnu la deconnexion n'a pas fonctionné")
    }
  }

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} onClick={() => navigate("/")}>
            Epic Armageddon Tournament
          </Typography>
          {user && (
            <Typography variant="caption" component="div" sx={{ flexGrow: 1 }}>
              {user.email} / {pseudo}
            </Typography>
          )}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            <List>
              <ListItem button onClick={() => { handleModalOpen(); setDrawerOpen(false); }}>
                <ListItemText primary="Compte" />
              </ListItem>
              <ListItem button onClick={() => { navigate("/TournamentList"); setDrawerOpen(false); }}>
                <ListItemText primary="Mes Tournois" />
              </ListItem>
              <ListItem button onClick={() => { navigate("/TournamentOrga"); setDrawerOpen(false); }}>
                <ListItemText primary="Organiser un tournois" />
              </ListItem>
            </List>
          </Drawer>
          <PseudoModal open={modalOpen} handleClose={handleModalClose} userId={userId} />

          {!user && (
            <>
              <Button color="inherit" onClick={() => { handleOpenSignIn(); setDrawerOpen(false); }}>Login</Button>
              <Button color="inherit" onClick={() => { handleOpenSignUp(); setDrawerOpen(false); }}>Inscription</Button>
            </>
          )}
          {user && (
            <Button color="inherit" onClick={() => { logOut(); setDrawerOpen(false); }}>Déconnexion</Button>
          )}
        </Toolbar>
      </AppBar>
      {/* Modal d'inscription */}
      <SignUpModal open={openSignUp} handleClose={handleCloseSignUp} />
      {/* Modal de connexion */}
      <SignInModal open={openSignIn} handleClose={handleCloseSignIn} />
    </Box>
  );
}
