<template>
  <div class="p-8">
    <div class="text-3xl font-bold">Sub Category</div>

    <div class="py-4 flex justify-between items-center gap-4">
      <SearchComponent @search="handleSearch" placeholder="Search subcategories" />
      <CreateSubCategory />
    </div>

    <div v-if="isLoading" class="w-full flex justify-center pt-4"><Loading /></div>
    <Table v-if="!isLoading">
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]"> No. </TableHead>
          <TableHead>Name</TableHead>
          <TableHead class="w-50 md:w-75 2xl:w-120">Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead class="text-right"> Action </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody v-if="data?.data?.items">
        <TableRow v-for="(item, index) in data.data.items" :key="index">
          <TableCell class="font-medium">
            {{ (data.data.currentPage - 1) * data.data.pageSize + index + 1 }}
          </TableCell>
          <TableCell>{{ item.name }}</TableCell>
          <TableCell
            class="truncate max-w-50 md:max-w-75 2xl:max-w-120 whitespace-nowrap overflow-hidden"
            >{{ item.description }}</TableCell
          >
          <TableCell>{{ item.category.name }}</TableCell>
          <TableCell>
            {{ convertDate(item.createdAt) }}
          </TableCell>
          <TableCell class="text-right flex justify-end gap-2.5 items-center">
            <SquarePen
              @click="openEditSubCategory(item)"
              class="size-4 cursor-pointer hover:text-secondary"
            />
            <Trash2
              @click="openDeleteSubCategory(item.id)"
              class="size-4 cursor-pointer hover:text-destructive"
            />
          </TableCell>
        </TableRow>
      </TableBody>
      <TableBody v-if="!data?.data?.items || data.data.items.length === 0">
        <TableRow>
          <TableCell colspan="4" class="text-center">No subcategories found</TableCell>
        </TableRow>
      </TableBody>
      <TableCaption v-if="data?.data?.items">
        <PaginationComponent :page-size="data.data.pageSize" :total="data.data.totalItems" />
      </TableCaption>
    </Table>

    <EditSubCategory v-model="isEditDialogOpen" :subCategory="selectedSubCategory" />
    <DeleteSubCategory v-model="isDeleteDialogOpen" :subCategoryId="selectedId" />
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
import { ApiResponse, editSubCategory, PaginatedResult, subCategory } from '@/types/api-response'
import SearchComponent from '@/components/SearchComponent.vue'
import { computed, ref } from 'vue'
import Loading from '@/components/Loading.vue'
import CreateSubCategory from '@/components/sub-category/CreateSubCategory.vue'
import EditSubCategory from '@/components/sub-category/EditSubCategory.vue'
import DeleteSubCategory from '@/components/sub-category/DeleteSubCategory.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'

const route = useRoute()
const router = useRouter()
const page = computed(() => route.query.page ?? '1')
const pageSize = computed(() => route.query.pageSize ?? '10')
const name = computed(() => route.query.name ?? '')
const isEditDialogOpen = ref(false)
const selectedSubCategory = ref<editSubCategory>({
  id: '',
  name: '',
  description: '',
  category: {
    id: '',
    name: '',
  },
})
const isDeleteDialogOpen = ref(false)
const selectedId = ref<string>('')

const { data, isLoading } = useQuery<ApiResponse<PaginatedResult<subCategory>>>({
  queryFn: async () => await fetchSubCategory(),
  queryKey: computed(() => [
    'subcategories',
    {
      page: page.value,
      pageSize: pageSize.value,
      ...(name.value ? { name } : {}),
    },
  ]),
  placeholderData: keepPreviousData,
})

const fetchSubCategory = async (): Promise<ApiResponse<PaginatedResult<subCategory>>> => {
  const query = new URLSearchParams()
  if (name.value) query.set('name', String(name.value))
  query.set('page', String(page.value))
  query.set('pageSize', String(pageSize.value))
  console.log(query)

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sub-category?${query}`)

  if (!response.ok) throw new Error('Cannot get data')

  const data = await response.json()
  return data
}

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

function openEditSubCategory(item: editSubCategory) {
  selectedSubCategory.value = item
  isEditDialogOpen.value = true
}

function openDeleteSubCategory(id: string) {
  console.log(id)
  selectedId.value = id
  isDeleteDialogOpen.value = true
}
</script>
