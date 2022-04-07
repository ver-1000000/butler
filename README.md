# バトラー
Node.jsサーバーで動作させることを前提とした、
TypeScript実装のDiscord Botです。

HerokuやGCPにデプロイすると無料枠で動かせてイイカンジです

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

## ファイル・ディレクトリ構成
本プロジェクトは [npmのWorkspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)を利用したモノリポ構成となっております。

```
.
├── package.json
├── tsconfig.base.json    # モノリポのパッケージ達に継承されるベースのtsconfig.json
├── tsconfig.json         # referencesで関連のtsconfig.jsonをまとめる、ビルド用tsconfig.json
├── packages/             # モノリポのパッケージ郡が格納されるディレクトリ
│   ├── core/             # 共通で利用するライブラリや定数、機能など
│   │   └── ... # 省略
│   ├── worker/           # Discordのイベントを常時監視するワーカー関連の機能
│   │   └── ... # 省略
│   └── web/              # ブラウザからBOTを操作するための、Next.jsによるUIを提供 (開発中)
│       └── ... # 省略
└── ... # 省略
```

## ローカルでの環境構築
### 前提
- 対象のDiscordサーバーにBOTがログインしている状態にしておくこと
- `node.js`のいい感じの環境を整えておくこと
- Redisサーバーにアクセスできること

### 手順
1. 本リポジトリをクローンし、`npm ci`を実行する
2. プロジェクトのルートディレクトリにある`.env.sample`をコピーして`.env`を作成する
3. `.env`ファイルを編集して環境変数を設定する
4. `npm run dev`を行うと、開発用サーバーが立ち上がり、ファイルの変更検知込のビルド&サービングを行う

## Herokuへのデプロイ
1. クローンしたリポジトリをHerokuに上げる
2. Herokuの環境変数を設定する
   - WAKEUP_URLにアプリのURLを設定するのを忘れないこと
3. Heroku Redisアドオンを設定し、Redisサーバーの環境変数を確認する(他のRedisサーバーを使う人はよしなに)
4. web dynoを再起動すると、`npm start` が実行され正常に動作をし始める

## GCE(Google Compute Engine)へのデプロイ
1. VMインスタンスを作り、VPCネットワーク ファイアウォールルールで、ポート3000の上りパケットを許可する設定を追加する
2. VMインスタンス内のnode.jsやGitなどの前提条件を整え、仮想環境でリポジトリをクローンする
3. Redisをインストールしてsystemctlとかで有効化する
4. 環境変数を整える
5. `npm ci`して`npm run build`して`npm run start`するとwebサーバーとworkerサーバーが起動する
   - `npm ci`にめちゃくちゃ時間(1時間弱くらいとか)がかかるかも？ node 16の問題らしいがworkspacesを利用したいので我慢
   - 一応、メモリ1GBとかならサーバーにSwap領域を設定しておいたほうがいいかも

## 環境変数(.envファイル)の説明
- `DISCORD_TOKEN`: Discord APIを利用するために必要なトークン
- `NOTIFY_TEXT_CHANNEL_ID`: 通知など、BOTが自発的に発言する際のテキストチャンネルID
- `POMODORO_VOICE_CHANNEL_ID`: ポモドーロ機能で利用するボイスチャンネルのID
- `REDIS_URL`: 利用するRedisサーバーのURI
- `DETECT_STICKER_RATE`: チャットがstickerの正規表現にマッチした際の反応率を、0.0-1.0で記述(0は無効化、1.0のときは必ず反応)
- `WAKEUP_URL`: Herokuのように、アクセスがないとsleepしてしまうPaaSなどに対して、定期的にGETリクエストを送るためのURL

## その他
### チャンネルのIDどうやって見るん？
[WebブラウザからDiscordにアクセス](https://discord.com/app/)して、お目当てのチャンネルのURL見ればなんとなくわかると思います。

音声チャンネルはURLが表示されないので、開発者ツールとかで該当音声チャンネルのDOMを見るとなんとなくわかると思います。
