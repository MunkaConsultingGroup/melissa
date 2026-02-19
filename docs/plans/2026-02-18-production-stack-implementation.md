# Production Stack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Melissa from SQLite dev setup to production-ready Neon + Inngest + Resend + Sentry stack on Vercel.

**Architecture:** Swap Prisma adapter from SQLite to Neon PostgreSQL. Replace inline webhook with Inngest event-driven workflow (webhook delivery + email + Slack). Add UTM tracking fields for ad attribution. Add Sentry for error monitoring. Deploy to Vercel with marketplace integrations.

**Tech Stack:** Next.js 16, Prisma 7 + @prisma/adapter-neon, Inngest, Resend, Sentry, Vercel

---

### Task 1: Migrate Prisma from SQLite to Neon PostgreSQL

**Files:**
- Modify: `package.json` (swap adapter dependency)
- Modify: `prisma/schema.prisma` (sqlite → postgresql)
- Modify: `src/lib/db.ts` (swap adapter)
- Modify: `.env` (update DATABASE_URL placeholder)
- Modify: `.gitignore` (add prisma migration lock)

**Step 1: Install Neon adapter, remove SQLite adapter**

Run:
```bash
cd /home/nick/melissa && npm install @prisma/adapter-neon @neondatabase/serverless && npm uninstall @prisma/adapter-better-sqlite3
```

**Step 2: Update Prisma schema**

Replace the full contents of `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Lead {
  id             String   @id @default(cuid())
  createdAt      DateTime @default(now())

  age            Int
  gender         String
  smokerStatus   String
  healthClass    String
  coverageAmount Int
  termLength     Int

  ratesShown     String   // JSON string of CarrierQuote[]

  firstName      String
  email          String
  phone          String
  zip            String

  consentGiven   Boolean
  consentText    String
  consentAt      DateTime
  ipAddress      String

  webhookSent    Boolean   @default(false)
  webhookSentAt  DateTime?
  buyerId        String?

  // UTM tracking for ad attribution
  utmSource      String?
  utmMedium      String?
  utmCampaign    String?
  utmContent     String?
  utmTerm        String?
  gclid          String?
  fbclid         String?
  referrer       String?
  landingPage    String?
}
```

**Step 3: Update the database adapter in `src/lib/db.ts`**

Replace the full contents of `src/lib/db.ts` with:

```typescript
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@/generated/prisma/client';

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaNeon({ connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Step 4: Update `.env` with placeholder**

Replace the contents of `.env` with:

```
# Neon PostgreSQL connection string (pooled)
# Get this from Vercel Marketplace → Neon integration, or Neon dashboard
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Inngest
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""

# Resend
RESEND_API_KEY=""

# Sentry
SENTRY_DSN=""

# Slack incoming webhook URL
SLACK_WEBHOOK_URL=""
```

**Step 5: Delete old SQLite migrations and database**

Run:
```bash
rm -rf /home/nick/melissa/prisma/migrations /home/nick/melissa/prisma/dev.db /home/nick/melissa/prisma/dev.db-journal
```

**Step 6: Generate Prisma client (without running migrations — no DB yet)**

Run:
```bash
cd /home/nick/melissa && npx prisma generate
```

Expected: Prisma Client generated successfully.

**Step 7: Verify build passes**

Run:
```bash
cd /home/nick/melissa && npm run build 2>&1 | tail -20
```

Expected: Build succeeds. The app won't connect to a database at build time — it only fails at runtime if DATABASE_URL is missing, which is fine.

**Step 8: Commit**

```bash
cd /home/nick/melissa && git add -A && git commit -m "feat: migrate from SQLite to Neon PostgreSQL

Swap Prisma adapter from better-sqlite3 to @prisma/adapter-neon.
Add UTM tracking fields to Lead model for ad attribution.
Remove old SQLite migrations and dev database.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Set Up Inngest Client and API Route

**Files:**
- Create: `src/lib/inngest.ts`
- Create: `src/app/api/inngest/route.ts`
- Modify: `package.json` (add inngest dependency)

**Step 1: Install Inngest**

Run:
```bash
cd /home/nick/melissa && npm install inngest
```

**Step 2: Create Inngest client at `src/lib/inngest.ts`**

```typescript
import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'melissa' });
```

**Step 3: Create the API route at `src/app/api/inngest/route.ts`**

```typescript
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { leadCaptured } from '@/inngest/lead-captured';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [leadCaptured],
});
```

**Step 4: Create placeholder Inngest function at `src/inngest/lead-captured.ts`**

Create directory and file:

```typescript
import { inngest } from '@/lib/inngest';

// Event type for lead capture
export interface LeadCapturedEvent {
  name: 'lead/captured';
  data: {
    leadId: string;
    firstName: string;
    email: string;
    phone: string;
    zip: string;
    age: number;
    gender: string;
    smokerStatus: string;
    healthClass: string;
    coverageAmount: number;
    termLength: number;
    ratesShown: string; // JSON string
  };
}

export const leadCaptured = inngest.createFunction(
  { id: 'lead-captured', retries: 3 },
  { event: 'lead/captured' },
  async ({ event, step }) => {
    // Step 1: Deliver webhook to buyer
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      await step.run('deliver-webhook', async () => {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event.data),
        });
        if (!res.ok) {
          throw new Error(`Webhook failed: ${res.status} ${res.statusText}`);
        }
        return { status: res.status };
      });
    }

    // Step 2: Send email notification (placeholder — wired in Task 3)

    // Step 3: Send Slack notification (placeholder — wired in Task 4)

    // Step 4: Update lead status
    // Imported dynamically to avoid circular deps
    await step.run('update-lead-status', async () => {
      const { prisma } = await import('@/lib/db');
      await prisma.lead.update({
        where: { id: event.data.leadId },
        data: { webhookSent: true, webhookSentAt: new Date() },
      });
    });

    return { success: true, leadId: event.data.leadId };
  }
);
```

**Step 5: Verify build passes**

Run:
```bash
cd /home/nick/melissa && npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 6: Commit**

```bash
cd /home/nick/melissa && git add -A && git commit -m "feat: add Inngest client, API route, and lead-captured workflow

Inngest handles webhook delivery with per-step retries.
Placeholder steps for email and Slack notifications.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Set Up Resend and Email Notification

**Files:**
- Create: `src/emails/new-lead.tsx`
- Modify: `src/inngest/lead-captured.ts` (add email step)
- Modify: `package.json` (add resend dependency)

**Step 1: Install Resend**

Run:
```bash
cd /home/nick/melissa && npm install resend
```

**Step 2: Create email template at `src/emails/new-lead.tsx`**

```tsx
import * as React from 'react';

interface NewLeadEmailProps {
  firstName: string;
  age: number;
  gender: string;
  smokerStatus: string;
  healthClass: string;
  coverageAmount: number;
  termLength: number;
  phone: string;
  email: string;
  zip: string;
  leadId: string;
}

export function NewLeadEmail({
  firstName,
  age,
  gender,
  smokerStatus,
  healthClass,
  coverageAmount,
  termLength,
  phone,
  email,
  zip,
  leadId,
}: NewLeadEmailProps) {
  const coverageFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(coverageAmount);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#334155', fontSize: '24px' }}>New Lead: {firstName}</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <tbody>
          {[
            ['Name', firstName],
            ['Age', String(age)],
            ['Gender', gender],
            ['Smoker', smokerStatus],
            ['Health', healthClass.replace('_', ' ')],
            ['Coverage', coverageFormatted],
            ['Term', `${termLength} years`],
            ['Phone', phone],
            ['Email', email],
            ['ZIP', zip],
          ].map(([label, value]) => (
            <tr key={label}>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#64748b', width: '120px' }}>
                {label}
              </td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
        Lead ID: {leadId}
      </p>
    </div>
  );
}
```

**Step 3: Add email step to Inngest workflow**

In `src/inngest/lead-captured.ts`, add the Resend import at the top:

```typescript
import { Resend } from 'resend';
import { NewLeadEmail } from '@/emails/new-lead';
```

Then replace the `// Step 2: Send email notification (placeholder — wired in Task 3)` comment with:

```typescript
    // Step 2: Send email notification
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      await step.run('send-email-notification', async () => {
        const resend = new Resend(resendApiKey);
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Melissa <leads@updates.munka.dev>',
          to: process.env.EMAIL_TO?.split(',') || [],
          subject: `New Lead: ${event.data.firstName}, ${event.data.age}, ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(event.data.coverageAmount)}`,
          react: NewLeadEmail(event.data),
        });
        if (error) throw new Error(`Email failed: ${error.message}`);
      });
    }
```

**Step 4: Verify build passes**

Run:
```bash
cd /home/nick/melissa && npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 5: Commit**

```bash
cd /home/nick/melissa && git add -A && git commit -m "feat: add Resend email notifications for new leads

React Email template with lead details table.
Fires as Inngest workflow step with automatic retries.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Add Slack Notification to Workflow

**Files:**
- Modify: `src/inngest/lead-captured.ts` (add Slack step)

**Step 1: Add Slack webhook step to Inngest workflow**

In `src/inngest/lead-captured.ts`, replace the `// Step 3: Send Slack notification (placeholder — wired in Task 4)` comment with:

```typescript
    // Step 3: Send Slack notification
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhookUrl) {
      await step.run('send-slack-notification', async () => {
        const coverageFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(event.data.coverageAmount);

        const res = await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🆕 New Lead: *${event.data.firstName}*`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: [
                    `*New Lead: ${event.data.firstName}*`,
                    `Age: ${event.data.age} | Gender: ${event.data.gender}`,
                    `Coverage: ${coverageFormatted} / ${event.data.termLength}yr term`,
                    `Health: ${event.data.healthClass} | Smoker: ${event.data.smokerStatus}`,
                    `Phone: ${event.data.phone} | Email: ${event.data.email}`,
                    `ZIP: ${event.data.zip}`,
                  ].join('\n'),
                },
              },
            ],
          }),
        });
        if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`);
      });
    }
```

**Step 2: Verify build passes**

Run:
```bash
cd /home/nick/melissa && npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
cd /home/nick/melissa && git add -A && git commit -m "feat: add Slack notifications for new leads

Posts lead details to Slack via incoming webhook as Inngest step.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Rewire Leads API to Use Inngest Events

**Files:**
- Modify: `src/app/api/leads/route.ts` (replace inline webhook with inngest.send)
- Modify: `src/lib/types.ts` (add UTM fields to LeadData)
- Modify: `src/components/chat/ChatWindow.tsx` (capture and pass UTMs)

**Step 1: Add UTM fields to LeadData type in `src/lib/types.ts`**

Add these fields to the `LeadData` interface after `ipAddress`:

```typescript
  // UTM tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landingPage?: string;
```

**Step 2: Replace the leads API route**

Replace the full contents of `src/app/api/leads/route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { inngest } from '@/lib/inngest';
import { LeadData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const lead = await prisma.lead.create({
      data: {
        age: body.age,
        gender: body.gender,
        smokerStatus: body.smokerStatus,
        healthClass: body.healthClass,
        coverageAmount: body.coverageAmount,
        termLength: body.termLength,
        ratesShown: JSON.stringify(body.ratesShown),
        firstName: body.firstName,
        email: body.email,
        phone: body.phone,
        zip: body.zip,
        consentGiven: body.consentGiven,
        consentText: body.consentText,
        consentAt: new Date(),
        ipAddress,
        // UTM tracking
        utmSource: body.utmSource || null,
        utmMedium: body.utmMedium || null,
        utmCampaign: body.utmCampaign || null,
        utmContent: body.utmContent || null,
        utmTerm: body.utmTerm || null,
        gclid: body.gclid || null,
        fbclid: body.fbclid || null,
        referrer: body.referrer || null,
        landingPage: body.landingPage || null,
      },
    });

    // Fire Inngest event — handles webhook, email, Slack with retries
    await inngest.send({
      name: 'lead/captured',
      data: {
        leadId: lead.id,
        firstName: body.firstName,
        email: body.email,
        phone: body.phone,
        zip: body.zip,
        age: body.age,
        gender: body.gender,
        smokerStatus: body.smokerStatus,
        healthClass: body.healthClass,
        coverageAmount: body.coverageAmount,
        termLength: body.termLength,
        ratesShown: JSON.stringify(body.ratesShown),
      },
    });

    return NextResponse.json({ id: lead.id, success: true });
  } catch (error) {
    console.error('Lead creation failed:', error);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}
```

**Step 3: Update ChatWindow to capture UTM params**

In `src/components/chat/ChatWindow.tsx`, add UTM capture. After the `hasInitialized` ref (line 30), add:

```typescript
  const utmParams = useRef<Record<string, string>>({});
```

After the `hasInitialized` check in the initialization useEffect, add UTM capture logic:

```typescript
  // Capture UTM params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
      utmKeys.forEach((key) => {
        const val = params.get(key);
        if (val) utmParams.current[key] = val;
      });
      utmParams.current.referrer = document.referrer || '';
      utmParams.current.landingPage = window.location.pathname;
    }
  }, []);
```

In the `submitLead` function, update the fetch body to include UTMs. After `ipAddress: '',` add:

```typescript
          utmSource: utmParams.current.utm_source,
          utmMedium: utmParams.current.utm_medium,
          utmCampaign: utmParams.current.utm_campaign,
          utmContent: utmParams.current.utm_content,
          utmTerm: utmParams.current.utm_term,
          gclid: utmParams.current.gclid,
          fbclid: utmParams.current.fbclid,
          referrer: utmParams.current.referrer,
          landingPage: utmParams.current.landingPage,
```

**Step 4: Verify build passes**

Run:
```bash
cd /home/nick/melissa && npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 5: Run existing tests to ensure nothing broke**

Run:
```bash
cd /home/nick/melissa && npm test 2>&1
```

Expected: All 11 tests pass (5 rates + 6 conversation).

**Step 6: Commit**

```bash
cd /home/nick/melissa && git add -A && git commit -m "feat: rewire leads API to use Inngest events + add UTM tracking

Replace inline webhook with inngest.send() for reliable delivery.
Capture UTM params, gclid, fbclid from URL for ad attribution.
Store referrer and landing page with each lead.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Set Up Sentry Error Monitoring

**Files:**
- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`
- Create: `src/instrumentation.ts` (Next.js instrumentation hook)
- Modify: `next.config.ts` (wrap with Sentry)
- Modify: `package.json` (add @sentry/nextjs)

**Step 1: Install Sentry**

Run:
```bash
cd /home/nick/melissa && npm install @sentry/nextjs
```

**Step 2: Create `sentry.client.config.ts` in project root**

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  enabled: process.env.NODE_ENV === 'production',
});
```

**Step 3: Create `sentry.server.config.ts` in project root**

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === 'production',
});
```

**Step 4: Create `src/instrumentation.ts`**

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
}

export const onRequestError = async (...args: unknown[]) => {
  const Sentry = await import('@sentry/nextjs');
  return (Sentry.captureRequestError as (...a: unknown[]) => void)(...args);
};
```

**Step 5: Read and update `next.config.ts` to wrap with Sentry**

First read the current `next.config.ts`:

Run:
```bash
cat /home/nick/melissa/next.config.ts
```

Then wrap the existing config with `withSentryConfig`. The exact edit depends on current contents but the pattern is:

```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // existing config...
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: '', // Set when you have Sentry org
  project: '', // Set when you have Sentry project
});
```

**Step 6: Add NEXT_PUBLIC_SENTRY_DSN to `.env`**

Add to `.env`:
```
NEXT_PUBLIC_SENTRY_DSN=""
```

**Step 7: Verify build passes**

Run:
```bash
cd /home/nick/melissa && npm run build 2>&1 | tail -20
```

Expected: Build succeeds (Sentry is disabled when DSN is empty).

**Step 8: Commit**

```bash
cd /home/nick/melissa && git add -A && git commit -m "feat: add Sentry error monitoring

Client + server configs, instrumentation hook, withSentryConfig wrapper.
Disabled in dev, enabled in production when DSN is set.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Deploy to Vercel with Integrations

**Step 1: Deploy to Vercel**

Run:
```bash
cd /home/nick/melissa && npx vercel --prod 2>&1
```

If not linked yet:
```bash
cd /home/nick/melissa && npx vercel link
```

**Step 2: Add Neon via Vercel Marketplace**

This is a manual step. Go to:
1. https://vercel.com/marketplace/neon
2. Add to the `melissa` project
3. This auto-creates a Neon database and injects `DATABASE_URL` env var

**Step 3: Run Prisma migration against Neon**

After DATABASE_URL is set:
```bash
cd /home/nick/melissa && npx vercel env pull .env.local && npx prisma migrate dev --name init
```

**Step 4: Add Inngest via Vercel Marketplace**

Manual step:
1. https://vercel.com/marketplace/inngest
2. Add to the `melissa` project
3. Auto-injects `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`

**Step 5: Add Resend via Vercel Marketplace**

Manual step:
1. https://vercel.com/marketplace/resend
2. Add to the `melissa` project
3. Auto-injects `RESEND_API_KEY`

**Step 6: Set remaining env vars in Vercel**

In Vercel Dashboard → melissa → Settings → Environment Variables:
- `SLACK_WEBHOOK_URL` = your Slack incoming webhook URL
- `EMAIL_FROM` = `Melissa <leads@yourdomain.com>` (after verifying domain in Resend)
- `EMAIL_TO` = comma-separated recipient emails
- `WEBHOOK_URL` = buyer webhook URL (when you have one)
- `SENTRY_DSN` = from sentry.io project settings
- `NEXT_PUBLIC_SENTRY_DSN` = same DSN value (for client-side)

**Step 7: Redeploy with all env vars**

```bash
cd /home/nick/melissa && npx vercel --prod
```

**Step 8: Verify the deployment**

1. Visit the deployed URL
2. Complete the chatbot flow with test data
3. Check Inngest dashboard for the `lead/captured` event
4. Check Neon dashboard for the lead row
5. Check Slack for the notification (if webhook configured)

**Step 9: Push all changes to GitHub**

```bash
cd /home/nick/melissa && git push origin main
```

---

### Task 8: Verify All Tests Pass

**Step 1: Run all tests**

Run:
```bash
cd /home/nick/melissa && npm test 2>&1
```

Expected: All existing tests pass (rates + conversation). The Inngest functions and API routes don't need unit tests — they're integration-tested via the deployed app and Inngest dashboard.

**Step 2: Verify build**

Run:
```bash
cd /home/nick/melissa && npm run build 2>&1 | tail -20
```

Expected: Clean build with no errors.

**Step 3: Final commit if any changes needed**

```bash
cd /home/nick/melissa && git status
```

If clean: done. If changes needed, commit and push.
