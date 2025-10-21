import { logger } from '@/utils/logger';

// 백엔드 API를 통한 Notion 연동 서비스

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API URL 로그 (항상 출력)
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 All env vars:', import.meta.env);

export interface NotionPageData {
  page: any;
  blocks: any[];
}

export interface NotionApiResponse {
  success: boolean;
  data?: NotionPageData;
  error?: string;
  code?: string;
}

export interface PageIdResponse {
  success: boolean;
  pageId?: string;
  type?: 'page' | 'database';
  error?: string;
}

// URL에서 페이지 ID 추출 (백엔드 API 사용)
export async function extractPageIdFromUrl(url: string): Promise<string | null> {
  try {
    logger.info('🔍 URL에서 페이지 ID 추출 시작', { url });

    const response = await fetch(`${API_BASE_URL}/api/notion/extract-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const result: PageIdResponse = await response.json();

    if (result.success && result.pageId) {
      logger.info('✅ 페이지 ID 추출 성공', { 
        pageId: result.pageId, 
        type: result.type 
      });
      return result.pageId;
    } else {
      logger.warn('❌ 페이지 ID 추출 실패', { error: result.error });
      return null;
    }
  } catch (error: any) {
    logger.error('URL 파싱 중 오류 발생', { 
      error: error.message, 
      url 
    });
    return null;
  }
}

// Notion URL 유효성 검증
export async function isValidNotionUrl(url: string): Promise<boolean> {
  const pageId = await extractPageIdFromUrl(url);
  return pageId !== null;
}

// Notion 페이지 데이터 가져오기 (백엔드 API 사용)
export async function fetchNotionPage(pageId: string): Promise<NotionPageData> {
  try {
    logger.info('🚀 Notion 페이지 데이터 요청 시작', { pageId });

    const response = await fetch(`${API_BASE_URL}/api/notion/page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pageId }),
    });

    const result: NotionApiResponse = await response.json();

    if (result.success && result.data) {
      logger.info('✅ Notion 페이지 데이터 가져오기 성공', {
        pageId,
        blocksCount: result.data.blocks.length
      });
      return result.data;
    } else {
      const errorMessage = result.error || '알 수 없는 오류가 발생했습니다';
      logger.error('❌ Notion 페이지 데이터 가져오기 실패', {
        pageId,
        error: errorMessage,
        code: result.code
      });
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    logger.error('Notion API 호출 중 오류 발생', {
      pageId,
      error: error.message
    });
    throw error;
  }
}

// 블록 컨텐츠를 텍스트로 변환
export function extractTextFromBlocks(blocks: any[]): string {
  let text = '';
  
  for (const block of blocks) {
    const type = block.type;
    
    switch (type) {
      case 'paragraph':
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
      case 'quote':
      case 'callout':
        if (block[type]?.rich_text) {
          text += extractRichText(block[type].rich_text) + '\n\n';
        }
        break;
      
      case 'bulleted_list_item':
      case 'numbered_list_item':
        if (block[type]?.rich_text) {
          text += '• ' + extractRichText(block[type].rich_text) + '\n';
        }
        break;
      
      case 'to_do':
        if (block[type]?.rich_text) {
          const checkbox = block[type].checked ? '☑' : '☐';
          text += `${checkbox} ${extractRichText(block[type].rich_text)}\n`;
        }
        break;
      
      case 'toggle':
        if (block[type]?.rich_text) {
          text += '▸ ' + extractRichText(block[type].rich_text) + '\n';
        }
        break;
      
      case 'code':
        if (block[type]?.rich_text) {
          text += '```' + (block[type].language || '') + '\n';
          text += extractRichText(block[type].rich_text) + '\n';
          text += '```\n\n';
        }
        break;
      
      case 'divider':
        text += '---\n\n';
        break;
      
      case 'table':
        text += '[테이블]\n\n';
        break;
      
      default:
        logger.debug(`지원하지 않는 블록 타입: ${type}`);
    }
    
    if (block.has_children) {
      text += '[하위 컨텐츠]\n';
    }
  }
  
  return text.trim();
}

// Rich Text 객체에서 텍스트 추출
function extractRichText(richTexts: any[]): string {
  return richTexts.map(rt => rt.plain_text || '').join('');
}

// 페이지 제목 추출
export function extractPageTitle(page: any): string {
  const properties = page.properties;
  
  for (const key in properties) {
    const prop = properties[key];
    if (prop.type === 'title' && prop.title?.length > 0) {
      return extractRichText(prop.title);
    }
  }
  
  return `Untitled (${page.id})`;
}

// 디버그용: Notion 페이지 정보 출력
export function debugNotionContent(pageData: NotionPageData) {
  const { page, blocks } = pageData;
  const title = extractPageTitle(page);
  const text = extractTextFromBlocks(blocks);
  
  const debugInfo = {
    id: page.id,
    title,
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    url: page.url,
    blocksCount: blocks.length,
    fullText: text,
    textLength: text.length,
  };

  logger.info('🔍 Notion 페이지 디버그 정보', debugInfo);
  
  return debugInfo;
}

// API 서버 헬스체크
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const result = await response.json();
    logger.info('🏥 API 서버 헬스체크', result);
    return result;
  } catch (error: any) {
    logger.error('API 서버 연결 실패', { error: error.message });
    throw new Error('API 서버에 연결할 수 없습니다');
  }
}