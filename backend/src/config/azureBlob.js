import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'nutrawell-media';

let blobServiceClient = null;
let containerClient = null;

if (connectionString) {
  try {
    console.log('Initializing Azure Blob Storage...');
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
  } catch (err) {
    console.error('Error connecting to Azure Blob Storage:', err.message);
  }
} else {
  console.log('Azure Storage Connection String not configured. Falling back to local file storage.');
}

// Ensure local uploads directory exists
const localUploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

export async function uploadImage(fileBuffer, originalName, mimeType) {
  const filename = `${Date.now()}-${originalName.replace(/\s+/g, '-')}`;

  if (blobServiceClient && containerClient) {
    try {
      // Ensure the container exists
      await containerClient.createIfNotExists({ access: 'blob' });
      
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: { blobContentType: mimeType }
      });
      
      console.log(`Uploaded to Azure Blob Storage: ${blockBlobClient.url}`);
      return blockBlobClient.url;
    } catch (err) {
      console.error('Failed to upload to Azure Blob Storage, saving locally:', err.message);
    }
  }

  // Fallback: Save file locally
  const filePath = path.join(localUploadsDir, filename);
  await fs.promises.writeFile(filePath, fileBuffer);
  
  // Return the path served by our express static middleware
  console.log(`Saved locally: /uploads/${filename}`);
  return `/uploads/${filename}`;
}
