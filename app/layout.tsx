import type { ReactNode } from "react";

export const metadata = {
  title: "Outbound Meeting Engine",
  description: "Personalized multi-step outbound that books meetings.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, sans-serif", color: "#111", background: "#fafafa" }}>
        {children}
      </body>
    </html>
  );
}
