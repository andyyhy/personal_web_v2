import type { Metadata } from "next";

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
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';

const NotoSansSC = localFont({
  src: "/fonts/NotoSansSC-VariableFont_wght.ttf",
  variable: "--font-NotoSansSC",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "andyyhy - Andy Yu Han Yang",
  description: "Andy Yu Han Yang's personal website",
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
        <div className="w-full border-b border-zinc-800 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl w-full mx-auto py-4 px-2 sm:px-4 md:px-6 flex flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" passHref>
                <span className="hidden sm:block text-xl font-bold text-[#8BC34A]">Andy Yang</span>
              </Link>
            </div>
            <NavigationMenu className="flex justify-center items-center w-full text-gray-400">
              <NavigationMenuList className="flex space-x-4 md:space-x-8">
                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()}`}>
                      About Me
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/projects" legacyBehavior passHref>
                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()} hover:bg-[#8BC34A]`}>
                      Projects
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/cool" legacyBehavior passHref>
                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()} hover:bg-[#8BC34A]`}>
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
        <SpeedInsights />
        <footer>
          <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center space-y-4">
            <div className="flex flex-row space-x-4 lg:fixed lg:bottom-6 lg:left-6 lg:flex-col lg:space-y-4 lg:space-x-0">
              <Link href="mailto:andyyhyang@gmail.com" target="_blank" rel="noopener noreferrer" passHref>
                <Mail className="h-6 w-6 text-gray-500 hover:text-[#8BC34A] transition-colors duration-200" />
              </Link>
              <Link href="https://www.linkedin.com/in/andyyhy" target="_blank" rel="noopener noreferrer" passHref>
                <Linkedin className="h-6 w-6 text-gray-500 hover:text-[#8BC34A] transition-colors duration-200" />
              </Link>
              <Link href="https://www.instagram.com/andyyhy02/" target="_blank" rel="noopener noreferrer" passHref>
                <Instagram className="h-6 w-6 text-gray-500 hover:text-[#8BC34A] transition-colors duration-200" />
              </Link>
              <Link href="https://github.com/andyyhy" target="_blank" rel="noopener noreferrer" passHref>
                <Github className="h-6 w-6 text-gray-500 hover:text-[#8BC34A] transition-colors duration-200" />
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Andy Yu Han Yang. All rights reserved.
            </p>
          </div>
        </footer>
        
      </body>
    </html>
  );
}
