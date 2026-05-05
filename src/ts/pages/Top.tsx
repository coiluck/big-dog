import { Link } from "react-router-dom";

export default function Top() {
  return (
    <div>
      <Link to="/game">Game</Link>
      <Link to="/record">Record</Link>
    </div>
  );
}