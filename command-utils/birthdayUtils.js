// checks if a user already has an entry
async function checkForBirthdayEntry(collection, username) {
  return await collection.findOne({ username });
}

// checks if the birthday entered is valid
function isValidBirthday(day, month) {
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

// adds a user's birthday to the db
async function addBirthday(collection, username, day, month) {
  const doc = { username, day, month };
  return await collection.insertOne(doc);
}

async function updateBirthday(collection, doc, day, month) {
  const filter = { _id: doc._id };
  const update = { $set: { day, month } };
  return await collection.updateOne(filter, update);
}

// removes a users birthday from the db
async function removeBirthday(collection, username) {
  return await collection.deleteOne({ username });
}

module.exports = {
  checkForBirthdayEntry,
  isValidBirthday,
  addBirthday,
  updateBirthday,
  removeBirthday,
};
