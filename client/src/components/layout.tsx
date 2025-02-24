import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Image,
  UserCircle,
  LightbulbIcon,
  Wallet,
} from "lucide-react";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  isActive: boolean;
}

function NavItem({ href, children, icon, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className="w-full aspect-square justify-center lg:aspect-auto lg:justify-start gap-2 p-0 lg:px-4"
      >
        {icon}
        <span className="hidden lg:inline">{children}</span>
      </Button>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isLoggedIn } = useGetLoginInfo();

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden lg:block lg:fixed top-0 bottom-0 w-[240px] border-r bg-card p-6">
        <div className="flex items-center gap-2 mb-8">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-xl">NFT Gallery</h1>
        </div>

        <nav className="flex flex-col h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            <NavItem
              href="/"
              icon={<Image className="h-4 w-4" />}
              isActive={location === "/"}
            >
              Home
            </NavItem>
            <NavItem
              href="/gallery"
              icon={<Palette className="h-4 w-4" />}
              isActive={location === "/gallery"}
            >
              Gallery
            </NavItem>
            <NavItem
              href="/governance"
              icon={<LightbulbIcon className="h-4 w-4" />}
              isActive={location === "/governance"}
            >
              Governance
            </NavItem>
            <NavItem
              href="/profile"
              icon={<UserCircle className="h-4 w-4" />}
              isActive={location === "/profile"}
            >
              Profile
            </NavItem>
          </div>
          <div className="mt-auto">
            <NavItem
              href="/unlock"
              icon={<Wallet className="h-4 w-4" />}
              isActive={location === "/unlock"}
            >
              {isLoggedIn ? "Disconnect" : "Connect"}
            </NavItem>
          </div>
        </nav>
      </aside>

      <main className="lg:ml-[240px] p-6 pb-20 lg:pb-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-2 lg:hidden">
        <nav className="grid grid-cols-4 gap-1">
          <NavItem
            href="/"
            icon={<Image className="h-4 w-4" />}
            isActive={location === "/"}
          >
            Home
          </NavItem>
          <NavItem
            href="/gallery"
            icon={<Palette className="h-4 w-4" />}
            isActive={location === "/gallery"}
          >
            Gallery
          </NavItem>
          <NavItem
            href="/profile"
            icon={<UserCircle className="h-4 w-4" />}
            isActive={location === "/profile"}
          >
            Profile
          </NavItem>
          <NavItem
            href="/unlock"
            icon={<Wallet className="h-4 w-4" />}
            isActive={location === "/unlock"}
          >
            Unlock
          </NavItem>
        </nav>
      </div>
    </div>
  );
}
