import Home from './pages/Home';
import { UserContextProvider } from './context/UserContext';
import { MainContextProvider } from './context/MainContext';
import Navbar from './components/Navbar';
import SignUpModal from './components/SignUpModal';
import SignInModal from './components/SignInModal';
import PseudoModal from './components/PseudoModal';
import Development from './components/Development';
import TournamentOrga from './pages/TournamentOrga';
import Tournament from './pages/Tournament';
import TournamentList from './pages/TournamentList';
import TournamentUpdate from './pages/TournamentUpdate';
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <UserContextProvider>
        <MainContextProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Development" element={<Development />} />
            <Route path="/TournamentOrga" element={<TournamentOrga />} />
            <Route path="/tournament" element={<Tournament />} />
            <Route path="/tournamentlist" element={<TournamentList />} />
            <Route path="/tournamentupdate" element={<TournamentUpdate />} />
          </Routes>
        </MainContextProvider>
      </UserContextProvider>
    </>
  );
}

export default App;
