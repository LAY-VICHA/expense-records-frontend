<template>
  <div class="w-full">
    <div class="w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <SearchComponent
        @search="handleSearch"
        :key="resetSearchKey"
        placeholder="Search record by reason..."
      />
      <SelectComponent
        @select="handleSortBy"
        :key="resetSortByKey"
        :selectOptions="sortOptions"
        placeholder="Select an options sort by"
      />
      <SelectComponent
        @select="handleFilterCategory"
        :key="resetFilterCategoryKey"
        :selectOptions="categoryOptions"
        placeholder="Select a category"
      />

      <Select v-model="selectedSubCategory">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select a subcategory" />
        </SelectTrigger>
        <SelectContent v-if="data?.data">
          <SelectGroup v-for="category in data?.data" :key="category.id">
            <div
              v-if="
                category.subCategories.length > 0 &&
                (selectedCategory.valueOf() === '' || selectedCategory.valueOf() === category.name)
              "
            >
              <SelectLabel>{{ category.name }}</SelectLabel>
              <SelectItem
                v-for="subCategory in category.subCategories"
                :key="subCategory.id"
                :value="subCategory.name"
              >
                {{ subCategory.name }}
              </SelectItem>
            </div>
          </SelectGroup>
        </SelectContent>
      </Select>

      <DatePicker :key="resetDatePickerKey" @selectedDate="onDateRangeSelected" />
    </div>
    <div class="w-full flex flex-wrap justify-end gap-2.5 pt-2">
      <ImportExpenseRecord />
      <CreateExpenseRecord />
      <Button
        variant="destructive"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { ApiResponse, AllCategories } from '@/types/api-response'
import { computed, ref, watch } from 'vue'
import DatePicker from '@/components/DatePicker.vue'
import CreateExpenseRecord from './CreateExpenseRecord.vue'
import ImportExpenseRecord from './ImportExpenseRecord.vue'

const route = useRoute()
const router = useRouter()
const selectedSubCategory = ref('')
const selectedCategory = ref<string>('')
const resetSearchKey = ref(0)
const resetSortByKey = ref(0)
const resetFilterCategoryKey = ref(0)
const resetDatePickerKey = ref(0)

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Highest Amount', value: 'highest' },
  { label: 'Lowest Amount', value: 'lowest' },
]

const handleSearch = (searchQuery: string) => {
  console.log('Search query:', searchQuery)
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
  console.log('Sort option:', sortOption)
  router.replace({
    query: {
      ...route.query,
      page: 1,
      pageSize: 10,
      sortBy: sortOption || '',
    },
  })
}

const handleFilterCategory = (category: string) => {
  console.log('Filter category:', category)
  selectedCategory.value = category
  router.replace({
    query: {
      ...route.query,
      page: 1,
      pageSize: 10,
      filterCategory: category || '',
      filterSubCategory: '',
    },
  })
}

watch(selectedSubCategory, (newValue) => {
  handleFilterSubCategory(newValue)
})

const handleFilterSubCategory = (subCategory: string) => {
  console.log('Filter subcategory:', subCategory)
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
  console.log('selected date ', date.start, date.end)
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

const handleReset = () => {
  resetSearchKey.value++
  resetSortByKey.value++
  resetFilterCategoryKey.value++
  resetDatePickerKey.value++
  selectedSubCategory.value = ''
  router.replace({ query: {} })
}

const { data } = useQuery<ApiResponse<AllCategories>>({
  queryFn: async () => await fetchCategory(),
  queryKey: ['all-categories'],
  placeholderData: keepPreviousData,
})

const categoryOptions = computed(() =>
  data.value?.data
    ? data.value.data.map((category) => ({
        label: category.name,
        value: category.name,
      }))
    : [],
)

const fetchCategory = async (): Promise<ApiResponse<AllCategories>> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/category/all`)

  if (!response.ok) throw new Error('Cannot get data')

  const data = await response.json()
  return data
}
</script>
