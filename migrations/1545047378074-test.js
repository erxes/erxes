const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Users = require('../dist/db/models/Users').default;

dotenv.config();

module.exports.up = function (next) {
  const { MONGO_URL } = process.env;

  mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }, function () {
    Users.updateMany(
      {},
      { $set: { role: 'contributor' } },
    ).then(function () {
      next();
    })
  })
}