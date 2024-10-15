const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'userId',
});

userSchema.set('toObject', { virtuals: true, transform: hideSensitiveFields });
userSchema.set('toJSON', { virtuals: true, transform: hideSensitiveFields });

function hideSensitiveFields(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret._id;
    if (ret.posts) {
        ret.posts = ret.posts.map(post => {
            delete post.__v;
            delete post.userId;
            delete post._id;
            return post;
        });
    }
    return ret;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
