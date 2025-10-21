// 클라이언트 로깅 시스템

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN', 
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userAgent?: string;
  url?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 최대 로그 개수

  // 로그 추가
  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 로그 배열에 추가
    this.logs.unshift(entry);
    
    // 최대 개수 초과시 오래된 로그 제거
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // 콘솔에도 출력
    this.logToConsole(entry);
    
    // 서버에 전송 (선택적)
    this.sendToServer(entry);
  }

  // 콘솔 출력
  private logToConsole(entry: LogEntry) {
    const { timestamp, level, message, data } = entry;
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, data ? JSON.parse(data) : '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data ? JSON.parse(data) : '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, data ? JSON.parse(data) : '');
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, data ? JSON.parse(data) : '');
        break;
    }
  }

  // 서버로 로그 전송 (추후 구현)
  private async sendToServer(entry: LogEntry) {
    try {
      // TODO: 백엔드 API 구현 후 활성화
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.warn('로그 서버 전송 실패:', error);
    }
  }

  // 공개 메서드들
  error(message: string, data?: any) {
    this.addLog(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any) {
    this.addLog(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any) {
    this.addLog(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any) {
    this.addLog(LogLevel.DEBUG, message, data);
  }

  // 모든 로그 반환
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  // 로그 다운로드
  downloadLogs() {
    const logsJson = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `arai-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 로그 지우기
  clearLogs() {
    this.logs = [];
    console.clear();
  }

  // 특정 레벨의 로그만 반환
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();

// 전역 오류 처리
window.addEventListener('error', (event) => {
  logger.error('전역 JavaScript 오류', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  });
});

// 처리되지 않은 Promise 거부 처리
window.addEventListener('unhandledrejection', (event) => {
  logger.error('처리되지 않은 Promise 거부', {
    reason: event.reason,
    stack: event.reason?.stack
  });
});

// 개발 환경에서 전역 logger 노출
if (import.meta.env.DEV) {
  (window as any).logger = logger;
}