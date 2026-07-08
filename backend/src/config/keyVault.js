import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

export async function loadKeyVaultSecrets() {
  const vaultName = process.env.AZURE_KEYVAULT_NAME;
  if (!vaultName) {
    console.log('Azure Key Vault Name (AZURE_KEYVAULT_NAME) not set. Skipping Key Vault load.');
    return;
  }

  const url = `https://${vaultName}.vault.azure.net`;
  console.log(`Connecting to Azure Key Vault: ${url}`);
  
  try {
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(url, credential);
    
    // Secrets list to resolve from Key Vault
    const secretsToLoad = [
      'AZURE_SQL_CONNECTION_STRING',
      'AZURE_STORAGE_CONNECTION_STRING',
      'AZURE_OPENAI_API_KEY',
      'AZURE_OPENAI_ENDPOINT',
      'JWT_SECRET',
      'APPLICATIONINSIGHTS_CONNECTION_STRING'
    ];

    for (const secretName of secretsToLoad) {
      try {
        const secret = await client.getSecret(secretName);
        if (secret && secret.value) {
          process.env[secretName] = secret.value;
          console.log(`[Key Vault] Loaded secret: ${secretName}`);
        }
      } catch (err) {
        // Log warning but proceed (some secrets might not exist yet)
        console.warn(`[Key Vault] Warning: Could not resolve ${secretName}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[Key Vault] Failed to load secrets from vault:', err.message);
  }
}
