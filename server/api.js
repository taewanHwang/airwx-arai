import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';
import fetch from 'node-fetch';
import crypto from 'crypto';
import {
  saveContext,
  getAllContexts,
  getContextById,
  deleteContext,
  searchContexts,
  getStats,
  clearAllContexts
} from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 로깅 미들웨어
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// 클라이언트 로그 수집 엔드포인트
app.post('/api/logs', (req, res) => {
  const logEntry = req.body;
  console.log('📝 클라이언트 로그:', JSON.stringify(logEntry, null, 2));
  res.status(200).json({ success: true });
});

// Notion 페이지 가져오기 API
app.post('/api/notion/page', async (req, res) => {
  try {
    const { pageId } = req.body;
    
    if (!pageId) {
      return res.status(400).json({ 
        error: 'pageId가 필요합니다' 
      });
    }

    console.log(`🔍 Notion 페이지 요청: ${pageId}`);

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

    console.log(`✅ 페이지 가져오기 성공: ${allBlocks.length}개 블록`);
    
    res.json({
      success: true,
      data: {
        page,
        blocks: allBlocks,
      }
    });

  } catch (error) {
    console.error('❌ Notion API 오류:', error);
    
    let errorMessage = '알 수 없는 오류가 발생했습니다';
    let statusCode = 500;

    if (error.code === 'object_not_found') {
      errorMessage = '페이지를 찾을 수 없습니다. URL을 확인하거나 페이지 접근 권한을 확인해주세요.';
      statusCode = 404;
    } else if (error.code === 'unauthorized') {
      errorMessage = 'Notion API 인증에 실패했습니다. API 키를 확인해주세요.';
      statusCode = 401;
    } else if (error.code === 'rate_limited') {
      errorMessage = '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: error.code
    });
  }
});

// URL에서 페이지 ID 추출 API
app.post('/api/notion/extract-id', (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL이 필요합니다' 
      });
    }

    // URL 패턴 매칭 (프론트엔드와 동일한 로직)
    const pagePattern = /^https?:\/\/(www\.)?notion\.so\/([a-zA-Z0-9-]+\/)?([a-zA-Z0-9-]*-)?([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(\?.*)?$/;
    const dbPattern = /^https?:\/\/(www\.)?notion\.so\/([a-zA-Z0-9-]+\/)?([a-zA-Z0-9-]*-)?([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\?.*v=([a-f0-9]{32}).*$/;

    const normalizedUrl = url.trim();
    
    // 데이터베이스 URL 먼저 확인
    const dbMatch = normalizedUrl.match(dbPattern);
    if (dbMatch) {
      const pageId = dbMatch[4].replace(/-/g, '');
      return res.json({
        success: true,
        pageId,
        type: 'database'
      });
    }
    
    // 일반 페이지 URL 확인
    const pageMatch = normalizedUrl.match(pagePattern);
    if (pageMatch) {
      const pageId = pageMatch[4].replace(/-/g, '');
      return res.json({
        success: true,
        pageId,
        type: 'page'
      });
    }

    res.status(400).json({
      success: false,
      error: '유효한 Notion URL이 아닙니다'
    });

  } catch (error) {
    console.error('URL 파싱 오류:', error);
    res.status(500).json({
      success: false,
      error: 'URL 처리 중 오류가 발생했습니다'
    });
  }
});

// 블록 컨텐츠를 텍스트로 변환하는 헬퍼 함수
function extractTextFromBlocks(blocks) {
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
      
      default:
        // 지원하지 않는 블록 타입은 무시
        break;
    }
  }
  
  return text.trim();
}

// Rich Text 객체에서 텍스트 추출
function extractRichText(richTexts) {
  return richTexts.map(rt => rt.plain_text || '').join('');
}

// 페이지 제목 추출
function extractPageTitle(page) {
  const properties = page.properties;
  
  for (const key in properties) {
    const prop = properties[key];
    if (prop.type === 'title' && prop.title?.length > 0) {
      return extractRichText(prop.title);
    }
  }
  
  return `Untitled (${page.id})`;
}

// Exaone API 호출 함수
async function callExaoneAPI(content) {
  const apiKey = process.env.EXAONE_API_KEY;
  const apiUrl = process.env.EXAONE_API_URL || 'https://api.lgresearch.ai';
  
  if (!apiKey) {
    throw new Error('EXAONE_API_KEY가 설정되지 않았습니다');
  }

  const prompt = `다음 문서를 자세히 분석하여 완전한 JSON 형식으로 메타데이터를 추출해주세요.

문서 내용:
${content}

위 문서를 분석하여 다음 JSON 형식으로 응답해주세요. 반드시 완전한 JSON만 출력하고, 다른 설명은 포함하지 마세요:

{
  "title": "문서의 정확한 제목",
  "summary": "문서의 주요 내용을 2-3문장으로 상세히 요약",
  "topics": ["주제1", "주제2", "주제3"]
}

중요: 반드시 완전한 JSON 형식으로만 응답하세요.`;

  const payload = {
    model: "32b",
    query: prompt,
    temperature: 0.1,
    max_tokens: 500,
    top_p: 0.9
  };

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "x-api-key": apiKey,
  };

  const response = await fetch(`${apiUrl}/v1/chatexaone/text-generation`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Exaone API 오류: ${response.status} ${response.statusText}`);
  }

  // Node.js 스트리밍 응답 처리
  let fullAnswer = "";
  
  // Node.js에서 스트림 처리
  for await (const chunk of response.body) {
    const chunkStr = chunk.toString('utf8');
    const lines = chunkStr.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        // 여러 JSON이 붙어있는 경우 분리
        const jsonParts = line.replace('}{', '}|||{').split('|||');
        
        for (const jsonStr of jsonParts) {
          const data = JSON.parse(jsonStr);
          if (data.result_code === 200) {
            const answer = data.data?.answer || '';
            if (answer) {
              fullAnswer += answer;
            }
          }
        }
      } catch (e) {
        // JSON 파싱 실패는 무시
        continue;
      }
    }
  }

  // JSON 응답 파싱
  const jsonMatches = fullAnswer.match(/\{[^{}]*(?:"[^"]*"[^{}]*)*\}/g);
  
  if (!jsonMatches) {
    throw new Error('응답에서 JSON 형식을 찾을 수 없습니다');
  }

  for (const jsonStr of jsonMatches) {
    try {
      const parsed = JSON.parse(jsonStr);
      
      // 필수 필드 검증
      if (parsed.title && parsed.summary && Array.isArray(parsed.topics)) {
        return parsed;
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error('유효한 메타데이터를 파싱할 수 없습니다');
}

// 메타데이터 추출 API
app.post('/api/metadata/extract', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { notionUrl } = req.body;
    
    if (!notionUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'notionUrl이 필요합니다' 
      });
    }

    console.log(`🚀 메타데이터 추출 요청: ${notionUrl}`);

    // 1. URL에서 페이지 ID 추출
    const pagePattern = /^https?:\/\/(www\.)?notion\.so\/([a-zA-Z0-9-]+\/)?([a-zA-Z0-9-]*-)?([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(\?.*)?$/;
    const pageMatch = notionUrl.match(pagePattern);
    
    if (!pageMatch) {
      return res.status(400).json({
        success: false,
        error: '유효한 Notion URL이 아닙니다'
      });
    }

    const pageId = pageMatch[4].replace(/-/g, '');

    // 2. Notion 페이지 데이터 가져오기
    const page = await notion.pages.retrieve({ page_id: pageId });
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

    // 3. 텍스트 추출
    const content = extractTextFromBlocks(allBlocks);
    const limitedContent = content.substring(0, 1500); // 1500자 제한
    
    console.log(`📄 텍스트 추출 완료: ${content.length}자 (제한: ${limitedContent.length}자)`);

    // 4. Exaone API 호출
    const metadata = await callExaoneAPI(limitedContent);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ 메타데이터 추출 성공: ${processingTime}ms`);

    // 컨텍스트 데이터베이스에 저장
    const contextId = crypto.randomUUID();
    const contextData = {
      id: contextId,
      title: metadata.title,
      summary: metadata.summary,
      topics: metadata.topics,
      original_url: notionUrl,
      notion_content: limitedContent,
      processing_time: processingTime
    };

    try {
      await saveContext(contextData);
      console.log(`💾 컨텍스트 저장 완료: ${contextId}`);
    } catch (dbError) {
      console.error('데이터베이스 저장 오류:', dbError);
      // DB 저장 실패해도 메타데이터는 반환
    }

    res.json({
      success: true,
      data: {
        ...metadata,
        contextId // 저장된 컨텍스트 ID 포함
      },
      processingTime
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ 메타데이터 추출 오류:', error);
    
    let errorMessage = '메타데이터 추출 중 오류가 발생했습니다';
    let statusCode = 500;

    if (error.code === 'object_not_found') {
      errorMessage = '페이지를 찾을 수 없습니다. URL을 확인하거나 페이지 접근 권한을 확인해주세요.';
      statusCode = 404;
    } else if (error.code === 'unauthorized') {
      errorMessage = 'Notion API 인증에 실패했습니다. API 키를 확인해주세요.';
      statusCode = 401;
    } else if (error.message.includes('EXAONE_API_KEY')) {
      errorMessage = 'Exaone API 키가 설정되지 않았습니다.';
      statusCode = 500;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      processingTime
    });
  }
});

// 컨텍스트 목록 조회
app.get('/api/contexts', async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    
    let contexts;
    if (search) {
      contexts = await searchContexts(search, parseInt(limit));
    } else {
      contexts = await getAllContexts(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: contexts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasSearch: !!search
      }
    });
  } catch (error) {
    console.error('컨텍스트 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '컨텍스트 목록을 불러오는데 실패했습니다'
    });
  }
});

// 특정 컨텍스트 조회
app.get('/api/contexts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const context = await getContextById(id);

    if (!context) {
      return res.status(404).json({
        success: false,
        error: '컨텍스트를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: context
    });
  } catch (error) {
    console.error('컨텍스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '컨텍스트를 불러오는데 실패했습니다'
    });
  }
});

// 모든 컨텍스트 초기화 (DB 클리어) - 더 구체적인 라우트를 먼저 정의
app.delete('/api/contexts/clear-all', async (req, res) => {
  try {
    const result = await clearAllContexts();
    
    res.json({
      success: true,
      message: '모든 컨텍스트가 삭제되었습니다',
      deletedCount: result.deletedCount
    });
    
    console.log(`🗑️ DB 초기화 완료: ${result.deletedCount}개 컨텍스트 삭제`);
  } catch (error) {
    console.error('DB 초기화 오류:', error);
    res.status(500).json({
      success: false,
      error: '데이터베이스 초기화에 실패했습니다'
    });
  }
});

// 데이터베이스 통계
app.get('/api/contexts/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '통계를 불러오는데 실패했습니다'
    });
  }
});

// 컨텍스트 삭제 - 일반적인 파라미터 라우트는 나중에 정의
app.delete('/api/contexts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteContext(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '삭제할 컨텍스트를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '컨텍스트가 삭제되었습니다'
    });
  } catch (error) {
    console.error('컨텍스트 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '컨텍스트 삭제에 실패했습니다'
    });
  }
});

// 메타데이터 API 헬스체크
app.get('/api/metadata/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    exaoneConfigured: !!process.env.EXAONE_API_KEY
  });
});

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    notionConfigured: !!process.env.NOTION_API_KEY,
    exaoneConfigured: !!process.env.EXAONE_API_KEY
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ARAI API 서버가 포트 ${PORT}에서 시작되었습니다`);
  console.log(`📄 Notion API 키 설정됨: ${process.env.NOTION_API_KEY ? '✅' : '❌'}`);
});