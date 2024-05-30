// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     contactNumber: { type: String, required: true },
//     password: { type: String, required: true }
// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String } // Add this line
});

module.exports = mongoose.model('User', userSchema);
