# 면접 결과 메일 발송 관리 MVP

채용담당자가 지원자별 1차 면접 결과 메일을 생성하고 미리보기하는 디자인 확인용 React MVP입니다.

## 포함 기능

- 지원자 샘플 데이터
- 합격/불합격 결과 선택
- 메일 제목/본문 자동 생성
- 메일 제목/본문 수정
- 지원자 추가
- 검색/필터
- 상태 변경
- localStorage 저장
- 실제 이메일 발송 없음

## 로컬 실행

```bash
npm install
npm run dev
```

## Vercel 배포

1. 이 프로젝트를 GitHub 저장소에 업로드합니다.
2. Vercel에서 Add New Project를 누릅니다.
3. GitHub 저장소를 Import합니다.
4. Framework Preset이 Vite로 잡히는지 확인합니다.
5. Build Command는 `npm run build`, Output Directory는 `dist`로 둡니다.
6. Deploy를 누릅니다.
