import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { connect } from 'socket.io-client';
import { Actions } from '@types';

export default function Session() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [name, setName] = useState('huh');
  const [data, setData] = useState<any>(null);

  async function joinSession() {
    const response = await fetch('/api/socket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        type: Actions.JoinSession,
        sessionId,
        name,
      }),
    });
    const resData = await response.json();
    setData(resData);
  }

  useEffect(() => {
    async function fetchSessionData() {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          type: Actions.GetSession,
          sessionId,
        }),
      });
      const resData = await response.json();
      console.log({ resData });
      setData(resData);
    }
    const socket = connect(window.location.origin, {
      path: '/api/socket',
    });

    socket.on('connect', () => {
      console.log('SOCKET CONNECTED!', socket.id);
    });

    socket.on('update', (data) => {
      setData(data);
    });

    if (sessionId) {
      fetchSessionData();
    }
    return () => {
      socket?.disconnect();
    };
  }, [sessionId]);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Planning poker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-zinc-800 text-white p-4">
        <button onClick={joinSession}>Join</button>
        {data ? (
          <div>
            <div className="flex justify-between">
              <h1 className="">{data.name}</h1>
              <h2>
                Hi {localStorage.user ? JSON.parse(localStorage.user).name : ''}
              </h2>
            </div>
            <h2>Participants</h2>
            <ul>
              {data.users?.length &&
                data.users.map((user: any) => (
                  <li key={user.id}>{user.name}</li>
                ))}
            </ul>
          </div>
        ) : (
          'Loading...'
        )}
      </main>
    </div>
  );
}
