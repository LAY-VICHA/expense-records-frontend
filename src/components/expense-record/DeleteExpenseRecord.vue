<template>
  <AlertDialog v-model:open="isDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your expense record and remove
          your data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel class="cursor-pointer">Cancel</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full cursor-pointer sm:w-auto"
          @click="deleteExpenseRecord(props.expenseRecordId)"
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
const reason = computed(() => route.query.reason ?? '')
const sortBy = computed(() => route.query.sortBy ?? '')
const filterCategory = computed(() => route.query.filterCategory ?? '')
const filterSubCategory = computed(() => route.query.filterSubCategory ?? '')
const filterStartDate = computed(() => route.query.filterStartDate ?? '')
const filterEndDate = computed(() => route.query.filterEndDate ?? '')

const props = defineProps<{
  expenseRecordId: string
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
  mutationFn: async (expenseRecordId: string) => {
    const response = await apiFetch(`/expense-record/${expenseRecordId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.error) {
      throw new Error(response.error.message || 'Failed to delete expense record')
    }

    return response.value
  },
  onSuccess: async () => {
    toast.success('Expense record deleted successfully')
    isDialogOpen.value = false
    queryClient.invalidateQueries({
      queryKey: [
        'expense-records',
        {
          page: page.value,
          pageSize: pageSize.value,
          ...(reason.value ? { reason } : {}),
          ...(sortBy.value ? { sortBy } : {}),
          ...(filterCategory.value ? { filterCategory } : {}),
          ...(filterSubCategory.value ? { filterSubCategory } : {}),
          ...(filterStartDate.value ? { filterStartDate } : {}),
          ...(filterEndDate.value ? { filterEndDate } : {}),
        },
      ],
    })
  },
  onError: (error) => {
    toast.error(error.message || 'Delete failed')
  },
})

const deleteExpenseRecord = async (expenseRecordId: string) => {
  mutation.mutate(expenseRecordId)
}
</script>
