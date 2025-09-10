export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  hourlyRate: number;
  estimatedHours: number;
  fixedFee?: number;
  color: string;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
}

export interface TimeSlot {
  id: string;
  projectId?: string;
  startTime: Date;
  duration: number; // in minutes
  description?: string;
}