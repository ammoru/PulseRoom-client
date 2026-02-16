import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import CreatePoll from "./pages/CreatePoll";
import PollRoom from "./pages/PollRoom";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="top-bar">
          <div className="brand">PulseRoom</div>
          <div className="tagline">Real-time polls for fast decisions.</div>
        </header>
        <Routes>
          <Route path="/" element={<CreatePoll />} />
          <Route path="/poll/:pollId" element={<PollRoom />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
