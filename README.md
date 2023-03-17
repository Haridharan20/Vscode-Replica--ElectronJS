## Code Editor Preview

Author: Haridharan K A

## Solution Overview

![url](https://github.com/Haridharan20/Vscode-Replica--ElectronJS)

The solution consists of two main components - FileDirectory and Terminal.
FileDirectory
The FileDirectory component is created using the Prismjs and react-folder-tree libraries. The react-folder-tree library allows us to display the directory structure in a tree format, while the Prismjs library is used to preview the code of specific files selected from the directory tree.
Terminal
The Terminal component is used to add a terminal visual to the application and is created using the xtermjs library.
The application also includes the clipboardJs library, which is used to copy the preview code from the editor to the clipboard.

![url](https://github.com/Haridharan20/Vscode-Replica--ElectronJS)

## Prerequisites

To use this solution, you should have the following prerequisites:

1. Node.js
2. Visual Studio Code
3. React.js
   The following libraries need to be installed:
4. Prism-Js
5. clipboard
6. electron
7. electron-builder
8. electron-nodemon
9. xterm

## Implementing the Solution

To implement the solution, follow these steps:

1. Run npm install to install all the dependencies for the project. Use npm i -f for force installation.
2. After installation is complete, use electron:start to run the electron application.
3. To build the desktop application, use the following command: electron:package:[mac||win||linux]
