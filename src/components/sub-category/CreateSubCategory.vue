<template>
  <Form v-slot="{ handleSubmit }" as="" :validation-schema="formSchema">
    <Dialog v-model:open="isDialogOpen">
      <DialogTrigger as-child>
        <Button class="text-base"> Create </Button>
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
                  <FormControl class="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent v-if="data?.data" class="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      <SelectItem
                        v-for="category in data.data"
                        :key="category.id"
                        :value="category.id"
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
          <Button type="submit" form="dialogForm" :disabled="mutation.isPending.value">
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
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import Loading from '../Loading.vue'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { ApiResponse, allCategories } from '@/types/api-response'

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
    description: z.string().max(200),
  }),
)

const fetchAllCategory = async (): Promise<ApiResponse<allCategories>> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/category/all`)

  if (!response.ok) throw new Error('Cannot get data')

  const data = await response.json()
  console.log(data.data)

  return data
}

const { data } = useQuery<ApiResponse<allCategories>>({
  queryFn: async () => await fetchAllCategory(),
  queryKey: computed(() => ['all-categories']),
  placeholderData: keepPreviousData,
})

const createSubCategory = async (data: SubCategoryFormValues) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sub-category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error('Failed to create subcategory')
  }

  return res.json()
}

const mutation = useMutation({
  mutationFn: createSubCategory,
  onSuccess: (data) => {
    console.log('Subcategory created:', data)
    toast.success('Subcategory created successfully')
    isDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['subcategories'] })
  },
  onError: (error) => {
    toast.error(error || 'Subcategory created failed')
    console.error('Error creating subcategory:', error)
  },
})

const onSubmit = (values: SubCategoryFormValues) => {
  console.log('Form submitted!', values)
  mutation.mutate({
    name: values.name,
    description: values.description,
    categoryId: values.categoryId,
  })
}
</script>
