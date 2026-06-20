---
title: "웹 성능 최적화 기초"
date: "2025-06-10"
tags: ["Web", "Performance"]
links: ["nextjs-app-router"]
---

# 웹 성능 최적화 기초

## Core Web Vitals

- **LCP** (Largest Contentful Paint): 주요 콘텐츠 로딩 속도
- **FID** (First Input Delay): 첫 상호작용 반응 속도
- **CLS** (Cumulative Layout Shift): 레이아웃 안정성

## 이미지 최적화

Next.js의 `<Image>` 컴포넌트를 쓰면 자동으로 WebP 변환 + lazy loading이 된다.

## 코드 스플리팅

`dynamic import`로 필요한 시점에만 모듈을 불러온다.
