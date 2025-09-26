# vercel-wordpress

VercelとヘッドレスWordPressを連携させるためのプロジェクトです。
フロントエンドはNext.jsを想定しています。

## 環境構築

このプロジェクトは、フロントエンドの開発環境としてDockerを利用します。

### 必要なツール
*   [Docker](https://www.docker.com/get-started)
*   [Node.js (npm/npx)](https://nodejs.org/ja/) (v18.x 以上) - Next.jsの初期セットアップ(`npx create-next-app`)にのみ使用します。
*   Windowsをお使いの場合は、[WSL2](https://learn.microsoft.com/ja-jp/windows/wsl/install) の利用を推奨します。

### WordPress環境
ヘッドレスCMSとして利用するWordPress環境を別途ご用意ください。（例: クラウドサーバー、ローカル環境など）
1. google cloudのMarketPlaceでWordPress Certified by Bitnami and Automatticを選択して構築
2. word pressにログインしてプラグインを追加
WPGraphQL

### 手順

1.  **リポジトリをクローンします**
    ```bash
    git clone https://github.com/<your-account>/vercel-wordpress.git
    cd vercel-wordpress
    ```

2.  **Next.jsアプリケーションを作成します**
    クローンしたディレクトリの中で、Next.jsプロジェクトの雛形を作成します。
    ```bash
    # カレントディレクトリにNext.jsプロジェクトを作成
    npx create-next-app@latest .
    ```
    実行すると対話形式で質問されます。以下は推奨設定です（お好みで変更してください）。
    ```
    ✔ Would you like to use TypeScript? … Yes
    ✔ Would you like to use ESLint? … Yes
    ✔ Would you like to use Tailwind CSS? … No
    ✔ Would you like to use `src/` directory? … Yes
    ✔ Would you like to use App Router? (recommended) … Yes
    ✔ Would you like to customize the default import alias? … No
    ```

3.  **環境変数を設定します**
    `.env.local.example` ファイルをコピーして `.env.local` を作成し、WordPressの情報を設定します。
    ```bash
    cp .env.local.example .env.local
    ```
    `.env.local`の中身を編集:
    ```
    WORDPRESS_API_URL=https://your-wordpress-site.com/graphql
    ```

4.  **開発サーバーを起動します (Docker)**
    以下のコマンドで、Dockerコンテナをビルドして起動します。
    ```bash
    docker-compose up --build
    ```
    ブラウザで `http://localhost:3000` にアクセスすると、開発中のサイトが表示されます。
    
    *   2回目以降の起動は `docker-compose up` だけでOKです。
    *   コードを編集すると、変更が自動で反映されます。

5.  **開発環境を停止します**
    ターミナルで `Ctrl + C` を押した後、以下のコマンドを実行するとコンテナが停止・削除されます。
    ```bash
    docker-compose down
    ```

## デプロイ

[!Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F<your-account>%2Fvercel-wordpress)

Vercelにデプロイする際は、環境変数 `WORDPRESS_API_URL` をVercelのプロジェクト設定画面から登録してください。