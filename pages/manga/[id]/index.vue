<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Error Alert -->
    <div v-if="error" class="mb-8 max-w-4xl mx-auto">
      <Alert variant="destructive">
        <NuxtIcon name="lucide:alert-triangle" class="h-5 w-5" />
        <AlertTitle class="font-medium">Lỗi</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
    </div>

    <div v-if="manga" class="max-w-4xl mx-auto">
      <!-- Manga Header -->
      <div class="flex flex-col md:flex-row gap-8 mb-12">
        <div class="w-full md:w-1/3">
          <div class="aspect-[2/3] bg-muted rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl">
            <img
              :src="manga?.cover || '/images/help.png'"
              :alt="manga.title || 'Manga cover'"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          
          <!-- Quick Action Buttons -->
          <div class="mt-6 flex flex-col gap-3">
            <Button 
              v-if="firstChapter"
              class="w-full bg-accent text-white hover:bg-accent/90 transition-colors duration-200 cursor-pointer"
              size="lg"
              @click="navigateToChapter(firstChapter)"
            >
              <BookOpenIcon class="mr-2 h-5 w-5" />
              Đọc từ đầu
            </Button>
            
            <Button 
              v-if="latestChapter"
              variant="secondary"
              size="lg"
              class="w-full cursor-pointer transition-colors duration-200"
              @click="navigateToChapter(latestChapter)"
            >
              <BookIcon class="mr-2 h-5 w-5" />
              Đọc mới nhất
            </Button>
          </div>
        </div>
        <div class="w-full md:w-2/3">
          <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight text-accent">{{ manga?.title || "Chưa có tiêu đề" }}</h1>
          
          <div class="space-y-3 mb-6">
            <p class="text-muted-foreground flex items-center">
              <NuxtIcon name="lucide:star" class="h-4 w-4 mr-2 opacity-70" />
              <span class="font-medium mr-2">Tác giả:</span> 
              <span>{{ manga?.author || "Chưa có thông tin" }}</span>
            </p>

            <p class="text-muted-foreground flex items-center">
              <NuxtIcon name="lucide:pen-tool" class="h-4 w-4 mr-2 opacity-70" />
              <span class="font-medium mr-2">Họa sĩ:</span> 
              <span>{{ manga?.artist || "Chưa có thông tin" }}</span>
            </p>
          </div>
          
          <div v-if="manga?.genres?.length > 0" class="flex flex-wrap gap-2 mb-6">
            <Badge 
              v-for="genre in manga?.genres" 
              :key="genre" 
              variant="primary"
              class="px-3 py-1 text-sm transition-colors duration-200"
            >
              {{ genre }}
            </Badge>
          </div>
          
          <Card class="mb-6 border border-border/50 hover:border-border transition-all duration-200 !py-2 gap-0">
            <CardHeader>
              <CardTitle class="text-lg">Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-card-foreground leading-relaxed">{{ manga?.description || "Chưa có mô tả" }}</p>
            </CardContent>
          </Card>
          
          <div class="flex flex-wrap items-center gap-3 text-sm mb-4">
            <Badge v-if="manga?.status" variant="outline" class="flex items-center">
              <NuxtIcon name="lucide:check-circle" class="h-3 w-3 mr-1" />
              Trạng thái: {{ manga.status }}
            </Badge>
            <Badge v-if="manga?.lastUpdated" variant="outline" class="flex items-center">
              <NuxtIcon name="lucide:clock" class="h-3 w-3 mr-1" />
              Cập nhật: {{ formatDate(manga.lastUpdated) }}
            </Badge>
          </div>

          <p v-if="manga?.noted" class="text-muted-foreground italic border-l-2 border-muted pl-3 py-1">
            <span class="font-medium">Ghi chú:</span> {{ manga?.noted }}
          </p>
        </div>
      </div>

      <!-- Chapter List -->
      <div class="mt-12 bg-card/30 p-6 rounded-xl border border-border/50 shadow-md">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 class="text-2xl font-bold flex items-center">
            <NuxtIcon name="lucide:book-open" class="h-5 w-5 mr-2" />
            Các chương
          </h2>
          <div class="flex items-center gap-4">
            <Select :model-value="sortOrder" @update:model-value="val => sortOrder = val">
              <SelectTrigger class="w-44">
                <!-- <SortAscIcon v-if="sortOrder === 'asc'" class="h-4 w-4 mr-2" />
                <SortDescIcon v-else class="h-4 w-4 mr-2" /> -->
                <NuxtIcon v-if="sortOrder === 'asc'" name="lucide:arrow-up-narrow-wide" class="h-4 w-4 mr-2" />
                <NuxtIcon v-else name="lucide:arrow-down-narrow-wide" class="h-4 w-4 mr-2" />
                <SelectValue :value="sortOrder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mới nhất trước</SelectItem>
                <SelectItem value="asc">Cũ nhất trước</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="space-y-4 w-full">
            <Skeleton class="h-16 w-full rounded-lg" />
            <Skeleton class="h-16 w-full rounded-lg" />
            <Skeleton class="h-16 w-full rounded-lg" />
            <Skeleton class="h-16 w-full rounded-lg" />
          </div>
        </div>
        
        <div v-else-if="sortedChapters.length > 0" class="grid gap-3">
          <Card
            v-for="chapter in sortedChapters"
            :key="chapter.id"
            class="transition-all hover:shadow-md border border-border/50 hover:border-border overflow-hidden !py-4"
          >
            <NuxtLink
              :to="'/manga/' + encodeURIComponent(manga.id) + '/chapter/' + encodeURIComponent(chapter.id)"
              class="block"
            >
              <CardContent class="px-5 flex items-center justify-between group">
                <div class="flex items-center font-medium group-hover:text-accent transition-colors duration-200">
                    <NuxtIcon name="lucide:book" class="h-5 w-5 mr-2 opacity-70 " />
                    {{ chapter?.title || "Không có tiêu đề" }}
                </div>
              </CardContent>
            </NuxtLink>
          </Card>
        </div>
        
        <div v-else-if="!error" class="text-center py-12">
          <Card class="border border-border/50">
            <CardContent class="flex flex-col items-center py-12">
              <BookOpenIcon class="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p class="text-muted-foreground text-lg">Chưa có chương nào.</p>
              <p class="text-muted-foreground text-sm mt-2">Vui lòng quay lại sau.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    
    <div v-else-if="!error" class="text-center py-12 max-w-4xl mx-auto">
      <div class="flex flex-col items-center gap-6">
        <div class="w-full max-w-md mx-auto">
          <div class="flex flex-col md:flex-row gap-8">
            <Skeleton class="h-64 w-full md:w-1/3 rounded-xl" />
            <div class="w-full md:w-2/3 space-y-4">
              <Skeleton class="h-10 w-3/4 rounded-full" />
              <Skeleton class="h-4 w-1/2 rounded-full" />
              <Skeleton class="h-4 w-1/2 rounded-full" />
              <div class="flex gap-2 mt-4">
                <Skeleton class="h-6 w-16 rounded-full" />
                <Skeleton class="h-6 w-16 rounded-full" />
                <Skeleton class="h-6 w-16 rounded-full" />
              </div>
              <Skeleton class="h-32 w-full rounded-lg mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '#app'
import { 
  BookOpenIcon,
  BookIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const manga = ref(null)
const chapters = ref([])
const error = ref(null)
const isLoading = ref(true)
const sortOrder = ref('desc') // Default sorting: newest first

// Computed properties for first and latest chapters
const sortedChapters = computed(() => {
  if (!chapters.value || chapters.value.length === 0) return []
  
  return [...chapters.value].sort((a, b) => {
    // Try to extract chapter numbers
    const aNum = parseInt(a.number || a.title.match(/\d+/)?.[0] || '0')
    const bNum = parseInt(b.number || b.title.match(/\d+/)?.[0] || '0')
    
    // If both have valid numbers, compare them
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortOrder.value === 'desc' ? bNum - aNum : aNum - bNum
    }
    
    // Fall back to release date if available
    if (a.releaseDate && b.releaseDate) {
      return sortOrder.value === 'desc' 
        ? new Date(b.releaseDate) - new Date(a.releaseDate)
        : new Date(a.releaseDate) - new Date(b.releaseDate)
    }
    
    // Default: just use the order from the API
    return sortOrder.value === 'desc' ? -1 : 1
  })
})

const firstChapter = computed(() => {
  if (!chapters.value || chapters.value.length === 0) return null
  
  // Find the chapter with the lowest number
  return [...chapters.value].sort((a, b) => {
    const aNum = parseInt(a.number || a.title.match(/\d+/)?.[0] || '0')
    const bNum = parseInt(b.number || b.title.match(/\d+/)?.[0] || '0')
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum
    }
    return 0
  })[0]
})

const latestChapter = computed(() => {
  if (!chapters.value || chapters.value.length === 0) return null
  
  // Find the chapter with the highest number
  return [...chapters.value].sort((a, b) => {
    const aNum = parseInt(a.number || a.title.match(/\d+/)?.[0] || '0')
    const bNum = parseInt(b.number || b.title.match(/\d+/)?.[0] || '0')
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return bNum - aNum
    }
    
    // Fall back to release date if available
    if (a.releaseDate && b.releaseDate) {
      return new Date(b.releaseDate) - new Date(a.releaseDate)
    }
    
    return 0
  })[0]
})

// Format date for Vietnamese locale
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Navigate to a specific chapter
const navigateToChapter = (chapter) => {
  if (!chapter) return
  
  router.push(`/manga/${encodeURIComponent(manga.value.id)}/chapter/${encodeURIComponent(chapter.id)}`)
}

// Handle image loading errors
const handleImageError = (e) => {
  console.error('Image failed to load:', e.target.src)
  e.target.src = '/help.png' // Fallback image
}

// SEO
const updateSEO = (mangaData) => {
  const description = mangaData.description || `Đọc truyện ${mangaData.title}.`
      
  useHead({
    title: `${mangaData.title} - Các chương`,
    htmlAttrs: {
      lang: 'vi'
    },
    meta: [
      {
        name: 'description',
        content: description
      },
      {
        property: 'og:title',
        content: mangaData.title
      },
      {
        property: 'og:description',
        content: description
      },
      {
        property: 'og:image',
        content: mangaData.cover
      },
      {
        property: 'og:locale',
        content: 'vi_VN'
      },
      {
        property: 'og:type',
        content: 'book'
      }
    ]
  })
}

// Fetch manga data from manga.json
const fetchMangaInfo = async () => {
  isLoading.value = true
  try {
    const response = await fetch('/manga/manga.json')
    if (!response.ok) {
      throw new Error(`Lỗi tải dữ liệu: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Validate required fields
    if (!data.manga || !Array.isArray(data.manga)) {
      throw new Error('Dữ liệu không hợp lệ')
    }
    
    // Find the specific manga by ID
    const mangaId = route.params.id
    const foundManga = data.manga.find(m => m.id === mangaId)
    
    if (!foundManga) {
      throw new Error(`Không tìm thấy truyện với ID ${mangaId}`)
    }
    
    return foundManga
  } catch (err) {
    console.error('Error fetching manga info:', err)
    error.value = err.message || 'Không thể tải thông tin truyện'
    return null
  } finally {
    isLoading.value = false
  }
}

// Fetch manga data from index.json
const fetchMangaData = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`/manga/${manga.value.title}/index.json`)
    if (!response.ok) {
      throw new Error(`Lỗi tải dữ liệu: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Validate required fields
    if (!data.id || !data.title) {
      throw new Error('Dữ liệu không hợp lệ')
    }
    
    // Set chapters
    chapters.value = data.chapters?.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      number: chapter.title.match(/\d+/)?.[0] || '',
      images: chapter.chapterImages,
      releaseDate: chapter.releaseDate || null
    })) || []
    
    // Update SEO
    updateSEO(manga.value)
  } catch (err) {
    console.error('Error fetching manga data:', err)
    error.value = err.message || 'Không thể tải dữ liệu truyện'
  } finally {
    isLoading.value = false
  }
}

// Load data
onMounted(async () => {
  try {
    error.value = null
    const mangaData = await fetchMangaInfo()
    if (mangaData) {
      manga.value = mangaData
      await fetchMangaData()
    }
  } catch (err) {
    console.error('Error during initialization:', err)
    error.value = err.message || 'Lỗi khởi tạo'
  }
})

// Watch for route changes
watch(
  () => route.params.id,
  async () => {
    try {
      error.value = null
      const mangaData = await fetchMangaInfo()
      if (mangaData) {
        manga.value = mangaData
        await fetchMangaData()
      }
    } catch (err) {
      console.error('Error during route change:', err)
      error.value = err.message || 'Không thể tải dữ liệu truyện'
    }
  }
)
</script>