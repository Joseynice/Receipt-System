const mongoose = require('mongoose');


const receiptSchema = new mongoose.Schema({
    company: {
        logo: { type: String, default: "" },
        name: { type: String, required: true },
        email: { type: String, required: false },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        currency: { type: String, enum: ['Dollar ($)', 'Naira (₦)'], default: 'Dollar ($)' }
    },

    receiver: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },

    items: [{
        name: { type: String, required: true },
        description: { type: String, default: "" },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        total: { 
            type: Number,
            required: true,
            default: function () { return this.quantity * this.price; }
        }
    }],

    total: { type: Number, required: true, default: 0 },
    vatAmount: { type: Number, required: true, default: 0 }, 
    grandTotal: { type: Number, required: true, default: 0 },

    date: { type: Date, default: Date.now }
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;