<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="
          cn(
            'w-full justify-start text-left font-normal cursor-pointer',
            !value && 'text-muted-foreground',
          )
        "
      >
        <Calendar class="mr-2 h-4 w-4" />
        <template v-if="value.start">
          <template v-if="value.end">
            {{
              formatter.custom(toDate(value.start), {
                dateStyle: 'medium',
              })
            }}
            -
            {{
              formatter.custom(toDate(value.end), {
                dateStyle: 'medium',
              })
            }}
          </template>

          <template v-else>
            {{
              formatter.custom(toDate(value.start), {
                dateStyle: 'medium',
              })
            }}
          </template>
        </template>
        <template v-else> Pick a date </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <RangeCalendarRoot
        v-slot="{ weekDays }"
        v-model="value"
        v-model:placeholder="placeholder"
        class="p-3"
      >
        <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <Select v-model="selectedMonth">
                <SelectTrigger class="w-[48%]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="(m, i) in 12" :key="i" :value="(i + 1).toString()">
                    {{ formatter.custom(new Date(2000, i, 1), { month: 'long' }) }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select v-model="selectedYear">
                <SelectTrigger class="w-[48%]">
                  <SelectValue placeholder="Year" />
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
            </div>
            <RangeCalendarGrid>
              <RangeCalendarGridHead>
                <RangeCalendarGridRow>
                  <RangeCalendarHeadCell v-for="day in weekDays" :key="day" class="w-full">
                    {{ day }}
                  </RangeCalendarHeadCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridHead>
              <RangeCalendarGridBody>
                <RangeCalendarGridRow
                  v-for="(weekDates, index) in firstMonth.rows"
                  :key="`weekDate-${index}`"
                  class="mt-2 w-full"
                >
                  <RangeCalendarCell
                    v-for="weekDate in weekDates"
                    :key="weekDate.toString()"
                    :date="weekDate"
                  >
                    <RangeCalendarCellTrigger
                      :day="weekDate"
                      :month="firstMonth.value"
                      @click="handleFirstCalendarClick(weekDate)"
                    />
                  </RangeCalendarCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridBody>
            </RangeCalendarGrid>
          </div>

          <!-- ===========================================================
          second calendar here
          =========================================================== -->

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <Select v-model="selectedSecondMonth">
                <SelectTrigger class="w-[48%]">
                  <SelectValue secondMonthPlaceholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="(m, i) in 12" :key="i" :value="(i + 1).toString()">
                    {{ formatter.custom(new Date(2000, i, 1), { month: 'long' }) }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select v-model="selectedSecondYear">
                <SelectTrigger class="w-[48%]">
                  <SelectValue secondMonthPlaceholder="Year" />
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
            </div>
            <RangeCalendarGrid>
              <RangeCalendarGridHead>
                <RangeCalendarGridRow>
                  <RangeCalendarHeadCell v-for="day in weekDays" :key="day" class="w-full">
                    {{ day }}
                  </RangeCalendarHeadCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridHead>
              <RangeCalendarGridBody>
                <RangeCalendarGridRow
                  v-for="(weekDates, index) in secondMonth.rows"
                  :key="`weekDate-${index}`"
                  class="mt-2 w-full"
                >
                  <RangeCalendarCell
                    v-for="weekDate in weekDates"
                    :key="weekDate.toString()"
                    :date="weekDate"
                  >
                    <RangeCalendarCellTrigger
                      :day="weekDate"
                      :month="secondMonth.value"
                      @click="handleSecondCalendarClick(weekDate)"
                    />
                  </RangeCalendarCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridBody>
            </RangeCalendarGrid>
          </div>
        </div>
      </RangeCalendarRoot>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { type DateValue, isEqualMonth, today } from '@internationalized/date'

import { Calendar } from 'lucide-vue-next'
import { type DateRange, RangeCalendarRoot, useDateFormatter } from 'reka-ui'

import { createMonth, type Grid, toDate } from 'reka-ui/date'
import { type Ref, ref, watch, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
} from '@/components/ui/range-calendar'

const current = today('Asia/Phnom_Penh')
const value = ref({
  start: current.subtract({ days: 365 }),
  end: current,
}) as Ref<DateRange>

const locale = ref('en-US')
const formatter = useDateFormatter(locale.value)

const placeholder = ref(value.value.start) as Ref<DateValue>
const secondMonthPlaceholder = ref(value.value.end) as Ref<DateValue>

const firstMonth = ref(
  createMonth({
    dateObj: placeholder.value,
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>
const secondMonth = ref(
  createMonth({
    dateObj: secondMonthPlaceholder.value,
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>

const emit = defineEmits<{
  (e: 'selectedDate', value: { start: string; end: string }): void
}>()

watch(
  value,
  (newValue) => {
    const start = newValue?.start
    const end = newValue?.end

    const isStartValid = start?.year && start?.month && start?.day
    const isEndValid = end?.year && end?.month && end?.day

    if (isStartValid && isEndValid) {
      const formatted = {
        start: `${start?.year}-${start?.month}-${start?.day}`,
        end: `${end?.year}-${end?.month}-${end?.day}`,
      }

      emit('selectedDate', formatted)
    }
  },
  { deep: true },
)

watch(placeholder, (_placeholder) => {
  firstMonth.value = createMonth({
    dateObj: _placeholder,
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  })
})

watch(secondMonthPlaceholder, (_secondMonthPlaceholder) => {
  secondMonth.value = createMonth({
    dateObj: _secondMonthPlaceholder,
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  })
})

const selectedMonth = computed({
  get: () => placeholder.value.month.toString(),
  set: (val: string) => {
    const num = Number(val)
    if (!isNaN(num)) {
      placeholder.value = placeholder.value.set({ month: num })
    }
  },
})

const selectedYear = computed({
  get: () => placeholder.value.year.toString(),
  set: (val: string) => {
    const num = Number(val)
    if (!isNaN(num)) {
      placeholder.value = placeholder.value.set({ year: num })
    }
  },
})

const selectedSecondMonth = computed({
  get: () => secondMonthPlaceholder.value.month.toString(),
  set: (val: string) => {
    const num = Number(val)
    if (!isNaN(num)) {
      secondMonthPlaceholder.value = secondMonthPlaceholder.value.set({ month: num })
    }
  },
})

const selectedSecondYear = computed({
  get: () => secondMonthPlaceholder.value.year.toString(),
  set: (val: string) => {
    const num = Number(val)
    if (!isNaN(num)) {
      secondMonthPlaceholder.value = secondMonthPlaceholder.value.set({ year: num })
    }
  },
})

function handleFirstCalendarClick(day: DateValue) {
  value.value.start = day

  if (!value.value.end || day.compare(value.value.end) > 0) {
    value.value.end = day
  }

  // Update placeholder month if clicked day is from a different month
  if (!isEqualMonth(day, placeholder.value)) {
    placeholder.value = day
  }
}

function handleSecondCalendarClick(day: DateValue) {
  value.value.end = day

  if (!value.value.start || day.compare(value.value.start) < 0) {
    value.value.start = day
  }

  // Update placeholder month if clicked day is from a different month
  if (!isEqualMonth(day, secondMonthPlaceholder.value)) {
    secondMonthPlaceholder.value = day
  }
}
</script>
