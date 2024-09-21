import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Github, Instagram, Linkedin, Mail } from "lucide-react"
import { Analytics } from "@vercel/analytics/react"

const NotoSansSC = localFont({
  src: "/fonts/NotoSansSC-VariableFont_wght.ttf",
  variable: "--font-NotoSansSC",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "andyyhy",
  description: "Andy's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/ay.png" type="image/png" />
      </head>
      <body className={`${NotoSansSC.variable} antialiased`}>
        <div className="w-full border-b border-zinc-800">
          <div className="max-w-4xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" passHref>
                  <Image src="/ay.png" alt="Logo" className="h-12 w-12" width={100} height={100} />
              </Link>
              <Link href="/" passHref>
                <span className="hidden sm:block text-xl font-bold">Andy Yang</span>
              </Link>
            </div>
            <NavigationMenu className="flex justify-center items-center w-full">
              <NavigationMenuList className="flex space-x-4 md:space-x-8">
                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      About Me
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/projects" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Projects
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/cool" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Cool Stuff
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {children}
        <Analytics />
        <footer className="w-full border-t border-zinc-800 mt-8">
          <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex justify-center space-x-6">
            <Link href="mailto:andyyhyang@gmail.com" target="_blank" rel="noopener noreferrer" passHref>
              <Mail />
            </Link>
            <Link href="https://www.linkedin.com/in/andyyhy" target="_blank" rel="noopener noreferrer" passHref>
              <Linkedin />
            </Link>
            <Link href="https://www.instagram.com/andyyhy02/" target="_blank" rel="noopener noreferrer" passHref>
              <Instagram />
            </Link>
            <Link href="https://github.com/andyyhy" target="_blank" rel="noopener noreferrer" passHref>
              <Github />
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
