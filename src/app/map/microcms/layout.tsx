import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map Field for microCMS",
  description: "Google Map integration for microCMS custom field",
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}