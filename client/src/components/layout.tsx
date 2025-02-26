import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Palette, Image, UserCircle, LightbulbIcon, Coins, Menu, CircleDollarSign } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import { logout } from "@multiversx/sdk-dapp/utils";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, children, icon, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className="w-full justify-start gap-2"
        onClick={onClick}
      >
        {icon}
        {children}
      </Button>
    </Link>
  );
}

const NAV_ITEMS = [
  { href: "/", icon: <Image className="h-4 w-4" />, label: "Home" },
  { href: "/gallery", icon: <Palette className="h-4 w-4" />, label: "Gallery" },
  { href: "/create", icon: <Image className="h-4 w-4" />, label: "Create NFT" },
  { href: "/stake", icon: <Coins className="h-4 w-4" />, label: "Stake" },
  { href: "/governance", icon: <LightbulbIcon className="h-4 w-4" />, label: "Governance" },
  { href: "/faucet", icon: <CircleDollarSign className="h-4 w-4" />, label: "Faucet" },
  // { href: "/profile", icon: <UserCircle className="h-4 w-4" />, label: "Profile" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn } = useGetLoginInfo();

  const renderNavItems = (onClick?: () => void) => (
    <nav className="flex flex-col h-full">
      <div className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            isActive={location === item.href}
            onClick={onClick}
          >
            {item.label}
          </NavItem>
        ))}
      </div>
      <div className="mt-auto pt-4">
        {!isLoggedIn && <NavItem
          key={'/unlock'}
          href={'/unlock'}
          icon={<UserCircle className="h-4 w-4" />}
          isActive={location === '/unlock'}
          onClick={onClick}
        >
          Connect Wallet
        </NavItem>}
        {isLoggedIn && <NavItem
          key={'/'}
          href={'/'}
          icon={<UserCircle className="h-4 w-4" />}
          isActive={location === '/logout'}
          onClick={() => {
            logout('/');
            onClick?.();
          }}
        >
          Logout
        </NavItem>}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen h-screen bg-background">
      <div className="grid lg:grid-cols-[240px_1fr] h-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col border-r bg-card p-6">
          <div className="flex items-center gap-2 mb-8">
            <Palette className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-xl">NFT Gallery</h1>
          </div>
          <div className="flex-1">
            {renderNavItems()}
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="sticky top-0 z-50 border-b bg-background lg:hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <h1 className="font-bold text-xl">NFT Gallery</h1>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center gap-2">
                      <Palette className="h-6 w-6 text-primary" />
                      <span>NFT Gallery</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                  {renderNavItems(() => setMobileOpen(false))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <main className="p-6 h-full overflow-auto">{children}</main>
      </div>
    </div>
  );
}