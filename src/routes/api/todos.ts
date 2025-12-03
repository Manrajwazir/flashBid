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
	// BetterAuth typically returns { user, session }
	if (!data?.user?.id) {
		return null
	}
	return data as { user: { id: string } }
}

export const Route = createFileRoute('/api/todos')({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const authData = await requireSession(request)
				if (!authData) {
					return json({ error: 'Unauthorized' }, { status: 401 })
				}
				const todos = await prisma.todo.findMany({
					where: { userId: authData.user.id },
					orderBy: { createdAt: 'desc' },
				})
				return json(todos)
			},
			POST: async ({ request }) => {
				const authData = await requireSession(request)
				if (!authData) {
					return json({ error: 'Unauthorized' }, { status: 401 })
				}
				const body = (await request.json().catch(() => ({}))) as any
				const title = typeof body.title === 'string' ? body.title.trim() : ''
				if (!title) {
					return json({ error: 'Title required' }, { status: 400 })
				}
				const todo = await prisma.todo.create({
					data: { title, userId: authData.user.id },
				})
				return json(todo, { status: 201 })
			},
		},
	},
})


