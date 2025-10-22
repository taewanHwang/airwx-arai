import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CalendarView } from '@/components/CalendarView';
import { ListView } from '@/components/ListView';
import { ChatbotPanel } from '@/components/ChatbotPanel';
import { getContexts, getContextStats, type ContextEntry } from '@/services/context-api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Dashboard = () => {
  const navigate = useNavigate();
  const [contexts, setContexts] = useState<ContextEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  // 컨텍스트 데이터 로드
  const loadContexts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getContexts();
      setContexts(data);
    } catch (err: any) {
      console.error('컨텍스트 로드 오류:', err);
      setError(err.message || '컨텍스트를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 통계 데이터 로드
  const loadStats = async () => {
    try {
      const statsData = await getContextStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('통계 로드 오류:', err);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadContexts();
    loadStats();
  }, []);

  // 프로젝트 목록 추출 (실제 데이터에서)
  const getUniqueProjects = () => {
    const projects = new Set(
      contexts.flatMap(context => context.topics || [])
    );
    return Array.from(projects);
  };

  const projects = getUniqueProjects();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Main Dashboard Area (70%) */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">ARAI Workspace</h1>
                {stats && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.totalContexts}개의 컨텍스트 저장됨
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4" />
                  홈으로
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={loadContexts}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  새로고침
                </Button>
                <Button variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <Button className="gap-2" onClick={() => navigate('/')}>
                  <Plus className="h-4 w-4" />
                  컨텍스트 추가
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          {/* 오류 표시 */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 로딩 상태 */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>컨텍스트를 불러오는 중...</span>
              </div>
            </div>
          ) : contexts.length === 0 ? (
            /* 빈 상태 */
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">컨텍스트가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                첫 번째 컨텍스트를 추가해보세요
              </p>
              <Button className="gap-2" onClick={() => navigate('/')}>
                <Plus className="h-4 w-4" />
                컨텍스트 추가하기
              </Button>
            </div>
          ) : (
            /* 실제 데이터 표시 */
            <Tabs defaultValue="list" className="h-full flex flex-col">
              <TabsList className="mb-6 w-fit">
                <TabsTrigger value="list" className="px-6">List View</TabsTrigger>
                <TabsTrigger value="calendar" className="px-6">Calendar View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="flex-1 mt-0">
                <ListView entries={contexts} projects={projects} onRefresh={loadContexts} />
              </TabsContent>
              
              <TabsContent value="calendar" className="flex-1 mt-0">
                <CalendarView entries={contexts} onRefresh={loadContexts} />
              </TabsContent>
            </Tabs>
          )}
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
