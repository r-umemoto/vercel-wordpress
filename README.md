# vercel-wordpress

VercelとヘッドレスWordPressを連携させるためのプロジェクトです。
フロントエンドはNext.jsを想定しています。

## 環境構築

### 作業環境
* windows11
* wls2

### WordPress
1. google cloudのMarketPlaceでWordPress Certified by Bitnami and Automatticを選択して構築
2. word pressにログインしてプラグインを追加
WPGraphQL

### ローカル環境
1. ubuntu 24.04 LTSをインストール
2. dockerをインストール

### 必要なツール
*   [Node.js](https://nodejs.org/ja/) (v18.x 以上)
*   [npm](https://www.npmjs.com/) または [yarn](https://yarnpkg.com/)
*   [Vercel CLI](https://vercel.com/docs/cli) (任意)

### 手順

1.  **リポジトリをクローンします**
    ```bash
    git clone https://github.com/<your-account>/vercel-wordpress.git
    cd vercel-wordpress
    ```

2.  **依存関係をインストールします**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **環境変数を設定します**
    `.env.local.example` ファイルをコピーして `.env.local` を作成し、WordPressの情報を設定します。
    ```bash
    cp .env.local.example .env.local
    ```
    `.env.local`の中身:
    ```
    WORDPRESS_API_URL=https://your-wordpress-site.com/graphql
    ```

4.  **開発サーバーを起動します**
    ```bash
    npm run dev
    ```
    http://localhost:3000 で開発中のサイトを確認できます。

## デプロイ

[!Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F<your-account>%2Fvercel-wordpress)

Vercelにデプロイする際は、環境変数 `WORDPRESS_API_URL` をVercelのプロジェクト設定画面から登録してください。