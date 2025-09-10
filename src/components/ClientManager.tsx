import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Mail, Phone, Building2, Users } from "lucide-react";
import { Client, Project } from "@/types";

interface ClientManagerProps {
  clients: Client[];
  projects: Project[];
  onAddClient: (client: Omit<Client, "id">) => void;
  onUpdateClient: (id: string, client: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientManager({
  clients,
  projects,
  onAddClient,
  onUpdateClient,
  onDeleteClient
}: ClientManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: ""
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      onUpdateClient(editingClient.id, formData);
    } else {
      onAddClient(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone || ""
    });
    setIsDialogOpen(true);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestione Clienti</h1>
          <p className="text-muted-foreground">Gestisci l'anagrafica dei tuoi clienti</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-medium">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Cliente
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Modifica Cliente" : "Nuovo Cliente"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome e Cognome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Es. Mario Rossi"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Azienda</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Es. Rossi Marketing S.r.l."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="mario.rossi@esempio.it"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+39 335 123 4567"
                />
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
                  {editingClient ? "Aggiorna" : "Crea"} Cliente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => {
          const clientProjects = getClientProjects(client.id);
          const totalValue = clientProjects.reduce((sum, project) => {
            return sum + (project.fixedFee || project.hourlyRate * project.estimatedHours);
          }, 0);

          return (
            <Card key={client.id} className="p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.company}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(client)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClient(client.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${client.email}`} 
                    className="text-primary hover:underline truncate"
                  >
                    {client.email}
                  </a>
                </div>

                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`tel:${client.phone}`}
                      className="text-primary hover:underline"
                    >
                      {client.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{clientProjects.length} progetti attivi</span>
                </div>

                {totalValue > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="text-sm text-muted-foreground">Valore totale progetti</div>
                    <div className="text-lg font-semibold text-accent">€{Math.round(totalValue)}</div>
                  </div>
                )}
              </div>

              {/* Recent Projects */}
              {clientProjects.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Progetti recenti</h4>
                  <div className="space-y-1">
                    {clientProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-sm text-foreground truncate">
                          {project.name}
                        </span>
                      </div>
                    ))}
                    {clientProjects.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{clientProjects.length - 3} altri progetti
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Empty State */}
        {clients.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nessun cliente</h3>
              <p>Inizia aggiungendo il tuo primo cliente</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}