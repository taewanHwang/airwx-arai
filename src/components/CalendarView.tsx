import { useState } from 'react';
import { ContextEntry } from '@/types/context';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  entries: ContextEntry[];
}

// Generate consistent color for each unique entry ID
const getEntryColor = (id: string): string => {
  const colors = [
    'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300',
    'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300',
    'bg-green-100 text-green-700 hover:bg-green-200 border-green-300',
    'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300',
    'bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-300',
    'bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-300',
    'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-300',
    'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-300',
  ];
  
  // Simple hash function to get consistent color index
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const CalendarView = ({ entries }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // January 2025
  const [selectedEntry, setSelectedEntry] = useState<ContextEntry | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
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
                      key={`${entry.id}-${day}`}
                      className={`text-xs p-1.5 rounded border truncate transition-colors cursor-pointer ${getEntryColor(entry.id)}`}
                      onClick={() => setSelectedEntry(entry)}
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

      {/* Entry Details Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <div className="mt-1">
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  {selectedEntry?.project}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date Range</label>
              <p className="mt-1 text-foreground">{selectedEntry?.dateRange}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Summary</label>
              <p className="mt-1 text-foreground">{selectedEntry?.summary}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Link</label>
              <div className="mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a
                    href={selectedEntry?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Original
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
