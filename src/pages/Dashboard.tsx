import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/CalendarView';
import { ListView } from '@/components/ListView';
import { ChatbotPanel } from '@/components/ChatbotPanel';
import { mockContextData, getUniqueProjects } from '@/data/mockData';

const Dashboard = () => {
  const projects = getUniqueProjects();

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
                <Button className="gap-2">
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
    </div>
  );
};

export default Dashboard;
