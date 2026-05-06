---
name: terminal-ui
description: 프로젝트의 터미널/사이버펑크 미학 — 색상 팔레트, 타이포그래피, 애니메이션, 시각 효과 적용.
license: MIT
compatibility: opencode
metadata:
  audience: developer
  project: ontological-debugger
  domain: styling
---

## 디자인 시스템
- **배경:** `bg-slate-950` (딥 다크)
- **주 텍스트:** `text-emerald-500` (터미널 그린)
- **폰트:** `font-mono` (전역 모노스페이스)
- **테두리:** `border-emerald-900/30` (옅은 초록 테두리)
- **선택 영역:** `selection:bg-emerald-500/30`

## 상태 기반 비주얼
게임은 `stability` 값에 따라 두 가지 불안정 상태가 있습니다:

### 글리치 상태 (stability < 40)
- prop: `isGlitched`
- 테두리: `border-emerald-900/30`
- 그림자: `shadow-[0_0_50px_rgba(16,185,129,0.02)]`
- 일반적인 터미널 느낌 유지

### 크리티컬 상태 (stability < 15)
- prop: `isCritical`
- 테두리: `border-red-500/40`
- 그림자: `shadow-[0_0_50px_rgba(239,68,68,0.1)]`
- 배경 강조: `bg-red-950/20`
- 프로그레스 바: `bg-red-500 shadow-[0_0_15px_red]`
- 텍스트: `text-red-500 animate-pulse`
- 본문: `animate-glitch-heavy`

## 자주 쓰는 UI 패턴

```jsx
// 상태 카드
<div className="p-4 rounded-2xl border bg-emerald-950/10 border-emerald-900/20">
  <span className="text-[9px] uppercase font-bold opacity-40 tracking-widest">Label</span>
  <span className="text-sm font-bold">{value}</span>
</div>

// 프로그레스 바
<div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
  <div className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`} 
       style={{ width: `${percent}%` }} />
</div>

// 메인 컨테이너
<div className="w-full max-w-2xl bg-black/40 backdrop-blur-sm border rounded-3xl p-8 md:p-12 relative z-10 transition-all duration-500">
```

## 사용 중인 애니메이션
- `animate-pulse` — 미묘한 깜빡임
- `animate-glitch-light` / `animate-glitch-heavy` — 글리치 효과 (`style.css`에 정의)
- `transition-all duration-500` / `duration-1000` — 부드러운 상태 전환
- `backdrop-blur-sm` — 메인 컨테이너 유리 효과

## 타이포그래피
- 헤더: `text-[9px] uppercase font-bold opacity-40 tracking-widest`
- 본문: `font-mono` (body에서 상속)
- 수치: `text-[10px] font-black`
- 아이콘: lucide-react, 보통 `w-4 h-4`에서 `w-8 h-8` 사이즈
