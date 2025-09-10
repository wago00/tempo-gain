import { useState } from "react";
import { Project, Client, TimeSlot } from "@/types";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import ProjectManager from "@/components/ProjectManager";
import ClientManager from "@/components/ClientManager";

// Sample data per la demo
const sampleClients: Client[] = [
  {
    id: "1",
    name: "Mario Rossi",
    company: "Rossi Marketing",
    email: "mario@rossimarketing.it",
    phone: "+39 335 123 4567"
  },
  {
    id: "2", 
    name: "Anna Bianchi",
    company: "Bianchi Design Studio",
    email: "anna@bianchidesign.it",
    phone: "+39 347 987 6543"
  }
];

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Sito Web E-commerce",
    clientId: "1",
    hourlyRate: 65,
    estimatedHours: 80,
    fixedFee: 4500,
    color: "#6366f1",
    createdAt: new Date()
  },
  {
    id: "2",
    name: "Brand Identity",
    clientId: "2", 
    hourlyRate: 55,
    estimatedHours: 40,
    color: "#8b5cf6",
    createdAt: new Date()
  }
];

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeEntries, setTimeEntries] = useState([]);

  // Project handlers
  const handleAddProject = (projectData: Omit<Project, "id">) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTimeSlots(prev => prev.filter(slot => slot.projectId !== id));
  };

  // Client handlers
  const handleAddClient = (clientData: Omit<Client, "id">) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString()
    };
    setClients(prev => [...prev, newClient]);
  };

  const handleUpdateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    // Remove projects associated with this client
    setProjects(prev => prev.filter(p => p.clientId !== id));
  };

  // TimeSlot handlers
  const handleAddTimeSlot = (slotData: Omit<TimeSlot, "id">) => {
    const newSlot: TimeSlot = {
      ...slotData,
      id: Date.now().toString()
    };
    setTimeSlots(prev => [...prev, newSlot]);
  };

  const handleUpdateTimeSlot = (id: string, updates: Partial<TimeSlot>) => {
    setTimeSlots(prev => prev.map(slot => slot.id === id ? { ...slot, ...updates } : slot));
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard projects={projects} timeEntries={timeEntries} clients={clients} />;
      case "calendar":
        return (
          <WeeklyCalendar 
            timeSlots={timeSlots}
            projects={projects}
            onAddTimeSlot={handleAddTimeSlot}
            onUpdateTimeSlot={handleUpdateTimeSlot}
          />
        );
      case "projects":
        return (
          <ProjectManager
            projects={projects}
            clients={clients}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case "clients":
        return (
          <ClientManager
            clients={clients}
            projects={projects}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case "timer":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Timer</h1>
            <p className="text-muted-foreground">Funzionalità timer in arrivo...</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Impostazioni</h1>
            <p className="text-muted-foreground">Pannello impostazioni in arrivo...</p>
          </div>
        );
      default:
        return <Dashboard projects={projects} timeEntries={timeEntries} clients={clients} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default Index;