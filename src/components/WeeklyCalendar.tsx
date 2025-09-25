import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TimeSlot, Project } from "@/types";
import { cn } from "@/lib/utils";
import TimeSlotDialog from "./TimeSlotDialog";

interface WeeklyCalendarProps {
  timeSlots: TimeSlot[];
  projects: Project[];
  onAddTimeSlot: (slot: Omit<TimeSlot, "id">) => void;
  onUpdateTimeSlot: (id: string, slot: Partial<TimeSlot>) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00
const TIME_SLOTS = [];
for (let h = 8; h <= 19; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_SLOTS.push({ hour: h, minute: m });
  }
}

export default function WeeklyCalendar({ 
  timeSlots, 
  projects, 
  onAddTimeSlot,
  onUpdateTimeSlot 
}: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lunedì come primo giorno
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };


  const getTimeSlotForCell = (date: Date, hour: number, minute: number) => {
    return timeSlots.find(slot => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slotStart.getTime() + slot.duration * 60 * 1000);
      const cellStart = new Date(date);
      cellStart.setHours(hour, minute, 0, 0);
      const cellEnd = new Date(cellStart.getTime() + 15 * 60 * 1000);
      
      return (
        slotStart.toDateString() === cellStart.toDateString() &&
        slotStart <= cellStart && 
        slotEnd > cellStart
      );
    });
  };

  const getSlotSpan = (slot: TimeSlot, startHour: number, startMinute: number) => {
    const slotStart = new Date(slot.startTime);
    const cellStart = new Date(slotStart);
    cellStart.setHours(startHour, startMinute, 0, 0);
    
    // Calculate how many 15-minute slots this time slot spans
    const slotDurationMinutes = slot.duration;
    const slotsSpanned = Math.ceil(slotDurationMinutes / 15);
    
    // Check if this is the first cell of the slot
    const isFirstCell = slotStart.getHours() === startHour && slotStart.getMinutes() === startMinute;
    
    return { slotsSpanned, isFirstCell };
  };

  const getProjectColor = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#6366f1';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario Settimanale</h1>
          <p className="text-muted-foreground">
            {weekDates[0].toLocaleDateString('it-IT')} - {weekDates[6].toLocaleDateString('it-IT')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentWeek(new Date())}
          >
            Oggi
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <TimeSlotDialog 
            projects={projects}
            onAddTimeSlot={onAddTimeSlot}
            onUpdateTimeSlot={onUpdateTimeSlot}
            defaultDate={new Date()}
          />
        </div>
      </div>

      {/* Week Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Ore Totali Settimana</h3>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(timeSlots
              .filter(slot => {
                const slotDate = new Date(slot.startTime);
                return weekDates.some(date => 
                  slotDate.toDateString() === date.toDateString()
                );
              })
              .reduce((sum, slot) => sum + slot.duration, 0) / 60 * 10) / 10}h
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Progetti Attivi</h3>
          <p className="text-2xl font-bold text-foreground">
            {new Set(timeSlots
              .filter(slot => {
                const slotDate = new Date(slot.startTime);
                return weekDates.some(date => 
                  slotDate.toDateString() === date.toDateString()
                );
              })
              .map(slot => slot.projectId)
              .filter(Boolean)
            ).size}
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Guadagno Stimato</h3>
          <p className="text-2xl font-bold text-accent">
            €{Math.round(timeSlots
              .filter(slot => {
                const slotDate = new Date(slot.startTime);
                return weekDates.some(date => 
                  slotDate.toDateString() === date.toDateString()
                );
              })
              .reduce((sum, slot) => {
                const project = projects.find(p => p.id === slot.projectId);
                return sum + (project?.hourlyRate || 0) * (slot.duration / 60);
              }, 0)
            )}
          </p>
        </Card>
      </div>

      {/* Calendar Grid - Toggl Track Style */}
      <Card className="p-4 shadow-medium">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-0 min-w-[1000px]">
            {/* Header Row */}
            <div className="p-3 text-sm font-medium text-muted-foreground sticky top-0 bg-background border-b border-border">Ora</div>
            {weekDates.map((date, index) => (
              <div key={date.toISOString()} className="p-3 text-center sticky top-0 bg-background border-b border-border">
                <div className="text-sm font-medium text-muted-foreground">
                  {dayNames[index]}
                </div>
                <div className={cn(
                  "text-lg font-semibold mt-1",
                  date.toDateString() === new Date().toDateString() 
                    ? "text-primary" 
                    : "text-foreground"
                )}>
                  {date.getDate()}
                </div>
              </div>
            ))}

            {/* Hour Rows */}
            {HOURS.map(hour => (
              <div key={hour} className="contents">
                {/* Hour Label */}
                <div className="p-3 text-sm font-medium text-muted-foreground border-r border-b border-border/30 bg-muted/20">
                  {hour}:00
                </div>
                
                {/* Day Cells */}
                {weekDates.map(date => {
                  // Find all time slots that are active during this hour
                  const activeSlots = timeSlots.filter(slot => {
                    const slotStart = new Date(slot.startTime);
                    const slotEnd = new Date(slotStart.getTime() + slot.duration * 60 * 1000);
                    const hourStart = new Date(date);
                    hourStart.setHours(hour, 0, 0, 0);
                    const hourEnd = new Date(date);
                    hourEnd.setHours(hour + 1, 0, 0, 0);
                    
                    return slotStart.toDateString() === date.toDateString() && 
                           slotStart < hourEnd && slotEnd > hourStart;
                  });

                  return (
                    <div
                      key={`${date.toISOString()}-${hour}`}
                      className="relative min-h-[60px] border-r border-b border-border/30 hover:bg-secondary/20 transition-colors"
                    >
                      {/* Render time slots */}
                      {activeSlots.map(slot => {
                        const slotStart = new Date(slot.startTime);
                        const slotEnd = new Date(slotStart.getTime() + slot.duration * 60 * 1000);
                        const project = projects.find(p => p.id === slot.projectId);
                        
                        // Calculate position and height relative to current hour
                        const hourStart = new Date(date);
                        hourStart.setHours(hour, 0, 0, 0);
                        const hourEnd = new Date(date);
                        hourEnd.setHours(hour + 1, 0, 0, 0);
                        
                        const visibleStart = slotStart > hourStart ? slotStart : hourStart;
                        const visibleEnd = slotEnd < hourEnd ? slotEnd : hourEnd;
                        
                        const startMinuteInHour = (visibleStart.getTime() - hourStart.getTime()) / (1000 * 60);
                        const durationInHour = (visibleEnd.getTime() - visibleStart.getTime()) / (1000 * 60);
                        
                        const top = (startMinuteInHour / 60) * 100;
                        const height = (durationInHour / 60) * 100;
                        
                        // Only show content in the first hour of the slot
                        const isFirstHour = slotStart.getHours() === hour;
                        
                        return (
                          <div
                            key={`${slot.id}-${hour}`}
                            className="absolute left-1 right-1 rounded cursor-pointer hover:brightness-110 transition-all shadow-sm border border-white/20"
                            style={{
                              top: `${top}%`,
                              height: `${height}%`,
                              backgroundColor: getProjectColor(slot.projectId || ''),
                              minHeight: '10px'
                            }}
                            onClick={() => setEditingSlot(slot)}
                          >
                            <div className="p-1 text-white h-full flex flex-col justify-center relative overflow-hidden">
                              {isFirstHour && (
                                <>
                                  <div className="text-[10px] font-semibold truncate leading-tight" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                                    {project?.name || 'Progetto'}
                                  </div>
                                  {slot.duration >= 30 && slot.description && (
                                    <div className="text-[9px] truncate opacity-90 mt-0.5 leading-tight" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                                      {slot.description}
                                    </div>
                                  )}
                                  <div className="text-[8px] opacity-90 mt-0.5 font-medium leading-tight" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                                    {Math.round(slot.duration / 60 * 10) / 10}h
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Edit Time Slot Dialog */}
      {editingSlot && (
        <TimeSlotDialog 
          projects={projects}
          onAddTimeSlot={onAddTimeSlot}
          onUpdateTimeSlot={onUpdateTimeSlot}
          editingSlot={editingSlot}
          onClose={() => setEditingSlot(null)}
          defaultDate={new Date()}
        />
      )}
    </div>
  );
}