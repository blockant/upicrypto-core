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
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const ethers_1 = require("ethers");
const INIT_CONFIG = {
    bundlerUrl: "http://localhost:4337",
    rpcUrl: "http://localhost:8545",
    signingKey: new ethers_1.ethers.Wallet(ethers_1.ethers.utils.randomBytes(32)).privateKey,
    entryPoint: "0x0576a174D229E3cFA37253523E645A78A0C91B57",
    simpleAccountFactory: "0x71D63edCdA95C61D6235552b5Bc74E32d8e2527B",
    paymasterUrl: "",
};
const CONFIG_PATH = path_1.default.resolve(__dirname, "../config.json");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        return promises_1.default.writeFile(CONFIG_PATH, prettier_1.default.format(JSON.stringify(INIT_CONFIG, null, 2), { parser: "json" }));
    });
}
main()
    .then(() => console.log(`Config written to ${CONFIG_PATH}`))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
