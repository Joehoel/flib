"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const flow_launcher_1 = require("flow-launcher");
const open_1 = __importDefault(require("open"));
// invariant(process.argv[2], "No args passed to plugin");
if (!process.argv[2]) {
    console.log("No args passed to plugin");
    process.exit(0);
}
const plugin = new flow_launcher_1.Flow({
    args: process.argv[2],
    icon: "./assets/npm.png",
});
plugin.on("query", ([query]) => {
    plugin.show({
        title: "Hello World",
        subtitle: "dowiahdhwoaidhwa",
        event: "open",
        parameters: [query],
    });
});
plugin.on("open", ([value]) => {
    (0, open_1.default)("https://google.com");
});
plugin.on("context-menu", () => {
    plugin.show({
        title: "Context menu",
        subtitle: "hello context menu",
        event: "open",
        parameters: ["https://google.com"],
    });
});
plugin.run();
