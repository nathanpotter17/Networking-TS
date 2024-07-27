export const PORT = 3031;
export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 600;
export const PLAYER_SIZE = 30;
export const PLAYER_SPEED = 500;
export const DIRECTION_VECTORS = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
};
function isDirection(arg) {
    return DIRECTION_VECTORS[arg] !== undefined;
}
export function isNumber(arg) {
    return typeof arg === "number";
}
export function isString(arg) {
    return typeof arg === "string";
}
export function isBoolean(arg) {
    return typeof arg === "boolean";
}
export function isHello(arg) {
    return arg && arg.kind === "Hello" && isNumber(arg.id);
}
export function isPlayerJoined(arg) {
    return (arg &&
        arg.kind === "PlayerJoined" &&
        isNumber(arg.id) &&
        isNumber(arg.x) &&
        isNumber(arg.y) &&
        isString(arg.style));
}
export function isPlayerLeft(arg) {
    return arg && arg.kind === "PlayerLeft" && isNumber(arg.id);
}
export function isClientMoving(arg) {
    return (arg &&
        arg.kind === "ClientMoving" &&
        isBoolean(arg.start) &&
        isDirection(arg.direction));
}
export function isPlayerMoving(arg) {
    return (arg &&
        arg.kind === "PlayerMoving" &&
        isNumber(arg.id) &&
        isNumber(arg.x) &&
        isNumber(arg.y));
}
// &&
//     isNumber(arg.id) &&
//     isNumber(arg.x) &&
//     isNumber(arg.y) &&
//     isBoolean(arg.start) &&
//     isBoolean(arg.direction)
export function modulus(a, b) {
    return ((a % b) + b) % b;
}
export function updatePlayer(player, deltaTime) {
    let dir;
    let dx = 0;
    let dy = 0;
    for (dir in DIRECTION_VECTORS) {
        if (player.moving[dir]) {
            dx += DIRECTION_VECTORS[dir].x;
            dy += DIRECTION_VECTORS[dir].y;
        }
    }
    player.x = modulus(player.x + dx * PLAYER_SPEED * deltaTime, WORLD_WIDTH);
    player.y = modulus(player.y + dy * PLAYER_SPEED * deltaTime, WORLD_HEIGHT);
}
//# sourceMappingURL=common.mjs.map