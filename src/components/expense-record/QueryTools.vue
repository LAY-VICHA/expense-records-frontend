<template>
  <div class="w-full">
    <SearchComponent @search="handleSearch" placeholder="Search record by reason..." />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SearchComponent from '@/components/SearchComponent.vue'

const router = useRouter()

const handleSearch = (searchQuery: string) => {
  console.log('Search query:', searchQuery)
  router.replace({
    query: {
      reason: searchQuery || '',
    },
  })
}
</script>
