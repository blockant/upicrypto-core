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
exports.getGasFee = void 0;
const ethers_1 = require("ethers");
function getGasFee(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        const [fee, block] = yield Promise.all([
            provider.send("eth_maxPriorityFeePerGas", []),
            provider.getBlock("latest"),
        ]);
        const tip = ethers_1.ethers.BigNumber.from(fee);
        const buffer = tip.div(100).mul(13);
        const maxPriorityFeePerGas = tip.add(buffer);
        const maxFeePerGas = block.baseFeePerGas
            ? block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas)
            : maxPriorityFeePerGas;
        return { maxFeePerGas, maxPriorityFeePerGas };
    });
}
exports.getGasFee = getGasFee;
