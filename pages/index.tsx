import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Actions } from '@types';

const Home: NextPage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [sessionName, setSessionName] = useState('');
  async function onClickCreateSession() {
    const response = await fetch('/api/socket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: sessionName,
        type: Actions.CreateSession,
        userName: userName,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      localStorage.user = JSON.stringify(data.user);
      router.push(`/sessions/${data.sessionId}`);
    }
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
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
          className="text-black"
        />
        <input
          type="text"
          placeholder="User Name"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
          className="text-black"
        />
        <button onClick={onClickCreateSession}>Create session</button>
      </main>
    </div>
  );
};

export default Home;
