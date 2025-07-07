require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Please provide an email address as an argument');
  console.log('Usage: node set-admin.js user@example.com');
  process.exit(1);
}

// Connect to MongoDB
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/golf-team-tracker';

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Set user as admin
async function setUserAsAdmin() {
  try {
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      process.exit(1);
    }
    
    // Set role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`User ${userEmail} has been set as admin successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin privilege:', error);
    process.exit(1);
  }
}

setUserAsAdmin(); 