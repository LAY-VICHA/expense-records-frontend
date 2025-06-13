<template>
  <div class="p-8">
    <div class="text-3xl font-bold">Expense Record</div>

    <div class="py-4 pb-6 flex justify-between items-center gap-4">
      <QueryTools />
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
      <TableBody v-if="expenseRecord?.items">
        <TableRow v-for="(item, index) in expenseRecord.items" :key="index">
          <TableCell class="font-medium">
            {{ (expenseRecord.currentPage - 1) * expenseRecord.pageSize + index + 1 }}
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
            <SquarePen
              @click="openEditExpenseRecord(item)"
              class="size-4 cursor-pointer hover:text-secondary"
            />
            <Trash2
              @click="openDeleteExpenseRecord(item.id)"
              class="size-4 cursor-pointer hover:text-destructive"
            />
          </TableCell>
        </TableRow>
      </TableBody>
      <TableBody v-if="!expenseRecord?.items || expenseRecord.items.length === 0">
        <TableRow>
          <TableCell colspan="8" class="text-center">No expense records found</TableCell>
        </TableRow>
      </TableBody>
      <TableCaption v-if="expenseRecord?.items">
        <PaginationComponent
          :page-size="expenseRecord.pageSize"
          :total="expenseRecord.totalItems"
        />
      </TableCaption>
    </Table>

    <EditExpenseRecord v-model="isEditDialogOpen" :expenseRecord="selectedExpenseRecord" />
    <DeleteExpenseRecord v-model="isDeleteDialogOpen" :expenseRecordId="selectedId" />
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
import {
  ApiResponse,
  ExpenseRecord,
  EditExpenseReocrd,
  PaginatedResult,
} from '@/types/api-response'
import { computed, ref } from 'vue'
import Loading from '@/components/Loading.vue'
import QueryTools from '@/components/expense-record/QueryTools.vue'
import EditExpenseRecord from '@/components/expense-record/EditExpenseRecord.vue'
import DeleteExpenseRecord from '@/components/expense-record/DeleteExpenseRecord.vue'
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
const isEditDialogOpen = ref(false)
const selectedExpenseRecord = ref<EditExpenseReocrd>({
  id: '',
  expenseDate: new Date(),
  amount: '',
  currency: '',
  reason: '',
  category: '',
  subCategory: '',
})
const isDeleteDialogOpen = ref(false)
const selectedId = ref<string>('')

const { data, isLoading } = useQuery<ApiResponse<PaginatedResult<ExpenseRecord>>>({
  queryFn: async () => await fetchExpenseRecord(),
  queryKey: computed(() => [
    'expense-records',
    {
      page: page.value,
      pageSize: pageSize.value,
      ...(reason.value ? { reason } : {}),
      ...(sortBy.value ? { sortBy } : {}),
      ...(filterCategory.value ? { filterCategory } : {}),
      ...(filterSubCategory.value ? { filterSubCategory } : {}),
      ...(filterStartDate.value ? { filterStartDate } : {}),
      ...(filterEndDate.value ? { filterEndDate } : {}),
    },
  ]),
  placeholderData: keepPreviousData,
})

const fetchExpenseRecord = async (): Promise<ApiResponse<PaginatedResult<ExpenseRecord>>> => {
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

const expenseRecord = computed(() => data.value?.data)

const convertDate = (date: Date): string => {
  const dateString = new Date(date).toISOString()
  return dateString.split('T')[0]
}

function openEditExpenseRecord(item: EditExpenseReocrd) {
  console.log('open edit expense record', item)

  selectedExpenseRecord.value = item
  isEditDialogOpen.value = true
}

function openDeleteExpenseRecord(id: string) {
  console.log(id)
  selectedId.value = id
  isDeleteDialogOpen.value = true
}
</script>
