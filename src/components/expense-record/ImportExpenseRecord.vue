<template>
  <Form v-slot="{ handleSubmit }" as="" :validation-schema="formSchema">
    <Dialog v-model:open="isDialogOpen">
      <DialogTrigger as-child>
        <Button variant="outline" class=""> <ArrowDownToLine />Import </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Record via CSV </DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <form id="dialogForm" @submit.prevent="handleSubmit($event, onSubmit)" class="grid gap-4">
            <FormField v-slot="{ handleChange }" name="file">
              <FormItem>
                <FormLabel>CSV file</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".csv"
                    placeholder="Import an csv file"
                    @change="
                      (e: Event) => {
                        const target = e.target as HTMLInputElement
                        if (target.files) {
                          handleChange([...target.files])
                        }
                      }
                    "
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
import { Input } from '@/components/ui/input'
import { ArrowDownToLine } from 'lucide-vue-next'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import Loading from '../Loading.vue'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

interface ImportExpenseRecordFormValues {
  file: File[]
}
const isDialogOpen = ref(false)
const queryClient = useQueryClient()

const formSchema = toTypedSchema(
  z.object({
    file: z
      .array(z.instanceof(File))
      .min(1, 'Please select a CSV file')
      .refine(
        (files) => files[0]?.type === 'text/csv' || files[0]?.name.endsWith('.csv'),
        'Only CSV files are allowed',
      ),
  }),
)

const ImportExpenseRecord = async (data: ImportExpenseRecordFormValues) => {
  const formData = new FormData()
  formData.append('file', data.file[0])

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/expense-record/bulk`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.msg || 'Failed to import expense records')
  }

  return res.json()
}

const mutation = useMutation({
  mutationFn: ImportExpenseRecord,
  onSuccess: (data) => {
    console.log('Expense record imported:', data)
    toast.success('Expense record imported successfully')
    isDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['expense-records'] })
  },
  onError: (error) => {
    toast.error(error || 'Expense record imported failed')
    console.error('Error importing records:', error)
  },
})

const onSubmit = (values: ImportExpenseRecordFormValues) => {
  console.log('Form submitted!', values)
  mutation.mutate({
    file: values.file,
  })
}
</script>
