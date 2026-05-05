import { Routes, Route } from "react-router-dom";
import Top from "./ts/pages/Top";
import Game from "./ts/pages/Game";
import Record from "./ts/pages/Record";
import "./css/default.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Top />} />
      <Route path="/game" element={<Game />} />
      <Route path="/record" element={<Record />} />
    </Routes>
  );
}