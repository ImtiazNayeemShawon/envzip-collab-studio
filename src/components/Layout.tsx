import { ReactNode } from "react";
import { Search, Settings, User, GitBranch } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CollaborationPanel from "./CollaborationPanel";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-smooth">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EnvSync</h1>
              <p className="text-xs text-muted-foreground">Environment Manager</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-muted/50 border-border focus:bg-card transition-smooth"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant={location.pathname === "/settings" ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            
            <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-smooth">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Collaboration Sidebar */}
        <CollaborationPanel />
      </div>
    </div>
  );
};

export default Layout;