<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold">Dashboard</h1>
    <section v-if="!cardLoading" class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2 text-gray-600">
          <CardTitle>Total Expense</CardTitle>
          <CircleDollarSign />
        </CardHeader>
        <CardContent class="text-2xl font-bold">{{ cardData?.totalExpense }} USD</CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2 text-gray-600">
          <CardTitle>Total Record Day</CardTitle>
          <CalendarDays />
        </CardHeader>
        <CardContent class="text-2xl font-bold">{{ cardData?.totalDays }} Days</CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2 text-gray-600">
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
        class="w-full h-full grid grid-cols-1 lg:grid-cols-7 gap-y-5"
      >
        <div class="lg:col-span-4">
          <BarChart v-if="barChartData" :barChartData="barChartData" :periodType="periodType" />
          <BarChart v-else :barChartData="barChartWithoutData" :periodType="periodType" />
        </div>
        <div class="lg:col-span-3 lg:pl-6">
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
  </div>
</template>

<script setup lang="ts">
import { CircleDollarSign, CalendarDays, ChartSpline } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BarChart from '@/components/dashboard/BarChart.vue'
import PieChart from '@/components/dashboard/PieChart.vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import {
  ApiResponse,
  BarChartResponse,
  CardDataResponse,
  PieChartResponse,
} from '@/types/api-response'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Loading from '@/components/Loading.vue'

const route = useRoute()
const selectedCategory = computed(() => route.query.selectedCategory ?? '')
const selectedSubCategory = computed(() => route.query.selectedSubCategory ?? '')
const periodType = computed(() => route.query.periodType ?? 'monthly')
const isIncludeHighExpenseRecord = computed(() => route.query.isIncludeHighExpenseRecord ?? false)

const year = computed(() => route.query.year ?? '2025')
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
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard`)

  if (!response.ok) throw new Error('Cannot get data')

  const data = await response.json()
  return data
}

const { data: barChartDataResponse, isLoading } = useQuery<ApiResponse<BarChartResponse>>({
  queryFn: async () => await fetchBarChartData(),
  queryKey: computed(() => [
    'bar-chart',
    {
      ...(selectedCategory.value ? { selectedCategory } : {}),
      ...(selectedSubCategory.value ? { selectedSubCategory } : {}),
      ...(periodType.value ? { periodType } : {}),
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
  if (periodType.value) query.set('periodType', String(periodType.value))
  if (isIncludeHighExpenseRecord.value)
    query.set('isIncludeHighExpenseRecord', String(isIncludeHighExpenseRecord.value))

  console.log(query)

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/bar-chart?${query}`)

  if (!response.ok) throw new Error('Cannot get data')

  const data = await response.json()
  return data
}

// ------------------------------------------------------------------------

const { data: pieChartDataResponse, isLoading: pieChartloading } = useQuery<
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

  console.log(query)

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/pie-chart?${query}`)

  if (!response.ok) throw new Error('Cannot get data')

  const data = await response.json()
  return data
}
</script>
