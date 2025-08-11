<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from './components/layout/AppSidebar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <SidebarProvider v-if="!route.meta.hideSidebar">
    <AppSidebar />
    <main class="w-full p-4">
      <SidebarTrigger class="size-6 cursor-pointer" />
      <RouterView />
    </main>
  </SidebarProvider>

  <RouterView v-else />
</template>
