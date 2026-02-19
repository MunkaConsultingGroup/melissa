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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save lead', detail: message }, { status: 500 });
  }
}
