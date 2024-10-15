const mongoose = require('mongoose');

const postSchema =  new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

postSchema.set('toObject', { transform: hidePostFields });
postSchema.set('toJSON', { transform: hidePostFields });

function hidePostFields(doc, ret) {
    delete ret.__v;
    return ret;
}

const Post = mongoose.model('Post', postSchema);

module.exports = Post;