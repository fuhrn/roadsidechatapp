import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import Chatpage from "./pages/Chatpage";
import Homepage from "./pages/Homepage";
import "./App.css"

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/chats" element={<Chatpage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
