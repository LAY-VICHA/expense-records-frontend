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
          <h1 class="font-bold text-xl text-center">Verify OTP</h1>
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
                  @complete="handleAutoSubmit"
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
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/ui/pin-input'
import { toast } from 'vue3-toastify'
import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import Loading from '@/components/Loading.vue'

const router = useRouter()
const email = router.options.history.state?.email

const formSchema = toTypedSchema(
  z.object({
    pin: z.array(z.coerce.string()).length(6, { message: 'OTP Code Require!' }),
  }),
)

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    pin: [],
  },
})

const handleComplete = (e: string[]) => e.join('')

const handleAutoSubmit = () => {
  onSubmit()
}

const register = async (data: { email: string; code: string }) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.message || 'Failed to verify code')
  }

  return response
}

const mutation = useMutation({
  mutationFn: register,
  onSuccess: (data) => {
    router.push('/login')
    setTimeout(() => {
      toast.success('Verify successfully', data)
    }, 50)
  },
  onError: (error) => {
    toast.error(error.message || 'Verify code failed')
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
  })
})
</script>
