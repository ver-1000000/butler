import { Request, Response } from "express";
import Redis from 'ioredis';
import { REDIS_URL } from '@butler/core';

const HKEY    = 'MEMO';
const redis   = new Redis(REDIS_URL);
const handler = async (req: Request, res: Response) => {
  const { id } = req.query;
  const data = await redis.hget(HKEY, String(id));
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Not Found.' });
  }
}
export default handler;
