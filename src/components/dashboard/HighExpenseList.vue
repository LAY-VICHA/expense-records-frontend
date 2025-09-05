<template>
  <div class="pt-8">
    <div class="text-3xl font-bold">High Expense Record</div>

    <div class="py-4 pb-6 flex justify-between items-center gap-4">
      <div class="w-full flex justify-between gap-4">
        <SearchComponent
          @search="handleSearch"
          :key="resetSearchKey"
          placeholder="Search record by reason..."
          class="max-w-sm"
        />
        <Button
          variant="destructive"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
          @click="handleReset"
          aria-label="reset filter button"
        >
          Reset Filters
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="w-full flex justify-center pt-4"><Loading /></div>
    <Transition appear name="slide-fade">
      <Table v-if="!isLoading">
        <TableHeader>
          <TableRow>
            <TableHead class="w-[100px]"> No. </TableHead>
            <TableHead>Expense Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sub Category</TableHead>
            <TableHead class="w-50 md:w-75 2xl:w-120">Reason</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead class="text-right">Spent In</TableHead>
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
            <TableCell>
              <span class="text-red-600 font-medium">{{ item.amount }}</span>
            </TableCell>
            <TableCell v-if="item.currency === 'USD'" class="text-right">
              <span class="font-medium text-green-700 bg-green-100 rounded-md py-0.75 px-2.5">{{
                item.currency
              }}</span>
            </TableCell>
            <TableCell v-else class="text-right">
              <span class="font-medium text-yellow-700 bg-yellow-100 rounded-md py-0.75 px-2.5">
                {{ item.currency }}
              </span>
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
            :total-page="expenseRecord.totalPages"
          />
        </TableCaption>
      </Table>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Loading from '@/components/Loading.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import SearchComponent from '@/components/SearchComponent.vue'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { useNoRetryQuery } from '@/lib/noRetryQuery'
import { ApiResponse, ExpenseRecord, PaginatedResult } from '@/types/api-response'
import { keepPreviousData } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const page = computed(() => route.query.page ?? '1')
const pageSize = computed(() => route.query.pageSize ?? '10')
const resetSearchKey = ref(0)
const reason = computed(() => route.query.reason ?? '')

const handleSearch = (searchQuery: string) => {
  router.replace({
    query: {
      ...route.query,
      page: 1,
      pageSize: 10,
      reason: searchQuery || '',
    },
  })
}

const handleReset = () => {
  resetSearchKey.value++
  router.replace({ query: {} })
}

const { data, isLoading } = useNoRetryQuery<ApiResponse<PaginatedResult<ExpenseRecord>>>({
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

const fetchExpenseRecord = async (): Promise<ApiResponse<PaginatedResult<ExpenseRecord>>> => {
  const query = new URLSearchParams()
  if (reason.value) query.set('reason', String(reason.value))
  query.set('page', String(page.value))
  query.set('pageSize', String(pageSize.value))
  query.set('isHighExpenseRecord', 'true')

  const response = await apiFetch<ApiResponse<PaginatedResult<ExpenseRecord>>>(
    `/expense-record?${query}`,
  )

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response.value
}

const expenseRecord = computed(() => data.value?.data)

const convertDate = (date: Date): string => {
  const dateString = new Date(date).toISOString()
  return dateString.split('T')[0]
}
</script>
