import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import ProjectManager from "@/components/ProjectManager";
import ClientManager from "@/components/ClientManager";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Loader2 } from "lucide-react";
import type { TimeSlot } from "@/types";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  
  // Use Supabase data hooks
  const {
    clients,
    projects,
    timeSlots,
    loading,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    addTimeSlot,
    updateTimeSlot,
  } = useSupabaseData();

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Function to render the active view based on state
  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            projects={projects}
            timeSlots={timeSlots}
            clients={clients}
          />
        );
      case "calendar":
        return (
          <WeeklyCalendar
            timeSlots={timeSlots}
            projects={projects}
            onAddTimeSlot={addTimeSlot}
            onUpdateTimeSlot={updateTimeSlot}
          />
        );
      case "projects":
        return (
          <ProjectManager
            projects={projects}
            clients={clients}
            timeSlots={timeSlots}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
          />
        );
      case "clients":
        return (
          <ClientManager
            clients={clients}
            projects={projects}
            onAddClient={addClient}
            onUpdateClient={updateClient}
            onDeleteClient={deleteClient}
          />
        );
      default:
        return <Dashboard projects={projects} timeSlots={timeSlots} clients={clients} />;
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