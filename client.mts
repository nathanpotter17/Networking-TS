import * as common from "./common.mjs";
import type { Direction } from "./common.mjs";
import { updatePlayer } from "./common.mjs";

const DIR_KEYS: { [key: string]: Direction } = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

(async () => {
  const gameCanvas = document.getElementById(
    "game"
  ) as HTMLCanvasElement | null;

  if (gameCanvas === null) throw new Error("Canvas not found");

  gameCanvas.width = common.WORLD_WIDTH;
  gameCanvas.height = common.WORLD_HEIGHT;

  const ctx = gameCanvas.getContext("2d");

  if (ctx === null) throw new Error("2D rendering context not found");

  const ws: WebSocket | undefined = new WebSocket("ws://localhost:3031");
  let myId: undefined | number = undefined;
  const players = new Map<number, common.Player>();

  // using an event queue to pass the events we want to handle...

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    console.log("Client received message:", message);
    if (myId === undefined && common.isHello(message)) {
      myId = message.id;
      console.log(`Connected as Player ${myId}`);
    } else if (myId !== undefined && common.isPlayerJoined(message)) {
      console.log("server says:", event.data);
      players.set(message.id, {
        id: message.id,
        x: message.x,
        y: message.y,
        moving: {
          left: false,
          right: false,
          up: false,
          down: false,
        },
        style: message.style,
      });
    } else if (myId !== undefined && common.isPlayerMoving(message)) {
      console.log("received move event on client:", event.data);
      const player = players.get(message.id);
      if (player === undefined) {
        console.error("We dont know this client...", message);
        ws.close();
        return;
      }
      player.moving[message.direction] = message.start;
      player.x = message.x;
      player.y = message.y;
    } else if (myId !== undefined && common.isPlayerLeft(message)) {
      players.delete(message.id);
    } else {
      console.error(
        "Message from server was a bogey. Shutting down...",
        message
      );
      ws.close();
    }
  });

  ws.addEventListener("open", (event) => {
    console.log("Client connected to the server.", event);
  });

  ws.addEventListener("error", (event) => {
    console.log("Error:", event);
  });

  ws.addEventListener("close", (event) => {
    console.log("Client disconnected from the server.", event);
  });

  let previousTimestamp = 0;
  const frame = (timestamp: number) => {
    const deltaTime = (timestamp - previousTimestamp) / 1000;

    previousTimestamp = timestamp;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, common.WORLD_WIDTH, common.WORLD_HEIGHT);

    ctx.fillStyle = "red";
    players.forEach((player) => {
      if (!player) return;
      updatePlayer(player, deltaTime);
      ctx.fillStyle = player.style;
      ctx.fillRect(player.x, player.y, common.PLAYER_SIZE, common.PLAYER_SIZE);
    });

    window.requestAnimationFrame(frame);
  };

  window.requestAnimationFrame((timestamp) => {
    previousTimestamp = timestamp;
    window.requestAnimationFrame(frame);
  });

  window.addEventListener("keydown", (e) => {
    if (!e.repeat) {
      const direction = DIR_KEYS[e.code as Direction];
      if (direction !== undefined) {
        ws.send(
          JSON.stringify({
            kind: "ClientMoving",
            start: true,
            direction,
          })
        );
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if (!e.repeat) {
      const direction = DIR_KEYS[e.code as Direction];
      if (direction !== undefined) {
        ws.send(
          JSON.stringify({
            kind: "ClientMoving",
            start: false,
            direction,
          })
        );
      }
    }
  });
})();
