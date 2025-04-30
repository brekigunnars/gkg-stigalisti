require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Command line arguments
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || 'Admin User';

if (!email || !password) {
  console.error('Please provide email and password as arguments');
  console.log('Usage: node create-admin.js email@example.com password "Admin Name"');
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

async function createAdmin() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`User ${email} already exists. Setting admin privileges...`);
      existingUser.isAdmin = true;
      await existingUser.save();
      console.log(`User ${email} has been set as admin successfully`);
      process.exit(0);
    }
    
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: true
    });
    
    await newUser.save();
    console.log(`Admin user ${email} created successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin(); 