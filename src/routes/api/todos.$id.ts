import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { auth } from '../../auth'
import { prisma } from '@/db'

async function requireSession(request: Request) {
	const url = new URL(request.url)
	const headers = new Headers(request.headers)
	const cookie = request.headers.get('cookie') ?? ''
	headers.set('cookie', cookie)
	const sessionReq = new Request(new URL('/api/auth/get-session', url.origin), {
		headers,
		method: 'GET',
	})
	const res = await auth.handler(sessionReq)
	if (!res.ok) {
		return null
	}
	const data = (await res.json()) as any
	if (!data?.user?.id) {
		return null
	}
	return data as { user: { id: string } }
}

export const Route = createFileRoute('/api/todos/$id')({
	params: {
		parse: (p) => ({ id: p.id }),
		stringify: ({ id }) => ({ id }),
	},
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const authData = await requireSession(request)
				if (!authData) {
				 return json({ error: 'Unauthorized' }, { status: 401 })
				}
				const id = Number(params.id)
				if (Number.isNaN(id)) {
					return json({ error: 'Invalid id' }, { status: 400 })
				}
				const existing = await prisma.todo.findFirst({
					where: { id, userId: authData.user.id },
				})
				if (!existing) {
					return json({ error: 'Not found' }, { status: 404 })
				}
				const updated = await prisma.todo.update({
					where: { id },
					data: { completed: !existing.completed },
				})
			 return json(updated)
			},
			DELETE: async ({ request, params }) => {
				const authData = await requireSession(request)
				if (!authData) {
				 return json({ error: 'Unauthorized' }, { status: 401 })
				}
				const id = Number(params.id)
				if (Number.isNaN(id)) {
					return json({ error: 'Invalid id' }, { status: 400 })
				}
				await prisma.todo.deleteMany({
					where: { id, userId: authData.user.id },
				})
				return json({ ok: true })
			},
		},
	},
})


