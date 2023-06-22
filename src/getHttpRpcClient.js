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
exports.getHttpRpcClient = void 0;
const HttpRpcClient_1 = require("@account-abstraction/sdk/dist/src/HttpRpcClient");
function getHttpRpcClient(provider, bundlerUrl, entryPointAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const chainId = yield provider.getNetwork().then((net) => net.chainId);
        return new HttpRpcClient_1.HttpRpcClient(bundlerUrl, entryPointAddress, chainId);
    });
}
exports.getHttpRpcClient = getHttpRpcClient;
