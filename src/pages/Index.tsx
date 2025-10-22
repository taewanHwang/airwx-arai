import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Sparkles, ArrowRight, Loader2, AlertCircle, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { 
  isValidNotionUrl, 
  extractPageIdFromUrl, 
  fetchNotionPage, 
  debugNotionContent,
  checkApiHealth
} from '@/services/notion-api';
import { extractMetadataFromNotionUrl } from '@/services/metadata-api';
import { clearAllContexts } from '@/services/context-api';
import { logger } from '@/utils/logger';

const Index = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isClearingDb, setIsClearingDb] = useState(false);

  const handleProcess = async () => {
    if (!link.trim()) return;

    console.log('🚀 handleProcess 시작', link);
    
    // 에러 및 결과 초기화
    setError(null);
    setShowResult(false);
    setDebugInfo(null);
    setMetadata(null);
    setIsProcessing(true);
    
    console.log('📋 상태 초기화 완료');

    try {
      // Notion URL 유효성 검증
      const isValid = await isValidNotionUrl(link);
      if (!isValid) {
        throw new Error('유효한 Notion URL이 아닙니다. Notion 페이지 또는 데이터베이스 URL을 입력해주세요.');
      }

      console.log('🚀 메타데이터 추출 처리 시작');
      console.log('📎 입력 URL:', link);

      // 메타데이터 추출 API 호출
      const extractedMetadata = await extractMetadataFromNotionUrl(link);
      
      console.log('✅ 메타데이터 추출 성공:', extractedMetadata);
      setMetadata(extractedMetadata);
      
      // 성공 결과 표시
      setShowResult(true);
      
    } catch (err: any) {
      console.error('❌ 처리 중 오류 발생:', err);
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearDatabase = async () => {
    setIsClearingDb(true);
    try {
      const deletedCount = await clearAllContexts();
      setError(null);
      // 성공 메시지를 error state에 임시로 표시 (성공용 state가 없으므로)
      setError(`✅ 데이터베이스 초기화 완료! ${deletedCount}개의 컨텍스트가 삭제되었습니다.`);
      
      // 3초 후 메시지 제거
      setTimeout(() => {
        setError(null);
      }, 3000);
      
      logger.info('데이터베이스 초기화 완료', { deletedCount });
    } catch (err: any) {
      console.error('❌ DB 초기화 중 오류 발생:', err);
      setError(`DB 초기화 실패: ${err.message}`);
    } finally {
      setIsClearingDb(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      {/* 설정 버튼 (우측 상단) */}
      <div className="fixed top-4 right-4 z-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-background/80 backdrop-blur-sm"
              disabled={isClearingDb}
            >
              {isClearingDb ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              설정
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                데이터베이스 초기화
              </AlertDialogTitle>
              <AlertDialogDescription>
                모든 저장된 컨텍스트를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                <br />
                <span className="text-destructive font-medium">정말로 계속하시겠습니까?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearDatabase}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isClearingDb}
              >
                {isClearingDb ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    삭제 중...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    모든 데이터 삭제
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome to ARAI
          </h1>
          <p className="text-xl text-muted-foreground">
            Always Ready, Always Informed
          </p>
          <p className="text-base text-muted-foreground mt-2">
            Paste your work link and let ARAI remember the context for you.
          </p>
        </div>

        <Card className="p-8 shadow-lg animate-scale-in">
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="link-input" className="text-sm font-medium text-foreground">
                Paste your Notion, email, or Teams link here…
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="link-input"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleProcess()}
                  placeholder="https://notion.so/..."
                  className="pl-10 py-6 text-base"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <Button
              onClick={handleProcess}
              disabled={!link.trim() || isProcessing}
              className="w-full py-6 text-base font-medium gap-2"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Extracting metadata with AI…
                </>
              ) : (
                <>
                  Process Context
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="mt-6 p-4 bg-accent/30 rounded-lg text-center animate-fade-in">
              <p className="text-sm text-muted-foreground">
                Extracting metadata with Exaone AI… analyzing content and generating summary…
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-6 animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showResult && metadata && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🤖</div>
                  <div className="flex-1 space-y-3">
                    <p className="font-semibold text-foreground">
                      AI 메타데이터 추출 완료!
                    </p>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">제목</p>
                        <p className="text-base font-semibold text-foreground">{metadata.title}</p>
                      </div>
                      
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">요약</p>
                        <p className="text-sm text-foreground leading-relaxed">{metadata.summary}</p>
                      </div>
                      
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-2">주요 주제</p>
                        <div className="flex flex-wrap gap-2">
                          {metadata.topics.map((topic: string, index: number) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {metadata.contextId && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">저장 완료</p>
                          <p className="text-xs text-green-600 font-mono">
                            ID: {metadata.contextId}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            이 컨텍스트는 데이터베이스에 저장되어 대시보드에서 확인할 수 있습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  저장된 컨텍스트 보기
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={() => {
                    setLink('');
                    setShowResult(false);
                    setMetadata(null);
                    setError(null);
                  }}
                  variant="secondary"
                  className="gap-2"
                >
                  새로 분석하기
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;
