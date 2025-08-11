<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <div
        v-if="state.state.value === 'expanded'"
        class="group-data-[collapsible=icon]:hidden py-2"
      >
        <router-link to="/">
          <img
            src="@/assets/images/logo.svg"
            alt="Expense Record Logo"
            class="w-full h-20 mx-auto rounded-full"
          />
        </router-link>
      </div>
      <div v-else class="group-data-[collapsible=icon]:h-14 py-2">
        <router-link to="/">
          <img
            src="@/assets/images/logo-icon.svg"
            alt="Expense Record Logo"
            class="size-full mx-auto rounded-full"
          />
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
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                class="flex h-full items-center justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <Avatar
                    className="size-8 rounded-lg flex items-center justify-center bg-slate-200"
                  >
                    <AvatarFallback className="rounded-lg uppercase">
                      {{ username.substring(0, 1) }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="flex flex-col items-start h-full g">
                    <div class="font-bold">{{ username }}</div>
                    <div class="text-xs">{{ email }}</div>
                  </div>
                </div>
                <ChevronRight />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              :side="isMobile ? 'top' : 'right'"
              align="end"
              class="w-[--reka-popper-anchor-width] min-w-50"
            >
              <DropdownMenuItem @click="logout" class="cursor-pointer">
                <LogOut />
                <span class="w-full font-medium text-sidebar-foreground hover:text-destructive"
                  >Sign Out</span
                >
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRoute, useRouter } from 'vue-router'
import { userInformation } from '@/lib/auth'
import { onMounted, ref } from 'vue'
import { LogOut, ChevronRight } from 'lucide-vue-next'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'

const username = ref<string>('')
const email = ref<string>('')
const { isMobile } = useSidebar()
const state = useSidebar()
const router = useRouter()

const isActive = (url: string) => {
  const route = useRoute()
  const pathname = route.path
  return url === pathname
}

const getUser = async () => {
  const data = await userInformation()

  username.value = data.name
  email.value = data.email
}

onMounted(() => {
  getUser()
})

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

const mutation = useMutation({
  mutationFn: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to login')
    }

    return response.json()
  },
  onSuccess: async () => {
    router.push('/login')
    setTimeout(() => {
      toast.success('Sign out successfully')
    }, 50)
  },
  onError: (error) => {
    toast.error(error.message || 'Logout failed')
  },
})

const logout = async () => {
  mutation.mutate()
}
</script>
