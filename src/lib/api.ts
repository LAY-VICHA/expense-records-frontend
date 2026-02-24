import { type Result, err, ok } from '@justmiracle/result'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
export async function apiFetch<TResult>(
  endpoint: string,
  options: RequestInit = {},
): Promise<Result<TResult>> {
  const headers: Record<string, string> = {
    ...(options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers as Record<string, string>)),
  }

  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })
    .then(ok)
    .catch(err)

  if (response.value?.status === 401) {
    const router = useRouter()
    router.push('/login')
    setTimeout(() => {
      toast.error('Session expired. Please login again')
    }, 50)
    throw new Error('Unauthorized')
  }

  if (response.error) {
    return response
  }

  if (!response.value.ok) {
    const errorData = await response.value.json()
    throw { message: `${errorData.message}`, status: response.value.status }
  }

  return response.value.json().then(ok).catch(err)
}
