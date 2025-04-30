require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

// Create a new admin user
const createAdmin = async () => {
  // Check if admin user with this email already exists
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin';
  
  if (!email || !password) {
    console.log('Usage: node create-admin.js <email> <password> [name]');
    process.exit(1);
  }
  
  try {
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      
      // Update to admin if not already
      if (!existingUser.isAdmin) {
        existingUser.isAdmin = true;
        await existingUser.save();
        console.log(`User ${email} updated to admin successfully.`);
      } else {
        console.log(`User ${email} is already an admin.`);
      }
      
      process.exit(0);
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create the admin user
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: true
    });
    
    await newAdmin.save();
    console.log(`Admin user ${email} created successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
};

createAdmin(); 