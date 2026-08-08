import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import { CurrencyProvider } from "./currency-provider";
import { LanguageProvider } from "./language-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "The Matrix Hotel",
  description: "Book your perfect stay at The Matrix Hotel.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>{children}</CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
