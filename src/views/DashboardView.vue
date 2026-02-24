<template>
  <div class="p-8">
    <h2 class="text-3xl font-bold">Dashboard</h2>
    <section
      v-if="!cardLoading"
      class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <Card class="flex flex-col justify-between">
        <CardHeader
          class="flex flex-cols items-center justify-between space-y-0 pb-2 text-gray-600"
        >
          <CardTitle>Total Expense</CardTitle>
          <CircleDollarSign />
        </CardHeader>
        <CardContent class="text-2xl font-bold">{{ cardData?.totalExpense }} USD</CardContent>
      </Card>
      <Card class="flex flex-col justify-between">
        <CardHeader
          class="flex flex-cols items-center justify-between space-y-0 pb-2 text-gray-600"
        >
          <CardTitle>Total Record Day</CardTitle>
          <CalendarDays />
        </CardHeader>
        <CardContent class="text-2xl font-bold">{{ cardData?.totalDays }} Days</CardContent>
      </Card>
      <Card class="flex flex-col justify-between">
        <CardHeader
          class="flex flex-cols items-center justify-between space-y-0 pb-2 text-gray-600"
        >
          <CardTitle>Average Expense/Day</CardTitle>
          <ChartSpline />
        </CardHeader>
        <CardContent class="text-2xl font-bold">{{ cardData?.averagePerDay }}</CardContent>
      </Card>
    </section>

    <section class="mt-8">
      <div>
        <Loading v-if="isLoading && pieChartloading" class="w-full flex justify-center pt-4" />
      </div>
      <div
        v-if="!isLoading && !pieChartloading"
        class="w-full h-full grid grid-cols-1 xl:grid-cols-7 gap-y-5"
      >
        <div class="xl:col-span-4">
          <BarChart v-if="barChartData" :barChartData="barChartData" :year="yearBarChart" />
          <BarChart v-else :barChartData="barChartWithoutData" :year="yearBarChart" />
        </div>
        <div class="xl:col-span-3 xl:pl-6">
          <PieChart
            v-if="pieChartData"
            :pieChartData="pieChartData"
            :groupBy="groupBy"
            :month="month"
          />
          <PieChart v-else :pieChartData="pieChartWithoutData" :groupBy="groupBy" :month="month" />
        </div>
      </div>
    </section>

    <HighExpenseList />
  </div>
</template>

<script setup lang="ts">
import BarChart from '@/components/dashboard/BarChart.vue'
import HighExpenseList from '@/components/dashboard/HighExpenseList.vue'
import PieChart from '@/components/dashboard/PieChart.vue'
import Loading from '@/components/Loading.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { useNoRetryQuery } from '@/lib/noRetryQuery'
import {
  ApiResponse,
  BarChartResponse,
  CardDataResponse,
  PieChartResponse,
} from '@/types/api-response'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { CalendarDays, ChartSpline, CircleDollarSign } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const selectedCategory = computed(() => route.query.selectedCategory ?? '')
const selectedSubCategory = computed(() => route.query.selectedSubCategory ?? '')
const yearBarChart = computed(() => route.query.yearBarChart ?? new Date().getFullYear().toString())
const isIncludeHighExpenseRecord = computed(() => route.query.isIncludeHighExpenseRecord ?? false)

const year = computed(() => route.query.year ?? new Date().getFullYear().toString())
const month = computed(() => route.query.month ?? '')
const groupBy = computed(() => route.query.groupBy ?? 'category')
const isIncludeHighExpenseRecordPieChart = computed(
  () => route.query.isIncludeHighExpenseRecordPieChart ?? false,
)

const { data: cardDataResponse, isLoading: cardLoading } = useQuery<ApiResponse<CardDataResponse>>({
  queryFn: async () => await fetchCardData(),
  queryKey: computed(() => ['card']),
  placeholderData: keepPreviousData,
})

const cardData = computed(() => cardDataResponse.value?.data)

const fetchCardData = async (): Promise<ApiResponse<CardDataResponse>> => {
  const response = await apiFetch<ApiResponse<CardDataResponse>>(`/dashboard`)

  if (response.error) {
    throw new Error(response.error.message || 'Failed to fetch card data')
  }

  return response.value
}

const { data: barChartDataResponse, isLoading } = useNoRetryQuery<ApiResponse<BarChartResponse>>({
  queryFn: async () => await fetchBarChartData(),
  queryKey: computed(() => [
    'bar-chart',
    {
      ...(selectedCategory.value ? { selectedCategory } : {}),
      ...(selectedSubCategory.value ? { selectedSubCategory } : {}),
      ...(yearBarChart.value ? { yearBarChart } : {}),
      ...(isIncludeHighExpenseRecord.value ? { isIncludeHighExpenseRecord } : {}),
    },
  ]),
  placeholderData: keepPreviousData,
})

const barChartData = computed(() => barChartDataResponse.value?.data)
const barChartWithoutData = {
  totalExpense: 0,
  averageExpense: 0,
  periodsWithData: 0,
  dataPoints: [],
}

const fetchBarChartData = async (): Promise<ApiResponse<BarChartResponse>> => {
  const query = new URLSearchParams()
  if (selectedCategory.value) query.set('selectedCategory', String(selectedCategory.value))
  if (selectedSubCategory.value) query.set('selectedSubCategory', String(selectedSubCategory.value))
  if (yearBarChart.value) query.set('yearBarChart', String(yearBarChart.value))
  if (isIncludeHighExpenseRecord.value)
    query.set('isIncludeHighExpenseRecord', String(isIncludeHighExpenseRecord.value))

  const response = await apiFetch<ApiResponse<BarChartResponse>>(`/dashboard/bar-chart?${query}`)

  if (response.error) {
    throw new Error(response.error.message || 'Failed to fetch bar chart data')
  }

  return response.value
}

const { data: pieChartDataResponse, isLoading: pieChartloading } = useNoRetryQuery<
  ApiResponse<PieChartResponse>
>({
  queryFn: async () => await fetchPieChartData(),
  queryKey: computed(() => [
    'bar-chart',
    {
      ...(year.value ? { year } : {}),
      ...(month.value ? { month } : {}),
      ...(groupBy.value ? { groupBy } : {}),
      ...(isIncludeHighExpenseRecordPieChart.value ? { isIncludeHighExpenseRecordPieChart } : {}),
    },
  ]),
  placeholderData: keepPreviousData,
})

const pieChartData = computed(() => pieChartDataResponse.value?.data)
const pieChartWithoutData = {
  totalExpense: 0,
  pieChartData: [],
}

const fetchPieChartData = async (): Promise<ApiResponse<PieChartResponse>> => {
  const query = new URLSearchParams()
  if (year.value) query.set('year', String(year.value))
  if (month.value) query.set('month', String(month.value))
  if (groupBy.value) query.set('groupBy', String(groupBy.value))
  if (isIncludeHighExpenseRecordPieChart.value)
    query.set(
      'isIncludeHighExpenseRecordPieChart',
      String(isIncludeHighExpenseRecordPieChart.value),
    )

  const response = await apiFetch<ApiResponse<PieChartResponse>>(`/dashboard/pie-chart?${query}`)

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response.value
}
</script>
