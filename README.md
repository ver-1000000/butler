# バトラー
Herokuやglitch上のnode.jsサーバーで動作させることを前提とした、
TypeScript実装のDiscord Botです。

- https://github.com/ver-1000000/butler.git

## 機能
- ボイスチャンネルが開始された際の通知
- 特殊なコマンドの提供
  - `!memo`コマンド - 発言のメモ
    - タイトル/本文がセットになった文字列のCRUDを提供
  - `!pomodoro`コマンド - ポモドーロタイマー機能
    - 特定の音声チャンネルで、マイクのミュートを利用した擬似的なポモドーロタイマーを提供
  - `!wiki`コマンド - [wikipedia](https://ja.wikipedia.org/)からの引用
    - wikipediaから単語の概要を引用して発言・リンクする
  - `!sticker`コマンド - チャットに反応するスタンプ機能
    - 正規表現と対応する画像URLを登録し、チャットがマッチした際Botに発言させることで、スタンプ機能のように振る舞わせる

それぞれのコマンドの詳細については、実装をご覧いただくか、本Bot起動後、コマンドに引数を付けずに実行することで詳細なヘルプが表示されます。

## ローカルでの環境構築
### 前提
- 対象のDiscordサーバーにBOTがログインしている状態にしておくこと
- `node.js`のいい感じの環境を整えておくこと
- Redisサーバーにアクセスできること

### 手順
1. 本リポジトリをクローンし、`npm ci`を実行する
2. プロジェクトのルートディレクトリにある`.env.sample`をコピーして`.env`を作成する
3. `.env`ファイルを編集して環境変数を設定する
4. `npm start`を行うと、アプリが起動し指定されたDiscordサーバーでBOTが動作し始まる
   - `npm run dev`を行うと、開発用サーバーが立ち上がり、ファイルの変更検知込のビルドを行う

## Glitchへのデプロイ
### 前提
- DiscordサーバーにBOTがログインしている状態にしておくこと
- Glitchのアカウントを作成し、ログインしておくこと

### 手順
1. https://glitch.com/ のヘッダーにある `New Project` から `Import from GitHub` を選択して `https://github.com/ver-1000000/butler` を入力する
2. Glitchのエディター画面に飛ばされ、しばらくするとエディター画面が表示され操作が可能になる
3. ファイルが編集できるようになるので、`.env`というファイルを編集して環境変数を設定する
4. `Tools` > `Terminal` からターミナルに入り、プロジェクトを動かすためのコマンドを入力する
   - `enable-npm`を実行して、Node 16のnpmを有効化する
     - https://glitch.happyfox.com/kb/article/59-can-i-change-the-version-of-node-js-my-project-uses/ を確認すること
   - `./setup-redis.sh` を実行してRedisサーバーをインストール(5-10分かかる)する
5. 問題がなければ、Glitchのコンテナが再起動し、BOTが動作し始める

### 注意
無料プランのGlitch Projectは **5分間放置するとCold状態** になります。

なので、外部から定期的にURLを叩いてCOLDにならないようにする必要があります。  
[Google Apps Script](https://script.google.com/)の場合、以下のコードを `awake.gs` という名前で保存して、  
`トリガー`メニューから**5分おきに`wakeGlitch`を実行する分ベースのタイマー**を作成します。

```gs
const GLITCH_URL = 'https://your-glitch-url.glitch.me';
const wakeGlitch = () => sendGlitch(GLITCH_URL, { type: 'wake' });
const sendGlitch = (uri, json) => {
  const contentType        = 'application/json; charset=utf-8';
  const method             = 'post';
  const payload            = json;
  const muteHttpExceptions = true;
  const params             = { contentType, method, payload, muteHttpExceptions };
  UrlFetchApp.fetch(uri, params);
};
```

## Herokuへのデプロイ
コードをクローンしていい感じにHerokuにあげると、あとはpushするたびにビルドが走ってBOTが動作し始めます。

Heroku Redisなどを利用して、REDIS_URLを設定するのも忘れないようにしてください。

## 環境変数(.envファイル)の説明
- `DISCORD_TOKEN`: Discord APIを利用するために必要なトークン
- `NOTIFY_TEXT_CHANNEL_ID`: 通知など、BOTが自発的に発言する際のテキストチャンネルID
- `POMODORO_VOICE_CHANNEL_ID`: ポモドーロ機能で利用するボイスチャンネルのID
- `REDIS_URL`: 利用するRedisサーバーのURI
- `DETECT_STICKER_RATE`: チャットがstickerの正規表現にマッチした際の反応率を、0.0-1.0で記述(0は無効化、1.0のときは必ず反応)

## その他
### チャンネルのIDどうやって見るん？
[WebブラウザからDiscordにアクセス](https://discord.com/app/)して、お目当てのチャンネルのURL見ればなんとなくわかると思います。

音声チャンネルはURLが表示されないので、開発者ツールとかで該当音声チャンネルのDOMを見るとなんとなくわかると思います。
