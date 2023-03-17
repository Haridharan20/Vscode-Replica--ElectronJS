const { app, BrowserWindow, protocol, dialog } = require("electron");
const url = require("url");
const path = require("path");
const { ipcMain } = require("electron");
const pty = require("node-pty");
const os = require("os");

let shell = os.platform() === "win32" ? "powershell.exe" : "bash";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    : "http://localhost:3001";
  mainWindow.loadURL(appURL);

  //-------- Terminal -----------------
  var ptyProcess = pty.spawn("zsh", [], {
    name: "xtreme-color",
    cols: 80,
    rows: 1,
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.on("data", (data) => {
    mainWindow.webContents.send("terminal-incData", data);
  });

  ipcMain.on("terminal-into", (event, data) => {
    ptyProcess.write(data);
  });

  //-------- File Handling ------------

  ipcMain.handle("my-function", async (event, arg) => {
    const result = await callGetFile(arg);
    return result;
  });

  ipcMain.handle("GetFile", async (event, arg) => {
    // console.log(arg);
    const path_result = await callGetFiles(arg.path);
    return path_result;
  });

  ipcMain.on("open-file-dialog", (event) => {
    console.log("happysss");
    dialog
      .showOpenDialog({
        properties: ["openDirectory"],
      })
      .then((result) => {
        if (!result.canceled) {
          const filePath = result.filePaths[0];
          event.reply("selected-file", {
            filePath,
            name: path.basename(filePath),
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });

  async function callGetFile({ fileName, fileDirectory }) {
    console.log("fileDirectory", fileDirectory);
    const fs = require("fs");
    const current = path.join(fileDirectory, "");
    // const parentDir = path.dirname(current);
    // console.log("demooo", current, parentDir, fileName);
    // const myPath = `src/components/${fileName}`;
    // const filePath = path.join(parentDir, fileName);
    const data = await fs.promises.readFile(current, "utf8");
    // console.log(data);
    return data;
  }

  // async function callGetFile(fileName) {
  //   console.log("demo", fileName);
  //   const fs = require("fs");
  //   const appDataPath = app.getPath("userData");
  //   const current = path.join(__dirname, "");
  //   const parentDir = path.dirname(current);
  //   const srcFilePath = path.join(parentDir, fileName);
  //   const userDataFilePath = path.join(appDataPath, fileName);

  //   console.log("user", userDataFilePath);

  //   await fs.promises.mkdir(path.dirname(userDataFilePath), {
  //     recursive: true,
  //   });
  //   await fs.promises.copyFile(srcFilePath, userDataFilePath);

  //   const data = await fs.promises.readFile(userDataFilePath, "utf8");
  //   console.log(data);
  //   return data;
  // }

  function callGetFiles(dir) {
    const fs = require("fs");
    const files = fs.readdirSync(dir);
    const tree = files.map((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (
        file === "node_modules" ||
        file === ".git" ||
        file === ".gitignore" ||
        file === ".DS_Store" ||
        file === "README.md"
      ) {
        return;
      }
      //   console.log("stat", stat.isDirectory(), file);
      else if (stat.isDirectory()) {
        return {
          type: "directory",
          name: file,
          children: callGetFiles(`${dir}/${file}`),
        };
      } else {
        return {
          type: "file",
          name: file,
        };
      }
    });
    const result = tree.filter((ele) => ele != undefined);
    return result;
    // return fs.readdir(dir).then((fileNamesArr) => {
    //   const fileStatPromises = fileNamesArr.map((fileName) => {
    //     return fs.stat(path.join(dir, fileName)).then((stats) => {
    //       const file = {};
    //       file.filePath = path.join(dir, fileName);
    //       file.isDirectory = stats.isDirectory();
    //       return file;
    //     });
    //   });
    //   return Promise.all(fileStatPromises);
    // });
  }
  // Automatically open Chrome's DevTools in development mode.
  // if (!app.isPackaged) {
  //   mainWindow.webContents.openDevTools();
  // }
}

function setupLocalFilesNormalizerProxy() {
  protocol.registerHttpProtocol(
    "file",
    (request, callback) => {
      const url = request.url.substr(8);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    },
    (error) => {
      if (error) console.error("Failed to register protocol");
    }
  );
}

app.whenReady().then(() => {
  createWindow();
  setupLocalFilesNormalizerProxy();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const allowedNavigationDestinations = "https://my-electron-app.com";
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
      event.preventDefault();
    }
  });
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
  });
});
