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
  const [pickedCard, setPickedCard] = useState<Card | null>(null);
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
    setUser((user) => (user ? { ...user, played_card: card } : user));
    setData(data);
  }

  async function onClickNewRound() {
    const data = await post(Actions.NewRound, { sessionId });

    setData(data);
  }
  const playedCard = data?.users.find((u) => u.id === user?.id)?.played_card;

  return (
    <div>
      <Head>
        <title>Planning Poker</title>
        <meta name="description" content="Planning poker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-zinc-800 text-white p-4">
        {!user && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              joinSession();
            }}
          >
            <input
              type="text"
              className="text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button>Join</button>
          </form>
        )}
        {data && user ? (
          <div>
            <div className="flex justify-between">
              <h1 className="">{data.name}</h1>
              <h2>Hi {user.name}</h2>
            </div>
            <h2 className="text-lg font-bold mt-2">Participants</h2>
            <ul>
              {data.users?.length &&
                data.users.map((user) => <li key={user.id}>{user.name}</li>)}
            </ul>

            <h2 className="text-lg font-bold mt-2">Picked cards</h2>
            {data.users.map((user) => {
              return (
                <div key={user.id}>
                  {user.played_card
                    ? `${
                        data.revealed
                          ? user.played_card.text
                          : `${user.name} picked a card`
                      }`
                    : `Waiting for ${user.name} to pick`}
                </div>
              );
            })}

            <h2 className="text-lg font-bold my-2">Available cards</h2>
            <div className="flex space-x-2">
              {data.cards.map((card) => {
                return (
                  <button
                    className={`border p-2 rounded hover:bg-white hover:text-zinc-800 transition-all ${
                      playedCard?.id === card.id ? 'bg-white text-black' : ''
                    }`}
                    onClick={() => onClickCard(card)}
                    key={card.id}
                  >
                    {card.text}
                  </button>
                );
              })}
            </div>
            {data.revealed && (
              <div>
                <h2 className="text-lg font-bold my-2">Result</h2>
                <div>
                  {data.users.reduce(
                    (acc, u) => acc + u.played_card!.value,
                    0
                  ) / data.users.length}
                </div>
                {user.id === data.creator_id && (
                  <div>
                    <button onClick={onClickNewRound}>New round</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>Please enter a name</div>
        )}
      </main>
    </div>
  );
}
