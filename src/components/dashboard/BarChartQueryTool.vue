<template>
  <div class="w-full pb-4">
    <div class="w-full grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      <SelectComponent
        @select="handleSelectedCategory"
        :key="resetCategoryKey"
        :selectOptions="categoryOptions"
        placeholder="Select a category"
      />

      <Select v-model="selectedSubCategory">
        <SelectTrigger class="w-full cursor-pointer" aria-label="Select button">
          <SelectValue placeholder="Select a subcategory" />
        </SelectTrigger>
        <SelectContent v-if="data?.data">
          <SelectGroup v-for="category in data?.data" :key="category.id">
            <div
              v-if="
                category.subCategories.length > 0 &&
                (selectedCategoryValue.valueOf() === '' ||
                  selectedCategoryValue.valueOf() === category.id)
              "
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

      <div class="flex">
        <div class="flex-1">
          <input
            type="radio"
            id="monthly"
            value="monthly"
            v-model="periodType"
            class="peer hidden"
          />
          <label
            for="monthly"
            dir="ltr"
            class="flex text-sm justify-center items-center size-full peer-checked:bg-secondary peer-checked:text-white bg-muted text-muted-foreground px-4 py-1.5 rounded-s-md cursor-pointer transition"
          >
            Monthly
          </label>
        </div>

        <div class="flex-1">
          <input type="radio" id="yearly" value="yearly" v-model="periodType" class="peer hidden" />
          <label
            for="yearly"
            dir="rtl"
            class="flex text-sm justify-center items-center size-full peer-checked:bg-secondary peer-checked:text-white bg-muted text-muted-foreground px-4 py-1.5 rounded-s-md cursor-pointer transition"
          >
            Yearly
          </label>
        </div>
      </div>

      <div class="flex items-center justify-center space-x-2">
        <Switch id="include-high-expense" v-model="isIncludeHighExepense" class="cursor-pointer" />
        <Label for="include-high-expense" class="text-sm cursor-pointer">High Expense</Label>
      </div>
    </div>

    <div class="w-full flex justify-end pt-4">
      <Button
        variant="destructive"
        class="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
        @click="handleReset"
      >
        Reset Filters
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import SelectComponent from '@/components/SelectComponent.vue'
import { AllCategories, ApiResponse } from '@/types/api-response'
import { keepPreviousData } from '@tanstack/vue-query'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/lib/api'
import { useNoRetryQuery } from '@/lib/noRetryQuery'

const route = useRoute()
const router = useRouter()
const selectedCategoryValue = ref<string>('')
const selectedSubCategory = ref<string>('')
const periodType = ref<string>(route.query.periodType === 'yearly' ? 'yearly' : 'monthly')
const isIncludeHighExepense = ref<boolean>(false)
const resetCategoryKey = ref(0)

const handleSelectedCategory = (category: string) => {
  selectedCategoryValue.value = category
  router.replace({
    query: {
      ...route.query,
      selectedCategory: category || '',
      selectedSubCategory: '',
    },
  })
}

watch(selectedSubCategory, (newValue) => {
  handleSelectedSubCategory(newValue)
})

const handleSelectedSubCategory = (subCategory: string) => {
  router.replace({
    query: {
      ...route.query,
      selectedSubCategory: subCategory || '',
    },
  })
}

watch(isIncludeHighExepense, (newValue) => {
  handleIncludeHighExpense(newValue)
})

const handleIncludeHighExpense = (isIncludeHighExepense: boolean) => {
  router.replace({
    query: {
      ...route.query,
      isIncludeHighExpenseRecord: String(isIncludeHighExepense),
    },
  })
}

watch(periodType, (newValue) => {
  handleSelectedPeriodType(newValue)
})

const handleSelectedPeriodType = (periodType: string) => {
  router.replace({
    query: {
      ...route.query,
      periodType: periodType || '',
    },
  })
}

const { data } = useNoRetryQuery<ApiResponse<AllCategories>>({
  queryFn: async () => await fetchCategory(),
  queryKey: ['all-categories'],
  placeholderData: keepPreviousData,
})

const categoryOptions = computed(() =>
  data.value?.data
    ? data.value.data.map((category) => ({
        label: category.name,
        value: category.id,
      }))
    : [],
)

const fetchCategory = async (): Promise<ApiResponse<AllCategories>> => {
  const response = await apiFetch<ApiResponse<AllCategories>>(`/category/all`)

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response.value
}

const handleReset = () => {
  resetCategoryKey.value++
  selectedCategoryValue.value = ''
  selectedSubCategory.value = ''
  periodType.value = 'monthly'
  isIncludeHighExepense.value = false
  router.replace({
    query: {
      ...route.query,
      selectedCategory: '',
      selectedSubCategory: '',
      periodType: 'monthly',
      isIncludeHighExpenseRecord: 'false',
    },
  })
}
</script>
