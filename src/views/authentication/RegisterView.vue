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
          <h1 class="font-bold text-xl text-center">Register</h1>
          <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField
            v-slot="{ componentField }"
            name="confirmPassword"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password again"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <div class="w-full flex justify-end">
            <Button
              type="submit"
              :disabled="mutation.isPending.value"
              class="w-full cursor-pointer"
            >
              <Loading v-if="mutation.isPending.value" />
              Submit
            </Button>
          </div>

          <p class="text-sm text-center">
            Already have an account?
            <a href="/login" class="text-primary hover:underline">Sign In.</a>
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
import Loading from '@/components/Loading.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'vue3-toastify'
import { AuthCredentials } from '@/types/api-response'
import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

const router = useRouter()
const formSchema = toTypedSchema(
  z
    .object({
      email: z.string().email(),
      password: z.string().min(3).max(50),
      confirmPassword: z.string().min(3).max(50),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    }),
)

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const register = async (data: AuthCredentials) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.message)
  }

  return response
}

const mutation = useMutation({
  mutationFn: register,
  onSuccess: (response) => {
    router.push({ path: '/verify-otp', state: { email: response.data.email } })
    setTimeout(() => {
      toast.success('Register successfully')
    }, 50)
  },
  onError: (error) => {
    toast.error(error.message || 'Register failed')
  },
})

const onSubmit = handleSubmit((values) => {
  if (values.password !== values.confirmPassword) {
    toast.error('Passwords do not match')
    return
  }
  mutation.mutate({
    email: values.email,
    password: values.password,
  })
})
</script>
