const mongoose = require("mongoose");
const Networks = require("./networks");

const walletSchema = new mongoose.Schema({
  userEmail: String,
  walletAddress: String,
  customerId: String,
  balance: {
    type: Number,
    default: 0,
  },
  networks: [{ type: mongoose.Schema.Types.ObjectId, ref: Networks }],
});

module.exports = mongoose.model("Wallet", walletSchema);
