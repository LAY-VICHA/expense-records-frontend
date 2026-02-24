<template>
  <div class="w-full">
    <div class="w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <SearchComponent
        @search="handleSearch"
        :key="resetSearchKey"
        :defaultValue="defaultSearch"
        placeholder="Search record by reason..."
      />
      <SelectComponent
        @select="handleSortBy"
        :key="resetSortByKey"
        :selectOptions="sortOptions"
        :defaultValue="defaultSortBy"
        placeholder="Select an options sort by"
      />
      <SelectComponent
        @select="handleFilterCategory"
        :key="resetFilterCategoryKey"
        :selectOptions="categoryOptions"
        :defaultValue="selectedCategory"
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
                (selectedCategory.valueOf() === '' || selectedCategory.valueOf() === category.id)
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

      <DatePicker
        :key="resetDatePickerKey"
        @selectedDate="onDateRangeSelected"
        :defaultStartDate="defaultFilterStartDate"
        :defaultEndDate="defaultFilterEndDate"
      />
    </div>
    <div class="w-full flex flex-wrap justify-end gap-2.5 pt-2">
      <ImportExpenseRecord />
      <CreateExpenseRecord />
      <Button
        variant="destructive"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
        @click="handleReset"
        aria-label="reset filter button"
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useRoute, useRouter } from 'vue-router'
import SearchComponent from '@/components/SearchComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import { keepPreviousData } from '@tanstack/vue-query'
import { ApiResponse, AllCategories } from '@/types/api-response'
import { computed, ref, watch } from 'vue'
import DatePicker from '@/components/DatePicker.vue'
import CreateExpenseRecord from './CreateExpenseRecord.vue'
import ImportExpenseRecord from './ImportExpenseRecord.vue'
import { apiFetch } from '@/lib/api'
import { useNoRetryQuery } from '@/lib/noRetryQuery'

const route = useRoute()
const router = useRouter()
const selectedSubCategory = ref<string>((route.query.filterSubCategory as string) || '')
const selectedCategory = ref<string>((route.query.filterCategory as string) || '')
let defaultSortBy = route.query.sortBy ? String(route.query.sortBy) : ''
let defaultSearch = route.query.reason ? String(route.query.reason) : ''
const resetSearchKey = ref(0)
const resetSortByKey = ref(0)
const resetFilterCategoryKey = ref(0)
const resetDatePickerKey = ref(0)

const normalizeDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

let defaultFilterStartDate = route.query.filterStartDate
  ? normalizeDate(String(route.query.filterStartDate))
  : undefined

let defaultFilterEndDate = route.query.filterEndDate
  ? normalizeDate(String(route.query.filterEndDate))
  : undefined

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Highest Amount', value: 'highest' },
  { label: 'Lowest Amount', value: 'lowest' },
]

const handleSearch = (searchQuery: string) => {
  router.replace({
    query: {
      ...route.query,
      page: 1,
      pageSize: 10,
      reason: searchQuery || '',
    },
  })
}

const handleSortBy = (sortOption: string) => {
  router.replace({
    query: {
      ...route.query,
      page: 1,
      pageSize: 10,
      sortBy: sortOption || '',
    },
  })
}

const handleFilterCategory = async (category: string) => {
  selectedCategory.value = category
  await router.replace({
    query: {
      ...route.query,
      page: 1,
      pageSize: 10,
      filterCategory: category || '',
      filterSubCategory: '',
    },
  })
  selectedSubCategory.value = ''
}

watch(selectedSubCategory, (newValue) => {
  handleFilterSubCategory(newValue)
})

const handleFilterSubCategory = (subCategory: string) => {
  router.replace({
    query: {
      ...route.query,
      page: 1,
      pageSize: 10,
      filterSubCategory: subCategory || '',
    },
  })
}

const onDateRangeSelected = (date: { start: string; end: string }) => {
  router.replace({
    query: {
      ...route.query,
      page: 1,
      pageSize: 10,
      filterStartDate: date.start || '',
      filterEndDate: date.end || '',
    },
  })
}

const handleReset = async () => {
  await router.replace({ query: {} })
  resetSearchKey.value++
  resetSortByKey.value++
  resetFilterCategoryKey.value++
  resetDatePickerKey.value++
  selectedSubCategory.value = ''
  selectedCategory.value = ''
  defaultSearch = ''
  defaultSortBy = ''
  defaultFilterStartDate = undefined
  defaultFilterEndDate = undefined
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
    throw new Error(response.error.message || 'Failed to fetch categories')
  }

  return response.value
}
</script>
