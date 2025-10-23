import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CalendarView } from '@/components/CalendarView';
import { ListView } from '@/components/ListView';
import { ChatbotPanel } from '@/components/ChatbotPanel';
import { mockContextData, getUniqueProjects } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const Dashboard = () => {
  const projects = getUniqueProjects();
  const [isAddContextOpen, setIsAddContextOpen] = useState(false);
  const [contextUrl, setContextUrl] = useState('');
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Main Dashboard Area (70%) */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">ARAI Workspace</h1>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <Button className="gap-2" onClick={() => setIsAddContextOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Context
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <Tabs defaultValue="calendar" className="h-full flex flex-col">
            <TabsList className="mb-6 w-fit">
              <TabsTrigger value="calendar" className="px-6">Calendar View</TabsTrigger>
              <TabsTrigger value="list" className="px-6">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="flex-1 mt-0">
              <CalendarView entries={mockContextData} />
            </TabsContent>
            
            <TabsContent value="list" className="flex-1 mt-0">
              <ListView entries={mockContextData} projects={projects} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Chatbot Panel (30%) */}
      <div className="w-[30%] min-w-[400px] max-w-[500px]">
        <ChatbotPanel />
      </div>

      {/* Add Context Dialog */}
      <Dialog open={isAddContextOpen} onOpenChange={setIsAddContextOpen}>
        <DialogContent className="max-w-md">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Add Context</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Paste your Notion, email, or Teams link here
              </label>
              <Input
                type="url"
                placeholder="https://..."
                value={contextUrl}
                onChange={(e) => setContextUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddContextOpen(false);
                  setContextUrl('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Context processed successfully",
                    description: "Your context has been added to the workspace.",
                  });
                  setIsAddContextOpen(false);
                  setContextUrl('');
                }}
              >
                Process Context
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
