# やりくり家計簿（Cloudflare Workers 版）

URLを開いた人は誰でも同じデータを見て編集できます（ログイン不要）。
データは Cloudflare の Durable Object に1つだけ保存されます。無料プランで動きます。

## デプロイ
1. Cloudflare アカウントを作成（無料）。
2. このフォルダで実行:
   ```
   npm install -g wrangler   # または npx wrangler
   npx wrangler login
   npx wrangler deploy
   ```
3. 表示された `https://okozukai.<あなた>.workers.dev` をスマホ・PCで開けば同期されます。

GitHub に置く場合は、このフォルダをリポジトリにして Cloudflare ダッシュボードの
「Workers & Pages → Create → Import a repository」で連携すると、push のたびに自動デプロイされます。

## 注意
- URLを知っている人は誰でも閲覧・編集できます。他人に教えないでください。
- 2台で同時に編集した場合は、後から保存した内容が残ります（10秒ごと・画面に戻った時に自動で最新を取得）。
- 通信できない時はその端末に保存し、復帰後に同期します。
