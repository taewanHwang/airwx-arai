import { useState } from 'react';
import { ContextEntry } from '@/services/context-api';
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

// Generate consistent color tones for projects
const getProjectColorGroup = (project: string): string[] => {
  const colorGroups = [
    // Blue tones for "Exaone Foundry 배포"
    [
      'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300',
      'bg-blue-200 text-blue-800 hover:bg-blue-300 border-blue-400',
      'bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-300',
    ],
    // Purple/Violet tones for "Exaone Foundry 개발"
    [
      'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300',
      'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-300',
      'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-300',
    ],
    // Green tones for "팀 업무"
    [
      'bg-green-100 text-green-700 hover:bg-green-200 border-green-300',
      'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300',
      'bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-300',
    ],
    // Orange/Amber tones for "개인"
    [
      'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300',
      'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300',
      'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300',
    ],
  ];
  
  // Hash project name to get consistent color group
  let hash = 0;
  for (let i = 0; i < project.length; i++) {
    hash = project.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorGroups[Math.abs(hash) % colorGroups.length];
};

// Get color for specific entry based on topics and entry ID
const getEntryColor = (entry: ContextEntry, isPast: boolean): string => {
  if (isPast) {
    return 'bg-gray-200 text-gray-600 hover:bg-gray-300 border-gray-400 opacity-70';
  }
  
  // Use first topic as project name for color consistency
  const project = entry.topics?.[0] || 'Default';
  const colorGroup = getProjectColorGroup(project);
  
  // Hash entry ID to get consistent color within project group
  let hash = 0;
  for (let i = 0; i < entry.id.length; i++) {
    hash = entry.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorGroup.length;
  return colorGroup[index];
};

export const CalendarView = ({ entries }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date
  const [selectedEntry, setSelectedEntry] = useState<ContextEntry | null>(null);
  const today = new Date();
  
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
      const entryDate = new Date(entry.created_at);
      const entryDateDay = entryDate.getDate();
      const entryMonth = entryDate.getMonth();
      const entryYear = entryDate.getFullYear();
      
      return entryDateDay === day && entryMonth === month && entryYear === year;
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
                  {getEntriesForDay(day).slice(0, 2).map(entry => {
                    const isPast = new Date(entry.created_at) < today;
                    return (
                      <div
                        key={`${entry.id}-${day}`}
                        className={`text-xs p-1.5 rounded border truncate transition-colors cursor-pointer ${getEntryColor(entry, isPast)}`}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        {entry.title}
                      </div>
                    );
                  })}
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
              <label className="text-sm font-medium text-muted-foreground">주제</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedEntry?.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">생성일</label>
              <p className="mt-1 text-foreground">
                {selectedEntry && new Date(selectedEntry.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">요약</label>
              <p className="mt-1 text-foreground leading-relaxed">{selectedEntry?.summary}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">원본 링크</label>
              <div className="mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a
                    href={selectedEntry?.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    원본 보기
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
