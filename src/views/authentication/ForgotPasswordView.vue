<template>
  <div class="size-full h-screen min-h-full flex">
    <div
      class="w-1/2 h-full hidden bg-primary lg:flex lg:flex-col lg:justify-center lg:items-center lg:gap-5"
    >
      <img
        src="@/assets/images/logo-icon-white.svg"
        alt="Expense Record Logo - Icon"
        class="w-full h-20 mx-auto rounded-full"
      />
      <img
        src="@/assets/images/logo-text-white.svg"
        alt="Expense Record Logo - Name"
        class="w-full h-10 mx-auto"
      />
    </div>
    <div class="size-full lg:w-1/2">
      <div class="size-full flex flex-col justify-center items-center">
        <form class="w-full space-y-6 max-w-sm px-4" @submit="onSubmit">
          <h1 class="font-bold text-xl text-center">Forgot Password</h1>
          <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="w-full flex justify-end">
            <Button
              type="submit"
              :disabled="mutation.isPending.value"
              class="w-full cursor-pointer py-3"
            >
              <Loading v-if="mutation.isPending.value" />
              Submit
            </Button>
          </div>

          <p class="text-sm text-center">
            Remember your password?
            <a href="/login" class="text-primary hover:underline"> Back to Login.</a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'vue3-toastify'
import { useMutation } from '@tanstack/vue-query'
import Loading from '@/components/Loading.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
  }),
)

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const forgotPassword = async (data: { email: string }) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const response = await res.json()
    throw new Error(response.message || 'Failed to send email verification')
  }

  return res.json()
}

const mutation = useMutation({
  mutationFn: forgotPassword,
  onSuccess: (data) => {
    router.push({ path: '/reset-password', state: { email: data.data.email } })
    setTimeout(() => {
      toast.success('Email sent successfully')
    }, 50)
  },
  onError: (error) => {
    toast.error(error.message || 'Email sent failed')
    error('Error email sent:', error)
  },
})

const onSubmit = handleSubmit((values) => {
  mutation.mutate({
    email: values.email,
  })
})
</script>
