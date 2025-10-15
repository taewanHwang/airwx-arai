import { ContextEntry } from '@/types/context';

export const mockContextData: ContextEntry[] = [
  {
    id: '1',
    title: 'LG 전자 방화벽 이슈 클레임',
    project: 'Exaone Foundry 배포',
    dateRange: '2025.01.10–01.15',
    startDate: new Date(2025, 0, 10),
    endDate: new Date(2025, 0, 15),
    link: 'https://notion.so/example1',
    summary: 'LG 전자 AX 팀 확산을 위해 PI팀에 방화벽 오픈 요청하기'
  },
  {
    id: '2',
    title: 'LG CNS 테스트 유저 계정 생성',
    project: 'Exaone Foundry 배포',
    dateRange: '2025.01.20–01.25',
    startDate: new Date(2025, 0, 20),
    endDate: new Date(2025, 0, 25),
    link: 'https://notion.so/example2',
    summary: 'LG CNS 테스트 유저 생성'
  },
  {
    id: '3',
    title: '디자인 리뷰 1차',
    project: 'Exaone Foundry 개발',
    dateRange: '2025.01.01–01.03',
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 0, 3),
    link: 'https://notion.so/example3',
    summary: 'Exaone 파운드리 고도화 개발을 위한 1차 디자인 리뷰 (참석자 : ~~)'
  },
  {
    id: '4',
    title: '통합 테스트 2차',
    project: 'Exaone Foundry 개발',
    dateRange: '2025.01.05–01.08',
    startDate: new Date(2025, 0, 5),
    endDate: new Date(2025, 0, 8),
    link: 'https://notion.so/example4',
    summary: 'Exaone 파운드리 고도화 개발 검증을 위한 2차 통합 테스트 (검증사항: ~~~)'
  },
  {
    id: '5',
    title: '통합 테스트 3차',
    project: 'Exaone Foundry 개발',
    dateRange: '2025.01.21–01.23',
    startDate: new Date(2025, 0, 21),
    endDate: new Date(2025, 0, 23),
    link: 'https://notion.so/example5',
    summary: 'Exaone 파운드리 고도화 개발 검증을 위한 3차 통합 테스트 (검증사항: ~~~)'
  },
  {
    id: '6',
    title: 'API 비용 품의서 작성 (경비처리)',
    project: '팀 업무',
    dateRange: '2025.01.01–01.02',
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 0, 2),
    link: 'https://notion.so/example6',
    summary: '비용 청구하기'
  },
  {
    id: '7',
    title: '팀 회식 장소 찾기',
    project: '팀 업무',
    dateRange: '2025.01.11–01.12',
    startDate: new Date(2025, 0, 11),
    endDate: new Date(2025, 0, 12),
    link: 'https://notion.so/example7',
    summary: '민규 환영회'
  },
  {
    id: '8',
    title: '민규와 티타임',
    project: '팀 업무',
    dateRange: '2025.01.15–01.16',
    startDate: new Date(2025, 0, 15),
    endDate: new Date(2025, 0, 16),
    link: 'https://notion.so/example8',
    summary: '민규 개인면담'
  },
  {
    id: '9',
    title: 'open ai GPT oss 테크니컬 리포트 리뷰',
    project: '개인',
    dateRange: '2025.02.01–02.02',
    startDate: new Date(2025, 1, 1),
    endDate: new Date(2025, 1, 2),
    link: 'https://notion.so/example9',
    summary: '최신 gpt 논문 기술 자료 리뷰 후 팀 내 공유'
  },
  {
    id: '10',
    title: 'meetup 발표자료 만들기',
    project: '개인',
    dateRange: '2025.01.23–01.25',
    startDate: new Date(2025, 0, 23),
    endDate: new Date(2025, 0, 25),
    link: 'https://notion.so/example10',
    summary: 'AirWX 활동 자료 공유를 위한 PPT 만들기 (5분 내외)'
  }
];

export const getUniqueProjects = (): string[] => {
  const projects = mockContextData.map(entry => entry.project);
  return ['All Projects', ...Array.from(new Set(projects))];
};
