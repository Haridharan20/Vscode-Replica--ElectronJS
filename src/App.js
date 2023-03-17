import { useEffect, useState } from "react";
import "./App.css";
import FileDirectory from "./components/FileDirectory";
import TerminalComponent from "./components/TerminalComponent";

function App() {
  const [fileContent, setfileContent] = useState(null);
  return (
    <div className="App">
      <h1 style={{ textAlign: "center" }}>Editor Preview</h1>
      <FileDirectory />
    </div>
  );
}

export default App;
