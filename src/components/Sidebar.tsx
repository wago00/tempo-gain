import { Calendar, Clock, Users, BarChart3, FolderOpen, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: BarChart3 },
  { id: "calendar", name: "Calendario", icon: Calendar },
  { id: "projects", name: "Progetti", icon: FolderOpen },
  { id: "clients", name: "Clienti", icon: Users },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">TimeTracker Pro</h1>
        <p className="text-sm text-muted-foreground">Gestione tempo e progetti</p>
        {user && (
          <p className="text-xs text-muted-foreground mt-2">
            {user.email}
          </p>
        )}
      </div>
      
      <nav className="p-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200",
                "hover:bg-secondary/60",
                activeView === item.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  );
}