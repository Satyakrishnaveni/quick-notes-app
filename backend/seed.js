// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const connectDB = require("./utils/db");
// const Tenant = require("./models/Tenant");
// const User = require("./models/User");

// dotenv.config();
// connectDB();

// const seedData = async () => {
//   await Tenant.deleteMany();
//   await User.deleteMany();

//   const acme = await Tenant.create({ name:"Acme", slug:"acme" });
//   const globex = await Tenant.create({ name:"Globex", slug:"globex" });

//   await User.create([
//     { email:"admin@acme.test", password:"123456", role:"Admin", tenant:acme._id },
//     { email:"user@acme.test", password:"password", role:"Member", tenant:acme._id },
//     { email:"admin@globex.test", password:"password", role:"Admin", tenant:globex._id },
//     { email:"user@globex.test", password:"password", role:"Member", tenant:globex._id }
//   ]);

//   console.log("Seeded tenants & users");
//   process.exit();
// };

// seedData();


// seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./utils/db");
const Tenant = require("./models/Tenant");
const User = require("./models/User");

dotenv.config();

const seedData = async () => {
  try {
    // wait for DB connection
    await connectDB();

    // clear existing
    await Tenant.deleteMany();
    await User.deleteMany();

    // create tenants
    const acme = await Tenant.create({ name: "Acme", slug: "acme" });
    const globex = await Tenant.create({ name: "Globex", slug: "globex" });

    // plain seed array
    const users = [
      { email: "admin@acme.test", password: "123456", role: "Admin", tenant: acme._id },
      { email: "user@acme.test", password: "password", role: "Member", tenant: acme._id },
      { email: "admin@globex.test", password: "password", role: "Admin", tenant: globex._id },
      { email: "user@globex.test", password: "password", role: "Member", tenant: globex._id }
    ];

    // hash passwords
    for (let u of users) {
      u.password = await bcrypt.hash(u.password, 10);
    }

    // insert users
    await User.insertMany(users);

    console.log("Seeded tenants & users");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedData();
