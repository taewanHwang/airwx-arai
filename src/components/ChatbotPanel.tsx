import { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/context';

const initialMessages: ChatMessage[] = [
  {
    id: '0',
    role: 'assistant',
    content: '안녕하세요, ARAI입니다.'
  }
];

const mockResponses: Record<string, string> = {
  'exaone': '마지막 논의에서는 보안팀 검토 후 일시적으로 방화벽을 오픈하기로 결정되었어요. 테스트 환경에서만 적용하며, 주간 리뷰 때 다시 점검 예정입니다.',
  '담당자': '해당 이슈는 LG BB 측 Minji가 담당하고 있었어요. 내부적으로는 보안 파트의 현우님이 대응 중이었습니다.'
};

export const ChatbotPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);

    // Mock response logic
    setTimeout(() => {
      let responseContent = '죄송합니다, 해당 내용을 찾을 수 없습니다. 다시 질문해 주세요.';
      
      if (input.toLowerCase().includes('exaone') || input.includes('방화벽')) {
        responseContent = mockResponses['exaone'];
      } else if (input.includes('담당자') || input.includes('누구')) {
        responseContent = mockResponses['담당자'];
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 500);

    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-6 border-b border-border bg-accent/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Ask ARAI 💬</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Recover your lost context instantly.
        </p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card">
        <p className="text-xs text-muted-foreground mb-3 text-center">
          (Chat responses are pre-set examples for this prototype.)
        </p>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="질문을 입력하세요..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
