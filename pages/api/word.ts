import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from './socket';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method === 'POST') {
    // get word
    const word = req.body;

    // dispatch to channel "word"
    res?.socket?.server?.io?.emit('word', word);

    // return word
    res.status(201).json(word);
  }
}
