# Meta Pixel + Conditional Firing + Income Question

**Date:** 2026-02-24
**Status:** Approved

## Overview

Add Meta Pixel tracking to Dad Insurance with conditional event firing. Fire a `Lead` event for every form submission and a `QualifiedLead` custom event only for premium/standard tier leads. Also add a household income question to the chatbot flow to enable full qualification filtering per the PPC course's recommended quiz funnel.

## Pixel ID

`897943992763325`

## Events

| Event | Type | Fires When | Use Case |
|---|---|---|---|
| `PageView` | Standard | Every page load | Audience building, retargeting |
| `Lead` | Standard | Every form submission | Total CPL tracking |
| `QualifiedLead` | Custom | Only qualified submissions | Ad set optimization target |

## QualifiedLead Criteria

All must be true:
- Age: 35-55
- Smoker status: "never" OR "former"
- Coverage: >= $250,000
- Household income: "$50K-$75K" OR "$75K-$100K" OR "Over $100K"

## New Chatbot Step: Income

Position: After `coverage`, before `timing`

```
Question: "What's your household income?"
Options:
  - Under $30K → value: "under_30k"
  - $30K - $50K → value: "30k_50k"
  - $50K - $75K → value: "50k_75k"
  - $75K - $100K → value: "75k_100k"
  - Over $100K → value: "over_100k"
```

## Files to Modify

### 1. `src/app/layout.tsx`
- Add Meta Pixel base code via Next.js `<Script>` component with `afterInteractive` strategy
- Add `<noscript>` fallback image in `<head>`
- Add dns-prefetch for `connect.facebook.net`

### 2. `src/lib/conversation.ts`
- Add `income` step after `coverage`, before `timing`
- 5 options matching the course's quiz funnel

### 3. `src/lib/types.ts`
- Add `income` to `ConversationAnswers` interface
- Add `householdIncome` to lead submission types if applicable

### 4. `src/components/chat/ChatWindow.tsx`
- In `submitLead()`: fire `fbq('track', 'Lead')` for every submission
- Conditionally fire `fbq('trackCustom', 'QualifiedLead')` based on qualification criteria
- Include `householdIncome` in POST body to `/api/leads`

### 5. `prisma/schema.prisma`
- Add `householdIncome String?` field to Lead model

### 6. `src/app/api/leads/route.ts`
- Accept `householdIncome` from request body
- Store in database

## Implementation Notes

- Pixel base code uses `afterInteractive` strategy (not `lazyOnload`) because tracking pixels need to be ready before user interactions
- `fbq` is called via `window.fbq` with a type guard since it's loaded externally
- The noscript fallback ensures basic PageView tracking even with JS disabled
- Income question is low-friction (single tap, multiple choice) — course says OTP is the real conversion killer (~11% drop), not qualification questions
