import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../auth'

export const Route = createFileRoute('/api/auth/sign-out')({
	server: {
		handlers: {
			POST: ({ request }) => auth.handler(request),
		},
	},
})


