import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { connect } from 'socket.io-client';
import { Actions, Card, Data, User } from '@types';
import { v4 as uuidv4 } from 'uuid';
import { post } from 'util/post';

export default function Session() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [name, setName] = useState('User 2');
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<Data | null>(null);

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
    localStorage.user = JSON.stringify({ id: uuidv4(), name });
    setUser(JSON.parse(localStorage.user));
    setData(resData);
  }

  useEffect(() => {
    async function fetchSessionData() {
      const resData: Data = await post(Actions.GetSession, { sessionId });
      setData(resData);
      if (localStorage.user && resData.users.find((u) => u.id === user?.id)) {
        setUser(JSON.parse(localStorage.user));
      }
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

  async function onClickCard(card: Card) {
    const data = await post(Actions.PickCard, { sessionId, card, user });
  }

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
            <h2 className="text-lg font-bold mt-2">Participants</h2>
            <ul>
              {data.users?.length &&
                data.users.map((user) => <li key={user.id}>{user.name}</li>)}
            </ul>

            <h2 className="text-lg font-bold mt-2">Cards</h2>
            {data.users.map((user) => {
              return (
                <div key={user.id}>
                  {user.played_card
                    ? `${data.revealed ? user.played_card : '???'}`
                    : `Waiting for ${user.name} to pick`}
                </div>
              );
            })}

            <h2 className="text-lg font-bold my-2">Available cards</h2>
            <div className="flex space-x-2">
              {data.cards.map((card) => {
                return (
                  <button
                    className="border p-2 rounded hover:bg-white hover:text-zinc-800 transition-all"
                    onClick={() => onClickCard(card)}
                    key={card.id}
                  >
                    {card.text}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          'Loading...'
        )}
      </main>
    </div>
  );
}
