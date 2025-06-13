<template>
  <div class="p-8">
    <div class="text-3xl font-bold">Category</div>

    <div class="py-4 flex justify-between items-center gap-4">
      <SearchComponent @search="handleSearch" placeholder="Search categories" class="max-w-sm" />
      <CreateCategory />
    </div>

    <div v-if="isLoading" class="w-full flex justify-center pt-4"><Loading /></div>
    <Table v-if="!isLoading">
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]"> No. </TableHead>
          <TableHead>Name</TableHead>
          <TableHead class="w-50 md:w-75 2xl:w-120">Description</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead class="text-right"> Action </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody v-if="categories?.items">
        <TableRow v-for="(item, index) in categories.items" :key="index">
          <TableCell class="font-medium">
            {{ (categories.currentPage - 1) * categories.pageSize + index + 1 }}
          </TableCell>
          <TableCell>{{ item.name }}</TableCell>
          <TableCell
            class="truncate max-w-50 md:max-w-75 2xl:max-w-120 whitespace-nowrap overflow-hidden"
            >{{ item.description }}</TableCell
          >
          <TableCell class="">
            {{ convertDate(item.createdAt) }}
          </TableCell>
          <TableCell class="text-right flex justify-end gap-2.5 items-center">
            <SquarePen
              @click="openEditCategory(item)"
              class="size-4 cursor-pointer hover:text-secondary"
            />
            <Trash2
              @click="openDeleteCategory(item.id)"
              class="size-4 cursor-pointer hover:text-destructive"
            />
          </TableCell>
        </TableRow>
      </TableBody>
      <TableBody v-if="!categories?.items || categories.items.length === 0">
        <TableRow>
          <TableCell colspan="4" class="text-center">No categories found</TableCell>
        </TableRow>
      </TableBody>
      <TableCaption v-if="categories?.items">
        <PaginationComponent :page-size="categories.pageSize" :total="categories.totalItems" />
      </TableCaption>
    </Table>

    <EditCategory v-model="isEditDialogOpen" :category="selectedCategory" />
    <DeleteCategory v-model="isDeleteDialogOpen" :categoryId="selectedId" />
  </div>
</template>

<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SquarePen, Trash2 } from 'lucide-vue-next'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { ApiResponse, Category, PaginatedResult } from '@/types/api-response'
import SearchComponent from '@/components/SearchComponent.vue'
import { computed, ref } from 'vue'
import Loading from '@/components/Loading.vue'
import CreateCategory from '@/components/category/CreateCategory.vue'
import EditCategory from '@/components/category/EditCategory.vue'
import DeleteCategory from '@/components/category/DeleteCategory.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'

const route = useRoute()
const router = useRouter()
const page = computed(() => route.query.page ?? '1')
const pageSize = computed(() => route.query.pageSize ?? '10')
const name = computed(() => route.query.name ?? '')
const isEditDialogOpen = ref(false)
const selectedCategory = ref<CategoryFormValues>({
  id: '',
  name: '',
  description: '',
})
const isDeleteDialogOpen = ref(false)
const selectedId = ref<string>('')

interface CategoryFormValues {
  id: string
  name: string
  description: string
}

const { data, isLoading } = useQuery<ApiResponse<PaginatedResult<Category>>>({
  queryFn: async () => await fetchCategory(),
  queryKey: computed(() => [
    'categories',
    {
      page: page.value,
      pageSize: pageSize.value,
      ...(name.value ? { name } : {}),
    },
  ]),
  placeholderData: keepPreviousData,
})

const fetchCategory = async (): Promise<ApiResponse<PaginatedResult<Category>>> => {
  const query = new URLSearchParams()
  if (name.value) query.set('name', String(name.value))
  query.set('page', String(page.value))
  query.set('pageSize', String(pageSize.value))
  console.log(query)

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/category?${query}`)

  if (!response.ok) throw new Error('Cannot get data')

  const data = await response.json()
  return data
}

const categories = computed(() => data.value?.data)

const convertDate = (date: Date): string => {
  const dateString = new Date(date).toISOString()
  return dateString.split('T')[0]
}

const handleSearch = (searchQuery: string) => {
  console.log('Search query:', searchQuery)
  router.replace({
    query: {
      name: searchQuery || '',
    },
  })
}

function openEditCategory(item: CategoryFormValues) {
  selectedCategory.value = item
  isEditDialogOpen.value = true
}

function openDeleteCategory(id: string) {
  console.log(id)
  selectedId.value = id
  isDeleteDialogOpen.value = true
}
</script>
