import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Actions } from '@types';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

const sessions: Record<string, any> = {
  'ebce1aea-f816-44b7-b38b-7e61baf64d5e': {
    id: 'ebce1aea-f816-44b7-b38b-7e61baf64d5e',
    name: 'Test',
    creating: true,
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
        const sessionId = uuidv4();
        const user = { id: uuidv4(), name: req.body.userName };
        sessions[sessionId] = {
          id: sessionId,
          name: req.body.name,
          users: [user],
        };
        res.json({ sessionId, user });
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
