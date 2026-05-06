---
name: react-component
description: 프로젝트의 JSX + Tailwind 패턴에 맞춰 React 컴포넌트를 생성합니다. 함수형 컴포넌트와 파일 구조 규칙을 따릅니다.
license: MIT
compatibility: opencode
metadata:
  audience: developer
  project: ontological-debugger
  stack: react-vite-tailwind
---

## 프로젝트 환경
- React 18 + Vite + Tailwind CSS 3 (PostCSS)
- 함수형 컴포넌트만 사용 (클래스 컴포넌트 사용 안 함)
- 아이콘: lucide-react
- 컴포넌트 경로: `src/components/<카테고리>/<이름>.jsx`
- 카테고리: `UI/`, `Game/`, `Admin/`

## 컴포넌트 기본 구조
새 컴포넌트를 만들 때 아래 패턴을 따릅니다:

```jsx
import React from 'react';
// 필요한 경우 lucide-react에서 아이콘 import

const ComponentName = ({ prop1, prop2, onAction }) => {
  return (
    <div className="tailwind-classes">
      {/* 내용 */}
    </div>
  );
};

export default ComponentName;
```

## 규칙
- `export default`로 내보내기
- 함수 시그니처에서 props 구조 분해
- Tailwind만으로 스타일링 (CSS-in-JS, 별도 CSS 파일 사용 안 함)
- 프로젝트 터미널 색상 팔레트 사용: `slate-950` 배경, `emerald-500` 텍스트, `emerald-900/30` 테두리
- 필요한 경우 `isGlitched`, `isCritical` props로 안정성 기반 시각 상태 대응
- 이벤트 핸들러는 `on` 접두사 사용
- 애니메이션: `animate-pulse`, `transition-all duration-500` 등으로 부드러운 UX
- 컴포넌트는 200줄 이하로 유지, 커지면 하위 컴포넌트나 훅으로 분리

## 컴포넌트 생성 순서
1. 카테고리 폴더 결정 (`UI/`, `Game/`, `Admin/`)
2. 파일 생성: `src/components/<카테고리>/<이름>.jsx`
3. 부모 컴포넌트(보통 `src/App.jsx`)에서 import
4. 필요한 props와 상태 연결
