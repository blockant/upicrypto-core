"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimpleAccount = void 0;
const sdk_1 = require("@account-abstraction/sdk");
const ethers_1 = require("ethers");
function getSimpleAccount(provider, signingKey, entryPointAddress, factoryAddress, paymasterAPI) {
    const owner = new ethers_1.ethers.Wallet(signingKey, provider);
    const sw = new sdk_1.SimpleAccountAPI({
        provider,
        entryPointAddress,
        owner,
        factoryAddress,
        paymasterAPI,
    });
    // Hack: default getUserOpReceipt does not include fromBlock which causes an error for some RPC providers.
    sw.getUserOpReceipt = (userOpHash, timeout = 30000, interval = 5000) => __awaiter(this, void 0, void 0, function* () {
        const endtime = Date.now() + timeout;
        const block = yield sw.provider.getBlock("latest");
        while (Date.now() < endtime) {
            // @ts-ignore
            const events = yield sw.entryPointView.queryFilter(
            // @ts-ignore
            sw.entryPointView.filters.UserOperationEvent(userOpHash), Math.max(0, block.number - 100));
            if (events.length > 0) {
                return events[0].transactionHash;
            }
            yield new Promise((resolve) => setTimeout(resolve, interval));
        }
        return null;
    });
    return sw;
}
exports.getSimpleAccount = getSimpleAccount;
