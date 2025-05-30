<template>
  <Pagination
    v-slot="{ page }"
    :items-per-page="props.pageSize"
    :total="props.total"
    :default-page="1"
  >
    <PaginationContent v-slot="{ items }">
      <PaginationPrevious @click="handlePage(page - 1)" />

      <template v-for="(item, index) in items" :key="index">
        <PaginationItem
          v-if="item.type === 'page'"
          :value="item.value"
          :is-active="item.value === page"
          @click="handlePage(item.value)"
        >
          {{ item.value }}
        </PaginationItem>
      </template>

      <PaginationEllipsis :index="4" />

      <PaginationNext @click="handlePage(page + 1)" />
    </PaginationContent>
  </Pagination>
</template>

<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  pageSize: number
  total: number
}>()

const route = useRoute()
const router = useRouter()

const handlePage = (page: number) => {
  console.log('page :', page)
  router.replace({
    query: {
      ...route.query,
      page: page || 1,
    },
  })
}
</script>
