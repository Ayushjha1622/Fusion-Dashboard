const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected:", mongoose.connection.name);
  } catch (err) {
    console.error("DB Connection Error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
