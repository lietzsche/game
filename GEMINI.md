# Ink Warrior: Path of Zen - 개발 가이드

이 프로젝트는 Phaser 3 게임 엔진을 사용하여 제작된 동양풍 수묵화 스타일의 횡스크롤 액션 게임입니다.

## 프로젝트 개요

*   **게임명:** Ink Warrior: Path of Zen (墨影)
*   **주요 기술 스택:**
    *   **Engine:** Phaser 3 (v3.80.1)
    *   **Build Tool:** Vite
    *   **Styling:** Tailwind CSS, PostCSS, Vanilla CSS
    *   **Language:** JavaScript (ES Modules)
*   **아키텍처:**
    *   `index.html`: UI 레이어 및 게임 컨테이너 구조 정의.
    *   `src/main.js`: Phaser 게임 인스턴스, 씬(Scene), 게임 로직, 커스텀 렌더링 로직 포함.
    *   **특이사항:** Phaser의 물리 엔진(Arcade Physics)을 설정했으나, 실제 이동 및 충돌 로직은 정밀한 제어를 위해 `main.js` 내에서 커스텀하게 구현되어 있습니다.

## 주요 기능 및 메커니즘

1.  **전투 시스템:**
    *   **공격:** 일반 공격(F)과 강공격(R). 일반 공격은 3단계 콤보 시스템을 가집니다.
    *   **방어:** S 키 또는 아래 방향키로 방어 가능. 방어 시 대미지가 대폭 감소합니다.
    *   **이동:** WASD 및 방향키 지원. Shift 키로 달리기 가능.
2.  **적 유닛:**
    *   **Ghoul:** 일반적인 적.
    *   **Oni:** 높은 체력과 강한 공격력을 가진 정예 적.
    *   **Shadow:** 빠른 속도를 가진 적.
3.  **지형 및 장애물:**
    *   `getTerrainY` 함수를 통해 동적으로 지형 높낮이를 계산합니다.
    *   가시(Spikes)와 같은 장애물이 동적으로 생성됩니다.
4.  **스토리 시스템:**
    *   플레이어의 이동 거리(`worldX`)에 따라 대화 상자(`dialogue-box`)가 활성화되며 스토리가 진행됩니다.
5.  **시각 효과:**
    *   수묵화 느낌을 내기 위한 입자(Particles), 먹물 자국(Ink Blots), 잔상(Ghosts), 화면 흔들림(Screenshake) 효과가 커스텀 그래픽스로 구현되어 있습니다.

## 실행 및 빌드 방법

프로젝트 루트 디렉토리에서 다음 명령어를 사용합니다.

*   **개발 서버 실행:**
    ```bash
    npm run dev
    ```
*   **프로젝트 빌드:**
    ```bash
    npm run build
    ```
*   **빌드 결과물 미리보기:**
    ```bash
    npm run preview
    ```

## 개발 컨벤션

*   **렌더링:** `customDraw()` 메서드에서 Phaser의 Graphics 객체를 사용하여 모든 엔티티를 직접 그립니다. 새로운 시각 효과나 유닛을 추가할 때 이 메서드를 수정해야 합니다.
*   **상태 관리:** `gameState` 전역 객체를 통해 레벨, HP, 공격력, 스토리 진행도 등을 관리합니다.
*   **반응형 대응:** 모바일 환경을 위해 `index.html`에 정의된 터치 컨트롤(`mobile-controls`)과 `main.js`의 `bindBtn` 메서드를 연동하여 사용합니다.

## 주요 파일 구조

*   `index.html`: 게임 UI(HP 바, 스토리 진행도, 대화창, 모바일 컨트롤) 레이아웃.
*   `src/main.js`: 전체 게임 로직 (플레이어 제어, 적 AI, 충돌 판정, 커스텀 렌더링).
*   `style.css`: 프로젝트 전반의 CSS 스타일링.
*   `vite.config.js`: Vite 설정 (Base path, 서버 포트 등).
*   `tailwind.config.js`: Tailwind CSS 설정.
