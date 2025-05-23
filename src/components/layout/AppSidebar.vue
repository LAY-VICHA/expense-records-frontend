<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <div class="group-data-[collapsible=icon]:h-14 py-2">
        <router-link to="/">
          <p
            class="group-data-[collapsible=icon]:hidden text-primary font-bold text-center text-xl"
          >
            Expense Record
          </p>
        </router-link>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Overview</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton asChild :isActive="isActive(item.url)" class="text-foreground">
                <a :href="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
<script setup lang="ts">
import { ChartPie, Database, Network, Shapes } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useRoute } from 'vue-router'

const isActive = (url: string) => {
  const route = useRoute()
  const pathname = route.path
  return url === pathname
}

const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: ChartPie,
  },
  {
    title: 'Expense Record',
    url: '/expense-record',
    icon: Database,
  },
  {
    title: 'Category',
    url: '/category',
    icon: Shapes,
  },
  {
    title: 'Sub Category',
    url: '/sub-category',
    icon: Network,
  },
]
</script>
