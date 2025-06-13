<template>
  <div class="h-full border border-solid border-gray-200 rounded-xl">
    <div class="grid grid-cols-4 p-5 pb-0 border-b border-solid border-b-gray-200">
      <div class="col-span-2 flex flex-col gap-1 px-6 py-5 sm:py-6">
        <p class="text-lg font-bold">
          Bar Chart -
          <span v-if="props.periodType === 'monthly'">Monthly</span>
          <span v-else>Yearly</span> Summary
        </p>
        <p class="text-sm text-gray-600">
          showing total expense for the last
          <span v-if="props.periodType === 'monthly'">12 months</span>
          <span v-else>7 years</span>
        </p>
      </div>

      <div class="px-6 py-5 border-l border-solid border-l-gray-200">
        <p class="text-start text-gray-600 text-sm">Total Expense</p>
        <p class="font-bold text-3xl">
          {{ props.barChartData.totalExpense }}
          <span class="font-normal text-xs text-gray-600">USD</span>
        </p>
      </div>

      <div class="px-6 py-5 border-l border-solid border-l-gray-200">
        <p class="text-start text-gray-600 text-sm">Average Expense</p>
        <p class="font-bold text-3xl">
          {{ props.barChartData.averageExpense }}
          <span class="font-normal text-xs text-gray-600">USD</span>
        </p>
      </div>
    </div>

    <div class="p-5 pb-0">
      <BarChartQueryTool />
    </div>
    <Chart :data="chartData" :options="chartOptions" type="bar" class="p-5 pt-0" />
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Colors,
} from 'chart.js'
import { Chart } from 'vue-chartjs'
import BarChartQueryTool from '@/components/dashboard/BarChartQueryTool.vue'
import { ref, watch } from 'vue'
import { BarChartResponse } from '@/types/api-response'
import type { ChartData, ChartDataset } from 'chart.js'
import type { LocationQueryValue } from 'vue-router'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  Colors,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
)

const props = defineProps<{
  barChartData: BarChartResponse
  periodType: string | LocationQueryValue[]
}>()

function getLast12Months() {
  const now = new Date()
  const months = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${d.getMonth() + 1}`)
  }

  return months
}

function getLast7Years() {
  const now = new Date()
  const years = []
  for (let i = 6; i >= 0; i--) {
    years.push(`${now.getFullYear() - i}`)
  }
  return years
}

function formatLabel(str: string) {
  if (props.periodType === 'monthly') {
    const [year, month] = str.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleString('default', { month: 'short', year: 'numeric' })
  }
  return str
}

const chartData = ref<ChartData<'bar' | 'line', number[], string>>({
  labels: [],
  datasets: [],
})

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: '' },
    colors: {
      forceOverride: true,
    },
    borderColor: {
      foreceOverride: true,
    },
  },
  scales: {
    y: { beginAtZero: true },
  },
})

const updateChartWith = (newData: BarChartResponse) => {
  const keys = props.periodType === 'monthly' ? getLast12Months() : getLast7Years()
  const valueMap = Object.fromEntries(keys.map((k) => [k, 0]))

  newData.dataPoints.forEach(({ date, amount }) => {
    if (valueMap[date] !== undefined) {
      valueMap[date] = amount
    }
    chartData.value = {
      labels: keys.map(formatLabel),
      datasets: [
        {
          type: 'bar',
          label: 'Total Expense',
          data: Object.values(valueMap),
          borderWidth: 1.5,
          borderRadius: 4,
        } as ChartDataset<'bar', number[]>,
        {
          type: 'line',
          label: 'Average',
          data: Array(keys.length).fill(newData.averageExpense),
          borderColor: 'red',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0,
        } as ChartDataset<'line', number[]>,
      ],
    }

    chartOptions.value.plugins.title.text =
      props.periodType === 'monthly' ? 'Last 12 Months Expense' : 'Last 7 Years Expense'
  })
}

watch(
  () => [props.barChartData, props.periodType],
  () => {
    updateChartWith(props.barChartData)
  },
  { immediate: true, deep: true },
)
</script>
