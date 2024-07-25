// @ts-check
// Do not run this file directly. Run it via `npm run watch`. See package.json for more info.
const { spawn } = require("child_process");
// const { WebSocketServer } = require("ws");
// // TODO: consider using fs.watch instead
// const { watchFile } = require("fs");
// const path = require("path");

/**
 *
 * @param {string} program
 * @param {string[]} args
 * @returns {ReturnType<typeof spawn>}
 */
function cmd(program, args) {
  const spawnOptions = { shell: true };
  console.log("CMD:", program, args.flat(), spawnOptions);
  const p = spawn(program, args.flat(), spawnOptions); // NOTE: flattening the args array enables you to group related arguments for better self-documentation of the running command
  // @ts-ignore [stdout may be null?]
  p.stdout.on("data", (data) => process.stdout.write(data));
  // @ts-ignore [stderr may be null?]
  p.stderr.on("data", (data) => process.stderr.write(data));
  p.on("close", (code) => {
    if (code !== 0) {
      console.error(program, args, "exited with", code);
    }
  });
  return p;
}

cmd("tsc", ["-w"]); // run TypeScript compiler in watch mode
cmd("http-server", ["-p", "3030", "-a", "127.0.0.1", "-s", "-c-1"]); // run a simple HTTP server to serve the files on port 3030 with no cache and no directory listing.

// const wss = new WebSocketServer({
//   port: 6970,
// });

// /** @type {import("ws").WebSocket[]} */
// const websockets = [];

// wss.on("connection", (ws) => {
//   websockets.push(ws);

//   ws.on("close", () => {
//     websockets.splice(websockets.indexOf(ws), 1);
//   });
// });

// const COLD_RELOAD_FILES = ["index.html", "index.js"];
// COLD_RELOAD_FILES.forEach((file) =>
//   watchFile(path.join(__dirname, file), { interval: 50 }, () => {
//     websockets.forEach((socket) => socket.send("cold"));
//   })
// );

// const HOT_RELOAD_FILES = ["game.js"];
// HOT_RELOAD_FILES.forEach((file) =>
//   watchFile(path.join(__dirname, file), { interval: 50 }, () => {
//     websockets.forEach((socket) => socket.send("hot"));
//   })
// );
