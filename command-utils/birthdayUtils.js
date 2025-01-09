const { getConfigCollection, getUsersCollection } = require("../db/db");

// checks if a user already has an entry
async function checkForBirthdayEntry(username) {
  console.log("Checking if user already has a birthday entered...");
  const userCollection = await getUsersCollection();
  return await userCollection.findOne({ username });
}

// checks if the birthday entered is valid
function isValidBirthday(day, month) {
  console.log("Checking if entered birthday is valid...");
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

// adds a user's birthday to the db
async function addBirthday(username, day, month) {
  console.log("Adding birthday to db...");
  const doc = { username, day, month };
  const userCollection = await getUsersCollection();
  return await userCollection.insertOne(doc);
}

// updates an existing birthday or adds it if it does not exist
async function updateBirthday(doc, day, month) {
  console.log("Updating birthday in db...");
  const filter = { _id: doc._id };
  const update = { $set: { day, month } };
  const userCollection = await getUsersCollection();
  return await userCollection.updateOne(filter, update);
}

// removes a users birthday from the db
async function removeBirthday(username) {
  console.log("Removing birthday from db...");
  const userCollection = await getUsersCollection();
  return await userCollection.deleteOne({ username });
}

// checks for active birthdays
async function checkForActiveBirthdays() {
  console.log("Checking for active birthdays...");
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const userCollection = await getUsersCollection();
  return await userCollection
    .find({ day: currentDay, month: currentMonth })
    .toArray();
}

async function wishHappyBirthday(client) {
  console.log("Wishing users a happy birthday...");
  const configCollection = await getConfigCollection();
  const users = await checkForActiveBirthdays();
  const config = await configCollection.findOne({
    configName: "birthday-config",
  });
  if (config) {
    if (users.length === 0) {
      console.log("No active birthdays");
    } else {
      console.log("Looping over users...");

      const guild = client.guilds.cache.get(process.env.GUILD_ID);
      const channel = await guild.channels.fetch(config.channel.id);
      for (const user of users) {
        await channel.send(`Happy birthday ${user.username}`);
        console.log("Message sent!");
      }
    }
  } else {
    console.log("A channel has not been set for wishing happy birthday");
  }
}

async function updateWishChannel(updatedDoc) {
  console.log("Updating channel for wishing happy birthday...");
  const filter = { configName: updatedDoc.configName };
  const update = { $set: updatedDoc };
  const configCollection = await getConfigCollection();
  return await configCollection.updateOne(filter, update);
}

async function saveWishChannel(doc) {
  const configCollection = await getConfigCollection();
  if (await configCollection.findOne({ configName: doc.configName })) {
    updateWishChannel(doc);
  } else {
    console.log("Saving channel for wishing happy birthday...");
    console.log(doc);
    await configCollection.insertOne(doc);
  }
}

module.exports = {
  checkForBirthdayEntry,
  isValidBirthday,
  addBirthday,
  updateBirthday,
  removeBirthday,
  checkForActiveBirthdays,
  wishHappyBirthday,
  updateWishChannel,
  saveWishChannel,
};
