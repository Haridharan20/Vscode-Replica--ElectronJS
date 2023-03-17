const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    termSend: async (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    send: async (channel) => {
      ipcRenderer.send(channel);
    },
    on: (channel, func) =>
      ipcRenderer.on(channel, (event, ...args) => func(...args)),
    invoke: async (channel, data) => ipcRenderer.invoke(channel, data),
  },
});
