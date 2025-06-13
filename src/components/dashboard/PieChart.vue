<template>
  <div class="h-full border border-solid border-gray-200 rounded-xl">
    <div class="grid grid-cols-3 p-5 pb-0 border-b border-solid border-b-gray-200">
      <div class="col-span-2 flex flex-col gap-1 px-6 py-5 sm:py-6">
        <p class="text-lg font-bold">
          Pie Chart -
          <span v-if="props.groupBy === 'category'">Category</span>
          <span v-else>Sub Category</span> Summary
        </p>
        <p class="text-sm text-gray-600">
          showing each
          <span v-if="props.groupBy === 'category'">category</span>
          <span v-else>sub category</span> in percentage
        </p>
      </div>
      <div class="px-6 py-5 border-l border-solid border-l-gray-200">
        <p class="text-start text-gray-600 text-sm">Total Expense</p>
        <p class="font-bold text-3xl">
          {{ props.pieChartData.totalExpense }}
          <span class="font-normal text-xs text-gray-600">USD</span>
        </p>
      </div>
    </div>
    <div class="p-5 w-full flex flex-col justify-center items-center">
      <PieChartQueryTool />
      <p v-if="props.pieChartData.pieChartData.length === 0" class="text-center py-5">No Data</p>
      <Chart
        v-else
        :data="chartData"
        :options="chartOptions"
        type="pie"
        class="max-w-[350px] max-h-[350px]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PieChartQueryTool from '@/components/dashboard/PieChartQueryTool.vue'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, Colors, ChartData } from 'chart.js'
import { Chart } from 'vue-chartjs'
import { ref, watch } from 'vue'
import { PieChartResponse } from '@/types/api-response'
import type { LocationQueryValue } from 'vue-router'

ChartJS.register(Title, Tooltip, Legend, Colors, ArcElement)

const props = defineProps<{
  pieChartData: PieChartResponse
  groupBy?: string | LocationQueryValue[]
  month: string | LocationQueryValue[]
}>()

const chartData = ref<ChartData<'pie', number[], string>>({ labels: [], datasets: [] })

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: {
      display: true,
      text: props.month ? 'Monthly Expense' : 'Yearly Expense',
    },
    colors: {
      forceOverride: true,
    },
    tooltip: {
      callbacks: {
        label: function (context: import('chart.js').TooltipItem<'pie'>) {
          const index = context.dataIndex
          const data = props.pieChartData.pieChartData[index]
          return `${data.label}: ${data.amount} USD (${data.percentage}%) - ${data.count} transaction${data.count > 1 ? 's' : ''}`
        },
      },
    },
  },
})

watch(
  () => props.pieChartData,
  (newData) => {
    const labels = newData.pieChartData.map((item) => item.label)
    const values = newData.pieChartData.map((item) => item.amount)

    chartData.value = {
      labels,
      datasets: [
        {
          label: 'Distribution',
          data: values,
          borderColor: '#ffffff',
          borderWidth: 1,
        },
      ],
    }

    chartOptions.value.plugins.title.text = props.month ? 'Monthly Expense' : 'Yearly Expense'
  },
  { immediate: true, deep: true },
)
</script>
