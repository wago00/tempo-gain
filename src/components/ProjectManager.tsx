import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Search, FolderOpen, Clock, DollarSign, ChevronRight } from "lucide-react";
import { Project, Client, TimeSlot, Invoice } from "@/types";
import ProjectDetail from "@/components/ProjectDetail";

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1'
];

interface ProjectManagerProps {
  projects: Project[];
  clients: Client[];
  timeSlots: TimeSlot[];
  invoices: Invoice[];
  onAddProject: (project: Omit<Project, "id">) => void;
  onUpdateProject: (id: string, project: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onGenerateInvoices: (projectId: string, totalAmount: number, numberOfInvoices: number) => void;
  onUpdateInvoice: (id: string, isPaid: boolean) => void;
}

export default function ProjectManager({
  projects,
  clients,
  timeSlots,
  invoices,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onGenerateInvoices,
  onUpdateInvoice
}: ProjectManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    hourlyRate: "",
    estimatedHours: "",
    fixedFee: "",
    color: PROJECT_COLORS[0],
    numberOfInvoices: "1"
  });

  const resetForm = () => {
    setFormData({
      name: "",
      clientId: "",
      hourlyRate: "",
      estimatedHours: "",
      fixedFee: "",
      color: PROJECT_COLORS[0],
      numberOfInvoices: "1"
    });
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      name: formData.name,
      clientId: formData.clientId,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      estimatedHours: parseFloat(formData.estimatedHours) || 0,
      fixedFee: formData.fixedFee ? parseFloat(formData.fixedFee) : undefined,
      color: formData.color,
      createdAt: new Date()
    };

    if (editingProject) {
      onUpdateProject(editingProject.id, projectData);
      if (projectData.fixedFee && parseInt(formData.numberOfInvoices) > 0) {
        onGenerateInvoices(editingProject.id, projectData.fixedFee, parseInt(formData.numberOfInvoices));
      }
    } else {
      onAddProject(projectData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    const projectInvoices = invoices.filter(inv => inv.projectId === project.id);
    setFormData({
      name: project.name,
      clientId: project.clientId,
      hourlyRate: project.hourlyRate.toString(),
      estimatedHours: project.estimatedHours.toString(),
      fixedFee: project.fixedFee?.toString() || "",
      color: project.color,
      numberOfInvoices: projectInvoices.length > 0 ? projectInvoices.length.toString() : "1"
    });
    setIsDialogOpen(true);
    setSelectedProjectId(null);
  };

  // Detail view
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  if (selectedProject) {
    const client = clients.find(c => c.id === selectedProject.clientId);
    return (
      <ProjectDetail
        project={selectedProject}
        client={client}
        timeSlots={timeSlots}
        invoices={invoices}
        onBack={() => setSelectedProjectId(null)}
        onEdit={handleEdit}
        onDelete={(id) => { onDeleteProject(id); setSelectedProjectId(null); }}
        onUpdateInvoice={onUpdateInvoice}
      />
    );
  }

  // Filter
  const filteredProjects = projects.filter(project => {
    const client = clients.find(c => c.id === project.clientId);
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      client?.name.toLowerCase().includes(query) ||
      client?.company.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestione Progetti</h1>
          <p className="text-muted-foreground">Crea e gestisci i tuoi progetti</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-medium">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Progetto
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Modifica Progetto" : "Nuovo Progetto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Progetto</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Es. Sviluppo sito web" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Seleziona un cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name} - {client.company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Tariffa Oraria (€)</Label>
                  <Input id="hourlyRate" type="number" step="0.01" value={formData.hourlyRate} onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))} placeholder="50.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Ore Stimate</Label>
                  <Input id="estimatedHours" type="number" step="0.5" value={formData.estimatedHours} onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))} placeholder="40" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fixedFee">Compenso Fisso (€)</Label>
                  <Input id="fixedFee" type="number" step="0.01" value={formData.fixedFee} onChange={(e) => setFormData(prev => ({ ...prev, fixedFee: e.target.value }))} placeholder="2000.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfInvoices">Numero Fatture</Label>
                  <Select value={formData.numberOfInvoices} onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfInvoices: value }))} disabled={!formData.fixedFee}>
                    <SelectTrigger><SelectValue placeholder="1" /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'fattura' : 'fatture'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.fixedFee && parseInt(formData.numberOfInvoices) > 0 && (
                    <p className="text-xs text-muted-foreground">€{(parseFloat(formData.fixedFee) / parseInt(formData.numberOfInvoices)).toFixed(2)} per fattura</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Colore Progetto</Label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button key={color} type="button" onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn("w-8 h-8 rounded-full border-2 transition-all", formData.color === color ? "border-foreground scale-110" : "border-border hover:scale-105")}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annulla</Button>
                <Button type="submit">{editingProject ? "Aggiorna" : "Crea"} Progetto</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca progetti per nome o cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Project List */}
      <div className="space-y-2">
        {filteredProjects.map((project) => {
          const client = clients.find(c => c.id === project.clientId);
          const projectTimeSlots = timeSlots.filter(slot => slot.projectId === project.id);
          const hoursSpent = projectTimeSlots.reduce((sum, slot) => sum + slot.duration, 0) / 60;
          const hoursProgress = project.estimatedHours > 0 ? (hoursSpent / project.estimatedHours) * 100 : 0;

          return (
            <Card
              key={project.id}
              className="p-4 cursor-pointer hover:shadow-medium transition-all duration-200 hover:bg-muted/30"
              onClick={() => setSelectedProjectId(project.id)}
            >
              <div className="flex items-center gap-4">
                {/* Color dot */}
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />

                {/* Name & Client */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{project.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{client?.name ?? '—'}</p>
                </div>

                {/* Hours progress bar */}
                <div className="hidden sm:flex items-center gap-3 w-48">
                  <div className="flex-1">
                    <Progress value={Math.min(hoursProgress, 100)} className="h-2" />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {hoursSpent.toFixed(1)}/{project.estimatedHours}h
                  </span>
                </div>

                {/* Rate badge */}
                <Badge variant="secondary" className="hidden md:flex">
                  <DollarSign className="w-3 h-3 mr-1" />
                  €{project.hourlyRate}/h
                </Badge>

                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>

              {/* Mobile progress */}
              <div className="sm:hidden mt-3 flex items-center gap-3">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <Progress value={Math.min(hoursProgress, 100)} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">{hoursSpent.toFixed(1)}/{project.estimatedHours}h</span>
              </div>
            </Card>
          );
        })}

        {filteredProjects.length === 0 && projects.length > 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nessun progetto trovato per "{searchQuery}"</p>
          </Card>
        )}

        {projects.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">Nessun progetto</h3>
            <p className="text-muted-foreground">Inizia creando il tuo primo progetto</p>
          </Card>
        )}
      </div>
    </div>
  );
}
