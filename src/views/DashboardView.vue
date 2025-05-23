<template>
  <div class="p-8">
    <div class="text-3xl font-bold">Dashboard</div>
    <section class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Expense</CardTitle>
          <CircleDollarSign />
        </CardHeader>
        <CardContent class="text-2xl font-bold">100 USD</CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Record Day</CardTitle>
          <CircleDollarSign />
        </CardHeader>
        <CardContent class="text-2xl font-bold">20 Days</CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Average Expense/Day</CardTitle>
          <CircleDollarSign />
        </CardHeader>
        <CardContent class="text-2xl font-bold">10</CardContent>
      </Card>
    </section>

    <section class="mt-5">more content here</section>
  </div>
</template>

<script setup lang="ts">
import { CircleDollarSign } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
</script>
