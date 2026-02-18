# Melissa - Life Insurance PPL Chatbot

## Overview

A Next.js application that serves a landing page with a Lemonade-style full-screen chatbot overlay. The chatbot ("Melissa") walks users through life insurance questions, shows estimated rates from multiple carriers using published rate data, then captures lead information. Leads are stored in a database with webhook support for future distribution.

## Technical Architecture

### Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion (typing indicators, message transitions, overlay slide-up)
- **Database:** SQLite via Prisma (zero-cost, file-based, upgradeable to Postgres later)
- **Deployment:** Vercel (free tier)
- **Repo:** MunkaConsulting/melissa (private)

### Project Structure
```
melissa/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles + Tailwind
│   │   └── api/
│   │       ├── leads/route.ts    # POST lead to DB
│   │       ├── rates/route.ts    # GET rate lookup
│   │       └── webhook/route.ts  # POST forward lead to external system
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── Footer.tsx
│   │   └── chat/
│   │       ├── ChatOverlay.tsx       # Full-screen overlay container
│   │       ├── ChatWindow.tsx        # Message list + input area
│   │       ├── MessageBubble.tsx     # Individual message (bot or user)
│   │       ├── TypingIndicator.tsx   # Animated dots while "thinking"
│   │       ├── OptionButtons.tsx     # Multiple choice responses
│   │       ├── TextInput.tsx         # Free-text input (age, name, etc.)
│   │       ├── RateCard.tsx          # Carrier comparison display
│   │       ├── ProgressBar.tsx       # Top progress indicator
│   │       └── ConsentCheckbox.tsx   # TCPA consent capture
│   ├── lib/
│   │   ├── conversation.ts       # State machine: steps, transitions, logic
│   │   ├── rates.ts              # Rate lookup engine
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── carriers.ts           # Carrier metadata (names, logos)
│   └── data/
│       └── rates.json            # Term life rate tables by carrier
├── prisma/
│   └── schema.prisma             # Lead + conversation data models
├── public/
│   └── (avatars, carrier logos, etc.)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Core Components

### 1. Conversation Engine (`lib/conversation.ts`)

A deterministic state machine. Each step defines:
- The message Melissa sends
- The input type (multiple choice, text, number)
- Validation rules
- The next step (can be conditional based on prior answers)

```
Steps:
1. welcome       → "Hi! I'm Melissa..." (auto-advance)
2. age           → "How old are you?" (number input, 18-85)
3. gender        → "What's your gender?" (Male / Female)
4. smoker        → "Do you use tobacco?" (No / Yes / Quit recently)
5. health        → "How's your overall health?" (Excellent / Good / Average / Below Average)
6. coverage      → "How much coverage?" ($100K / $250K / $500K / $750K / $1M)
7. term          → "For how long?" (10yr / 15yr / 20yr / 25yr / 30yr)
8. rates_display → Show carrier comparison table (computed from steps 2-7)
9. lead_capture  → "Want exact quotes? I'll connect you with a licensed agent."
10. name         → "What's your first name?"
11. email        → "What's your email?"
12. phone        → "Best phone number?"
13. zip          → "What's your ZIP code?"
14. consent      → TCPA consent checkbox + submit
15. confirmation → "You're all set! A licensed agent will reach out within 24 hours."
```

Conditional logic:
- If smoker=Yes → skip to a note about how rates may be higher
- If age > 70 → adjust available term lengths (no 30yr)
- If health=Below Average → note that rates shown assume standard underwriting

### 2. Rate Lookup Engine (`lib/rates.ts`)

Pure function: takes user profile → returns array of carrier estimates.

```typescript
interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  smokerStatus: 'never' | 'current' | 'former';
  healthClass: 'preferred_plus' | 'preferred' | 'standard_plus' | 'standard';
  coverageAmount: number;
  termLength: number;
}

interface CarrierQuote {
  carrier: string;
  monthlyRate: number;
  annualRate: number;
  rating: string; // AM Best rating
}

function getEstimates(profile: UserProfile): CarrierQuote[]
```

Maps health self-assessment to underwriting class:
- Excellent → Preferred Plus
- Good → Preferred
- Average → Standard Plus
- Below Average → Standard

Rate data source: published term life rate tables from carriers. These are openly available — carriers publish them in marketing materials and through IMO/BGA partner portals. For the prototype, we'll seed with accurate rate data for 5 carriers across common age/coverage/term combinations.

### 3. Rate Data Format (`data/rates.json`)

```json
{
  "protective_life": {
    "name": "Protective Life",
    "am_best": "A+",
    "rates": {
      "male": {
        "preferred_plus": {
          "non_smoker": {
            "20": {  // term length
              "500000": {  // coverage amount
                "30": 18.50,  // age: monthly rate
                "35": 22.10,
                "40": 29.80,
                ...
              }
            }
          }
        }
      }
    }
  }
}
```

### 4. Lead Data Model (Prisma)

```prisma
model Lead {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  // Conversation data
  age           Int
  gender        String
  smokerStatus  String
  healthClass   String
  coverageAmount Int
  termLength    Int

  // Rate shown
  ratesShown    Json     // snapshot of what Melissa displayed

  // Contact info
  firstName     String
  email         String
  phone         String
  zip           String

  // Compliance
  consentGiven  Boolean
  consentText   String   // exact language they agreed to
  consentAt     DateTime
  ipAddress     String

  // Distribution
  webhookSent   Boolean  @default(false)
  webhookSentAt DateTime?
  buyerId       String?  // who the lead was sold to (future)
}
```

### 5. Chat UI Components

**ChatOverlay:** Full-screen overlay that slides up from bottom when triggered. White background, centered chat window (max-width ~600px), close button top-right.

**MessageBubble:** Two variants:
- Bot message: left-aligned, with Melissa avatar, light background
- User message: right-aligned, accent color background, white text

**TypingIndicator:** Three animated dots that appear for 500-1000ms before each bot message. Creates the illusion of Melissa "thinking."

**OptionButtons:** Row/grid of buttons for multiple-choice questions. Clicking one sends the answer and advances the conversation.

**RateCard:** A clean comparison card shown inside the chat. Lists carriers with monthly rate, AM Best rating, and a visual indicator of relative price.

**ProgressBar:** Thin bar at the top of the chat showing how far through the flow they are (step X of 15).

**ConsentCheckbox:** Required checkbox with TCPA-compliant language before final submission.

### 6. API Routes

**POST /api/leads** — Saves completed lead to SQLite database. Returns lead ID.

**GET /api/rates?age=35&gender=male&smoker=never&health=preferred&coverage=500000&term=20** — Returns carrier rate estimates. Called by the frontend when the conversation reaches the rate display step.

**POST /api/webhook** — Generic endpoint that forwards a lead (by ID) to an external webhook URL configured via environment variable. For future use when lead distribution is set up.

## TCPA Compliance

The consent step includes:
- Explicit checkbox (not pre-checked)
- Consent language: "By checking this box, I agree to be contacted by a licensed insurance agent at the phone number provided, including by autodialer or prerecorded message. This is not a condition of purchase."
- Timestamp + IP address logged with every consent
- Consent text stored verbatim in the lead record

## Deployment

- **Vercel:** Free tier, auto-deploys from GitHub
- **Database:** SQLite file in the Vercel deployment (for prototype; migrate to Supabase/Planetscale for production)
- **Environment variables:** WEBHOOK_URL (optional, for future lead distribution)

## What This Prototype Does NOT Include (Future)

- Soft credit pull integration ($5/lead enrichment)
- Lead distribution / ping tree / buyer routing
- A/B testing on chat flow variants
- Analytics dashboard
- Admin panel for managing leads
- Real-time lead notifications (email/SMS/Slack)
- Multi-state compliance variations
