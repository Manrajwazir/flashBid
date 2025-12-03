import { createFileRoute } from '@tanstack/react-router';
import { auth } from '../../auth';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
      PATCH: ({ request }) => auth.handler(request),
      PUT: ({ request }) => auth.handler(request),
      DELETE: ({ request }) => auth.handler(request),
      OPTIONS: ({ request }) => auth.handler(request),
    },
  },
});
