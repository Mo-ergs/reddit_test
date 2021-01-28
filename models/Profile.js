const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    favSubreddits: {
        type: [String]
    },
    newsletterSendTime: {
        type: String,
        default: '8am'
    },
    wantsNewsletter: {
        type: Boolean
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);