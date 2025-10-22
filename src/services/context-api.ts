import { logger } from '@/utils/logger';

// 컨텍스트 API 서비스

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ContextEntry {
  id: string;
  title: string;
  summary: string;
  topics: string[];
  original_url: string;
  notion_content: string;
  created_at: Date;
  processing_time: number;
}

export interface ContextListResponse {
  success: boolean;
  data: ContextEntry[];
  pagination: {
    limit: number;
    offset: number;
    hasSearch: boolean;
  };
  error?: string;
}

export interface ContextResponse {
  success: boolean;
  data?: ContextEntry;
  error?: string;
}

export interface ContextStats {
  totalContexts: number;
  recentContexts: number;
  dbPath: string;
  dbSize: number;
}

export interface ContextStatsResponse {
  success: boolean;
  data?: ContextStats;
  error?: string;
}

export interface ClearAllResponse {
  success: boolean;
  message?: string;
  deletedCount?: number;
  error?: string;
}

// 컨텍스트 목록 조회
export async function getContexts(
  limit: number = 50,
  offset: number = 0,
  search?: string
): Promise<ContextEntry[]> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    logger.info('📋 컨텍스트 목록 조회 요청', { limit, offset, search });

    const response = await fetch(`${API_BASE_URL}/api/contexts?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ContextListResponse = await response.json();

    if (result.success && result.data) {
      logger.info('✅ 컨텍스트 목록 조회 성공', {
        count: result.data.length,
        hasSearch: result.pagination.hasSearch
      });
      
      // Date 객체로 변환
      return result.data.map(context => ({
        ...context,
        created_at: new Date(context.created_at)
      }));
    } else {
      const errorMessage = result.error || '컨텍스트 목록 조회에 실패했습니다';
      logger.error('❌ 컨텍스트 목록 조회 실패', { error: errorMessage });
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    logger.error('컨텍스트 목록 조회 API 호출 중 오류 발생', {
      error: error.message
    });
    throw error;
  }
}

// 특정 컨텍스트 조회
export async function getContextById(id: string): Promise<ContextEntry> {
  try {
    logger.info('🔍 컨텍스트 상세 조회 요청', { id });

    const response = await fetch(`${API_BASE_URL}/api/contexts/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('컨텍스트를 찾을 수 없습니다');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ContextResponse = await response.json();

    if (result.success && result.data) {
      logger.info('✅ 컨텍스트 상세 조회 성공', { 
        id, 
        title: result.data.title 
      });
      
      return {
        ...result.data,
        created_at: new Date(result.data.created_at)
      };
    } else {
      const errorMessage = result.error || '컨텍스트 조회에 실패했습니다';
      logger.error('❌ 컨텍스트 상세 조회 실패', { id, error: errorMessage });
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    logger.error('컨텍스트 상세 조회 API 호출 중 오류 발생', {
      id,
      error: error.message
    });
    throw error;
  }
}

// 컨텍스트 삭제
export async function deleteContext(id: string): Promise<void> {
  try {
    logger.info('🗑️ 컨텍스트 삭제 요청', { id });

    const response = await fetch(`${API_BASE_URL}/api/contexts/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('삭제할 컨텍스트를 찾을 수 없습니다');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      logger.info('✅ 컨텍스트 삭제 성공', { id });
    } else {
      const errorMessage = result.error || '컨텍스트 삭제에 실패했습니다';
      logger.error('❌ 컨텍스트 삭제 실패', { id, error: errorMessage });
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    logger.error('컨텍스트 삭제 API 호출 중 오류 발생', {
      id,
      error: error.message
    });
    throw error;
  }
}

// 데이터베이스 통계 조회
export async function getContextStats(): Promise<ContextStats> {
  try {
    logger.info('📊 컨텍스트 통계 조회 요청');

    const response = await fetch(`${API_BASE_URL}/api/contexts/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ContextStatsResponse = await response.json();

    if (result.success && result.data) {
      logger.info('✅ 컨텍스트 통계 조회 성공', result.data);
      return result.data;
    } else {
      const errorMessage = result.error || '통계 조회에 실패했습니다';
      logger.error('❌ 컨텍스트 통계 조회 실패', { error: errorMessage });
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    logger.error('컨텍스트 통계 조회 API 호출 중 오류 발생', {
      error: error.message
    });
    throw error;
  }
}

// 모든 컨텍스트 초기화 (DB 클리어)
export async function clearAllContexts(): Promise<number> {
  try {
    logger.info('🗑️ 모든 컨텍스트 초기화 요청');

    const response = await fetch(`${API_BASE_URL}/api/contexts/clear-all`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ClearAllResponse = await response.json();

    if (result.success) {
      const deletedCount = result.deletedCount || 0;
      logger.info('✅ 모든 컨텍스트 초기화 성공', { deletedCount });
      return deletedCount;
    } else {
      const errorMessage = result.error || '데이터베이스 초기화에 실패했습니다';
      logger.error('❌ 모든 컨텍스트 초기화 실패', { error: errorMessage });
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    logger.error('모든 컨텍스트 초기화 API 호출 중 오류 발생', {
      error: error.message
    });
    throw error;
  }
}