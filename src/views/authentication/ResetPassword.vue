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
          <h1 class="font-bold text-xl text-center">Reset Password</h1>
          <p class="text-left">We have sent the code to admin. Please contact admin for code:)</p>
          <FormField v-slot="{ componentField, value }" name="pin">
            <FormItem>
              <FormLabel>OTP</FormLabel>
              <FormControl>
                <PinInput
                  id="pin-input"
                  :model-value="value"
                  placeholder="○"
                  class="w-full flex gap-2 items-center mt-1"
                  otp
                  type="text"
                  :name="componentField.name"
                  @update:model-value="
                    (arrStr: string[]) => {
                      setFieldValue('pin', arrStr)
                    }
                  "
                >
                  <PinInputGroup>
                    <PinInputSlot v-for="(id, index) in 6" :key="id" :index="index" />
                  </PinInputGroup>
                </PinInput>
              </FormControl>
              <FormDescription>
                Allows users to input a sequence of one-character alphanumeric inputs.
              </FormDescription>
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

          <Button type="submit" :disabled="mutation.isPending.value" class="w-full cursor-pointer">
            <Loading v-if="mutation.isPending.value" />
            Submit
          </Button>

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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/ui/pin-input'
import { toast } from 'vue3-toastify'
import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import Loading from '@/components/Loading.vue'

const router = useRouter()
const email = router.options.history.state?.email

const formSchema = toTypedSchema(
  z
    .object({
      pin: z.array(z.coerce.string()).length(6, { message: 'OTP Code Require!' }),
      password: z.string().min(3).max(50),
      confirmPassword: z.string().min(3).max(50),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    }),
)

const { isFieldDirty, handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    pin: [],
  },
})

const handleComplete = (e: string[]) => e.join('')

const resetPassword = async (data: { email: string; code: string; password: string }) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.message || 'Failed to reset password')
  }

  return response
}

const mutation = useMutation({
  mutationFn: resetPassword,
  onSuccess: (data) => {
    router.push('/login')
    setTimeout(() => {
      toast.success('Reset Password successfully', data)
    }, 50)
  },
  onError: (error) => {
    toast.error(error.message || 'Reset Password failed')
  },
})

const onSubmit = handleSubmit((values) => {
  const pin = handleComplete(values.pin)

  if (!email) {
    toast.error('Invalid Request')
    return
  }

  mutation.mutate({
    email: email as string,
    code: pin,
    password: values.password,
  })
})
</script>
