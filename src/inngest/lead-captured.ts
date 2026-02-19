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
