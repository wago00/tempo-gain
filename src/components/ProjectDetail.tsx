import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, Clock, DollarSign, TrendingUp, FileText, Check, Edit, Trash2, User } from "lucide-react";
import { Project, Client, TimeSlot, Invoice } from "@/types";

interface ProjectDetailProps {
  project: Project;
  client?: Client;
  timeSlots: TimeSlot[];
  invoices: Invoice[];
  onBack: () => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onUpdateInvoice: (id: string, isPaid: boolean) => void;
}

export default function ProjectDetail({
  project,
  client,
  timeSlots,
  invoices,
  onBack,
  onEdit,
  onDelete,
  onUpdateInvoice,
}: ProjectDetailProps) {
  const projectTimeSlots = timeSlots.filter(slot => slot.projectId === project.id);
  const hoursSpent = projectTimeSlots.reduce((sum, slot) => sum + slot.duration, 0) / 60;
  const hoursProgress = project.estimatedHours > 0 ? (hoursSpent / project.estimatedHours) * 100 : 0;
  const earnedAmount = hoursSpent * project.hourlyRate;
  const feeProgress = project.fixedFee ? (earnedAmount / project.fixedFee) * 100 : 0;

  const projectInvoices = invoices
    .filter(inv => inv.projectId === project.id)
    .sort((a, b) => a.invoiceNumber - b.invoiceNumber);
  const paidInvoices = projectInvoices.filter(inv => inv.isPaid);
  const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const invoiceProgress = projectInvoices.length > 0 ? (paidInvoices.length / projectInvoices.length) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            {client && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <User className="w-4 h-4" />
                <span>{client.name} — {client.company}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifica
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(project.id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Elimina
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            Tariffa Oraria
          </div>
          <p className="text-2xl font-bold text-foreground">€{project.hourlyRate}/h</p>
        </Card>
        <Card className="p-5 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Ore Lavorate
          </div>
          <p className="text-2xl font-bold text-foreground">{hoursSpent.toFixed(1)}h <span className="text-base font-normal text-muted-foreground">/ {project.estimatedHours}h</span></p>
        </Card>
        {project.fixedFee && (
          <Card className="p-5 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Compenso Fisso
            </div>
            <p className="text-2xl font-bold text-foreground">€{project.fixedFee.toLocaleString()}</p>
          </Card>
        )}
      </div>

      {/* Ore Progress */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Progresso Ore
          </h2>
          <Badge variant="secondary">{hoursProgress.toFixed(0)}%</Badge>
        </div>
        <Progress value={Math.min(hoursProgress, 100)} className="h-3" />
        <p className="text-sm text-muted-foreground">
          {hoursSpent.toFixed(1)} ore lavorate su {project.estimatedHours} stimate — guadagnato €{earnedAmount.toFixed(2)}
        </p>
      </Card>

      {/* Compenso Fisso Progress */}
      {project.fixedFee && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Progresso Compenso
            </h2>
            <Badge variant="secondary">{feeProgress.toFixed(0)}%</Badge>
          </div>
          <Progress value={Math.min(feeProgress, 100)} className="h-3" />
          <p className="text-sm text-muted-foreground">
            €{earnedAmount.toFixed(2)} guadagnato su €{project.fixedFee.toFixed(2)} pattuito
          </p>
        </Card>
      )}

      {/* Fatturazione */}
      {projectInvoices.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Fatturazione
            </h2>
            <span className="text-sm text-muted-foreground">
              {paidInvoices.length}/{projectInvoices.length} pagate
            </span>
          </div>
          <Progress value={invoiceProgress} className="h-3" />

          <div className="space-y-2">
            {projectInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors",
                  invoice.isPaid ? "bg-green-500/10" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={invoice.isPaid}
                    onCheckedChange={(checked) => onUpdateInvoice(invoice.id, !!checked)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <span className={cn(invoice.isPaid && "line-through text-muted-foreground")}>
                    Fattura {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", invoice.isPaid ? "text-green-600" : "text-foreground")}>
                    €{invoice.amount.toFixed(2)}
                  </span>
                  {invoice.isPaid && <Check className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
            <span className="text-muted-foreground">Totale Incassato</span>
            <span className="font-semibold text-green-600">
              €{totalCollected.toFixed(2)} / €{project.fixedFee?.toFixed(2) ?? '—'}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
