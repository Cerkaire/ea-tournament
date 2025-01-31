import React, { useContext, useState, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { auth, googleProvider, db } from '../firebase-config';
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

export default function SignUpModal({ open, handleClose }) {
  const { signUp } = useContext(UserContext);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputsRef = useRef([]);

  const addInputRef = (el) => {
    if (el && !inputsRef.current.includes(el)) {
      inputsRef.current.push(el);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = inputsRef.current[0].value;
    const password = inputsRef.current[1].value;
    const repeatPassword = inputsRef.current[2].value;

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    } else {
      setPasswordError(false);
    }

    if (password !== repeatPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    } else {
      setPasswordMatchError(false);
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        role: "user", // Add a default role
        createdAt: new Date()
      });

      setErrorMessage('Inscription réussie.');
    } catch (error) {
      console.error('Erreur lors de l\'inscription :', error);
      setErrorMessage('Échec de l\'inscription.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        // Ajouter des informations pour les nouveaux utilisateurs Google
        await setDoc(userDocRef, {
          email: user.email,
          role: "user", // Ajouter un rôle par défaut
          createdAt: new Date()
        });
      }

      setErrorMessage('Connexion réussie.');
    } catch (error) {
      console.error('Erreur lors de la connexion avec Google :', error);
      setErrorMessage('Échec de la connexion avec Google.');
    }
  };


  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Inscription</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField label="Email" inputRef={(el) => addInputRef(el)} fullWidth margin="normal" />
          <TextField label="Mot de passe" type="password" inputRef={(el) => addInputRef(el)} fullWidth margin="normal" />
          <TextField label="Répéter le mot de passe" type="password" inputRef={(el) => addInputRef(el)} fullWidth margin="normal" />
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          <Button type="submit" color="primary" variant="contained" fullWidth>Inscription</Button>
        </form>
        <Button onClick={handleGoogleSignIn} color="primary" variant="contained" fullWidth>
          Se connecter avec Google
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
