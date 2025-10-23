import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleProcess = () => {
    if (!link.trim()) return;

    setIsProcessing(true);
    setShowResult(false);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowResult(true);
    }, 2000);
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

          {showResult && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold text-foreground">
                      ARAI has added this to your workspace.
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-foreground">
                        <span className="font-medium">Title:</span> Firewall Exception Issue – Exaone foundry Project
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Summary:</span> Discussed firewall configuration for LG Electronic AX Division deployment.
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Tags:</span> [Project: Exaone Foundry] [From: 2025.01.10] [To: 2025.01.15]
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full gap-2"
              >
                View in Dashboard
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
