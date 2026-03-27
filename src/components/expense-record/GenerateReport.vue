<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button class="cursor-pointer" aria-label="Create expense record button">
        Generate Report
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Generate Report</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <form id="dialogForm" @submit.prevent="onSubmit" class="grid gap-4">
          <FormField v-slot="{ componentField }" name="type">
            <FormItem>
              <FormLabel>Report Type</FormLabel>
              <Select
                v-bind="componentField"
                @update:modelValue="selectedType = String($event)"
                class="w-[300px]"
              >
                <FormControl class="w-full cursor-pointer">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent v-if="reportTypes" class="max-h-[200px] overflow-y-auto">
                  <SelectGroup>
                    <SelectItem
                      v-for="reportType in reportTypes"
                      :key="reportType.value"
                      :value="reportType.value"
                      class="cursor-pointer"
                    >
                      {{ reportType.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="fileType">
            <FormItem>
              <FormLabel>File Type</FormLabel>
              <Select v-bind="componentField" class="w-[300px]">
                <FormControl class="w-full cursor-pointer">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a file type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent v-if="fileTypes" class="max-h-[200px] overflow-y-auto">
                  <SelectGroup>
                    <SelectItem
                      v-for="fileType in fileTypes"
                      :key="fileType.value"
                      :value="fileType.value"
                      class="cursor-pointer"
                    >
                      {{ fileType.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-if="selectedType === 'category'"
            v-slot="{ componentField }"
            name="categoryId"
          >
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

          <FormField
            v-if="selectedType === 'subcategory'"
            v-slot="{ componentField }"
            name="subCategoryId"
          >
            <FormItem>
              <FormLabel>Sub Category</FormLabel>

              <Select v-bind="componentField" class="w-[300px]">
                <FormControl class="w-full cursor-pointer">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent v-if="allCategories" class="max-h-[250px] overflow-y-auto">
                  <SelectGroup v-for="category in allCategories" :key="category.id">
                    <div v-if="category.subCategories.length > 0">
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
            <FormField v-slot="{ componentField }" name="year">
              <FormItem class="w-1/2">
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Select
                    v-bind="componentField"
                    @update:modelValue="selectedYear = Number($event)"
                  >
                    <SelectTrigger class="w-full cursor-pointer" aria-label="Select button">
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent class="max-h-[300px]">
                      <SelectItem
                        v-for="y in new Date().getFullYear() - 2000 + 1"
                        :key="y"
                        :value="2000 + y - 1"
                        class="cursor-pointer"
                      >
                        {{ 2000 + y - 1 }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-if="
                selectedType === 'monthly' ||
                selectedType === 'category' ||
                selectedType === 'subcategory'
              "
              v-slot="{ componentField }"
              name="month"
            >
              <FormItem class="w-1/2">
                <FormLabel>Month</FormLabel>
                <FormControl>
                  <Select v-bind="componentField">
                    <SelectTrigger class="w-full cursor-pointer" aria-label="Select button">
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                    <SelectContent class="max-h-[300px]">
                      <SelectItem
                        v-for="(m, i) in monthOptions"
                        :key="i"
                        :value="i + 1"
                        class="cursor-pointer"
                      >
                        {{ formatter.custom(new Date(2000, i, 1), { month: 'long' }) }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </form>
      </div>

      <DialogFooter>
        <Button
          :disabled="!fileBlob"
          variant="secondary"
          @click="downloadReport"
          class="cursor-pointer text-background"
        >
          Download
        </Button>
        <Button
          type="submit"
          form="dialogForm"
          :disabled="mutation.isPending.value"
          class="cursor-pointer"
          aria-label="Submit button"
        >
          <Loading v-if="mutation.isPending.value" />
          Generate
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { keepPreviousData, useMutation } from '@tanstack/vue-query'
import * as z from 'zod'
import Loading from '../Loading.vue'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { ApiResponse, AllCategories } from '@/types/api-response'
import { apiFetch } from '@/lib/api'
import { useNoRetryQuery } from '@/lib/noRetryQuery'
import { useDateFormatter } from 'reka-ui'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

type GenerateReportFormValues =
  | {
      year: number
      type: 'monthly'
      month: number
      fileType: 'excel' | 'csv'
    }
  | {
      year: number
      type: 'yearly'
      fileType: 'excel' | 'csv'
    }
  | {
      year: number
      type: 'category'
      categoryId: string
      fileType: 'excel' | 'csv'
      month?: number | undefined
    }
  | {
      year: number
      type: 'subcategory'
      subCategoryId: string
      fileType: 'excel' | 'csv'
      month?: number | undefined
    }

const isDialogOpen = ref(false)
const locale = ref('en-US')
const formatter = useDateFormatter(locale.value)
const selectedYear = ref<number>(new Date().getFullYear())
const selectedType = ref<string | null>('')
const fileBlob = ref<Blob | null>(null)
const fileName = ref<string>('expense-report.xlsx')

const reportTypes = [
  { label: 'Monthly Report', value: 'monthly' },
  { label: 'Yearly Report', value: 'yearly' },
  { label: 'Report by Category', value: 'category' },
  { label: 'Report by Subcategory', value: 'subcategory' },
]

const fileTypes = [{ label: 'Excel', value: 'excel' }]

const allCategories = computed(() => data.value?.data)
const selectedCategory = ref<string | null>('')

const monthOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const count = Number(selectedYear.value) === currentYear ? currentMonth : 12
  return Array.from({ length: count }, (_, i) => i + 1)
})

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

async function generateReport(data: GenerateReportFormValues) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  const response = await fetch(`${BASE_URL}/expense-record/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(response.statusText || 'Failed to generate report')
  }

  const disposition = response.headers.get('Content-Disposition')

  if (disposition && disposition.includes('filename=')) {
    fileName.value = disposition.split('filename=')[1].replace(/"/g, '')
  }

  fileBlob.value = await response.blob()
}

const downloadReport = () => {
  if (!fileBlob.value) return

  const url = window.URL.createObjectURL(fileBlob.value)

  const a = document.createElement('a')
  a.href = url

  a.download = fileName.value
  a.click()

  window.URL.revokeObjectURL(url)
  fileBlob.value = null
}

const mutation = useMutation({
  mutationFn: generateReport,
  onSuccess: () => {
    toast.success('Report generated successfully')
    // isDialogOpen.value = false
  },
  onError: (error) => {
    toast.error(error.message || 'Failed to generate report')
  },
})

const formSchema = toTypedSchema(
  z.discriminatedUnion('type', [
    // Monthly
    z.object({
      type: z.literal('monthly'),
      fileType: z.enum(['excel', 'csv']),
      year: z.coerce.number().min(2000, 'Year is required'),
      month: z.coerce.number().min(1).max(12, 'Month is required'),
    }),

    // Yearly
    z.object({
      type: z.literal('yearly'),
      fileType: z.enum(['excel', 'csv']),
      year: z.coerce.number().min(2000, 'Year is required'),
    }),

    // Category
    z.object({
      type: z.literal('category'),
      fileType: z.enum(['excel', 'csv']),
      year: z.coerce.number().min(2000),
      month: z.coerce.number().min(1).max(12).optional(),
      categoryId: z.string().min(1, 'Category is required'),
    }),

    // Subcategory
    z.object({
      type: z.literal('subcategory'),
      fileType: z.enum(['excel', 'csv']),
      year: z.coerce.number().min(2000),
      month: z.coerce.number().min(1).max(12).optional(),
      subCategoryId: z.string().min(1, 'Subcategory is required'),
    }),
  ]),
)

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit((values: GenerateReportFormValues) => {
  switch (values.type) {
    case 'monthly':
      mutation.mutate({
        type: 'monthly',
        fileType: values.fileType,
        year: Number(values.year),
        month: Number(values.month),
      })
      break

    case 'yearly':
      mutation.mutate({
        type: 'yearly',
        fileType: values.fileType,
        year: Number(values.year),
      })
      break

    case 'category':
      mutation.mutate({
        type: 'category',
        fileType: values.fileType,
        year: Number(values.year),
        categoryId: values.categoryId,
        month: values.month ? Number(values.month) : undefined,
      })
      break

    case 'subcategory':
      mutation.mutate({
        type: 'subcategory',
        fileType: values.fileType,
        year: Number(values.year),
        subCategoryId: values.subCategoryId,
        month: values.month ? Number(values.month) : undefined,
      })
      break
  }
})
</script>
