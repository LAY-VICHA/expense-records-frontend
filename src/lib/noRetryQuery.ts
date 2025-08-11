import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

export function useNoRetryQuery<TData = unknown, TError = { message: string; status: number }>(
  options: UseQueryOptions<TData, TError>,
) {
  return useQuery({
    retry: (failureCount, error) => {
      const err = error as Response

      if (err.status === 404) {
        return false
      }
      return failureCount < 3
    },
    ...options,
  })
}
