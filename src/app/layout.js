import "./globals.css";

export const metadata = {
  title: "SpeakUp CRM",
  description: "Мини-CRM для ИИ-ассистента Ани",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
