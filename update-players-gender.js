require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/Player');

// Connect to MongoDB
const db = process.env.MONGO_URI;

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Define male and female players
const malePlayers = [
  'Ragnar Már',
  'Aron Snær',
  'Breki',
  'Guðmundur Snær',
  'Gunnlaugur Árni',
  'Hjalti Hlíðberg',
  'Hlynur',
  'Kristófer Orri',
  'Sigurður Arnar',
  'Magnús Yngvi',
  'Óliver Máni',
  'Róbert Leó',
  'Pálmi Freyr',
  'Óli Björn',
  'Gunnar Þór',
  'Arnar Daði',
  'Guðjón Frans'
];

const femalePlayers = [
  'Anna Júlía',
  'Saga',
  'Una Karen',
  'Alma Rún',
  'Ragnheiður',
  'Gunnhildur Hekla',
  'Hulda Clara',
  'Karen Lind',
  'Katrín Hörn',
  'Helga',
  'Elísabet Sunna',
  'Elísabet Ólafs',
  'Embla Hrönn',
  'Eva Fanney',
  'Kristín Helga',
  'María Kristín',
  'Ríkey Sif'
];

async function updatePlayerGenders() {
  try {
    // Update male players
    for (const name of malePlayers) {
      const result = await Player.updateMany(
        { name: { $regex: new RegExp(name, 'i') } },
        { $set: { gender: 'male' } }
      );
      console.log(`Updated ${result.modifiedCount} male player(s) with name containing "${name}"`);
    }

    // Update female players
    for (const name of femalePlayers) {
      const result = await Player.updateMany(
        { name: { $regex: new RegExp(name, 'i') } },
        { $set: { gender: 'female' } }
      );
      console.log(`Updated ${result.modifiedCount} female player(s) with name containing "${name}"`);
    }

    // Check for any players without gender
    const playersWithoutGender = await Player.find({ gender: { $exists: false } });
    if (playersWithoutGender.length > 0) {
      console.log('\nPlayers without gender:');
      playersWithoutGender.forEach(player => {
        console.log(`- ${player.name}`);
      });
    } else {
      console.log('\nAll players have been assigned a gender.');
    }

    // Verify the update
    const maleCount = await Player.countDocuments({ gender: 'male' });
    const femaleCount = await Player.countDocuments({ gender: 'female' });
    console.log(`\nTotal male players: ${maleCount}`);
    console.log(`Total female players: ${femaleCount}`);
    console.log(`Total players: ${maleCount + femaleCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating player genders:', error);
    process.exit(1);
  }
}

updatePlayerGenders(); 