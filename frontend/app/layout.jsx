import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: { default: "Circuit Sages: Earth System Trend Detective", template: "%s | Circuit Sages" },
  description: "Pick a city and a climate variable, see how it has changed since 1980, and find out whether the change is statistically significant. Built on NASA MERRA-2 data.",
  openGraph: { title: "Circuit Sages: Earth System Trend Detective", description: "NASA MERRA-2 trends for five Indian cities, explained in plain language.", type: "website" },
};

export const viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
