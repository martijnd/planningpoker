import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Actions, CardSet } from '@types';
import { post } from 'util/post';
import { v4 as uuidv4 } from 'uuid';

const availableSets: CardSet[] = [
  {
    name: 'Linear',
    cards: [
      {
        id: uuidv4(),
        text: '1',
        value: 1,
      },
      {
        id: uuidv4(),
        text: '2',
        value: 2,
      },
      {
        id: uuidv4(),
        text: '3',
        value: 3,
      },
      {
        id: uuidv4(),
        text: '4',
        value: 4,
      },
      {
        id: uuidv4(),
        text: '5',
        value: 5,
      },
      {
        id: uuidv4(),
        text: '6',
        value: 6,
      },
      {
        id: uuidv4(),
        text: '7',
        value: 7,
      },
      {
        id: uuidv4(),
        text: '8',
        value: 8,
      },
      {
        id: uuidv4(),
        text: '9',
        value: 9,
      },
      {
        id: uuidv4(),
        text: '10',
        value: 10,
      },
    ],
  },
  {
    name: 'Fibonacci',
    cards: [
      {
        id: uuidv4(),
        text: '0',
        value: 0,
      },
      {
        id: uuidv4(),
        text: '½',
        value: 0.5,
      },
      {
        id: uuidv4(),
        text: '1',
        value: 1,
      },
      {
        id: uuidv4(),
        text: '2',
        value: 2,
      },
      {
        id: uuidv4(),
        text: '3',
        value: 3,
      },
      {
        id: uuidv4(),
        text: '5',
        value: 5,
      },
      {
        id: uuidv4(),
        text: '8',
        value: 8,
      },
      {
        id: uuidv4(),
        text: '13',
        value: 13,
      },
      {
        id: uuidv4(),
        text: '20',
        value: 20,
      },
      {
        id: uuidv4(),
        text: '40',
        value: 40,
      },
    ],
  },
];
const Home: NextPage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [sessionName, setSessionName] = useState('Session 1');
  async function onClickCreateSession() {
    const data = await post(Actions.CreateSession, {
      name: sessionName,
      type: Actions.CreateSession,
      userName: userName,
      id: localStorage.user ? JSON.parse(localStorage.user).id : null,
    });

    localStorage.user = JSON.stringify(data.user);
    router.push(`/sessions/${data.sessionId}`);
  }

  useEffect(() => {
    if (localStorage.user) {
      setUserName(
        localStorage.user ? JSON.parse(localStorage.user).name : 'User 1'
      );
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Planning Poker</title>
        <meta name="description" content="Planning poker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-zinc-800 text-white p-4">
        <div className="max-w-md mx-auto flex flex-col space-y-4">
          <h1 className="font-bold">Planning poker</h1>
          <input
            type="text"
            placeholder="Session Name"
            onChange={(e) => setSessionName(e.target.value)}
            value={sessionName}
            required
            className="text-black px-4 py-2 rounded"
          />
          <input
            type="text"
            placeholder="User Name"
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            required
            className="text-black px-4 py-2 rounded"
          />
          <select
            className="text-black px-4 py-2 rounded"
            name="sets"
            id="sets"
          >
            {availableSets.map((set) => (
              <option key={set.name}>{`${set.name} (${set.cards
                .map((card) => card.text)
                .join(', ')})`}</option>
            ))}
          </select>
          <button
            className="p-4 bg-slate-600 rounded shadow"
            onClick={onClickCreateSession}
          >
            Create session
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
