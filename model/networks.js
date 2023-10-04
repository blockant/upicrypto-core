const mongoose = require("mongoose");

const networksSchema = new mongoose.Schema({
  networkName: String,
  chainId: String,
  rpcUrl: String,
  currencySymbol: String,
  blockExplorerUrl: String,
});

module.exports = mongoose.model("Networks", networksSchema);
