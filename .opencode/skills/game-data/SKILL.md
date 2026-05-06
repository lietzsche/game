---
name: game-data
description: 데이터 기반 스토리 시스템에서 게임 스테이지, 선택지, 시나리오를 추가/수정/재구성합니다.
license: MIT
compatibility: opencode
metadata:
  audience: developer
  project: ontological-debugger
  domain: game-logic
---

## 데이터 구조
- 모든 게임 스테이지는 `src/data/scenario.js`에 `INITIAL_STAGES` 배열로 정의
- 각 스테이지 속성: `id`, `title`, `description`, `options[]`, (선택) `isEnding`
- 상태 관리는 `src/hooks/useGameState.js`에서 담당
- 데이터는 `localStorage`의 `ontological_stages` 키에 저장

## 스테이지 객체 스키마
```js
{
  id: '고유-id',           // 문자열, 네비게이션용
  title: '스테이지 제목',    // 화면에 표시될 제목
  description: '내용...',    // 타자기 효과로 출력되는 본문
  isEnding: false,          // true면 게임 종료, 재시작 버튼 표시
  options: [
    {
      text: '선택지 텍스트',
      next: '다음-스테이지-id',
      trait: 'logic',                      // 통계에 반영될 성향
      stabilityImpact: 5,                  // -100 ~ +100
      requirement: {                       // 선택 제한 조건 (선택)
        trait: 'philosophy',
        min: 2                             // 누적 성향 수가 이 값 이상이어야 함
      }
    }
  ]
}
```

## 핵심 규칙
- `boot` 스테이지는 진입점이며 삭제 불가
- `options[].next`로 스테이지를 연결 — 끊어진 링크는 진행 불가 상태 발생
- 종료 스테이지는 `isEnding: true` 설정 (재시작 버튼 표시)
- 성향 종류: `logic`, `philosophy`, `empathy`, `pragmatism`, `chaos` (필요시 추가 가능)
- `stabilityImpact`는 균형 있게 — 단일 선택으로 게임오버가 되지 않도록
- `requirement`는 누적 `traitStats` 수치 기준으로 판정

## 콘텐츠 추가 순서
1. 스토리 분기(스테이지 ID 흐름) 기획
2. `src/data/scenario.js`의 `INITIAL_STAGES`에 새 스테이지 객체 추가
3. 기존 스테이지의 `options[].next`를 새 ID로 연결
4. 적절한 `trait`, `stabilityImpact`, `requirement` 값 설정
5. `npm run dev`로 흐름 테스트
