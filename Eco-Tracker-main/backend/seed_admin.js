const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  let admin = await User.findOne({ email: 'admin@ecotrack.gov' });
  if (!admin) {
    admin = await User.create({
      name: 'Super Admin',
      email: 'admin@ecotrack.gov',
      password: 'password123',
      role: 'AUTHORITY',
      adminDetails: {
        adminCode: 'VIVA_ADMIN_2026',
        departmentName: 'Central Control',
        roleLevel: 'Super Admin'
      }
    });
    console.log("Admin created");
  } else {
    // Force reset password to password123
    admin.password = 'password123';
    await admin.save();
    console.log("Admin password reset");
  }
  process.exit();
}
seed();
