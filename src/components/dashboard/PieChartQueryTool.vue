<template>
  <div class="w-full pb-6">
    <div class="w-full grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      <Select v-model="selectedYear">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select a year" />
        </SelectTrigger>
        <SelectContent class="max-h-[300px]">
          <SelectItem
            v-for="y in new Date().getFullYear() - 2000 + 1"
            :key="y"
            :value="(2000 + y - 1).toString()"
          >
            {{ 2000 + y - 1 }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select :disabled="!selectedYear" v-model="selectedMonth">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select a month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="(m, i) in monthOptions" :key="i" :value="(i + 1).toString()">
            {{ formatter.custom(new Date(2000, i, 1), { month: 'long' }) }}
          </SelectItem>
        </SelectContent>
      </Select>

      <div class="flex">
        <div class="flex-1">
          <input
            type="radio"
            id="category"
            value="category"
            v-model="groupBy"
            class="peer hidden"
          />
          <label
            for="category"
            dir="ltr"
            class="flex text-sm justify-center items-center size-full peer-checked:bg-secondary peer-checked:text-white bg-muted text-muted-foreground px-4 py-1.5 rounded-s-md cursor-pointer transition"
          >
            Cat
          </label>
        </div>

        <div class="flex-1">
          <input
            type="radio"
            id="subCategory"
            value="subCategory"
            v-model="groupBy"
            class="peer hidden"
          />
          <label
            for="subCategory"
            dir="rtl"
            class="flex text-sm justify-center items-center size-full peer-checked:bg-secondary peer-checked:text-white bg-muted text-muted-foreground px-4 py-1.5 rounded-s-md cursor-pointer transition"
          >
            Sub
          </label>
        </div>
      </div>

      <div>
        <div class="size-full flex items-center justify-center space-x-2">
          <Switch id="include-high-expense" v-model="isIncludeHighExepense" class="" />
          <Label for="include-high-expense" class="text-sm">High Expense</Label>
        </div>
      </div>
    </div>

    <div class="w-full flex justify-end gap-2.5 pt-4">
      <Button variant="outline" class="" @click="handleClearMonth"> Clear Month </Button>
      <Button
        variant="destructive"
        class="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        @click="handleReset"
      >
        Reset Filters
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useDateFormatter } from 'reka-ui'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const locale = ref('en-US')
const formatter = useDateFormatter(locale.value)

const route = useRoute()
const router = useRouter()
const selectedYear = ref<string>(new Date().getFullYear().toString())
const selectedMonth = ref<string>(String(route.query.month))
const groupBy = ref<string>(route.query.groupBy === 'subCategory' ? 'subCategory' : 'category')
const isIncludeHighExepense = ref<boolean>(false)

watch(selectedYear, (newValue) => {
  handleYear(newValue)
})

const handleYear = (year: string) => {
  console.log('Selected year:', year)
  router.replace({
    query: {
      ...route.query,
      year: year || '',
    },
  })
}

watch(selectedMonth, (newValue) => {
  handleMonth(newValue)
})

const handleMonth = (month: string) => {
  console.log('Selected month:', month)
  router.replace({
    query: {
      ...route.query,
      month: month || '',
    },
  })
}

watch(groupBy, (newValue) => {
  handleGroupBy(newValue)
})

const handleGroupBy = (groupBy: string) => {
  console.log('Selected groupBy:', groupBy)
  router.replace({
    query: {
      ...route.query,
      groupBy: groupBy || '',
    },
  })
}

watch(isIncludeHighExepense, (newValue) => {
  handleIsIncludeHighExepense(newValue)
})

const handleIsIncludeHighExepense = (handleIsIncludeHighExepense: boolean) => {
  console.log('is Include High Expense Record:', handleIsIncludeHighExepense)
  router.replace({
    query: {
      ...route.query,
      isIncludeHighExpenseRecordPieChart: String(handleIsIncludeHighExepense),
    },
  })
}

const monthOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const count = Number(selectedYear.value) === currentYear ? currentMonth : 12
  return Array.from({ length: count }, (_, i) => i + 1)
})

const handleClearMonth = () => {
  selectedMonth.value = ''
}

const handleReset = () => {
  selectedYear.value = new Date().getFullYear().toString()
  selectedMonth.value = (new Date().getMonth() + 1).toString()
  groupBy.value = 'category'
  isIncludeHighExepense.value = false
}
</script>
