<template>
  <Form
    v-slot="{ handleSubmit }"
    as=""
    :validation-schema="formSchema"
    :initial-values="{ expenseDate: expenseDateValue, currency: 'USD' }"
  >
    <Dialog v-model:open="isDialogOpen">
      <DialogTrigger as-child>
        <Button class="cursor-pointer" aria-label="Create expense record button"> Create </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Expense Record</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <form id="dialogForm" @submit.prevent="handleSubmit($event, onSubmit)" class="grid gap-4">
            <FormField v-slot="{ componentField }" name="expenseDate">
              <FormItem class="flex flex-col">
                <FormLabel>Expense Date</FormLabel>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      :class="
                        cn(
                          'w-full justify-start text-left font-normal cursor-pointer',
                          !expenseDateValue && 'text-muted-foreground',
                        )
                      "
                    >
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{
                        expenseDateValue
                          ? df.format(expenseDateValue.toDate(getLocalTimeZone()))
                          : 'Pick a date'
                      }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar
                      v-bind="componentField"
                      v-model="expenseDateValue"
                      initial-focus
                      :min-value="new CalendarDate(1900, 1, 1)"
                      :max-value="today(getLocalTimeZone())"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="categoryId">
              <FormItem>
                <FormLabel>Category</FormLabel>

                <Select
                  v-bind="componentField"
                  @update:modelValue="selectedCategory = String($event)"
                  class="w-[300px]"
                >
                  <FormControl class="w-full cursor-pointer">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent v-if="allCategories" class="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      <SelectItem
                        v-for="category in allCategories"
                        :key="category.id"
                        :value="category.id"
                        class="cursor-pointer"
                      >
                        {{ category.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="subCategoryId">
              <FormItem>
                <FormLabel>Sub Category</FormLabel>

                <Select :disabled="isSubCategoryDisabled" v-bind="componentField" class="w-[300px]">
                  <FormControl class="w-full cursor-pointer">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sub category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent v-if="allCategories" class="max-h-[250px] overflow-y-auto">
                    <SelectGroup v-for="category in allCategories" :key="category.id">
                      <div
                        v-if="category.subCategories.length > 0 && selectedCategory === category.id"
                      >
                        <SelectLabel>{{ category.name }}</SelectLabel>
                        <SelectItem
                          v-for="subCategory in category.subCategories"
                          :key="subCategory.id"
                          :value="subCategory.id"
                          class="cursor-pointer"
                        >
                          {{ subCategory.name }}
                        </SelectItem>
                      </div>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
            <div class="flex gap-4">
              <FormField v-slot="{ componentField }" name="amount">
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Enter amount of expense"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="currency">
                <FormItem class="">
                  <FormLabel>Currency</FormLabel>

                  <FormControl>
                    <div class="flex">
                      <div class="flex-1">
                        <input
                          type="radio"
                          id="usd"
                          value="USD"
                          v-bind="componentField"
                          class="peer hidden"
                          checked
                        />
                        <label
                          for="usd"
                          dir="ltr"
                          class="block text-sm text-center w-full peer-checked:bg-secondary peer-checked:text-white bg-muted text-muted-foreground px-4 py-1.5 rounded-s-md cursor-pointer transition"
                        >
                          USD
                        </label>
                      </div>

                      <div class="flex-1">
                        <input
                          type="radio"
                          id="khr"
                          value="KHR"
                          v-bind="componentField"
                          class="peer hidden"
                        />
                        <label
                          for="khr"
                          dir="rtl"
                          class="block text-sm text-center w-full peer-checked:bg-secondary peer-checked:text-white bg-muted text-muted-foreground px-4 py-1.5 rounded-s-md cursor-pointer transition"
                        >
                          KHR
                        </label>
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
            <FormField v-slot="{ componentField }" name="reason">
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Textarea
                    type="text"
                    placeholder="Enter expense reason"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </form>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            form="dialogForm"
            :disabled="mutation.isPending.value"
            class="cursor-pointer"
            aria-label="Submit button"
          >
            <Loading v-if="mutation.isPending.value" />
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { CalendarIcon } from 'lucide-vue-next'
import { keepPreviousData, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import Loading from '../Loading.vue'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { ApiResponse, AllCategories } from '@/types/api-response'
import {
  CalendarDate,
  DateFormatter,
  DateValue,
  getLocalTimeZone,
  today,
} from '@internationalized/date'
import { apiFetch } from '@/lib/api'
import { useNoRetryQuery } from '@/lib/noRetryQuery'

interface ExpenseRecordFormValues {
  expenseDate: string
  categoryId: string
  subCategoryId?: string
  amount: number
  currency: 'USD' | 'KHR'
  reason?: string
}

const isDialogOpen = ref(false)
const queryClient = useQueryClient()

const formSchema = toTypedSchema(
  z.object({
    expenseDate: z.object({
      day: z.number(),
      era: z.string(),
      month: z.number(),
      year: z.number(),
    }),
    categoryId: z.string().min(1, 'Category is required'),
    subCategoryId: z.string().optional(),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    currency: z.string().refine((v) => ['USD', 'KHR'].includes(v), {
      message: 'Currency must be either USD or KHR.',
    }),
    reason: z.string().max(200).optional(),
  }),
)

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})
const expenseDateValue = ref<DateValue>(today(getLocalTimeZone()))

const fetchAllCategory = async (): Promise<ApiResponse<AllCategories>> => {
  const response = await apiFetch<ApiResponse<AllCategories>>(`/category/all`)

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response.value
}

const { data } = useNoRetryQuery<ApiResponse<AllCategories>>({
  queryFn: async () => await fetchAllCategory(),
  queryKey: ['all-categories'],
  placeholderData: keepPreviousData,
})

const allCategories = computed(() => data.value?.data)

const selectedCategory = ref<string | null>('')
const isSubCategoryDisabled = computed(() => {
  if (!selectedCategory.value) return true

  const selected = data?.value?.data?.find((category) => category.id === selectedCategory.value)

  return !selected || selected.subCategories.length === 0
})

const createExpenseRecord = async (data: ExpenseRecordFormValues) => {
  const response = await apiFetch(`/expense-record`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response.value
}

const mutation = useMutation({
  mutationFn: createExpenseRecord,
  onSuccess: () => {
    toast.success('Expense record created successfully')
    isDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['expense-records'] })
  },
  onError: (error) => {
    toast.error(error.message || 'Expense record created failed')
  },
})

const onSubmit = (values: ExpenseRecordFormValues) => {
  if (expenseDateValue.value) {
    const date = expenseDateValue.value.toDate(getLocalTimeZone())
    const formattedDate = date.toLocaleDateString('sv-SE')
    values.expenseDate = formattedDate
  }
  mutation.mutate({
    expenseDate: values.expenseDate,
    categoryId: values.categoryId,
    subCategoryId: values.subCategoryId,
    amount: values.amount,
    currency: values.currency,
    reason: values.reason,
  })
}
</script>
