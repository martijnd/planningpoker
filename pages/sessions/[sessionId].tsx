import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { connect } from 'socket.io-client';
import { Actions, Card, Data, User } from '@types';
import { v4 as uuidv4 } from 'uuid';
import { post } from 'util/post';

const PLAYER_LOCATIONS = [
  'top',
  'bottom',
  'left',
  'right',
  'top',
  'bottom',
  'top',
  'bottom',
  'top',
  'bottom',
  'top',
  'bottom',
  'top',
  'bottom',
  'top',
  'bottom',
  'top',
  'bottom',
  'top',
  'bottom',
  'top',
  'bottom',
  'top',
];

export default function Session() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [name, setName] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<Data | null>(null);

  async function joinSession() {
    const existingUser = localStorage.user
      ? JSON.parse(localStorage.user)
      : { id: uuidv4(), name };
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
        user: existingUser,
      }),
    });
    const resData = await response.json();
    localStorage.user = JSON.stringify(existingUser);
    setUser(existingUser);
    setData(resData);
  }

  useEffect(() => {
    async function fetchSessionData() {
      try {
        const resData: Data = await post(Actions.GetSession, { sessionId });
        setData(resData);
        const userAlreadyParticipates = resData.users.find(
          (u) => u.id === JSON.parse(localStorage.user).id
        );
        if (localStorage.user) {
          if (userAlreadyParticipates) {
            setUser(userAlreadyParticipates);
          } else {
            joinSession();
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    const socket = connect(window.location.origin, {
      path: '/api/socket',
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('update', (socketData) => {
      if (socketData.id !== data?.id) {
        return;
      }
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
    try {
      const data = await post(Actions.PickCard, { sessionId, card, user });
      setUser((user) => (user ? { ...user, played_card: card } : user));
      setData(data);
    } catch (e) {
      console.log(e);
    }
  }

  async function onClickNewRound() {
    const data = await post(Actions.NewRound, { sessionId });

    setData(data);
  }
  const playedCard = data?.users.find((u) => u.id === user?.id)?.played_card;

  function getLocationUsers(
    users: User[],
    location: string,
    revealed: boolean
  ) {
    return users
      .filter((_, index) => PLAYER_LOCATIONS[index] === location)
      .map((user) => {
        return (
          <div key={user.id} className="inline-flex flex-col mx-4">
            <div className={`border py-2 rounded text-center w-6 self-center`}>
              <div>
                {revealed
                  ? user.played_card?.text
                  : user.played_card?.text
                  ? '✔'
                  : '?'}
              </div>
            </div>
            <div>{user.name}</div>
          </div>
        );
      });
  }

  return (
    <div>
      <Head>
        <title>Planning Poker</title>
        <meta name="description" content="Planning poker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-zinc-800 text-white p-4 relative">
        <div className="max-w-screen-md mx-auto">
          {data && !user && (
            <>
              <h2 className="font-bold text-2xl mb-2">{data.name}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  joinSession();
                }}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  className="text-black px-4 py-2 rounded"
                  value={name}
                  placeholder="Enter your name"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <button className="py-2 px-4 bg-gray-700 rounded">Join</button>
              </form>
            </>
          )}
          {data && user && (
            <div className="flex flex-col">
              <nav className="flex justify-between">
                <h1 className="font-bold text-2xl">{data.name}</h1>
                <div className="flex items-center">
                  <h2>Hi {user.name}</h2>{' '}
                  <div
                    className={`ml-2 h-4 w-4 transition-colors ${
                      connected ? 'bg-green-500' : 'bg-gray-600'
                    } rounded-full`}
                  ></div>
                </div>
              </nav>
              <div id="table-container" className="text-center w-full mt-20">
                <div id="top">
                  {getLocationUsers(data.users, 'top', data.revealed)}
                </div>
                <div id="bottom">
                  {getLocationUsers(data.users, 'bottom', data.revealed)}
                </div>
                <div
                  id="table"
                  className="bg-blue-300 h-20 w-full rounded flex justify-center items-center"
                >
                  {data.revealed && (
                    <div className="flex items-center text-blue-500 space-x-2">
                      <h2 className="text-lg font-bold">Result</h2>
                      <span className="font-semibold">
                        {data.users.reduce(
                          (acc, u) => acc + u.played_card!.value,
                          0
                        ) / data.users.length}
                      </span>
                      {user.id === data.creator_id && (
                        <button
                          onClick={onClickNewRound}
                          className="p-2 hover:rotate-180 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div id="left" className="grid place-items-center">
                  {getLocationUsers(data.users, 'left', data.revealed)}
                </div>
                <div id="right" className="grid place-items-center">
                  {getLocationUsers(data.users, 'right', data.revealed)}
                </div>
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                <h2 className="text-lg font-bold my-2 text-center">
                  Available cards
                </h2>
                <div className="flex space-x-4">
                  {data.cards.map((card) => {
                    return (
                      <button
                        className={`border-2 p-8 rounded-lg hover:bg-white hover:text-zinc-800 transition-all ${
                          playedCard?.id === card.id
                            ? 'bg-white text-black'
                            : ''
                        }`}
                        onClick={() => onClickCard(card)}
                        key={card.id}
                      >
                        {card.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
