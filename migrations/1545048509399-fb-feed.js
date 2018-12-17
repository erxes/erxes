const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ConversationMessages = require('../dist/db/models/ConversationMessages').default;

dotenv.config();

/**
 * Updating every post and parent comment's commentCount to 101 by static
 *
 */
module.exports.up = function(next) {
  const { MONGO_URL } = process.env;

  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
    function() {
      ConversationMessages.updateMany({ 'facebookData.isPost': true }, { 'facebookData.commentCount': 101 }).then(
        function() {
          ConversationMessages.updateMany(
            {
              $and: [{ 'facebookData.commentId': { $exists: true } }, { 'facebookData.parentId': { $exists: false } }]
            },
            { 'facebookData.commentCount': 101 }
          ).then(function() {
            next();
          });
        }
      );
    }
  );
};
