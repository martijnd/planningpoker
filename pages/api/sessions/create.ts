import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '../socket';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method === 'POST') {
    res?.socket?.server?.io?.emit('create-session', sessionId);

    // return word
    res.status(201).json({ sessionId });
  }
}
