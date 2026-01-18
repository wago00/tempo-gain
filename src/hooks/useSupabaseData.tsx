import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Client, Project, TimeSlot, Invoice } from "@/types";

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setClients([]);
      setProjects([]);
      setTimeSlots([]);
      setInvoices([]);
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadClients(),
        loadProjects(), 
        loadTimeSlots(),
        loadInvoices()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Errore nel caricamento",
        description: "Si è verificato un errore nel caricamento dei dati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading clients:", error);
      return;
    }

    if (data) {
      const mappedClients: Client[] = data.map(client => ({
        id: client.id,
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone || undefined,
      }));
      setClients(mappedClients);
    }
  };

  const loadProjects = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading projects:", error);
      return;
    }

    if (data) {
      const mappedProjects: Project[] = data.map(project => ({
        id: project.id,
        name: project.name,
        clientId: project.client_id || "",
        hourlyRate: Number(project.hourly_rate),
        estimatedHours: Number(project.estimated_hours),
        fixedFee: project.fixed_fee ? Number(project.fixed_fee) : undefined,
        color: project.color,
        createdAt: new Date(project.created_at),
      }));
      setProjects(mappedProjects);
    }
  };

  const loadTimeSlots = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("user_id", user.id)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error loading time slots:", error);
      return;
    }

    if (data) {
      const mappedTimeSlots: TimeSlot[] = data.map(slot => ({
        id: slot.id,
        projectId: slot.project_id || undefined,
        startTime: new Date(slot.start_time),
        duration: slot.duration,
        description: slot.description || undefined,
      }));
      setTimeSlots(mappedTimeSlots);
    }
  };

  const loadInvoices = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("invoice_number", { ascending: true });

    if (error) {
      console.error("Error loading invoices:", error);
      return;
    }

    if (data) {
      const mappedInvoices: Invoice[] = data.map(invoice => ({
        id: invoice.id,
        projectId: invoice.project_id,
        invoiceNumber: invoice.invoice_number,
        amount: Number(invoice.amount),
        isPaid: invoice.is_paid,
        paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
        dueDate: invoice.due_date ? new Date(invoice.due_date) : undefined,
      }));
      setInvoices(mappedInvoices);
    }
  };

  // Client operations
  const addClient = async (clientData: Omit<Client, "id">) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        name: clientData.name,
        company: clientData.company,
        email: clientData.email,
        phone: clientData.phone,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiunta del cliente",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const newClient: Client = {
        id: data.id,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone || undefined,
      };
      setClients(prev => [newClient, ...prev]);
      toast({
        title: "Cliente aggiunto",
        description: "Il cliente è stato aggiunto con successo",
      });
    }
  };

  const updateClient = async (id: string, clientData: Omit<Client, "id">) => {
    if (!user) return;

    const { error } = await supabase
      .from("clients")
      .update({
        name: clientData.name,
        company: clientData.company,
        email: clientData.email,
        phone: clientData.phone,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del cliente",
        variant: "destructive",
      });
      return;
    }

    setClients(prev => prev.map(client => 
      client.id === id ? { ...clientData, id } : client
    ));
    toast({
      title: "Cliente aggiornato",
      description: "Il cliente è stato aggiornato con successo",
    });
  };

  const deleteClient = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del cliente",
        variant: "destructive",
      });
      return;
    }

    setClients(prev => prev.filter(client => client.id !== id));
    toast({
      title: "Cliente eliminato",
      description: "Il cliente è stato eliminato con successo",
    });
  };

  // Project operations
  const addProject = async (projectData: Omit<Project, "id" | "createdAt">) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: projectData.name,
        client_id: projectData.clientId || null,
        hourly_rate: projectData.hourlyRate,
        estimated_hours: projectData.estimatedHours,
        fixed_fee: projectData.fixedFee || null,
        color: projectData.color,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiunta del progetto",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const newProject: Project = {
        id: data.id,
        name: data.name,
        clientId: data.client_id || "",
        hourlyRate: Number(data.hourly_rate),
        estimatedHours: Number(data.estimated_hours),
        fixedFee: data.fixed_fee ? Number(data.fixed_fee) : undefined,
        color: data.color,
        createdAt: new Date(data.created_at),
      };
      setProjects(prev => [newProject, ...prev]);
      toast({
        title: "Progetto aggiunto",
        description: "Il progetto è stato aggiunto con successo",
      });
    }
  };

  const updateProject = async (id: string, projectData: Omit<Project, "id" | "createdAt">) => {
    if (!user) return;

    const { error } = await supabase
      .from("projects")
      .update({
        name: projectData.name,
        client_id: projectData.clientId || null,
        hourly_rate: projectData.hourlyRate,
        estimated_hours: projectData.estimatedHours,
        fixed_fee: projectData.fixedFee || null,
        color: projectData.color,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del progetto",
        variant: "destructive",
      });
      return;
    }

    setProjects(prev => prev.map(project => 
      project.id === id ? { ...projectData, id, createdAt: project.createdAt } : project
    ));
    toast({
      title: "Progetto aggiornato",
      description: "Il progetto è stato aggiornato con successo",
    });
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del progetto",
        variant: "destructive",
      });
      return;
    }

    setProjects(prev => prev.filter(project => project.id !== id));
    toast({
      title: "Progetto eliminato",
      description: "Il progetto è stato eliminato con successo",
    });
  };

  // TimeSlot operations
  const addTimeSlot = async (timeSlotData: Omit<TimeSlot, "id">) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("time_slots")
      .insert({
        user_id: user.id,
        project_id: timeSlotData.projectId || null,
        start_time: timeSlotData.startTime.toISOString(),
        duration: timeSlotData.duration,
        description: timeSlotData.description,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiunta del time slot",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const newTimeSlot: TimeSlot = {
        id: data.id,
        projectId: data.project_id || undefined,
        startTime: new Date(data.start_time),
        duration: data.duration,
        description: data.description || undefined,
      };
      setTimeSlots(prev => [newTimeSlot, ...prev]);
      toast({
        title: "Time slot aggiunto",
        description: "Il time slot è stato aggiunto con successo",
      });
    }
  };

  const updateTimeSlot = async (id: string, timeSlotData: Omit<TimeSlot, "id">) => {
    if (!user) return;

    const { error } = await supabase
      .from("time_slots")
      .update({
        project_id: timeSlotData.projectId || null,
        start_time: timeSlotData.startTime.toISOString(),
        duration: timeSlotData.duration,
        description: timeSlotData.description,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del time slot",
        variant: "destructive",
      });
      return;
    }

    setTimeSlots(prev => prev.map(slot => 
      slot.id === id ? { ...timeSlotData, id } : slot
    ));
    toast({
      title: "Time slot aggiornato",
      description: "Il time slot è stato aggiornato con successo",
    });
  };

  // Invoice operations
  const generateInvoicesForProject = async (projectId: string, totalAmount: number, numberOfInvoices: number) => {
    if (!user || numberOfInvoices <= 0) return;

    const amountPerInvoice = totalAmount / numberOfInvoices;
    
    // First delete existing invoices for this project
    await supabase
      .from("invoices")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);

    // Create new invoices
    const invoicesToCreate = Array.from({ length: numberOfInvoices }, (_, i) => ({
      user_id: user.id,
      project_id: projectId,
      invoice_number: i + 1,
      amount: amountPerInvoice,
      is_paid: false,
    }));

    const { data, error } = await supabase
      .from("invoices")
      .insert(invoicesToCreate)
      .select();

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante la creazione delle fatture",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const newInvoices: Invoice[] = data.map(invoice => ({
        id: invoice.id,
        projectId: invoice.project_id,
        invoiceNumber: invoice.invoice_number,
        amount: Number(invoice.amount),
        isPaid: invoice.is_paid,
        paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
        dueDate: invoice.due_date ? new Date(invoice.due_date) : undefined,
      }));
      
      // Remove old invoices for this project and add new ones
      setInvoices(prev => [
        ...prev.filter(inv => inv.projectId !== projectId),
        ...newInvoices
      ]);
      
      toast({
        title: "Fatture create",
        description: `${numberOfInvoices} fatture create con successo`,
      });
    }
  };

  const updateInvoice = async (id: string, isPaid: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("invoices")
      .update({
        is_paid: isPaid,
        paid_at: isPaid ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento della fattura",
        variant: "destructive",
      });
      return;
    }

    setInvoices(prev => prev.map(invoice => 
      invoice.id === id ? { 
        ...invoice, 
        isPaid, 
        paidAt: isPaid ? new Date() : undefined 
      } : invoice
    ));
  };

  const deleteInvoicesForProject = async (projectId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting invoices:", error);
      return;
    }

    setInvoices(prev => prev.filter(inv => inv.projectId !== projectId));
  };

  return {
    clients,
    projects,
    timeSlots,
    invoices,
    loading,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    addTimeSlot,
    updateTimeSlot,
    generateInvoicesForProject,
    updateInvoice,
    deleteInvoicesForProject,
  };
};