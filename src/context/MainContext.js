// MainContext.js
import { createContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

export const MainContext = createContext();

export function MainContextProvider(props) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);

  const fetchTournaments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tournois"));
      const tournamentsList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(tournament => tournament.statut === "publié");
      setTournaments(tournamentsList);
      setLoading(false);
      console.log(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments: ", error);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  console.log(selectedTournamentId)

  return (
    <MainContext.Provider value={{ tournaments, loading, selectedTournamentId, setSelectedTournamentId }}>
      {props.children}
    </MainContext.Provider>
  );
}