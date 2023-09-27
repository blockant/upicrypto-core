const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userEmail: String,
  walletAddress: String,
  customerId:String,
  balance: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Wallet", walletSchema);
