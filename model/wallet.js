const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userEmail: String,
  walletAddress: String,
});

module.exports = mongoose.model("Wallet", walletSchema);
