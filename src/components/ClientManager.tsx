import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Edit, Trash2, Mail, Phone, Search, ChevronDown, FolderOpen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: ""
  });

  const resetForm = () => {
    setFormData({ name: "", company: "", email: "", phone: "" });
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

  const getClientProjects = (clientId: string) =>
    projects.filter(p => p.clientId === clientId);

  const getClientValue = (clientId: string) =>
    getClientProjects(clientId).reduce(
      (sum, p) => sum + (p.fixedFee || p.hourlyRate * p.estimatedHours),
      0
    );

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

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
              <DialogTitle>{editingClient ? "Modifica Cliente" : "Nuovo Cliente"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome e Cognome</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Es. Mario Rossi" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Azienda</Label>
                <Input id="company" value={formData.company} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} placeholder="Es. Rossi Marketing S.r.l." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="mario.rossi@esempio.it" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+39 335 123 4567" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annulla</Button>
                <Button type="submit">{editingClient ? "Aggiorna" : "Crea"} Cliente</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome, azienda o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client List */}
      <Card className="divide-y divide-border overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{clients.length === 0 ? "Nessun cliente" : "Nessun risultato"}</p>
            <p className="text-sm">{clients.length === 0 ? "Inizia aggiungendo il tuo primo cliente" : "Prova con una ricerca diversa"}</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const clientProjects = getClientProjects(client.id);
            const totalValue = getClientValue(client.id);
            const isOpen = openClientId === client.id;

            return (
              <Collapsible
                key={client.id}
                open={isOpen}
                onOpenChange={(open) => setOpenClientId(open ? client.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors text-left cursor-pointer">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{client.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{client.company}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="font-normal">
                        {clientProjects.length} {clientProjects.length === 1 ? "progetto" : "progetti"}
                      </Badge>
                      {totalValue > 0 && (
                        <Badge variant="outline" className="font-semibold text-accent">
                          €{Math.round(totalValue).toLocaleString("it-IT")}
                        </Badge>
                      )}
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-5 pb-5 pt-1 ml-14 space-y-4 border-t border-border">
                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="w-4 h-4" /> {client.email}
                      </a>
                      {client.phone && (
                        <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                          <Phone className="w-4 h-4" /> {client.phone}
                        </a>
                      )}
                    </div>

                    {/* Projects */}
                    {clientProjects.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Progetti</p>
                        {clientProjects.map((project) => (
                          <div key={project.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                            <span className="text-foreground">{project.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                        <Edit className="w-3.5 h-3.5 mr-1.5" /> Modifica
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDeleteClient(client.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Elimina
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </Card>
    </div>
  );
}
