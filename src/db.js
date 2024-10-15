const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test')
.then(() => {
    console.log('MongoDB connected successfully!');
})
.catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

module.exports = mongoose;
