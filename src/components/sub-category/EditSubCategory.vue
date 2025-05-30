<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Subcategory</DialogTitle>
      </DialogHeader>
      <Form
        v-slot="{ handleSubmit }"
        :validation-schema="formSchema"
        :initial-values="{
          name: props.subCategory?.name,
          description: props.subCategory?.description,
          categoryId: props.subCategory?.category.id,
        }"
      >
        <div class="grid gap-4 py-4">
          <form id="editForm" @submit.prevent="handleSubmit(onSubmit)" class="grid gap-4">
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
                  <Input v-bind="componentField" placeholder="Enter subcategory name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="description">
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea v-bind="componentField" placeholder="Enter subcategory description" />
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue3-toastify'
import Loading from '../Loading.vue'
import { useRoute } from 'vue-router'
import { allCategories, ApiResponse, editSubCategory } from '@/types/api-response'

const route = useRoute()
const page = computed(() => route.query.page ?? '1')
const pageSize = computed(() => route.query.pageSize ?? '10')
const name = computed(() => route.query.name ?? '')

interface editedSubCategory {
  categoryId: string
  name: string
  description: string
}

const props = defineProps<{
  subCategory: editSubCategory
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

const mutation = useMutation({
  mutationFn: async (data: editedSubCategory) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/sub-category/${props.subCategory.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    )

    if (!res.ok) {
      throw new Error('Failed to update subcategory')
    }
    return res.json()
  },
  onSuccess: () => {
    toast.success('Subcategory updated successfully')
    isDialogOpen.value = false
    queryClient.invalidateQueries({
      queryKey: [
        'subcategories',
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

const onSubmit = (values: editedSubCategory) => {
  mutation.mutate(values)
}
</script>
