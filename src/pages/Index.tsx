import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  isValidNotionUrl, 
  extractPageIdFromUrl, 
  fetchNotionPage, 
  debugNotionContent,
  checkApiHealth
} from '@/services/notion-api';
import { logger } from '@/utils/logger';

const Index = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleProcess = async () => {
    if (!link.trim()) return;

    console.log('🚀 handleProcess 시작', link);
    
    // 에러 및 결과 초기화
    setError(null);
    setShowResult(false);
    setDebugInfo(null);
    setIsProcessing(true);
    
    console.log('📋 상태 초기화 완료');

    try {
      // Notion URL 유효성 검증
      const isValid = await isValidNotionUrl(link);
      if (!isValid) {
        throw new Error('유효한 Notion URL이 아닙니다. Notion 페이지 또는 데이터베이스 URL을 입력해주세요.');
      }

      // 페이지 ID 추출
      const pageId = await extractPageIdFromUrl(link);
      if (!pageId) {
        throw new Error('URL에서 페이지 ID를 추출할 수 없습니다.');
      }

      console.log('🚀 Notion 페이지 처리 시작');
      console.log('📎 입력 URL:', link);
      console.log('🆔 추출된 페이지 ID:', pageId);

      // Notion API 호출
      const pageData = await fetchNotionPage(pageId);
      
      // 디버그 정보 출력 및 저장
      const debug = debugNotionContent(pageData);
      setDebugInfo(debug);
      
      // 성공 결과 표시
      setShowResult(true);
      
    } catch (err: any) {
      console.error('❌ 처리 중 오류 발생:', err);
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
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
                  Processing your link…
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
                Processing your link… extracting summary and tags…
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-6 animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showResult && debugInfo && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold text-foreground">
                      Notion 페이지를 성공적으로 가져왔습니다!
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-foreground">
                        <span className="font-medium">제목:</span> {debugInfo.title}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">페이지 ID:</span> {debugInfo.id}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">생성일:</span> {new Date(debugInfo.createdTime).toLocaleString('ko-KR')}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">수정일:</span> {new Date(debugInfo.lastEditedTime).toLocaleString('ko-KR')}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">블록 수:</span> {debugInfo.blocksCount}개
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">텍스트 길이:</span> {debugInfo.textLength}자
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium mb-2">디버그 정보 (콘솔 확인)</p>
                <p className="text-xs text-muted-foreground font-mono">
                  콘솔에서 상세한 디버그 정보를 확인하세요.
                  <br />
                  추출된 텍스트 미리보기: {debugInfo.fullText.substring(0, 100)}...
                </p>
              </div>

              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full gap-2"
              >
                대시보드로 이동 (테스트)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;
