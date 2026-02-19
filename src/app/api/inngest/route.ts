import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { leadCaptured } from '@/inngest/lead-captured';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [leadCaptured],
});
