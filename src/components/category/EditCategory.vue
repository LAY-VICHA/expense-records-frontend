<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
      </DialogHeader>
      <Form
        v-slot="{ handleSubmit }"
        :validation-schema="formSchema"
        :initial-values="{
          name: props.category?.name,
          description: props.category?.description,
        }"
      >
        <div class="grid gap-4 py-4">
          <form id="editForm" @submit.prevent="handleSubmit(onSubmit)" class="grid gap-4">
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" placeholder="Enter category name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="description">
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea v-bind="componentField" placeholder="Enter category description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </form>
        </div>
        <DialogFooter>
          <Button type="submit" form="editForm" :disabled="mutation.isPending.value">
            <Loading v-if="mutation.isPending.value" />
            Save Changes
          </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue3-toastify'
import Loading from '../Loading.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const page = computed(() => route.query.page ?? '1')
const pageSize = computed(() => route.query.pageSize ?? '10')
const name = computed(() => route.query.name ?? '')

interface editedCategory {
  name: string
  description: string
}

const props = defineProps<{
  category: { id: string; name: string; description: string }
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

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(200),
  }),
)

const mutation = useMutation({
  mutationFn: async (data: editedCategory) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/category/${props.category.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to update category')
    }
    return res.json()
  },
  onSuccess: () => {
    toast.success('Category updated successfully')
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
    console.log(error)
    toast.error(error instanceof Error ? error.message : 'Update failed')
  },
})

const onSubmit = (values: editedCategory) => {
  mutation.mutate(values)
}
</script>
