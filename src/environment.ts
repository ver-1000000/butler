require('dotenv').config();

/** `.env`ファイルから定数を読み取ってオブジェクトとして提供する環境変数。 */
export const {
  DISCORD_TOKEN,
  NOTIFY_TEXT_CHANNEL_ID,
  POMODORO_VOICE_CHANNEL_ID,
  REDIS_URL,
  DETECT_STICKER_RATE
} = process.env;

