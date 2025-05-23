<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from './components/layout/AppSidebar.vue'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <main class="w-full p-4">
      <SidebarTrigger class="size-6" />
      <RouterView />
    </main>
  </SidebarProvider>
</template>
