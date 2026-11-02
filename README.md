# やりくり家計簿

## PayPay の自動記録（Android）
1. Cloudflare → Workers & Pages → money → Settings → Variables and Secrets → 追加
   種類は **Secret**、名前 `PAY_KEY`、値は長い合言葉（例: ランダムな英数字20文字以上）。保存してデプロイ。
2. Android に MacroDroid（または Tasker）を入れ、通知へのアクセスを許可。
3. マクロを作成:
   - トリガー: 通知を受信 → アプリ「PayPay」を選択
   - アクション: HTTPリクエスト
     - URL: `https://money.atb76-univ.workers.dev/api/pay?key=<PAY_KEY の値>`
     - メソッド: POST / コンテンツタイプ: text/plain
     - 本文: 通知のタイトルと本文を差し込む変数
4. PayPay アプリで「支払いと入出金に関する取引」の通知をオンにする。
5. 実際に少額を支払い、アプリの「支出ログ」に「PayPay・未確認」で出るか確認。

URL の key は他人に教えないでください。決済は仕送りから引かれ、ログ上のボタンで仕送り／バイト代を切り替えると確認済みになります。
