<template>
  <AlertDialog v-model:open="isDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your category and remove your
          data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel class="cursor-pointer">Cancel</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto cursor-pointer"
          @click="deleteCategory(props.categoryId)"
          :disabled="mutation.isPending.value"
        >
          <Loading v-if="mutation.isPending.value" />
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { apiFetch } from '@/lib/api'
const route = useRoute()
const page = computed(() => route.query.page ?? '1')
const pageSize = computed(() => route.query.pageSize ?? '10')
const name = computed(() => route.query.name ?? '')

const props = defineProps<{
  categoryId: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isDialogOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: async (categoryId: string) => {
    const response = await apiFetch(`/category/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.error) {
      throw new Error(response.error.message || 'Failed to delete category')
    }

    return response.value
  },
  onSuccess: async () => {
    toast.success('Category deleted successfully')
    isDialogOpen.value = false
    queryClient.invalidateQueries({
      queryKey: [
        'categories',
        {
          page: page.value,
          pageSize: pageSize.value,
          ...(name.value ? { name } : {}),
        },
      ],
    })
  },
  onError: (error) => {
    toast.error(error.message || 'Delete failed')
  },
})

const deleteCategory = async (categoryId: string) => {
  mutation.mutate(categoryId)
}
</script>
