# 존재론적 디버거 (Ontological Debugger) - 개발 가이드

이 프로젝트는 React와 Tailwind CSS를 사용하여 개발된 철학적 SF 텍스트 어드벤처 게임입니다.

## 프로젝트 개요

*   **게임명:** 존재론적 디버거 (Ontological Debugger)
*   **장르:** 텍스트 어드벤처 / 철학적 시뮬레이션
*   **주요 기술 스택:**
    *   **Framework:** React (v18)
    *   **Build Tool:** Vite
    *   **Styling:** Tailwind CSS (PostCSS)
    *   **Icons:** Lucide React
*   **브랜치 정보:** `new-game-dev` (기존 Phaser 기반 프로젝트에서 React 기반으로 전면 전환됨)

## 아키텍처 및 핵심 로직

현재 게임의 로직과 데이터는 `sample.js`에 통합되어 있으며, 데이터 기반(Data-driven) 구조로 설계되었습니다.

1.  **데이터 구조 (`GAME_STAGES`):**
    *   각 스테이지는 `id`, `title`, `description`, `options` 등을 가집니다.
    *   `options` 배열의 `next` 속성을 통해 다음 스테이지 ID를 지정하여 흐름을 제어합니다.
    *   `isEnding: true` 설정 시 해당 스테이지에서 게임이 종료되고 결과 창이 나타납니다.
2.  **상태 관리:**
    *   `currentStageId`: 현재 진행 중인 스테이지 추적.
    *   `history`: 사용자가 선택한 행동의 기록을 저장하여 터미널 스타일로 렌더링.
    *   `traits`: 선택지에 따른 사용자의 성향(logic, philosophy 등)을 수집.
3.  **UI/UX 디자인:**
    *   **터미널 스타일:** `slate-950` 배경과 `emerald-500` 텍스트를 사용한 사이버펑크 스타일.
    *   **반응형 레이아웃:** 모바일과 데스크탑 환경 모두 최적화.
    *   **시각 효과:** Lucide 아이콘과 CSS 애니메이션(`animate-pulse`, `animate-in`)을 통한 몰입감 부여.

## 빌드 및 실행 방법

프로젝트 루트 디렉토리에서 다음 명령어를 사용합니다.

*   **의존성 설치:**
    ```bash
    npm install
    ```
*   **개발 서버 실행:**
    ```bash
    npm run dev
    ```
*   **프로젝트 빌드:**
    ```bash
    npm run build
    ```

## 개발 컨벤션 및 팁

*   **콘텐츠 확장:** 새로운 스토리나 선택지를 추가하려면 `sample.js` 파일 내의 `GAME_STAGES` 배열에 객체를 추가하고 `next` 연결을 설정하면 됩니다.
*   **스타일링:** Tailwind CSS 클래스를 사용하여 UI를 수정합니다. 커스텀 스크롤바 등은 `App` 컴포넌트 하단의 `styled-jsx` 영역에서 관리합니다.
*   **아이콘 추가:** `lucide-react`에서 필요한 아이콘을 import 하여 사용합니다.

## 주요 파일 구조

*   `sample.js`: 게임의 메인 컴포넌트 및 모든 시나리오 데이터.
*   `src/main.jsx`: React 앱의 진입점(Entry Point).
*   `index.html`: 메인 HTML 템플릿 및 폰트 설정.
*   `tailwind.config.js`: Tailwind CSS 설정 (콘텐츠 경로 및 테마 확장).
*   `vite.config.js`: Vite 빌드 및 플러그인 설정.
*   `.gitignore`: React/Vite 환경에 최적화된 제외 목록.
