const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

// Keep a global reference of the window object
let mainWindow;
let serverModule = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

async function startBackendServer() {
  // In production, app.getAppPath() points to resources/app where our files are
  const appPath = isDev ? path.join(__dirname, '..') : app.getAppPath();
  const serverPath = path.join(appPath, 'server.js');

  console.log('Starting backend server from:', serverPath);
  
  // Set environment variables before importing
  process.env.NODE_ENV = isDev ? 'development' : 'production';
  process.env.PORT = '3000';
  
  // Change working directory so relative paths in server.js work
  process.chdir(appPath);
  
  try {
    // Use dynamic import to load the ES module server
    // The server auto-starts on import
    serverModule = await import(pathToFileURL(serverPath).href);
    console.log('Backend server started successfully');
  } catch (err) {
    console.error('Failed to start backend server:', err);
    throw err;
  }
}

function stopBackendServer() {
  // Server runs in-process, will shut down with the app
  console.log('Backend server stopping with app...');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    show: false, // Don't show until ready
  });

  // Remove default menu bar (optional - keeps it cleaner)
  // Menu.setApplicationMenu(null);

  // Load the app
  if (isDev) {
    // Development: load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Start backend server first (production only - dev runs it separately)
  if (!isDev) {
    try {
      await startBackendServer();
      // Give server a moment to fully initialize
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Failed to start backend:', err);
      // Show error dialog to user
      const { dialog } = require('electron');
      dialog.showErrorBox('Server Error', 'Failed to start backend server: ' + err.message);
    }
  }
  createWindow();
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  stopBackendServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopBackendServer();
});

// Security: Prevent navigation to unknown URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Allow localhost navigation in dev
    if (!isDev && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});
