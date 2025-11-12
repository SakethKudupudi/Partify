import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n🔍 Checking phone models in database...\n');

const { data: models, error } = await supabase
  .from('phone_models')
  .select('id, brand_id, name, release_date, is_active, created_at')
  .order('created_at', { ascending: false });

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log(`✅ Found ${models.length} phone model(s):\n`);
  models.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name}`);
    console.log(`   ID: ${model.id}`);
    console.log(`   Brand ID: ${model.brand_id}`);
    console.log(`   Release Date: ${model.release_date}`);
    console.log(`   Active: ${model.is_active}`);
    console.log(`   Created: ${model.created_at}`);
    console.log('');
  });
}

// Check brands too
const { data: brands } = await supabase
  .from('brands')
  .select('id, name')
  .eq('is_active', true);

console.log(`\n📱 Active Brands (${brands.length}):`);
brands.forEach(brand => {
  console.log(`   - ${brand.name} (${brand.id})`);
});
