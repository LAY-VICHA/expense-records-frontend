<template>
  <Form v-slot="{ handleSubmit }" as="" :validation-schema="formSchema">
    <Dialog v-model:open="isDialogOpen">
      <DialogTrigger as-child>
        <Button class="cursor-pointer"> Create </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Subcategory</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <form id="dialogForm" @submit.prevent="handleSubmit($event, onSubmit)" class="grid gap-4">
            <FormField v-slot="{ componentField }" name="categoryId">
              <FormItem>
                <FormLabel>Category</FormLabel>

                <Select v-bind="componentField" class="w-[300px]">
                  <FormControl class="w-full cursor-pointer">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent v-if="allCategories" class="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      <SelectItem
                        v-for="category in allCategories"
                        :key="category.id"
                        :value="category.id"
                        class="cursor-pointer"
                      >
                        {{ category.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter subcategory name" v-bind="componentField" />
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
                    placeholder="Enter subcategory description"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { keepPreviousData, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import Loading from '../Loading.vue'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { ApiResponse, AllCategories } from '@/types/api-response'
import { apiFetch } from '@/lib/api'
import { useNoRetryQuery } from '@/lib/noRetryQuery'

interface SubCategoryFormValues {
  categoryId: string
  name: string
  description: string
}
const isDialogOpen = ref(false)
const queryClient = useQueryClient()

const formSchema = toTypedSchema(
  z.object({
    categoryId: z.string().min(1, 'Category is required'),
    name: z.string().min(2).max(50),
    description: z.string().max(200).optional(),
  }),
)

const fetchAllCategory = async (): Promise<ApiResponse<AllCategories>> => {
  const response = await apiFetch<ApiResponse<AllCategories>>(`/category/all`)

  if (response.error) {
    throw new Error(response.error.message || 'Failed to fetch categories')
  }

  return response.value
}

const { data } = useNoRetryQuery<ApiResponse<AllCategories>>({
  queryFn: async () => await fetchAllCategory(),
  queryKey: ['all-categories'],
  placeholderData: keepPreviousData,
})

const allCategories = computed(() => data.value?.data)

const createSubCategory = async (data: SubCategoryFormValues) => {
  const response = await apiFetch(`/sub-category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (response.error) {
    throw new Error(response.error.message || 'Failed to create subcategory')
  }

  return response.value
}

const mutation = useMutation({
  mutationFn: createSubCategory,
  onSuccess: () => {
    toast.success('Subcategory created successfully')
    isDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['subcategories'] })
  },
  onError: (error) => {
    toast.error(error.message || 'Subcategory created failed')
  },
})

const onSubmit = (values: SubCategoryFormValues) => {
  mutation.mutate({
    name: values.name,
    description: values.description,
    categoryId: values.categoryId,
  })
}
</script>
