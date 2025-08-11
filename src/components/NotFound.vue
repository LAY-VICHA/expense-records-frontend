<template>
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:pl-[255px]">
    <div class="flex flex-col items-center">
      <h1 class="text-8xl font-semibold text-destructive">404</h1>
      <div class="py-6 text-center">
        <p class="font-semibold text-xl">Page not found</p>
        <p class="text-sm">The page you are looking for does not exist!</p>
      </div>
      <Button class="mt-4 cursor-pointer" @click="$router.push('/')">Back to Home</Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Button } from './ui/button'
</script>
