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
      <body className={`${NotoSansSC.variable} antialiased`}>
        <div className="w-full border-b border-zinc-800">
          <div className="max-w-4xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="ay.png" alt="Logo" className="h-12 w-12" />
              <span className="hidden sm:block text-xl font-bold">Andy Yang</span>
            </div>
            <NavigationMenu className="flex justify-center items-center w-full">
              <NavigationMenuList className="flex space-x-4 md:space-x-8">
                <NavigationMenuItem>
                  <Link href="/docs" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      About Me
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/docs" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Projects
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/docs" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Fun Stuff
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
