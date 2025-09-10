import { Card } from "@/components/ui/card";
import { Clock, DollarSign, Target, TrendingUp } from "lucide-react";
import { Project, TimeSlot, Client } from "@/types";

interface DashboardProps {
  projects: Project[];
  timeSlots: TimeSlot[];
  clients: Client[];
}

export default function Dashboard({ projects, timeSlots, clients }: DashboardProps) {
  // Calcoli per le metriche
  const totalHoursToday = timeSlots
    .filter(slot => {
      const today = new Date().toDateString();
      return slot.startTime.toDateString() === today;
    })
    .reduce((sum, slot) => sum + slot.duration, 0) / 60;

  const totalEarningsToday = timeSlots
    .filter(slot => {
      const today = new Date().toDateString();
      return slot.startTime.toDateString() === today;
    })
    .reduce((sum, slot) => {
      const project = projects.find(p => p.id === slot.projectId);
      return sum + (project?.hourlyRate || 0) * (slot.duration / 60);
    }, 0);

  const activeProjects = projects.length;
  const totalClients = clients.length;

  const stats = [
    {
      title: "Ore Oggi",
      value: `${totalHoursToday.toFixed(1)}h`,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Guadagno Oggi",
      value: `€${totalEarningsToday.toFixed(0)}`,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Progetti Attivi",
      value: activeProjects,
      icon: Target,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Clienti Totali",
      value: totalClients,
      icon: TrendingUp,
      color: "text-primary-glow",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Panoramica delle tue attività</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('it-IT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 bg-gradient-to-br from-card to-secondary/20 border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-4">Progetti Recenti</h3>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => {
              const client = clients.find(c => c.id === project.clientId);
              return (
                <div key={project.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <p className="font-medium text-foreground">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{client?.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-accent">€{project.hourlyRate}/h</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-4">Slot Recenti</h3>
          <div className="space-y-3">
            {timeSlots.slice(-5).reverse().map((slot) => {
              const project = projects.find(p => p.id === slot.projectId);
              return (
                <div key={slot.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project?.color || '#6366f1' }}
                    />
                    <div>
                      <p className="font-medium text-foreground">{project?.name || 'Progetto sconosciuto'}</p>
                      <p className="text-sm text-muted-foreground">
                        {slot.startTime.toLocaleTimeString('it-IT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {slot.description || 'Nessuna descrizione'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{Math.round(slot.duration / 60 * 10) / 10}h</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}