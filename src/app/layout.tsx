import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyMenu - Digital Menu Management System',
  description: 'Create and manage digital menus for your restaurant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
