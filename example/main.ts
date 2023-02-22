import { Flow } from "flow-launcher";
import open from "open";

// invariant(process.argv[2], "No args passed to plugin");

if (!process.argv[2]) {
  console.log("No args passed to plugin");
  process.exit(0);
}

const plugin = new Flow<{ open: [url: string] }>({
  args: process.argv[2],
  icon: "./assets/npm.png",
});

plugin.on("query", ([query]) => {
  plugin.show({
    title: "Hello World",
    subtitle: query,
    event: "open",
    parameters: ["https://google.com"],
  });
});

// plugin.on("query", ([query]) => {
//   plugin.show({
//     title: "Hello World",
//     subtitle: query,
//     event: "open",
//     parameters: ["https://google.com"],
//   });
// });

// plugin.on("open", ([url]) => {
//   plugin.emit("open-settings");

//   // open(url);
// });

// plugin.on("context-menu", () => {
//   plugin.show({
//     title: "Context menu",
//     subtitle: "hello context menu",
//     event: "open",
//     parameters: ["https://google.com"],
//   });
// });

plugin.run();
