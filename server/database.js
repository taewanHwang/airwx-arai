import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 데이터 디렉토리 생성
const dataDir = join(__dirname, '..', 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// 데이터베이스 파일 경로
const dbPath = join(dataDir, 'arai.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath);

// Promise 래퍼 함수들
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// 테이블 초기화
async function initializeTables() {
  // contexts 테이블 생성
  const createContextsTable = `
    CREATE TABLE IF NOT EXISTS contexts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      topics TEXT NOT NULL, -- JSON 배열로 저장
      original_url TEXT NOT NULL,
      notion_content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processing_time INTEGER NOT NULL -- 밀리초
    )
  `;

  // 인덱스 생성
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_contexts_created_at ON contexts(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_contexts_title ON contexts(title)',
    'CREATE INDEX IF NOT EXISTS idx_contexts_url ON contexts(original_url)'
  ];

  try {
    await dbRun(createContextsTable);
    for (const indexQuery of createIndexes) {
      await dbRun(indexQuery);
    }
    console.log('✅ 데이터베이스 테이블 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error);
    throw error;
  }
}

// 컨텍스트 저장
async function saveContext(contextData) {
  const query = `
    INSERT INTO contexts (id, title, summary, topics, original_url, notion_content, processing_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await dbRun(
      query,
      contextData.id,
      contextData.title,
      contextData.summary,
      JSON.stringify(contextData.topics),
      contextData.original_url,
      contextData.notion_content,
      contextData.processing_time
    );
    
    console.log(`✅ 컨텍스트 저장 완료: ${contextData.id}`);
    return result;
  } catch (error) {
    console.error('❌ 컨텍스트 저장 오류:', error);
    throw error;
  }
}

// 모든 컨텍스트 조회
async function getAllContexts(limit = 50, offset = 0) {
  const query = `
    SELECT id, title, summary, topics, original_url, created_at, processing_time
    FROM contexts
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const rows = await dbAll(query, limit, offset);
    return rows.map(row => ({
      ...row,
      topics: JSON.parse(row.topics),
      created_at: new Date(row.created_at)
    }));
  } catch (error) {
    console.error('❌ 컨텍스트 조회 오류:', error);
    throw error;
  }
}

// 특정 컨텍스트 조회
async function getContextById(id) {
  const query = `
    SELECT *
    FROM contexts
    WHERE id = ?
  `;

  try {
    const row = await dbGet(query, id);
    if (!row) return null;

    return {
      ...row,
      topics: JSON.parse(row.topics),
      created_at: new Date(row.created_at)
    };
  } catch (error) {
    console.error('❌ 컨텍스트 조회 오류:', error);
    throw error;
  }
}

// 컨텍스트 삭제
async function deleteContext(id) {
  const query = 'DELETE FROM contexts WHERE id = ?';

  try {
    const result = await dbRun(query, id);
    console.log(`✅ 컨텍스트 삭제 완료: ${id}`);
    return result.changes > 0;
  } catch (error) {
    console.error('❌ 컨텍스트 삭제 오류:', error);
    throw error;
  }
}

// 검색 (제목, 요약에서)
async function searchContexts(query, limit = 20) {
  const searchQuery = `
    SELECT id, title, summary, topics, original_url, created_at, processing_time
    FROM contexts
    WHERE title LIKE ? OR summary LIKE ?
    ORDER BY created_at DESC
    LIMIT ?
  `;

  try {
    const searchPattern = `%${query}%`;
    const rows = await dbAll(searchQuery, searchPattern, searchPattern, limit);
    return rows.map(row => ({
      ...row,
      topics: JSON.parse(row.topics),
      created_at: new Date(row.created_at)
    }));
  } catch (error) {
    console.error('❌ 컨텍스트 검색 오류:', error);
    throw error;
  }
}

// 통계 조회
async function getStats() {
  try {
    const totalCount = await dbGet('SELECT COUNT(*) as count FROM contexts');
    const recentCount = await dbGet(`
      SELECT COUNT(*) as count 
      FROM contexts 
      WHERE created_at >= datetime('now', '-7 days')
    `);

    return {
      totalContexts: totalCount.count,
      recentContexts: recentCount.count,
      dbPath,
      dbSize: 0 // SQLite3 라이브러리에서는 PRAGMA 접근이 복잡하므로 생략
    };
  } catch (error) {
    console.error('❌ 통계 조회 오류:', error);
    throw error;
  }
}

// 앱 종료 시 데이터베이스 연결 정리
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

// 초기화 실행
initializeTables().catch(console.error);

export {
  db,
  saveContext,
  getAllContexts,
  getContextById,
  deleteContext,
  searchContexts,
  getStats
};