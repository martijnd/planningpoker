import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import cors from "@fastify/cors";

const server = fastify();
server.register(cors, {
  origin: "http://localhost:3000",
});
server.register(fastifyIO, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined
  server.io.on("connection", (socket) => {
    server.io.emit("hello", "test");
    console.log(socket.id);
  });
});

server.listen({ port: 3001 });
