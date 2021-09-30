import { Client, Message } from 'discord.js';

import { DETECT_STICKER_RATE } from 'src/environment';
import { PrettyText } from 'src/lib/pretty-text';
import { StickersStore } from 'src/stores/stickers.store';

/** `GenerateText.help`に食わせるヘルプ文の定数。 */
const HELP = {
  DESC: `\`!sticker\` コマンド - チャットを監視して、正規表現にマッチしたスタンプ画像を表示する機能`,
  ITEMS: [
    ['!sticker.set http://example.com/hoge.jpg /abc/', '`http://example.com/hoge.jpg` に正規表現 `/abc/` を設定(新規追加/上書き)します'],
    ['!sticker.remove http://example.com/hoge.jpg', '`http://example.com/hoge.jpg` が設定されていれば削除します'],
    ['!sticker.help', '`!sticker` コマンドのヘルプを表示します(エイリアス: `!sticker`)']
  ]
} as const;

/** `StickersStore`の値を操作するサービスクラス。 */
export class StickerService {
  constructor(private client: Client, private stickersStore: StickersStore) {}

  /** Clientからのイベント監視を開始する。 */
  run() {
    this.client.on('message', message => this.onMessage(message));
    return this;
  }

  /** `message`で関数を振り分けるファサード。 */
  private onMessage(message: Message) {
    const content   = message.content;
    const body      = content.replace(/!sticker\.?\w*\s*\n*/, '').trim(); // コマンド以外のテキスト部分
    if (message.author.bot) { return; } // botの発言は無視
    if (content.startsWith('!sticker.set')) { this.set(message, { body }); };
    if (content.startsWith('!sticker.remove')) { this.remove(message, { body }); };
    if (content.startsWith('!sticker.help') || content === '!sticker') { this.help(message); };
    if (!content.startsWith('!')) { this.sendSticker(message); }
  }

  /** `!sticker.set` コマンドを受け取った時、第一引数をキーに、第二引数を値にしたものを登録する。 */
  private async set({ channel }: Message, { body }: { body: string }) {
    const key   = body.replace(/\s.*/g, '');
    const value = body.replace(key, '').trim().replace(/^\/|\/$/g, '');
    channel.send((await this.stickersStore.set(key, value)).pretty);
  }

  /** `!sticker.remove` コマンドを受け取った時、第一引数にマッチする値を削除する。 */
  private async remove({ channel }: Message, { body: url }: { body: string }) {
    channel.send((await this.stickersStore.del(url)).pretty);
  }

  /** ヘルプを表示する。 */
  private help({ channel }: Message) {
    const text = PrettyText.helpList(HELP.DESC, ...HELP.ITEMS);
    channel.send(text);
  }

  /** チャットからStickerの正規表現を検知した場合、DETECT_STICKER_RATEに従ってStickerを送信する。 */
  private async sendSticker({ channel, mentions, content }: Message) {
    const detectSticker = async ({ content, mentions }: Pick<Message, 'content' | 'mentions'>) => {
      const hasUrl       = content.includes('http');
      const mentioned    = !!this.client.user && mentions.has((this.client.user));
      const failedRandom = Math.random() >= (Number(DETECT_STICKER_RATE) || 0);
      if (mentioned || hasUrl || failedRandom) { return null; } // 検知無用のときは早期リターン
      const data     = (await this.stickersStore.data()).value;
      const stickers = Object.entries(data).map(([_, sticker]) => sticker);
      const urls     = stickers.reduce<string[]>((a, { id, regexp }) => new RegExp(regexp).test(content) ? a.concat(id) : a, []);
      const url      = urls[new Date().getMilliseconds() % urls.length] || '';
      const sticker  = data[url];
      const regexp   = sticker?.regexp || '';
      return url ? `${url} ||/${regexp}/||` : null;
    }
    const text = await detectSticker({ mentions, content });
    if (text) { channel.send(text); }
  }
}
