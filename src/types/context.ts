export interface ContextEntry {
  id: string;
  title: string;
  project: string;
  dateRange: string;
  startDate: Date;
  endDate: Date;
  link: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
