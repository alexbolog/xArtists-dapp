import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Palette, Image, UserCircle, LightbulbIcon } from "lucide-react";

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
        className="w-full justify-start gap-2"
      >
        {icon}
        {children}
      </Button>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block border-r bg-card p-6">
          <div className="flex items-center gap-2 mb-8">
            <Palette className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-xl">NFT Gallery</h1>
          </div>

          <nav className="space-y-2">
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
              href="/create" 
              icon={<Image className="h-4 w-4" />}
              isActive={location === "/create"}
            >
              Create NFT
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
          </nav>
        </aside>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}