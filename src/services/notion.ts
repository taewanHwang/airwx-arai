import { Client } from '@notionhq/client';

// Notion 클라이언트 초기화
const notion = new Client({
  auth: import.meta.env.VITE_NOTION_API_KEY,
});

// Notion URL 패턴 정규식 (더 유연하게 수정)
const NOTION_URL_PATTERNS = {
  // 일반 페이지: workspace/title-pageId 또는 workspace/pageId 형식
  page: /^https?:\/\/(www\.)?notion\.so\/([a-zA-Z0-9-]+\/)?([a-zA-Z0-9-]*-)?([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(\?.*)?$/,
  // 데이터베이스: ?v= 파라미터가 있는 경우
  database: /^https?:\/\/(www\.)?notion\.so\/([a-zA-Z0-9-]+\/)?([a-zA-Z0-9-]*-)?([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\?.*v=([a-f0-9]{32}).*$/,
};

// URL에서 페이지 ID 추출
export function extractPageIdFromUrl(url: string): string | null {
  // URL 정규화 (쿼리 파라미터 제거하지 않음)
  const normalizedUrl = url.trim();
  
  console.log('🔍 URL 분석 중:', normalizedUrl);
  
  // 데이터베이스 URL 먼저 확인 (?v= 파라미터가 있는 경우)
  const dbMatch = normalizedUrl.match(NOTION_URL_PATTERNS.database);
  if (dbMatch) {
    console.log('✅ 데이터베이스 URL 매칭:', dbMatch);
    const pageId = dbMatch[4].replace(/-/g, '');
    console.log('📄 추출된 페이지 ID:', pageId);
    return pageId;
  }
  
  // 일반 페이지 URL 매칭
  const pageMatch = normalizedUrl.match(NOTION_URL_PATTERNS.page);
  if (pageMatch) {
    console.log('✅ 페이지 URL 매칭:', pageMatch);
    const pageId = pageMatch[4].replace(/-/g, '');
    console.log('📄 추출된 페이지 ID:', pageId);
    return pageId;
  }
  
  console.log('❌ URL 패턴 매칭 실패');
  console.log('페이지 패턴:', NOTION_URL_PATTERNS.page);
  console.log('데이터베이스 패턴:', NOTION_URL_PATTERNS.database);
  
  return null;
}

// Notion URL 유효성 검증
export function isValidNotionUrl(url: string): boolean {
  return extractPageIdFromUrl(url) !== null;
}

// 페이지 컨텐츠 가져오기
export async function fetchNotionPage(pageId: string) {
  try {
    // 페이지 메타데이터 가져오기
    const page = await notion.pages.retrieve({ page_id: pageId });
    
    // 페이지 블록 컨텐츠 가져오기
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    
    // 모든 블록 가져오기 (페이지네이션 처리)
    let allBlocks = blocks.results;
    let cursor = blocks.next_cursor;
    
    while (cursor) {
      const moreBlocks = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
        start_cursor: cursor,
      });
      allBlocks = [...allBlocks, ...moreBlocks.results];
      cursor = moreBlocks.next_cursor;
    }
    
    return {
      page,
      blocks: allBlocks,
    };
  } catch (error: any) {
    console.error('Notion API 에러:', error);
    
    // 에러 처리
    if (error.code === 'object_not_found') {
      throw new Error('페이지를 찾을 수 없습니다. URL을 확인하거나 페이지 접근 권한을 확인해주세요.');
    } else if (error.code === 'unauthorized') {
      throw new Error('Notion API 인증에 실패했습니다. API 키를 확인해주세요.');
    } else if (error.code === 'rate_limited') {
      throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      throw new Error(`Notion 페이지를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}

// 블록 컨텐츠를 텍스트로 변환
export function extractTextFromBlocks(blocks: any[]): string {
  let text = '';
  
  for (const block of blocks) {
    const type = block.type;
    
    // 각 블록 타입별 텍스트 추출
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
        // 테이블은 별도 처리 필요 (복잡함)
        text += '[테이블]\n\n';
        break;
      
      default:
        // 지원하지 않는 블록 타입
        console.log(`지원하지 않는 블록 타입: ${type}`);
    }
    
    // 자식 블록이 있으면 재귀적으로 처리
    if (block.has_children) {
      // 자식 블록은 별도 API 호출이 필요함 (성능상 생략 가능)
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
  // 페이지 속성에서 제목 찾기
  const properties = page.properties;
  
  for (const key in properties) {
    const prop = properties[key];
    if (prop.type === 'title' && prop.title?.length > 0) {
      return extractRichText(prop.title);
    }
  }
  
  // 제목이 없으면 페이지 ID 반환
  return `Untitled (${page.id})`;
}

// 디버그용: Notion 페이지 정보 출력
export function debugNotionContent(pageData: any) {
  const { page, blocks } = pageData;
  const title = extractPageTitle(page);
  const text = extractTextFromBlocks(blocks);
  
  console.group('🔍 Notion 페이지 디버그 정보');
  console.log('📄 페이지 ID:', page.id);
  console.log('📝 페이지 제목:', title);
  console.log('📅 생성일:', page.created_time);
  console.log('📅 수정일:', page.last_edited_time);
  console.log('🔗 URL:', page.url);
  console.log('📊 블록 수:', blocks.length);
  console.log('📄 추출된 텍스트 (처음 500자):');
  console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
  console.log('📄 전체 텍스트 길이:', text.length, '자');
  console.groupEnd();
  
  return {
    id: page.id,
    title,
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    url: page.url,
    blocksCount: blocks.length,
    fullText: text,
    textLength: text.length,
  };
}