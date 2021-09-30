import level from 'level';

import { PrettyText } from 'src/lib/pretty-text';

/** ストアにアクセスした結果を使いやすくするためにラップする型。 */
interface StoreResult<T = string | Record<string, string>> {
  /** ストアにアクセスした結果をユーザーフレンドリーな文字列として整形した値。 */
  pretty: string;
  /** ストアにアクセスするのに利用されたkey。 */
  key?: string;
  /** ストアにアクセスして取り出されたvalue。 */
  value: T;
}

export interface Sticker {
  /** 一意になるURL。 */
  id: string;
  /** ステッカーが呼び出される根拠となる正規表現。 */
  regexp: string;
}

/** 画像と正規表現のレコードを表すクラス。 */
export class StickersStore {
  private store: level.LevelDB<string, string> = level('.data/sticker');

  constructor() {}

  /** 設定されている値をすべて取得する。 */
  async data(): Promise<StoreResult<Record<string, Sticker>>> {
    const read = () => new Promise<Record<string, Sticker>>(resolve => {
      const stream                         = this.store.createReadStream();
      const buffer: Record<string, Sticker> = {};
      stream.on('data', chunk => buffer[chunk.key] = JSON.parse(chunk.value));
      stream.on('end', () => resolve(buffer));
    });
    const value  = await read();
    const pretty = PrettyText.markdownList('', ...Object.entries(value).map<[string, string]>(([k, v]) => [k, v.regexp]));
    return { pretty, value };
  }

  /** データストアから値を取得する。 */
  async get(key: string): Promise<StoreResult<Sticker | null>> {
    const result = this.store.get(key).catch(reason => (reason.name === 'NotFoundError' ? 'null' : (() => { throw reason; })()));
    const value  = JSON.parse(await result) as Sticker | null;
    const pretty = value == null ? `**${key}** は設定されていません:cry:` : ` **\`${key}\`** \`/${value.regexp}/\``;
    return { pretty, key, value };
  }

  /** データストアに値を設定する。 */
  async set(key: string, value: string): Promise<StoreResult<string>> {
    await this.store.put(key, JSON.stringify({ id: key, regexp: value }));
    const pretty = `**\`${key}\`** に **\`/${value}/\`** を設定しました:pleading_face:`;
    return { pretty, key, value };
  }

  /** データストアから値を削除する。 */
  async del(key: string): Promise<StoreResult<Sticker | null>> {
    const value  = (await this.get(key)).value;
    const pretty = value == null ? `**${key}** は設定されていません:cry:` : `**${key}** を削除しました:wave:${
      value ? '\n' + PrettyText.code(value.regexp) : ''
    }`;
    if (value != null ) { await this.store.del(key); }
    return { pretty, key, value };
  }
}
