import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "RUサンプル物件検索  | RU不動産",
    template: "%s | RU不動産 (サンプル)",
  },
  description: "【サンプルプロジェクト】RU不動産で理想の物件を見つけましょう。最新の物件情報をリアルタイムで検索できます。",
};

export default function RootLayout({ 
    children,
 }: Readonly<{ 
    children: React.ReactNode; 
 }>) {
  return (
    <>
        <Header />
        <main>{children}</main>
    </>
  );
}
