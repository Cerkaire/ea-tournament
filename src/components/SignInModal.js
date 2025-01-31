import React, { useContext, useState, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { auth, googleProvider } from '../firebase-config';
import { signInWithPopup } from 'firebase/auth';

function LoginError({ message }) {
    return <Typography variant="caption" color="error">{message}</Typography>;
}

export default function SignInModal({ open, handleClose }) {
    const { signIn } = useContext(UserContext);
    const [errorMessage, setErrorMessage] = useState('');
    const inputsRef = useRef([]);

    const addInputRef = (el) => {
        if (el && !inputsRef.current.includes(el)) {
            inputsRef.current.push(el);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await signIn(inputsRef.current[0].value, inputsRef.current[1].value);
            handleClose();
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                setErrorMessage('Mot de passe incorrect.');
            } else if (error.code === 'auth/user-not-found') {
                setErrorMessage('Utilisateur non trouvé.');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage('Email invalide.');
            } else {
                setErrorMessage(`Erreur lors de la connexion : ${error.message}`);
            }
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            handleClose();
        } catch (error) {
            setErrorMessage(`Erreur lors de la connexion avec Google : ${error.message}`);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Connexion</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <TextField label="Email" inputRef={(el) => addInputRef(el)} fullWidth margin="normal" />
                    <TextField label="Mot de passe" type="password" inputRef={(el) => addInputRef(el)} fullWidth margin="normal" />
                    {errorMessage && <LoginError message={errorMessage} />}
                    <Button type="submit" color="primary" variant="contained" fullWidth>Connexion</Button>
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