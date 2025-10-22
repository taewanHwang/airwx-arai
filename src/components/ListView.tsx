import { useState } from 'react';
import { ContextEntry, deleteContext } from '@/services/context-api';
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ListViewProps {
  entries: ContextEntry[];
  projects: string[];
  onRefresh?: () => void;
}

export const ListView = ({ entries, projects, onRefresh }: ListViewProps) => {
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteContext = async (id: string, title: string) => {
    setDeletingId(id);
    try {
      await deleteContext(id);
      toast({
        title: "컨텍스트 삭제 완료",
        description: `"${title}"이(가) 성공적으로 삭제되었습니다.`,
      });
      
      // 데이터 새로고침
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast({
        title: "삭제 실패",
        description: error.message || "컨텍스트 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEntries = (selectedProject === 'All Projects'
    ? entries
    : entries.filter(entry => entry.topics.includes(selectedProject))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by created date descending

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">저장된 컨텍스트</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedProject === 'All Projects' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedProject('All Projects')}
            className="transition-all"
          >
            전체 ({entries.length})
          </Button>
          {projects.map(project => (
            <Button
              key={project}
              variant={selectedProject === project ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProject(project)}
              className="transition-all"
            >
              {project} ({entries.filter(e => e.topics.includes(project)).length})
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">제목</TableHead>
              <TableHead className="font-semibold">주제</TableHead>
              <TableHead className="font-semibold">생성일</TableHead>
              <TableHead className="font-semibold">요약</TableHead>
              <TableHead className="font-semibold text-right">링크</TableHead>
              <TableHead className="font-semibold text-right">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {selectedProject === 'All Projects' 
                    ? '저장된 컨텍스트가 없습니다' 
                    : `"${selectedProject}" 주제의 컨텍스트가 없습니다`
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{entry.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.topics.slice(0, 2).map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {entry.topics.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{entry.topics.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString('ko-KR')}
                  </TableCell>
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
                        href={entry.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="원본 링크로 이동"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-destructive hover:text-destructive-foreground"
                          disabled={deletingId === entry.id}
                        >
                          {deletingId === entry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>컨텍스트 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 "{entry.title}"을(를) 삭제하시겠습니까?
                            <br />
                            <span className="text-destructive font-medium">
                              이 작업은 되돌릴 수 없습니다.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteContext(entry.id, entry.title)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
