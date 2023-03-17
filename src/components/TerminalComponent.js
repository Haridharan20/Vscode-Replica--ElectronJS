import { useRef, useEffect, useMemo } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import "xterm/lib/xterm.js";
import { FitAddon } from "xterm-addon-fit";

function TerminalComponent({ ptyProcess }) {
  const terminalRef = useRef(null);

  const myStyle = {
    marginTop: "20px",
  };

  const memoizedPtyProcess = useMemo(() => ptyProcess, [ptyProcess]);

  useEffect(() => {
    if (terminalRef.current) {
      const { ipcRenderer } = window.electron;
      const terminal = new Terminal();
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      terminal.open(terminalRef.current);
      fitAddon.fit();
      terminal.onData((e) => {
        ipcRenderer.termSend("terminal-into", e);
      });
      ipcRenderer.on("terminal-incData", (e, data) => {
        terminal.write(e);
      });
    }
    const elementToRemove = document.querySelector(
      ".xterm-dom-renderer-owner-2"
    );
    if (elementToRemove) {
      elementToRemove.remove();
    }
  }, [memoizedPtyProcess]);

  return <>{terminalRef ? <div style={myStyle} ref={terminalRef} /> : null}</>;
}

export default TerminalComponent;
