import { createFileRoute } from '@tanstack/react-router';
import { auth } from '../../auth';

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
    },
  },
});
