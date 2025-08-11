<template>
  <Select v-model="selectedOption">
    <SelectTrigger class="w-full cursor-pointer" aria-label="Select button">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
          v-for="option in props.selectOptions"
          :key="option.value"
          :value="option.value"
          class="cursor-pointer"
        >
          {{ option.label }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script lang="ts" setup>
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ref, watch } from 'vue'

const props = defineProps<{
  selectOptions: { label: string; value: string }[]
  placeholder: string
}>()

const emit = defineEmits<{
  (event: 'select', value: string): void
}>()

const selectedOption = ref('')

watch(selectedOption, (newValue) => {
  emit('select', newValue)
})
</script>
