import "./globals.css";

export const metadata = {
  title: "Limes Dekor | Personalizowane dekoracje",
  description:
    "Dekoracje i prezenty tworzone na śluby, urodziny, Wielkanoc i Boże Narodzenie.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
