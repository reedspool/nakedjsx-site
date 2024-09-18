import { watch } from "fs";

let clientText: string;
const buildClientAndSetupClientText = async () => {
    const { outputs, logs } = await Bun.build({
        entrypoints: ["./client.ts"],
        outdir: "./out",
        target: "browser",
    });
    if (logs.length > 0) {
        console.clear();
        console.error("\n👇 Client side errors 🙅\n");
        logs.forEach((log) => console.error(log));
        console.error("\n☝ Client side errors 🙅\n");
        return;
    }
    if (outputs.length > 1) {
        throw new Error("Unexpected multiple outputs");
    }
    console.clear();
    console.log("\n✅✅✅ Client built successfully ✅✅✅\n");
    clientText = await outputs[0].text();
};
await buildClientAndSetupClientText();

type WebsocketData = { connectionId: number };
let nextConnectionId: WebsocketData["connectionId"] = 1;
const server = Bun.serve<WebsocketData>({
    async fetch(req, server) {
        const url = new URL(req.url);
        if (url.pathname === "/websocket") {
            server.upgrade(req, {
                data: {
                    connectionId: nextConnectionId++,
                },
            });
            return;
        }
        if (url.pathname === "/")
            return new Response(await Bun.file("./index.html").text(), {
                headers: {
                    "Content-Type": "text/html",
                },
            });
        if (url.pathname === "/out/client.js") {
            return new Response(clientText, {
                headers: {
                    "Content-Type": "text/javascript",
                },
            });
        }
    },
    websocket: {
        open(ws) {
            ws.subscribe("all");
            ws.subscribe("changes");
            console.log(
                `Established websocket connection #${ws.data.connectionId}`,
            );
        },
        message(ws, message) {}, // a message is received
        close(ws, code, message) {}, // a socket is closed
        drain(ws) {}, // the socket is ready to receive more data
    },
});

const { url } = server;
console.log(`Server running at ${url}`);

const watcher = watch(import.meta.dir, async (event, filename) => {
    console.log(`File watcher detected ${event} in ${filename}`);
    if (filename === "index.ts") return;
    if (filename === "client.ts" || filename === "emacs-colors.json") {
        // TODO: Feels like there's a possible race condition where watcher
        //       fires this callback again while the build occurs.
        await buildClientAndSetupClientText();
        server.publish("changes", "reload");
    }
    if (filename === "index.html") {
        server.publish("changes", "reload");
    }
});
