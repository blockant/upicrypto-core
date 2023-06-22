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
// This example requires several layers of calls:
// EntryPoint
//  ┕> sender.executeBatch
//    ┕> sender.execute (recipient 1)
//    ⋮
//    ┕> sender.execute (recipient N)
function main(t, amt, withPM) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(config_json_1.default.rpcUrl);
        const paymasterAPI = withPM
            ? (0, src_1.getVerifyingPaymaster)(config_json_1.default.paymasterUrl, config_json_1.default.entryPoint)
            : undefined;
        const accountAPI = (0, src_1.getSimpleAccount)(provider, config_json_1.default.signingKey, config_json_1.default.entryPoint, config_json_1.default.simpleAccountFactory, paymasterAPI);
        const sender = yield accountAPI.getCounterFactualAddress();
        const ac = yield accountAPI._getAccountContract();
        const value = ethers_1.ethers.utils.parseEther(amt);
        let dest = [];
        let data = [];
        t.map((addr) => addr.trim()).forEach((addr) => {
            dest = [...dest, sender];
            data = [
                ...data,
                ac.interface.encodeFunctionData("execute", [
                    ethers_1.ethers.utils.getAddress(addr),
                    value,
                    "0x",
                ]),
            ];
        });
        const op = yield accountAPI.createSignedUserOp(Object.assign({ target: sender, data: ac.interface.encodeFunctionData("executeBatch", [dest, data]) }, (yield (0, src_1.getGasFee)(provider))));
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
