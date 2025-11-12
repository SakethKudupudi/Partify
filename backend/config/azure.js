import { BlobServiceClient } from '@azure/storage-blob';

let blobServiceClient = null;

export async function initializeAzure() {
  try {
    const connectionString = process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING || process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!connectionString || connectionString === 'DefaultEndpointsProtocol=https;AccountName=devstorageaccount;AccountKey=devkey==;EndpointSuffix=core.windows.net') {
      console.warn('⚠️  Azure Storage not configured for production');
      return;
    }

    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    console.log('✅ Azure Blob Storage initialized successfully');
    console.log(`   Account: ${connectionString.match(/AccountName=([^;]+)/)?.[1]}`);
    return blobServiceClient;
  } catch (error) {
    console.error('❌ Azure Storage initialization failed:', error.message);
    console.warn('⚠️  Image upload will be disabled');
  }
}

export function getAzureBlobClient() {
  if (!blobServiceClient) {
    console.warn('⚠️  Azure Blob Storage not available');
    return null;
  }
  return blobServiceClient;
}

export async function uploadToAzure(containerName, blobName, data) {
  const client = getAzureBlobClient();
  if (!client) {
    console.warn('⚠️  Skipping Azure upload - not configured');
    return `https://placeholder.example.com/${blobName}`;
  }

  try {
    const containerClient = client.getContainerClient(containerName);
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists({
      access: 'blob' // Public read access for blobs
    });
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(data, data.length);
    return blockBlobClient.url;
  } catch (error) {
    console.warn('⚠️  Azure upload failed:', error.message);
    return `https://placeholder.example.com/${blobName}`;
  }
}

export async function deleteFromAzure(containerName, blobName) {
  const client = getAzureBlobClient();
  if (!client) {
    return;
  }

  try {
    const containerClient = client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.delete();
  } catch (error) {
    console.warn('⚠️  Azure delete failed:', error.message);
  }
}

