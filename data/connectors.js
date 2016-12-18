import Mongoose from 'mongoose';

Mongoose.connect('mongodb://127.0.0.1:7011/meteor');

const ConversationSchema = Mongoose.Schema({
  _id: String,
  content: String,
});

const Conversations = Mongoose.model('conversations', ConversationSchema);

export { Conversations };
