import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/node-test');

mongoose.connection.once('open', () => {
  console.log('Connection has been made ...'); // eslint-disable-line
}).on('error', (error) => {
  console.log('Connection error: ', error); // eslint-disable-line
});
