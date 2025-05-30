export type ApiResponse<TData> = {
  success: boolean
  data?: TData
  message?: string
}

export interface PaginatedResult<TData> {
  items: TData[]
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}

export type category = {
  name: string
  id: string
  description: string
  createdAt: Date
  updatedAt: Date | null
}

export type subCategory = category & {
  category: {
    id: string
    name: string
  }
}

export type editSubCategory = {
  id: string
  name: string
  description: string
  category: {
    id: string
    name: string
  }
}

export type categories = category & {
  subCategories: {
    name: string
    id: string
    description: string | null
    createdAt: Date
    updatedAt: Date | null
    categoryId: string
  }[]
}

export type allCategories = categories[]

export type expenseRecord = {
  id: string
  expenseDate: Date
  amount: string
  currency: string
  reason: string | null
  category: string
  subCategory: string | null
  createdAt: Date
  updatedAt: Date | null
}
