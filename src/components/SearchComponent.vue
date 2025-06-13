<template>
  <div class="relative w-full items-center text-xs">
    <Input
      id="search"
      v-model="searchQuery"
      type="text"
      :placeholder="props.placeholder"
      class="pl-10 placeholder:text-sm"
    />
    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
      <Search class="size-5 text-muted-foreground" />
    </span>
  </div>
</template>
<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { ref, watch } from 'vue'

const props = defineProps(['placeholder'])
const searchQuery = ref('')
const emit = defineEmits<{
  (e: 'search', value: string): void
}>()

let debounceTimeout: ReturnType<typeof setTimeout>

watch(searchQuery, (value) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    emit('search', value)
  }, 500)
})
</script>
