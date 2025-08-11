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

export type Category = {
  name: string
  id: string
  description: string
  createdAt: Date
  updatedAt: Date | null
}

export type SubCategory = Category & {
  category: {
    id: string
    name: string
  }
}

export type EditSubCategory = {
  id: string
  name: string
  description: string
  category: {
    id: string
    name: string
  }
}

export type Categories = Category & {
  subCategories: {
    name: string
    id: string
    description: string | null
    createdAt: Date
    updatedAt: Date | null
    categoryId: string
  }[]
}

export type AllCategories = Categories[]

export type ExpenseRecord = {
  id: string
  expenseDate: Date
  amount: string
  currency: string
  reason: string | null
  category: string
  categoryId: string
  subCategory: string | null
  subCategoryId: string | null
  createdAt: Date
  updatedAt: Date | null
}

export type EditExpenseReocrd = {
  id: string
  expenseDate: Date
  amount: string
  currency: string
  reason: string | null
  category: string
  categoryId: string
  subCategory: string | null
  subCategoryId: string | null
}

type DataPoints = {
  date: string
  amount: number
}

export type BarChartResponse = {
  totalExpense: number
  averageExpense: number
  periodsWithData: number
  dataPoints: DataPoints[]
}

export type CardDataResponse = {
  totalExpense: number
  totalDays: number
  averagePerDay: number
}

type PieChartData = {
  label: string
  amount: number
  percentage: number
  count: number
}

export type PieChartResponse = {
  totalExpense: number
  pieChartData: PieChartData[]
}

export type AuthCredentials = {
  email: string
  password: string
}
