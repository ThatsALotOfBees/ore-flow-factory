const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vknxsalnupisbkpqbprm.supabase.co';
const supabaseKey = 'sb_secret_-f8cPpcqcAyPmlSCCpDJ8Q_XwUN62Pz'; // Secret key for admin access

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSaves() {
  const { data, error } = await supabase.from('game_saves').select('*');
  if (error) {
    console.error("DB Error:", error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log("No saves found in the database. 0 rows.");
    return;
  }
  
  console.log(`Found ${data.length} saves.`);
  data.forEach((save, i) => {
    console.log(`\n--- Save ${i+1} ---`);
    console.log(`User ID: ${save.user_id}`);
    if (save.save_data) {
      console.log(`Currency: ${save.save_data.currency}`);
      console.log(`Buildings count: ${save.save_data.activeBuildings?.length}`);
      console.log(`Total Spent: ${save.save_data.totalSpent}`);
    } else {
      console.log("save_data is null/empty");
    }
  });
}

checkSaves();
