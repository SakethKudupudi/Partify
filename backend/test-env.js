import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

console.log('\n=== Environment Variables Check ===');
console.log('AZURE_STORAGE_ACCOUNT_CONNECTION_STRING:', 
  process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING ? 
  `✅ EXISTS (${process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING.substring(0, 50)}...)` : 
  '❌ NOT FOUND'
);
console.log('AZURE_STORAGE_ACCOUNT_KEY:', 
  process.env.AZURE_STORAGE_ACCOUNT_KEY ? 
  `✅ EXISTS (${process.env.AZURE_STORAGE_ACCOUNT_KEY.substring(0, 30)}...)` : 
  '❌ NOT FOUND'
);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ EXISTS' : '❌ NOT FOUND');
console.log('===================================\n');
