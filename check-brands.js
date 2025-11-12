const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBrands() {
  console.log('🔍 Checking brands in Supabase...\n');
  
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching brands:', error);
      return;
    }

    console.log(`✅ Found ${data.length} active brand(s):\n`);
    
    if (data.length === 0) {
      console.log('⚠️  No brands found in database!');
      console.log('\nPossible reasons:');
      console.log('1. Brand was not created successfully');
      console.log('2. Brand is_active is set to false');
      console.log('3. Table "brands" does not exist\n');
    } else {
      data.forEach((brand, index) => {
        console.log(`${index + 1}. ${brand.name}`);
        console.log(`   ID: ${brand.id}`);
        console.log(`   Description: ${brand.description || 'N/A'}`);
        console.log(`   Image URL: ${brand.image_url || 'N/A'}`);
        console.log(`   Active: ${brand.is_active}`);
        console.log(`   Created: ${brand.created_at}`);
        console.log('');
      });
    }

    // Also check all brands including inactive
    const { data: allBrands, error: error2 } = await supabase
      .from('brands')
      .select('*');

    if (!error2) {
      console.log(`📊 Total brands (including inactive): ${allBrands.length}`);
      if (allBrands.length !== data.length) {
        console.log(`⚠️  ${allBrands.length - data.length} inactive brand(s) found`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBrands();
