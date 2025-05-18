<template>
  <div class="mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
    <h1 class="text-3xl md:text-4xl font-bold my-8 text-center text-accent">
      Vietnam Key Fanclub - Mạn họa đồ thư quán  ✨
    </h1>

    <!-- Search Bar -->
    <div class="mb-8 max-w-lg mx-auto">
      <div class="relative">
        <Input
          v-model="searchQuery"
          placeholder="Tìm manga"
          class="w-full pl-10 pr-4 py-2 rounded-full border border-accent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent transition-all duration-300"
        />
        <NuxtIcon
          name="lucide:search"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent"
        />
      </div>
    </div>

    <!-- Manga Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 container max-w-5xl mx-auto">
      <NuxtLink
        v-for="manga in filteredManga"
        :key="manga.id"
        :to="'/manga/' + manga.id"
        class="group relative flex"
      >
        <Card class="flex flex-col overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full !py-0 gap-1">
          <div class="aspect-[2/3] overflow-hidden">
            <NuxtImg
              :src="manga?.cover || '/images/help.png'"
              :alt="manga?.title || 'Manga cover'"
              format="webp"
              :width="200"
              :height="300"
              placeholder
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div class="px-4 py-2 flex flex-col flex-1">
            <h3 class="text-gray-900 dark:text-white font-medium text-sm md:text-lg line-clamp-2">{{ manga?.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-md md:text-base mt-auto">{{ manga?.author }}</p>
            <div v-if="manga?.genres?.length > 0" class="flex gap-2 mt-2">
              <Badge
                v-for="genre in manga?.genres.slice(0, 2)"
                :key="genre"
                class="bg-green-500/10 text-green-600 dark:text-green-300 text-sm"
              >
                {{ genre }}
              </Badge>
            </div>
          </div>
        </Card>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-if="isLoading" class="text-center mt-12">
      <p class="text-gray-500 dark:text-gray-400 text-lg">Đang tải danh sách manga...</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát.</p>
    </div>
    <div v-if="!isLoading && filteredManga.length === 0" class="text-center mt-12">
      <p class="text-gray-500 dark:text-gray-400 text-lg">Không tìm thấy manga nào 😿</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Hãy thử tìm với từ khóa khác nhé!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onMounted } from 'vue'

// Vietnamese SEO
useHead({
  title: 'Vietnam Key Fanclub Manga - Tổng hợp truyện dịch từ VNKeyFC',
  meta: [
    {
      name: 'description',
      content: 'Vietnam Key FanClub - Manga Translation Team chủ yếu dịch các manga liên quan đến Key - hãng phát triển visual novel nổi tiếng với các tác phẩm như "Kanon", "AIR", "CLANNAD", "Little Busters!", "Rewrite", "Angel Beats!", v.v… Nhóm cũng dịch một số tác phẩm bên ngoài để công việc được phong phú hơn.'
    },
    {
      name: 'keywords',
      content: 'manga, đọc manga, manga online, thư viện manga, manga tiếng Việt, VNKeyFC, Key Visual Novel, dịch manga'
    },
    {
      property: 'og:title',
      content: 'Vietnam Key Fanclub Manga - Tổng hợp truyện dịch từ VNKeyFC'
    },
    {
      property: 'og:description',
      content: 'Vietnam Key FanClub - Manga Translation Team chủ yếu dịch các manga liên quan đến Key'
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})

const manga = ref([])
const searchQuery = ref('')
const isLoading = ref(false)

// Fetch manga data
const fetchManga = async () => {
  isLoading.value = true
  try {
    const response = await fetch('/manga/manga.json')
    const data = await response.json()
    manga.value = data.manga
  } catch (error) {
    console.error('Lỗi khi tải danh sách manga:', error)
  } finally {
    isLoading.value = false
  }
}

// Filter manga based on search query
const filteredManga = computed(() => {
  if (!searchQuery.value) return manga.value
  const query = searchQuery.value.toLowerCase()
  return manga.value.filter(manga => 
    manga.title.toLowerCase().includes(query) ||
    manga.author.toLowerCase().includes(query) ||
    manga.genres.some(genre => genre.toLowerCase().includes(query))
  )
})

// Fetch manga data on component mount
onMounted(() => {
  fetchManga()
})
</script>

<style scoped>
</style>