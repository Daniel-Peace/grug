// db.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const CONFIG_COLLECTION = "configs";
const USERS_COLLECTION = "users";

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

async function getConfigCollection() {
  return await db.collection(CONFIG_COLLECTION);
}

async function getUsersCollection() {
  return await db.collection(USERS_COLLECTION);
}

module.exports = {
  connectToDatabase,
  getDb,
  getConfigCollection,
  getUsersCollection,
};
