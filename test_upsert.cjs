const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vknxsalnupisbkpqbprm.supabase.co';
const supabaseKey = 'sb_secret_-f8cPpcqcAyPmlSCCpDJ8Q_XwUN62Pz'; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
  const userId = 'efa1043b-fb42-487d-b0a3-4e28e1e380a5';
  
  const testData = {
    currency: 500,
    totalSpent: 100,
    tickCount: 5,
    activeBuildings: [],
    grid: [],
    inventory: {}
  };

  const { data, error } = await supabase
    .from('game_saves')
    .upsert({ user_id: userId, save_data: testData }, { onConflict: 'user_id' });
    
  if (error) {
    console.error("Upsert Error:", error);
  } else {
    console.log("Upsert Success!");
  }
}

testUpsert();
