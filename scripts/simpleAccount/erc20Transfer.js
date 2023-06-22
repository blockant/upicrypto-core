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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const src_1 = require("../../src");
// @ts-ignore
const config_json_1 = __importDefault(require("../../config.json"));
function main(tkn, t, amt, withPM) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(config_json_1.default.rpcUrl);
        const paymasterAPI = withPM
            ? (0, src_1.getVerifyingPaymaster)(config_json_1.default.paymasterUrl, config_json_1.default.entryPoint)
            : undefined;
        const accountAPI = (0, src_1.getSimpleAccount)(provider, config_json_1.default.signingKey, config_json_1.default.entryPoint, config_json_1.default.simpleAccountFactory, paymasterAPI);
        const token = ethers_1.ethers.utils.getAddress(tkn);
        const to = ethers_1.ethers.utils.getAddress(t);
        const erc20 = new ethers_1.ethers.Contract(token, src_1.ERC20_ABI, provider);
        const [symbol, decimals] = yield Promise.all([
            erc20.symbol(),
            erc20.decimals(),
        ]);
        const amount = ethers_1.ethers.utils.parseUnits(amt, decimals);
        console.log(`Transferring ${amt} ${symbol}...`);
        const op = yield accountAPI.createSignedUserOp(Object.assign({ target: erc20.address, data: erc20.interface.encodeFunctionData("transfer", [to, amount]) }, (yield (0, src_1.getGasFee)(provider))));
        console.log(`Signed UserOperation: ${yield (0, src_1.printOp)(op)}`);
        const client = yield (0, src_1.getHttpRpcClient)(provider, config_json_1.default.bundlerUrl, config_json_1.default.entryPoint);
        const uoHash = yield client.sendUserOpToBundler(op);
        console.log(`UserOpHash: ${uoHash}`);
        console.log("Waiting for transaction...");
        const txHash = yield accountAPI.getUserOpReceipt(uoHash);
        console.log(`Transaction hash: ${txHash}`);
    });
}
exports.default = main;
