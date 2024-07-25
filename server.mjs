import { WebSocketServer } from "ws";
import * as common from "./common.mjs";
const SERVER_FPS = 30;
const wss = new WebSocketServer({ port: common.PORT }); // 3031
let idCounter = 0;
let eventQueue = []; // event loop buffer
const players = new Map();
wss.on("connection", (ws) => {
    const id = idCounter++;
    const x = Math.random() * common.WORLD_WIDTH;
    const y = Math.random() * common.WORLD_HEIGHT;
    const player = {
        id,
        x,
        y,
        ws,
        moving: common.DEFAULT_MOVING,
    };
    players.set(id, player);
    console.log(`Player ${player.id} connected to the server.`);
    eventQueue.push({
        kind: "PlayerJoined",
        id: player.id,
        x: player.x,
        y: player.y,
    });
    ws.addEventListener("message", (event) => {
        const message = JSON.parse(event.data.toString());
        if (common.isClientMoving(message)) {
            console.log(`Received message from player ${id}`, message);
            eventQueue.push({
                kind: "PlayerMoving",
                id,
                x: player.x,
                y: player.y,
                start: message.start,
                direction: message.direction,
            });
        }
        else {
            console.error("Message from client was a bogey. Shutting down...", message);
            ws.close();
        }
    });
    ws.on("close", () => {
        console.log("Client disconnected from the server.");
        players.delete(id);
        //schedule the event to be sent to all players.
        eventQueue.push({ kind: "PlayerLeft", id });
    });
});
function tick() {
    for (let event of eventQueue) {
        switch (event.kind) {
            case "PlayerJoined":
                {
                    const joinedPlayer = players.get(event.id);
                    if (joinedPlayer === undefined)
                        continue; // not much we can do here... skip on
                    joinedPlayer.ws.send(JSON.stringify({
                        kind: "Hello",
                        id: joinedPlayer.id,
                    }));
                    // const eventString = JSON.stringify(event);
                    players.forEach((otherPlayer) => {
                        joinedPlayer.ws.send(JSON.stringify({
                            kind: "PlayerJoined",
                            id: otherPlayer.id,
                            x: otherPlayer.x,
                            y: otherPlayer.y,
                        }));
                        if (otherPlayer.id !== joinedPlayer.id) {
                            otherPlayer.ws.send(JSON.stringify({
                                kind: "PlayerJoined",
                                id: joinedPlayer.id,
                                x: joinedPlayer.x,
                                y: joinedPlayer.y,
                            }));
                        }
                    });
                }
                break;
            case "PlayerLeft":
                {
                    // using const here is less wasteful
                    const eventString = JSON.stringify(event);
                    players.forEach((player) => {
                        player.ws.send(eventString);
                    });
                }
                break;
            case "PlayerMoving":
                {
                    const eventString = JSON.stringify(event);
                    const player = players.get(event.id);
                    if (player === undefined)
                        continue; // not much we can do here... skip on
                    player.moving[event.direction] = event.start;
                    players.forEach((player) => player.ws.send(eventString));
                }
                break;
        }
    }
    eventQueue.length = 0; // clear the event queue
    // do the move sim, this is common between both client ++ server
    players.forEach((player) => {
        common.updatePlayer(player, 1 / SERVER_FPS);
    });
    setTimeout(tick, 1000 / SERVER_FPS);
}
setTimeout(tick, 1000 / SERVER_FPS);
console.log(`Server is running on ws://localhost:${common.PORT}`);
//# sourceMappingURL=server.mjs.map