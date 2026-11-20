import app from './app.js';
import { dataDir, storageMode } from './store.js';

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Amna Sahar portfolio server listening on http://localhost:${port}`);
  console.log(`Data directory: ${dataDir}`);
  console.log(`Storage mode: ${storageMode}`);
  console.log(`Admin password source: ${process.env.ADMIN_PASSWORD ? 'ADMIN_PASSWORD env' : 'default (12345)'}`);
});
