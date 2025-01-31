import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const UserContext = createContext();

export function UserContextProvider(props) {
  const [user, setUser] = useState(null);
  const [pseudo, setPseudo] = useState('');
  const [openSignUp, setOpenSignUp] = useState(false); // État pour contrôler l'ouverture de la modal d'inscription
  const [openSignIn, setOpenSignIn] = useState(false); // État pour contrôler l'ouverture de la modal de connexion
  const [loading, setLoading] = useState(true);

  const signUp = (email, pwd) => createUserWithEmailAndPassword(auth, email, pwd);
  const signIn = (email, pwd) => signInWithEmailAndPassword(auth, email, pwd);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setPseudo(userDoc.data().pseudo);
        }
        setUser({ ...user, pseudo: userDoc.data().pseudo });
      } else {
        setUser(null);
        setPseudo('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{
      user, pseudo, signUp, openSignUp, setOpenSignUp, openSignIn, setOpenSignIn, signIn
    }}>
      {!loading && props.children}
    </UserContext.Provider>
  );
}
