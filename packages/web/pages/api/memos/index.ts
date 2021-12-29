import { Request, Response } from "express";
import Redis from 'ioredis';
import { REDIS_URL } from '@butler/core';

const HKEY    = 'MEMO';
const redis   = new Redis(REDIS_URL);
const handler = async (_req: Request, res: Response) => {
  const data = await redis.hgetall(HKEY);
  res.status(200).json(data);
}
export default handler;
