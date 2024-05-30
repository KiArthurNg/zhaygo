const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    curry: { type: String, required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    price: { type: String, required: true },
    imageurl: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Order', orderSchema);
