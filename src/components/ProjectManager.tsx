import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, DollarSign, Clock, User, FolderOpen, TrendingUp } from "lucide-react";
import { Project, Client, TimeSlot } from "@/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProjectManagerProps {
  projects: Project[];
  clients: Client[];
  timeSlots: TimeSlot[];
  onAddProject: (project: Omit<Project, "id">) => void;
  onUpdateProject: (id: string, project: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1'
];

export default function ProjectManager({
  projects,
  clients,
  timeSlots,
  onAddProject,
  onUpdateProject,
  onDeleteProject
}: ProjectManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    hourlyRate: "",
    estimatedHours: "",
    fixedFee: "",
    color: PROJECT_COLORS[0]
  });

  const resetForm = () => {
    setFormData({
      name: "",
      clientId: "",
      hourlyRate: "",
      estimatedHours: "",
      fixedFee: "",
      color: PROJECT_COLORS[0]
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
    } else {
      onAddProject(projectData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      clientId: project.clientId,
      hourlyRate: project.hourlyRate.toString(),
      estimatedHours: project.estimatedHours.toString(),
      fixedFee: project.fixedFee?.toString() || "",
      color: project.color
    });
    setIsDialogOpen(true);
  };

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
              <DialogTitle>
                {editingProject ? "Modifica Progetto" : "Nuovo Progetto"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Progetto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Es. Sviluppo sito web"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Tariffa Oraria (€)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="50.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Ore Stimate</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fixedFee">Compenso Fisso (€) - Opzionale</Label>
                <Input
                  id="fixedFee"
                  type="number"
                  step="0.01"
                  value={formData.fixedFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, fixedFee: e.target.value }))}
                  placeholder="2000.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Colore Progetto</Label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        formData.color === color 
                          ? "border-foreground scale-110" 
                          : "border-border hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button type="submit">
                  {editingProject ? "Aggiorna" : "Crea"} Progetto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const client = clients.find(c => c.id === project.clientId);
          
          // Calcolo ore spese per questo progetto
          const projectTimeSlots = timeSlots.filter(slot => slot.projectId === project.id);
          const hoursSpent = projectTimeSlots.reduce((sum, slot) => sum + slot.duration, 0) / 60;
          const hoursProgress = project.estimatedHours > 0 ? (hoursSpent / project.estimatedHours) * 100 : 0;
          
          // Calcolo progresso compenso fisso
          const earnedAmount = hoursSpent * project.hourlyRate;
          const feeProgress = project.fixedFee ? (earnedAmount / project.fixedFee) * 100 : 0;
          
          return (
            <Card key={project.id} className="p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteProject(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{client?.name || 'Cliente non trovato'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-accent" />
                  <span className="font-medium text-accent">€{project.hourlyRate}/h</span>
                </div>

                {/* Progress Ore */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Ore Lavorate</span>
                    </div>
                    <span className="font-medium">{hoursSpent.toFixed(1)}h / {project.estimatedHours}h</span>
                  </div>
                  <Progress 
                    value={Math.min(hoursProgress, 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {hoursProgress.toFixed(0)}% completato
                  </div>
                </div>

                {/* Progress Compenso Fisso */}
                {project.fixedFee && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span>Compenso Fisso</span>
                      </div>
                      <span className="font-medium">€{earnedAmount.toFixed(0)} / €{project.fixedFee}</span>
                    </div>
                    <Progress 
                      value={Math.min(feeProgress, 100)} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {feeProgress.toFixed(0)}% guadagnato
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {/* Empty State */}
        {projects.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nessun progetto</h3>
              <p>Inizia creando il tuo primo progetto</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}