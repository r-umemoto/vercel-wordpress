# 1. ベースイメージの指定
# 公式のNode.js v18の軽量イメージを使用します
FROM node:18-alpine

# 2. 作業ディレクトリの作成
# コンテナ内での作業場所を設定します
WORKDIR /app

# 3. 依存関係のインストール
# package.jsonとlockファイルを先にコピーして、効率的に依存関係をインストールします
COPY package*.json ./
RUN npm install

# 4. ソースコードのコピー
# プロジェクトの全てのファイルをコンテナ内にコピーします
COPY . .

# 5. ポートの開放
# Next.jsのデフォルトポート3000番を開放します
EXPOSE 3000

# 6. 開発サーバーの起動コマンド
# コンテナ起動時に`npm run dev`を実行します
CMD ["npm", "run", "dev"]
