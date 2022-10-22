import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Actions, Data } from '@types';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

const sessions: Record<string, Data> = {
  'ebce1aea-f816-44b7-b38b-7e61baf64d5e': {
    id: 'ebce1aea-f816-44b7-b38b-7e61baf64d5e',
    name: 'Test',
    creating: true,
    revealed: false,
    creator_id: 'ef77489d-6de5-4357-b4c2-55b1107829c8',
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
    users: [
      {
        id: 'ef77489d-6de5-4357-b4c2-55b1107829c8',
        name: 'User 1',
      },
    ],
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log('New Socket.io server...');
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
    });
    res.socket.server.io = io;
  }

  if (req.method === 'POST') {
    const { type } = req.body;
    switch (type) {
      case Actions.JoinSession: {
        // Get user from request if exists
        const newUser = req.body.user;
        sessions[req.body.sessionId] = {
          ...sessions[req.body.sessionId],
          users: [...sessions[req.body.sessionId].users, newUser],
        };
        res.socket.server.io.emit('update', sessions[req.body.sessionId]);
        res.json(sessions[req.body.sessionId]);
        break;
      }

      case Actions.GetSession: {
        if (!sessions[req.body.sessionId]) {
          res.status(404).json({ error: 'Session not found.' });
          break;
        }
        res.json(sessions[req.body.sessionId]);
        break;
      }

      case Actions.CreateSession: {
        const newSessionId = uuidv4();
        const sessionName = req.body.name;
        const cards = req.body.cards ?? [
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
        ];
        const id = req.body.id ?? uuidv4();
        const user = { id, name: req.body.userName };
        sessions[newSessionId] = {
          revealed: false,
          creating: false,
          id: newSessionId,
          name: sessionName,
          creator_id: user.id,
          cards,
          users: [user],
        };
        res.json({ sessionId: newSessionId, user });
        break;
      }

      case Actions.NewRound: {
        sessions[req.body.sessionId] = {
          ...sessions[req.body.sessionId],
          revealed: false,
          users: sessions[req.body.sessionId].users.map((user) => {
            return {
              ...user,
              played_card: undefined,
            };
          }),
        };
        res.socket.server.io.emit('update', sessions[req.body.sessionId]);
        res.json(sessions[req.body.sessionId]);
        break;
      }

      case Actions.PickCard:
        const { sessionId, card, user } = req.body;
        if (sessions[sessionId].revealed) {
          res.status(403).json({ error: 'Round already revealed' });
          return;
        }
        sessions[sessionId].users = sessions[sessionId].users.map((u) => {
          if (user.id === u.id) {
            return {
              ...u,
              played_card: card,
            };
          }
          return u;
        });

        const shouldReveal = sessions[sessionId].users.every((user) => {
          return Boolean(user.played_card);
        });
        if (shouldReveal) {
          sessions[sessionId] = {
            ...sessions[sessionId],
            revealed: true,
          };
        }

        res.socket.server.io.emit('update', sessions[req.body.sessionId]);

        res.json(sessions[req.body.sessionId]);
        break;

      case Actions.FinishSetupSession:
        sessions[req.body.sessionId] = {
          ...sessions[req.body.sessionId],
          creating: false,
        };
        res.json(sessions[req.body.sessionId]);
        break;
    }
  }

  res.end();
}
