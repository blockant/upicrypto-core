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
exports.printOp = exports.toJSON = void 0;
const ethers_1 = require("ethers");
function toJSON(op) {
    return ethers_1.ethers.utils.resolveProperties(op).then((userOp) => Object.keys(userOp)
        .map((key) => {
        let val = userOp[key];
        if (typeof val !== "string" || !val.startsWith("0x")) {
            val = ethers_1.ethers.utils.hexValue(val);
        }
        return [key, val];
    })
        .reduce((set, [k, v]) => (Object.assign(Object.assign({}, set), { [k]: v })), {}));
}
exports.toJSON = toJSON;
function printOp(op) {
    return __awaiter(this, void 0, void 0, function* () {
        return toJSON(op).then((userOp) => JSON.stringify(userOp, null, 2));
    });
}
exports.printOp = printOp;
