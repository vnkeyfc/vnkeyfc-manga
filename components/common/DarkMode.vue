<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Check } from 'lucide-vue-next'

const colorMode = useColorMode()

// Computed property to determine which icon to show
const isDark = computed(() => colorMode.value === 'dark')

// Computed properties to determine which theme is active
const isLightActive = computed(() => colorMode.preference === 'light')
const isDarkActive = computed(() => colorMode.preference === 'dark')
const isSystemActive = computed(() => colorMode.preference === 'system')
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="relative">
        <div class="relative flex h-8 w-2 items-center justify-center rounded-full">
          <NuxtIcon
            name="i-lucide-sun"
            class="absolute h-[1.2rem] w-[1.2rem] transition-opacity duration-300"
            :class="[isDark ? 'opacity-0' : 'opacity-100']"
          />
          <NuxtIcon
            name="i-lucide-moon"
            class="absolute h-[1.2rem] w-[1.2rem] transition-opacity duration-300"
            :class="[isDark ? 'opacity-100' : 'opacity-0']"
          />
        </div>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="colorMode.preference = 'light'" class="flex justify-between">
        <span>Sáng</span>
        <Check v-if="isLightActive" class="h-4 w-4" />
      </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'dark'" class="flex justify-between">
        <span>Tối</span>
        <Check v-if="isDarkActive" class="h-4 w-4" />
      </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'system'" class="flex justify-between">
        <span>Hệ thống</span>
        <Check v-if="isSystemActive" class="h-4 w-4" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>
/* Optional: Add smooth transitions for theme changes */
html.dark {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>