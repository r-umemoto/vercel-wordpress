This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 環境構築
1. gcpのマーケットプレースからWordPress Certified by Bitnami and Automatticを選んで構築
ぷらぐいん：WPGraphQL
2. ローカルでvercelの開発環境を構築

### ローカルでのWordPress環境構築 (Docker)

ローカルでWordPress環境も同時に動かして開発する場合、Docker Compose を利用するのが便利です。

1. `docker-compose.yaml` の `environment` セクションにあるパスワードを任意のものに変更します。
2. 以下のコマンドでWordPressとデータベースを起動します。
   ```bash
   docker-compose up -d
   ```
3. ブラウザで `http://localhost:8080` にアクセスし、WordPressの初期設定を行います。
4. 管理画面から `WPGraphQL` プラグインをインストール・有効化します。
5. Next.jsアプリが `http://localhost:8080/graphql` を参照するように設定します。
