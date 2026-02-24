<template>
  <div class="w-full pb-4">
    <div class="w-full grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      <SelectComponent
        @select="handleSelectedCategory"
        :key="resetCategoryKey"
        :selectOptions="categoryOptions"
        :defaultValue="selectedCategoryValue"
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

      <Select v-model="selectedYear">
        <SelectTrigger class="w-full cursor-pointer" aria-label="Select button">
          <SelectValue placeholder="Select a year" />
        </SelectTrigger>
        <SelectContent class="max-h-[300px]">
          <SelectItem
            v-for="y in new Date().getFullYear() - 2000 + 1"
            :key="y"
            :value="(2000 + y - 1).toString()"
            class="cursor-pointer"
          >
            {{ 2000 + y - 1 }}
          </SelectItem>
        </SelectContent>
      </Select>

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
const selectedCategoryValue = ref<string>((route.query.selectedCategory as string) || '')
const selectedSubCategory = ref<string>((route.query.selectedSubCategory as string) || '')
const selectedYear = ref<string>(
  (route.query.yearBarChart as string) || new Date().getFullYear().toString(),
)
const isIncludeHighExepense = ref<boolean>(route.query.isIncludeHighExpenseRecord === 'true')
const resetCategoryKey = ref(0)

const handleSelectedCategory = async (category: string) => {
  selectedCategoryValue.value = category
  await router.replace({
    query: {
      ...route.query,
      selectedCategory: category || '',
      selectedSubCategory: '',
    },
  })
  selectedSubCategory.value = ''
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

watch(selectedYear, (newValue) => {
  handleYear(newValue)
})

const handleYear = (yearBarChart: string) => {
  router.replace({
    query: {
      ...route.query,
      yearBarChart: yearBarChart || '',
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

const handleReset = async () => {
  selectedCategoryValue.value = ''
  resetCategoryKey.value++
  selectedYear.value = new Date().getFullYear().toString()
  isIncludeHighExepense.value = false
  await router.replace({
    query: {
      ...route.query,
      selectedCategory: '',
      selectedSubCategory: '',
      yearBarChart: new Date().getFullYear().toString(),
      isIncludeHighExpenseRecord: 'false',
    },
  })
  selectedSubCategory.value = ''
}
</script>
