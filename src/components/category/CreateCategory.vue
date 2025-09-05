<template>
  <Form v-slot="{ handleSubmit }" as="" :validation-schema="formSchema">
    <Dialog v-model:open="isDialogOpen">
      <DialogTrigger as-child>
        <Button class="cursor-pointer"> Create </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <form id="dialogForm" @submit.prevent="handleSubmit($event, onSubmit)" class="grid gap-4">
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter category name" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="description">
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    type="text"
                    placeholder="Enter category description"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </form>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            form="dialogForm"
            :disabled="mutation.isPending.value"
            class="cursor-pointer"
          >
            <Loading v-if="mutation.isPending.value" />
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import Loading from '../Loading.vue'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { apiFetch } from '@/lib/api'

interface CategoryFormValues {
  name: string
  description: string
}
const isDialogOpen = ref(false)
const queryClient = useQueryClient()

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(200).optional(),
  }),
)

const createCategory = async (data: CategoryFormValues) => {
  const response = await apiFetch(`/category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (response.error) {
    throw new Error(response.error.message || 'Failed to create category')
  }

  return response.value
}

const mutation = useMutation({
  mutationFn: createCategory,
  onSuccess: () => {
    toast.success('Category created successfully')
    isDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  },
  onError: (error) => {
    toast.error(error.message || 'Category created failed')
  },
})

const onSubmit = (values: CategoryFormValues) => {
  mutation.mutate({
    name: values.name,
    description: values.description,
  })
}
</script>
