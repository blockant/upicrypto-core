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
exports.getVerifyingPaymaster = void 0;
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const sdk_1 = require("@account-abstraction/sdk");
const opUtils_1 = require("./opUtils");
const SIG_SIZE = 65;
const DUMMY_PAYMASTER_AND_DATA = "0x0101010101010101010101010101010101010101000000000000000000000000000000000000000000000000000001010101010100000000000000000000000000000000000000000000000000000000000000000101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101";
class VerifyingPaymasterAPI extends sdk_1.PaymasterAPI {
    constructor(paymasterUrl, entryPoint) {
        super();
        this.paymasterUrl = paymasterUrl;
        this.entryPoint = entryPoint;
    }
    getPaymasterAndData(userOp) {
        return __awaiter(this, void 0, void 0, function* () {
            // Hack: userOp includes empty paymasterAndData which calcPreVerificationGas requires.
            try {
                // userOp.preVerificationGas contains a promise that will resolve to an error.
                yield ethers_1.ethers.utils.resolveProperties(userOp);
                // eslint-disable-next-line no-empty
            }
            catch (_) { }
            const pmOp = {
                sender: userOp.sender,
                nonce: userOp.nonce,
                initCode: userOp.initCode,
                callData: userOp.callData,
                callGasLimit: userOp.callGasLimit,
                verificationGasLimit: userOp.verificationGasLimit,
                maxFeePerGas: userOp.maxFeePerGas,
                maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
                // A dummy value here is required in order to calculate a correct preVerificationGas value.
                paymasterAndData: DUMMY_PAYMASTER_AND_DATA,
                signature: ethers_1.ethers.utils.hexlify(Buffer.alloc(SIG_SIZE, 1)),
            };
            const op = yield ethers_1.ethers.utils.resolveProperties(pmOp);
            op.preVerificationGas = (0, sdk_1.calcPreVerificationGas)(op);
            // Ask the paymaster to sign the transaction and return a valid paymasterAndData value.
            return axios_1.default
                .post(this.paymasterUrl, {
                jsonrpc: "2.0",
                id: 1,
                method: "pm_sponsorUserOperation",
                params: [yield (0, opUtils_1.toJSON)(op), this.entryPoint],
            })
                .then((res) => res.data.result.toString());
        });
    }
}
const getVerifyingPaymaster = (paymasterUrl, entryPoint) => new VerifyingPaymasterAPI(paymasterUrl, entryPoint);
exports.getVerifyingPaymaster = getVerifyingPaymaster;
