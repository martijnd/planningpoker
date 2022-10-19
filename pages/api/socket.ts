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
    ],
    users: [
      {
        id: 'f',
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
      case Actions.JoinSession:
        const name = req.body.name;
        sessions[req.body.sessionId] = {
          ...sessions[req.body.sessionId],
          users: [
            ...sessions[req.body.sessionId].users,
            { id: uuidv4(), name },
          ],
        };
        res.socket.server.io.emit('update', sessions[req.body.sessionId]);
        res.json(sessions[req.body.sessionId]);
        break;

      case Actions.GetSession:
        res.json(sessions[req.body.sessionId]);
        break;

      case Actions.CreateSession:
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
        ];
        const newUser = { id: uuidv4(), name: req.body.userName };
        sessions[newSessionId] = {
          revealed: false,
          creating: false,
          id: newSessionId,
          name: sessionName,
          cards,
          users: [newUser],
        };
        res.json({ sessionId: newSessionId, user: newUser });
        break;

      case Actions.PickCard:
        const { sessionId, card, user } = req.body;
        sessions[sessionId].users = sessions[sessionId].users.map((u) => {
          if (user.id === u.id) {
            return {
              ...u,
              played_card: card,
            };
          }
          return u;
        });
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
