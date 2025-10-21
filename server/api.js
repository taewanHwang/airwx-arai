import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';

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

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    notionConfigured: !!process.env.NOTION_API_KEY
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ARAI API 서버가 포트 ${PORT}에서 시작되었습니다`);
  console.log(`📄 Notion API 키 설정됨: ${process.env.NOTION_API_KEY ? '✅' : '❌'}`);
});