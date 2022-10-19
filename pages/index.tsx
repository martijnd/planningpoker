import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { io, connect } from "socket.io-client";

const Home: NextPage = () => {
  useEffect(() => {
    const socket = connect(process.env.BASE_URL ?? "http://localhost:3004", {
      path: "/api/socket",
    });
    console.log(socket);
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
    });
    return () => {
      socket?.disconnect();
    };
  }, []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Planning poker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-zinc-800 text-white">
        <h1 className="">Planning poker</h1>
      </main>
    </div>
  );
};

export default Home;
