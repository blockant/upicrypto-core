#!/usr/bin/env node
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
const commander_1 = require("commander");
const address_1 = __importDefault(require("./address"));
const transfer_1 = __importDefault(require("./transfer"));
const erc20Transfer_1 = __importDefault(require("./erc20Transfer"));
const batchTransfer_1 = __importDefault(require("./batchTransfer"));
const batchErc20Transfer_1 = __importDefault(require("./batchErc20Transfer"));
const program = new commander_1.Command();
program
    .name("ERC-4337 SimpleAccount")
    .description("A collection of example scripts for working with ERC-4337 SimpleAccount.sol")
    .version("0.1.0");
program
    .command("address")
    .description("Generate a counterfactual address.")
    .action(address_1.default);
program
    .command("transfer")
    .description("Transfer ETH")
    .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
    .requiredOption("-t, --to <address>", "The recipient address")
    .requiredOption("-amt, --amount <eth>", "Amount in ETH to transfer")
    .action((opts) => __awaiter(void 0, void 0, void 0, function* () { return (0, transfer_1.default)(opts.to, opts.amount, Boolean(opts.withPaymaster)); }));
program
    .command("erc20Transfer")
    .description("Transfer ERC-20 token")
    .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
    .requiredOption("-tkn, --token <address>", "The token address")
    .requiredOption("-t, --to <address>", "The recipient address")
    .requiredOption("-amt, --amount <decimal>", "Amount of the token to transfer")
    .action((opts) => __awaiter(void 0, void 0, void 0, function* () { return (0, erc20Transfer_1.default)(opts.token, opts.to, opts.amount, Boolean(opts.withPaymaster)); }));
program
    .command("batchTransfer")
    .description("Batch transfer ETH")
    .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
    .requiredOption("-t, --to <addresses>", "Comma separated list of recipient addresses")
    .requiredOption("-amt, --amount <eth>", "Amount in ETH to transfer")
    .action((opts) => __awaiter(void 0, void 0, void 0, function* () { return (0, batchTransfer_1.default)(opts.to.split(","), opts.amount, Boolean(opts.withPaymaster)); }));
program
    .command("batchErc20Transfer")
    .description("Batch transfer ERC-20 token")
    .option("-pm, --withPaymaster", "Use a paymaster for this transaction")
    .requiredOption("-tkn, --token <address>", "The token address")
    .requiredOption("-t, --to <addresses>", "Comma separated list of recipient addresses")
    .requiredOption("-amt, --amount <decimal>", "Amount of the token to transfer")
    .action((opts) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, batchErc20Transfer_1.default)(opts.token, opts.to.split(","), opts.amount, Boolean(opts.withPaymaster));
}));
program.parse();
