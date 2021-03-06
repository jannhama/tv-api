const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const config = require('../../config/config');

let connection = null;

module.exports = {
  connect() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(config.db, (err, db) => {
        if (err) {
          return reject();
        }
        connection = db;
        return resolve(db);
      });
    });
  },
  getMongoId(id) {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new Error('Not a valid id');
    }
    return objectId;
  },
  get getDb() {
    if (connection) {
      return Promise.resolve(connection);
    }
    return this.connect();
  },
};
