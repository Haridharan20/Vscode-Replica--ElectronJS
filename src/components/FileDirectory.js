import React, { useState, useRef, useEffect } from "react";
import FileTree from "react-folder-tree";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-cshtml";
import "prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard";
import ClipboardJS from "clipboard";
import TerminalComponent from "./TerminalComponent";

function FileDirectory() {
  const { ipcRenderer } = window.electron;
  const editorRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [directoryPath, setDirectoryPath] = useState(null);
  const [exe, setExe] = useState("");
  const [files, setFiles] = useState({
    type: "directory",
    name: "Choose Directory",
  });

  const codeRef = useRef(null);

  async function handleFileClick({ nodeData }) {
    let my_path = "";
    if (nodeData.path.length > 1) {
      let prevFile = null;
      for (let i = 0; i < nodeData.path.length - 1; i++) {
        prevFile =
          prevFile == null
            ? files.children[nodeData.path[i]]
            : prevFile.children[nodeData.path[i]];
        my_path = my_path + prevFile.name + "/";
      }
      my_path = `${my_path}/${nodeData.name}`;
    } else {
      my_path = `/${nodeData.name}`;
    }
    if (nodeData.type === "file") {
      const { ipcRenderer } = window.electron;
      const reply = await ipcRenderer.invoke("my-function", {
        fileName: my_path,
        fileDirectory: `${directoryPath}/${my_path}`,
      });
      // console.log(reply);
      setSelectedFile({ ...nodeData, content: reply });
      setExe(my_path.split(".")[1]);
    }
  }

  // function handleEditorDidMount(editor) {
  //   editorRef.current = editor;
  //   if (selectedFile) {
  //     editor.setValue(selectedFile.content);
  //   }
  // }

  function getLanguageForFile(filename) {
    switch (getFileExtension(filename)) {
      case "js":
        return "javascript";
      case "css":
        return "css";
      case "html":
        return "html";
      default:
        return "";
    }
  }

  function getFileExtension(filename) {
    return filename.split(".").pop();
  }

  const handleOpenFile = async () => {
    // const { ipcRenderer } = window.electron;
    ipcRenderer.send("open-file-dialog");
  };

  ipcRenderer.on("selected-file", (event) => {
    setDirectoryPath(event.filePath);
    setFiles({ ...files, name: event.name });
    setSelectedFile({ ...selectedFile, content: "" });
  });

  const handleCopyToClipboard = () => {
    const codeElement = codeRef.current;
    if (codeElement) {
      const clipboard = new ClipboardJS(".copy-to-clipboard", {
        text: function () {
          return codeElement.textContent;
        },
      });
      clipboard.on("success", function () {
        alert("Code copied to clipboard!");
        clipboard.destroy();
      });
    }
  };

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }

    async function fetchData() {
      // const { ipcRenderer } = window.electron;
      const reply = await ipcRenderer.invoke("GetFile", {
        path: directoryPath,
      });
      // console.log(reply);
      const newChild = reply;
      setFiles({ ...files, children: newChild });
    }
    if (directoryPath) fetchData();
    // console.log(files);
  }, [directoryPath, selectedFile, exe]);

  // const fileTree = (
  //   <FileTree data={files} onNameClick={handleFileClick} showCheckbox={false} />
  // );
  return (
    <div>
      <div className="main">
        <div className="main-editor">
          <div className="tree-structure">
            <button onClick={handleOpenFile}>Choose File</button>
            <FileTree
              data={files}
              onNameClick={handleFileClick}
              showCheckbox={false}
            />
          </div>

          <div className="editor">
            <pre>
              <code
                ref={codeRef}
                className={`language-${exe} copy-to-clipboard`}
                onClick={handleCopyToClipboard}
              >
                {selectedFile ? selectedFile.content : ""}
              </code>
            </pre>
          </div>
        </div>
        <br />
        <div>
          <TerminalComponent />
        </div>
      </div>
    </div>
  );
}

export default FileDirectory;
