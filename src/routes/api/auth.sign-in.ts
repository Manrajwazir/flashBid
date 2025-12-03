import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../auth'

export const Route = createFileRoute('/api/auth/sign-in')({
	server: {
		handlers: {
			POST: ({ request }) => auth.handler(request),
		},
	},
})


