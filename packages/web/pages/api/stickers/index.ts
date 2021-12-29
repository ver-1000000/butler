import { Request, Response } from "express";
import Redis from 'ioredis';
import { REDIS_URL } from '@butler/core';
import { Sticker } from '@butler/worker/src/stores/stickers.store';

/** Redisで利用するトップキー。 */
const HKEY    = 'STICKER';
const redis   = new Redis(REDIS_URL);
const handler = async (_req: Request, res: Response) => {
  const entries = Object.entries(await redis.hgetall(HKEY));
  const data    = entries.reduce<Record<string, Sticker>>((a, [k, v]) => ({ ...a, [k]: JSON.parse(v) }), {});
  res.status(200).json(data);
}
export default handler;
