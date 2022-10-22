import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Actions } from '@types';
import { post } from 'util/post';

const Home: NextPage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('User 1');
  const [sessionName, setSessionName] = useState('Session 1');
  async function onClickCreateSession() {
    const data = await post(Actions.CreateSession, {
      name: sessionName,
      type: Actions.CreateSession,
      user: localStorage.user ? JSON.parse(localStorage.user) : null,
    });

    localStorage.user = JSON.stringify(data.user);
    router.push(`/sessions/${data.sessionId}`);
  }

  return (
    <div>
      <Head>
        <title>Planning Poker</title>
        <meta name="description" content="Planning poker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-zinc-800 text-white">
        <h1 className="">Planning poker</h1>
        <input
          type="text"
          placeholder="Session Name"
          onChange={(e) => setSessionName(e.target.value)}
          value={sessionName}
          required
          className="text-black"
        />
        <input
          type="text"
          placeholder="User Name"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
          required
          className="text-black"
        />
        <button onClick={onClickCreateSession}>Create session</button>
      </main>
    </div>
  );
};

export default Home;
