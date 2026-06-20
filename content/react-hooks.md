---
title: "React Hooks 정리"
date: "2025-06-18"
tags: ["React", "JavaScript", "Web"]
links: ["javascript-basics", "nextjs-app-router"]
---

# React Hooks 정리

Hooks는 함수형 컴포넌트에서 상태와 사이드 이펙트를 다루는 방법이다.

## useState

```js
const [count, setCount] = useState(0);
```

## useEffect

마운트/언마운트/의존성 변경 시 실행된다.
의존성 배열이 빈 배열이면 마운트 시 한 번만 실행.

## useCallback / useMemo

불필요한 리렌더링을 방지할 때 사용한다.
