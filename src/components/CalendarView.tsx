import { ContextEntry } from '@/types/context';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  entries: ContextEntry[];
}

export const CalendarView = ({ entries }: CalendarViewProps) => {
  // Generate calendar for January 2025
  const year = 2025;
  const month = 0; // January
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getEntriesForDay = (day: number) => {
    return entries.filter(entry => {
      const entryDate = entry.startDate.getDate();
      const entryMonth = entry.startDate.getMonth();
      const entryYear = entry.startDate.getFullYear();
      
      return (entryDate === day && entryMonth === month && entryYear === year) ||
             (entry.startDate <= new Date(year, month, day) && entry.endDate >= new Date(year, month, day));
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">January 2025</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {/* Day headers */}
        {days.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <Card
            key={index}
            className={`min-h-24 p-2 ${!day ? 'bg-muted/30' : 'bg-card hover:shadow-md transition-shadow'}`}
          >
            {day && (
              <>
                <div className="text-sm font-medium text-foreground mb-1">{day}</div>
                <div className="space-y-1">
                  {getEntriesForDay(day).slice(0, 2).map(entry => (
                    <div
                      key={entry.id}
                      className="text-xs p-1.5 rounded bg-primary/10 text-primary truncate hover:bg-primary/20 transition-colors cursor-pointer"
                      title={`${entry.title}\n${entry.summary}`}
                    >
                      {entry.title}
                    </div>
                  ))}
                  {getEntriesForDay(day).length > 2 && (
                    <div className="text-xs text-muted-foreground pl-1.5">
                      +{getEntriesForDay(day).length - 2} more
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
