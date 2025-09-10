import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { TimeSlot, Project } from "@/types";
import { cn } from "@/lib/utils";

interface WeeklyCalendarProps {
  timeSlots: TimeSlot[];
  projects: Project[];
  onAddTimeSlot: (slot: Omit<TimeSlot, "id">) => void;
  onUpdateTimeSlot: (id: string, slot: Partial<TimeSlot>) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00

export default function WeeklyCalendar({ 
  timeSlots, 
  projects, 
  onAddTimeSlot,
  onUpdateTimeSlot 
}: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

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

  const handleCellClick = (date: Date, hour: number) => {
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);
    
    onAddTimeSlot({
      startTime,
      duration: 60, // 1 ora di default
      description: "Nuovo slot",
      projectId: projects[0]?.id
    });
  };

  const getTimeSlotForCell = (date: Date, hour: number) => {
    return timeSlots.find(slot => {
      const slotStart = new Date(slot.startTime);
      const cellDate = new Date(date);
      cellDate.setHours(hour, 0, 0, 0);
      
      return (
        slotStart.toDateString() === cellDate.toDateString() &&
        slotStart.getHours() === hour
      );
    });
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
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4 shadow-medium">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-2 min-w-[800px]">
            {/* Header Row */}
            <div className="p-3 text-sm font-medium text-muted-foreground">Ora</div>
            {weekDates.map((date, index) => (
              <div key={date.toISOString()} className="p-3 text-center">
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

            {/* Time Slots */}
            {HOURS.map(hour => (
              <div key={hour} className="contents">
                {/* Hour Label */}
                <div className="p-3 text-sm text-muted-foreground font-medium border-r border-border/50">
                  {hour}:00
                </div>
                
                {/* Time Cells */}
                {weekDates.map(date => {
                  const timeSlot = getTimeSlotForCell(date, hour);
                  const project = timeSlot ? projects.find(p => p.id === timeSlot.projectId) : null;
                  
                  return (
                    <div
                      key={`${date.toISOString()}-${hour}`}
                      onClick={() => !timeSlot && handleCellClick(date, hour)}
                      className={cn(
                        "min-h-[60px] border border-border/30 cursor-pointer transition-all duration-200",
                        "hover:bg-secondary/30 hover:border-primary/30",
                        timeSlot ? "p-1" : "p-3"
                      )}
                    >
                      {timeSlot ? (
                        <div 
                          className="h-full rounded-md p-2 text-white text-xs font-medium flex flex-col justify-center"
                          style={{ backgroundColor: getProjectColor(timeSlot.projectId || '') }}
                        >
                          <div className="truncate font-semibold">
                            {project?.name || 'Progetto'}
                          </div>
                          <div className="truncate opacity-90 mt-1">
                            {timeSlot.description}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {Math.round(timeSlot.duration / 60 * 10) / 10}h
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Week Summary */}
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
    </div>
  );
}