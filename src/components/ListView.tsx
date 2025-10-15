import { useState } from 'react';
import { ContextEntry } from '@/types/context';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ListViewProps {
  entries: ContextEntry[];
  projects: string[];
}

export const ListView = ({ entries, projects }: ListViewProps) => {
  const [selectedProject, setSelectedProject] = useState('All Projects');

  const filteredEntries = (selectedProject === 'All Projects'
    ? entries
    : entries.filter(entry => entry.project === selectedProject)
  ).sort((a, b) => b.endDate.getTime() - a.endDate.getTime()); // Sort by end date descending

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">All Contexts</h2>
        <div className="flex flex-wrap gap-2">
          {projects.map(project => (
            <Button
              key={project}
              variant={selectedProject === project ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProject(project)}
              className="transition-all"
            >
              {project}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Project</TableHead>
              <TableHead className="font-semibold">Date Range</TableHead>
              <TableHead className="font-semibold">Summary</TableHead>
              <TableHead className="font-semibold text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{entry.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {entry.project}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{entry.dateRange}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {entry.summary}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hover:bg-secondary hover:text-secondary-foreground"
                  >
                    <a
                      href={entry.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Go to original context"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
