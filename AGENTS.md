# AGENTS.md — 존재론적 디버거

## 명령어
- `npm run dev` — 개발 서버 (Vite, 핫 리로드)
- `npm run build` — 프로덕션 빌드 → `dist/`
- `npm run preview` — 프로덕션 빌드 미리보기
- 테스트, 린트, 타입체크 명령어 없음

## 아키텍처
- 진입점: `index.html` → `src/main.jsx` → `src/App.jsx`
- 데이터 기반 게임: 모든 스테이지는 `src/data/scenario.js`에 `INITIAL_STAGES` 배열로 정의
- 상태 관리: `src/hooks/useGameState.js` (단일 커스텀 훅, Redux/context 없음)
- 컴포넌트: `src/components/{UI,Game,Admin}/` — 각각 단일 JSX 파일, `export default`

## 절대 깨면 안 되는 핵심 게임 로직

### 스테이지 스키마 (`INITIAL_STAGES`)
각 스테이지 객체:
```
id, title, description, options[], isEnding (선택적 bool)
```
각 선택지 객체:
```
text, next (스테이지 id), trait (문자열), stabilityImpact (숫자), requirement? ({trait, min})
```

### 핵심 규칙
- **`boot` 스테이지는 진입점 — 절대 삭제/이름 변경 금지.** `useGameState.js` 기본값이 `boot`이며, AdminPanel에서 삭제 차단, `useGameState.deleteStage`도 `boot`에 대해 오류 반환.
- `options[].next`는 반드시 존재하는 스테이지 id를 가리켜야 함 — 깨진 링크는 진행 불가 상태 유발. AdminPanel이 이를 검증하여 빨간 경고 표시.
- `isEnding: true` 스테이지는 `options`를 생략하거나 빈 배열로 두어야 함 — OptionList가 재시작 버튼을 대신 렌더링.
- 안정도 0~100. <40이면 `isGlitched` prop 활성화, <15면 `isCritical` 활성화. 둘 다 CSS 애니메이션 클래스를 트리거.
- 트레잇 요구사항이 선택지를 잠금: `traitStats[req.trait] < req.min`이면 해당 선택지는 `Lock` 아이콘과 함께 비활성화.

### 타자기 효과 → 선택지 차단
- `useTypewriter` 훅이 타이핑 중에는 선택지 상호작용을 차단: `OptionList`가 `isTyping`을 감지하여 `opacity-0 pointer-events-none translate-y-4` 적용.
- 새 콘텐츠 추가 시 반드시 타자기가 끝날 때까지 기다리거나(혹은 클릭 스킵) UI가 제대로 나타나는지 확인할 것.

## 스타일링
- Tailwind + `style.css`에 커스텀 키프레임 정의 (`.animate-glitch-light`, `.animate-glitch-heavy`, `.glitch-text`, `.animate-spin-slow`, `.custom-scrollbar`).
- 터미널 팔레트: `bg-slate-950`, `text-emerald-500`, `border-emerald-900/30`.
- body에 `font-mono`, 아이콘은 `lucide-react`.

## 영속성
- 게임 스테이지는 `localStorage` 키 `ontological_stages`에 저장 — 페이지 새로고침 후에도 유지.
- 개발 중 `scenario.js`를 수정해도 localStorage에 이전 데이터가 남아 있으면 변경 사항이 반영되지 않음. 브라우저 콘솔에서 `localStorage.removeItem('ontological_stages')`를 실행하여 초기화.

## OpenCode 스킬
- `.opencode/skills/`에 프로젝트 전용 스킬 정의 있음 (`react-component`, `game-data`, `terminal-ui`, `full-feature`).
- 오래된 정보 주의: `GEMINI.md`는 `sample.js`와 `GAME_STAGES`를 참조하지만 둘 다 틀렸음. 실제 파일은 `src/data/scenario.js`이며 `INITIAL_STAGES`를 export.

## 규칙

### 문서 언어
- 모든 문서 파일(`.md`)은 한글로 작성한다.

### 커밋
- 커밋 메시지는 한글로 작성한다.
- 모든 작업 완료 후, 스테이징 여부와 관계없이 `git diff` 기준으로 적절한 한글 커밋 메시지를 추천한다.

### 코드
- 한국어 게임 — 모든 스테이지 제목/설명은 한글 텍스트.
- TypeScript 사용 안 함, 순수 JSX만 사용.
- 외부 API 호출이나 백엔드 없음 — 모든 것이 클라이언트 사이드.
