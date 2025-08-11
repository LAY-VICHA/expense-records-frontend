export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!res.ok) return false

    const data = await res.json()
    return !!data?.user
  } catch (err) {
    throw new Error(`Server Error: ${err}`)
  }
}

export const userInformation = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    if (!res.ok) {
      throw new Error(`Cannot get user information`)
    }

    const data = await res.json()

    return data.user
  } catch (err) {
    throw new Error(`Server Error: ${err}`)
  }
}
