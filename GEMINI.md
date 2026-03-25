# Ink Warrior: Path of Zen - 개발 가이드

이 프로젝트는 Phaser 3 게임 엔진을 사용하여 제작된 동양풍 수묵화 스타일의 횡스크롤 액션 게임입니다.

## 프로젝트 개요

*   **게임명:** Ink Warrior: Path of Zen (墨影)
*   **주요 기술 스택:**
    *   **Engine:** Phaser 3 (v3.80.1, WebGL Renderer)
    *   **Visuals:** 커스텀 WebGL 셰이더 (Paper Texture & Vignette)
    *   **Architecture:** 기능별 모듈화 (Player, Enemy, Effect, UI)
*   **핵심 철학:** 거추장스러운 라이브러리(Tailwind, Physics 엔진)를 제거하고 직접 구현한 커스텀 로직으로 가볍고 정교한 액션 제공.

## 핵심 시스템

1.  **전투 시스템:**
    *   **공격:** 일반 공격(F/J) 및 강공격(R/K). 콤보 시스템 포함.
    *   **먹물(Ink) 게이지:** 대시와 강공격 시 소모. 대기 시 회복.
    *   **패링(Parry):** 방어(S/L) 직후 적과 접촉 시 발동. 대미지 무효화, 적 밀쳐내기, 먹물 30 회복.
2.  **조작계 (Multi-Input):**
    *   **Keyboard:** 왼손(WASD)과 오른손(JKL)을 분리하여 쾌적한 조작 지원.
    *   **Touch:** 화면 좌측(이동)과 우측(액션)을 분리한 캔버스 기반 가상 버튼 시스템.
3.  **시각 효과:**
    *   `PaperPipeline`: WebGL 기반 종이 질감 및 노이즈 효과.
    *   `EffectManager`: 수묵화 스타일의 파티클, 잔상, 먹물 튐 효과 관리.

## 실행 및 빌드

*   `npm run dev`: 개발 서버 실행 (Port 3000)
*   `npm run build`: 프로덕션 빌드

## 모듈 가이드

*   `Player.js`: 입력 처리, 상태 머신, 캐릭터 렌더링.
*   `EnemyManager.js`: 적 AI 및 피격/패링 판정 조율.
*   `UIManager.js`: 캔버스 기반 UI 렌더링 및 터치 버튼 시각화.
*   `GameScene.js`: 전체 게임 상태 조율 및 배경 렌더링.
