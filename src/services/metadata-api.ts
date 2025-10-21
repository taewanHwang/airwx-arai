import { logger } from '@/utils/logger';

// 메타데이터 추출 API 서비스

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface MetadataExtractionRequest {
  notionUrl: string;
}

export interface ExtractedMetadata {
  title: string;
  summary: string;
  topics: string[];
}

export interface MetadataApiResponse {
  success: boolean;
  data?: ExtractedMetadata;
  error?: string;
  processingTime?: number;
}

// Notion URL에서 메타데이터 추출
export async function extractMetadataFromNotionUrl(
  notionUrl: string
): Promise<ExtractedMetadata> {
  try {
    logger.info('🚀 메타데이터 추출 요청 시작', { notionUrl });

    const response = await fetch(`${API_BASE_URL}/api/metadata/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notionUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: MetadataApiResponse = await response.json();

    if (result.success && result.data) {
      logger.info('✅ 메타데이터 추출 성공', {
        notionUrl,
        title: result.data.title,
        topicsCount: result.data.topics.length,
        processingTime: result.processingTime
      });
      return result.data;
    } else {
      const errorMessage = result.error || '메타데이터 추출에 실패했습니다';
      logger.error('❌ 메타데이터 추출 실패', {
        notionUrl,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    logger.error('메타데이터 추출 API 호출 중 오류 발생', {
      notionUrl,
      error: error.message
    });
    throw error;
  }
}

// API 서버 메타데이터 서비스 헬스체크
export async function checkMetadataApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metadata/health`);
    const result = await response.json();
    logger.info('🏥 메타데이터 API 헬스체크', result);
    return result;
  } catch (error: any) {
    logger.error('메타데이터 API 서버 연결 실패', { error: error.message });
    throw new Error('메타데이터 API 서버에 연결할 수 없습니다');
  }
}