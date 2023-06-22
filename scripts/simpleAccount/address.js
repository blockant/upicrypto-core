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
const src_1 = require("../../src");
const ethers_1 = require("ethers");
// @ts-ignore
const config_json_1 = __importDefault(require("../../config.json"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(config_json_1.default.rpcUrl);
        const accountAPI = (0, src_1.getSimpleAccount)(provider, config_json_1.default.signingKey, config_json_1.default.entryPoint, config_json_1.default.simpleAccountFactory);
        const address = yield accountAPI.getCounterFactualAddress();
        console.log(`SimpleAccount address: ${address}`);
    });
}
exports.default = main;
