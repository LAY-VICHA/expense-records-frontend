<template>
  <div class="p-8">
    <div class="text-3xl font-bold">Expense Record</div>

    <div class="py-4 flex justify-between items-center gap-4">
      <QueryTools />
      <!-- <CreateCategory /> -->
    </div>

    <div v-if="isLoading" class="w-full flex justify-center pt-4"><Loading /></div>
    <Table v-if="!isLoading">
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]"> No. </TableHead>
          <TableHead>Expense Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Sub Category</TableHead>
          <TableHead class="w-50 md:w-75 2xl:w-120">Reason</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead class="text-right"> Action </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody v-if="data?.data?.items">
        <TableRow v-for="(item, index) in data.data.items" :key="index">
          <TableCell class="font-medium">
            {{ (data.data.currentPage - 1) * data.data.pageSize + index + 1 }}
          </TableCell>
          <TableCell>{{ convertDate(item.expenseDate) }}</TableCell>
          <TableCell>{{ item.category }}</TableCell>
          <TableCell>{{ item.subCategory }}</TableCell>
          <TableCell
            class="truncate max-w-50 md:max-w-75 2xl:max-w-120 whitespace-nowrap overflow-hidden"
            >{{ item.reason }}</TableCell
          >
          <TableCell>{{ item.amount }}</TableCell>
          <TableCell>{{ item.currency }}</TableCell>
          <TableCell class="text-right flex justify-end gap-2.5 items-center">
            <SquarePen class="size-4 cursor-pointer hover:text-secondary" />
            <Trash2 class="size-4 cursor-pointer hover:text-destructive" />
          </TableCell>
        </TableRow>
      </TableBody>
      <TableBody v-if="!data?.data?.items || data.data.items.length === 0">
        <TableRow>
          <TableCell colspan="4" class="text-center">No expense records found</TableCell>
        </TableRow>
      </TableBody>
      <TableCaption v-if="data?.data?.items">
        <PaginationComponent :page-size="data.data.pageSize" :total="data.data.totalItems" />
      </TableCaption>
    </Table>

    <!-- <EditCategory v-model="isEditDialogOpen" :category="selectedCategory" />
    <DeleteCategory v-model="isDeleteDialogOpen" :categoryId="selectedId" /> -->
  </div>
</template>

<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SquarePen, Trash2 } from 'lucide-vue-next'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { ApiResponse, expenseRecord, PaginatedResult } from '@/types/api-response'
import { computed, ref } from 'vue'
import Loading from '@/components/Loading.vue'
import QueryTools from '@/components/expense-record/QueryTools.vue'
// import CreateCategory from '@/components/category/CreateCategory.vue'
// import EditCategory from '@/components/category/EditCategory.vue'
// import DeleteCategory from '@/components/category/DeleteCategory.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'

const route = useRoute()

const page = computed(() => route.query.page ?? '1')
const pageSize = computed(() => route.query.pageSize ?? '10')
const reason = computed(() => route.query.reason ?? '')
const sortBy = computed(() => route.query.sortBy ?? '')
const filterCategory = computed(() => route.query.filterCategory ?? '')
const filterSubCategory = computed(() => route.query.filterSubCategory ?? '')
const filterStartDate = computed(() => route.query.filterStartDate ?? '')
const filterEndDate = computed(() => route.query.filterEndDate ?? '')
// const isEditDialogOpen = ref(false)
// const selectedCategory = ref<CategoryFormValues>({
//   id: '',
//   name: '',
//   description: '',
// })
// const isDeleteDialogOpen = ref(false)
// const selectedId = ref<string>('')

// interface ExpenseRecordFormValues {
//   id: string
//   name: string
//   description: string
// }

const { data, isLoading } = useQuery<ApiResponse<PaginatedResult<expenseRecord>>>({
  queryFn: async () => await fetchExpenseRecord(),
  queryKey: computed(() => [
    'expense-records',
    {
      page: page.value,
      pageSize: pageSize.value,
      ...(reason.value ? { reason } : {}),
    },
  ]),
  placeholderData: keepPreviousData,
})

const fetchExpenseRecord = async (): Promise<ApiResponse<PaginatedResult<expenseRecord>>> => {
  const query = new URLSearchParams()
  if (reason.value) query.set('reason', String(reason.value))
  if (sortBy.value) query.set('sortBy', String(sortBy.value))
  if (filterCategory.value) query.set('filterCategory', String(filterCategory.value))
  if (filterSubCategory.value) query.set('filterSubCategory', String(filterSubCategory.value))
  if (filterStartDate.value) query.set('filterStartDate', String(filterStartDate.value))
  if (filterEndDate.value) query.set('filterEndDate', String(filterEndDate.value))
  query.set('page', String(page.value))
  query.set('pageSize', String(pageSize.value))
  console.log(query)

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/expense-record?${query}`)

  if (!response.ok) throw new Error('Cannot get data')

  const data = await response.json()
  return data
}

const convertDate = (date: Date): string => {
  const dateString = new Date(date).toISOString()
  return dateString.split('T')[0]
}

// function openEditCategory(item: CategoryFormValues) {
//   selectedCategory.value = item
//   isEditDialogOpen.value = true
// }

// function openDeleteCategory(id: string) {
//   console.log(id)
//   selectedId.value = id
//   isDeleteDialogOpen.value = true
// }
</script>
