import { Request, Response } from "express";
import Redis from 'ioredis';
import { REDIS_URL } from '@butler/core';
import { Sticker } from '@butler/worker/src/stores/stickers.store';

/** Redisで利用するトップキー。 */
const HKEY    = 'STICKER';
const redis   = new Redis(REDIS_URL);
const handler = async (req: Request, res: Response) => {
  const { id } = req.query;
  const data: Sticker | null = JSON.parse((await redis.hget(HKEY, String(id))) ?? 'null');
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Not Found.' });
  }
}
export default handler;
