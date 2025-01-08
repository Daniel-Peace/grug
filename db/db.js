// db.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
let db;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("Connected to MongoDB!");
    db = client.db();
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

function getDb() {
  return db;
}

module.exports = { connectToDatabase, getDb };
