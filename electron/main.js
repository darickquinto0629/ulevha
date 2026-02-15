const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function startBackendServer() {
  return new Promise((resolve, reject) => {
    const serverPath = isDev
      ? path.join(__dirname, '../server.js')
      : path.join(process.resourcesPath, 'server.js');

    console.log('Starting backend server from:', serverPath);

    // Spawn the server process
    serverProcess = spawn('node', [serverPath], {
      cwd: isDev ? path.join(__dirname, '..') : process.resourcesPath,
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        PORT: '3000',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`[Server] ${data}`);
      // Resolve when server is ready
      if (data.toString().includes('Ulevha API Server Started')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error] ${data}`);
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    // Timeout fallback - resolve after 3 seconds even if no message
    setTimeout(resolve, 3000);
  });
}

function stopBackendServer() {
  if (serverProcess) {
    console.log('Stopping backend server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
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
      preload: path.join(__dirname, 'preload.js'),
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
  // Start backend server first (in production)
  if (!isDev) {
    try {
      await startBackendServer();
    } catch (err) {
      console.error('Failed to start backend:', err);
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
