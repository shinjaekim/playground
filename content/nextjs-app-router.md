---
title: "Next.js App Router 기초"
date: "2025-06-20"
tags: ["Next.js", "React", "Web"]
links: ["react-hooks", "web-performance"]
---

# Next.js App Router 기초

App Router는 Next.js 13부터 도입된 새로운 라우팅 시스템이다.
`app/` 디렉토리 안에 `page.tsx`를 두면 자동으로 라우트가 생성된다.

## Server Components

기본적으로 모든 컴포넌트는 Server Component다.
클라이언트 상태가 필요할 때만 `"use client"`를 선언한다.

## Layout

`layout.tsx`는 하위 페이지 전체에 공유되는 껍데기다.
중첩 레이아웃도 지원한다.
