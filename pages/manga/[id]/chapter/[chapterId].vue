<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
    <!-- Error Message -->
    <div v-if="error" class="container mx-auto px-4 py-8">
      <Alert variant="destructive">
        <NuxtIcon name="lucide:alert-circle" class="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
    </div>

    <!-- Reader Header -->
    <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div v-if="manga?.title" class="flex items-center text-lg gap-2">
              <NuxtLink :to="'/manga/' + encodeURIComponent(manga?.id)">
                <h1 class="font-semibold line-clamp-1 text-primary hover:text-bg-primary-foreground">
                  {{ `${manga?.title}` }}
                </h1>
              </NuxtLink>
              <div class="hidden sm:block h-6">
                <Separator orientation="vertical" class="h-6" />
              </div>
              <span class="text-nowrap hidden sm:block">{{ currentChapter?.title }}</span>
            </div>
            <Skeleton v-else class="h-5 text-sm w-52" />
          </div>
          <div class="flex items-center gap-2">
            <Select v-if="chapters.length > 0" :model-value="currentChapter?.id" @update:model-value="changeChapter">
              <SelectTrigger class="w-32 sm:w-40">
                <SelectValue>
                  {{ currentChapter.title }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
                  {{ chapter.title }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>

    <!-- Reader Content -->
    <main class="container mx-auto p-2 flex-1">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="flex flex-col items-center gap-2">
          <p class="text-muted-foreground">Đang tải chapter...</p>
        </div>
      </div>
      
      <div v-else-if="chapterImages.length > 0" class="max-w-3xl mx-auto space-y-6">
        <!-- Vertical Reading Mode -->
        <div v-if="readingMode === 'vertical'" class="space-y-2">
          <div v-for="(image, index) in chapterImages" :key="index" class="relative">
            <img
              :src="getImagePath(image)"
              :alt="`Trang ${index + 1} - ${manga?.title} - ${currentChapter.title}`"
              class="w-full rounded-lg shadow-md dark:shadow-none border border-muted dark:border-gray-700"
              loading="lazy"
              @error="handleImageError($event, index)"
            />

            <Badge 
              v-if="showPageNumbers" 
              variant="outline"
              class="absolute bottom-1 right-1 bg-white text-black dark:bg-gray-800 dark:text-white"
            >
              {{ index + 1 }} / {{ chapterImages.length }}
            </Badge>
          </div>
        </div>
        
        <!-- Paged Reading Mode -->
        <div v-else-if="readingMode === 'paged'" class="relative">
          <img
            :src="getImagePath(chapterImages[currentPage])"
            :alt="`Trang ${currentPage + 1} - ${manga?.title} - ${currentChapter.title}`"
            class="w-full rounded-lg shadow-md dark:shadow-none border border-muted dark:border-gray-700 mx-auto"
            loading="eager"
            @error="handleImageError($event, currentPage)"
          />
          
          <!-- Left navigation area (previous page) -->
          <div 
            class="absolute top-0 left-0 w-1/2 h-full cursor-pointer" 
            @click="currentPage > 0 && changePage(-1)"
            :class="{ 'cursor-not-allowed': currentPage <= 0 }"
          ></div>
          
          <!-- Right navigation area (next page) -->
          <div 
            class="absolute top-0 right-0 w-1/2 h-full cursor-pointer" 
            @click="currentPage < chapterImages.length - 1 && changePage(1)"
            :class="{ 'cursor-not-allowed': currentPage >= chapterImages.length - 1 }"
          ></div>
        </div>
      </div>
      
      <div v-else-if="!error && !loading" class="text-center py-12">
        <div class="flex flex-col items-center gap-4">
          <NuxtIcon name="lucide:image-off" class="h-16 w-16 text-muted-foreground" />
          <p class="text-muted-foreground">Không có hình ảnh trong chapter này</p>
        </div>
      </div>
    </main>

    <!-- Reader Footer -->
    <footer v-if="!error && currentChapter" class="sticky bottom-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div class="container mx-auto px-4 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <NuxtLink :to="'/manga/' + encodeURIComponent(manga?.id)">
              <Button variant="outline" size="sm">
                <NuxtIcon name="lucide:chevron-left" class="h-4 w-4 mr-1" />
                <span class="hidden sm:inline">Quay lại chi tiết truyện</span>
              </Button>
            </NuxtLink>
            
            <Button
              variant="outline"
              size="sm"
              @click="toggleSettings"
            >
              <NuxtIcon name="lucide:settings" class="h-4 w-4" />
              <span class="hidden sm:inline">Cài đặt</span>
            </Button>
          </div>
          
          
            
            <div v-if="readingMode === 'paged'" class="mx-4 text-sm">
              {{ currentPage + 1 }} / {{ chapterImages.length }}
            </div>

          <div class="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              class="bg-accent text-white hover:bg-accent/80 cursor-pointer"
              :disabled="currentChapterIndex <= 0"
              @click="navigateChapter(-1)"
            >
              <NuxtIcon name="lucide:chevron-left" class="h-4 w-4" />
              <span class="hidden sm:inline">Trước</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              class="bg-accent text-white hover:bg-accent/80 cursor-pointer"
              :disabled="currentChapterIndex >= chapters.length - 1"
              @click="navigateChapter(1)"
            >
              <span class="hidden sm:inline">Sau</span>
              <NuxtIcon name="lucide:chevron-right" class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>

    <!-- Settings Dialog -->
    <Dialog :open="showSettings" @update:open="showSettings = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cài đặt đọc truyện</DialogTitle>
          <DialogDescription>
            Tùy chỉnh trải nghiệm đọc truyện của bạn
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="flex items-center justify-between">
            <Label for="reading-mode">Chế độ đọc</Label>
            <Tabs v-model="readingMode" @update:model-value="updateReadingMode" class="w-40 sm:w-52 ">
              <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger class="data-[state=active]:bg-accent data-[state=active]:text-white" value="vertical">Cuộn dọc</TabsTrigger>
                <TabsTrigger class="data-[state=active]:bg-accent data-[state=active]:text-white" value="paged">Lật trang</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div class="flex items-center justify-between">
            <Label for="page-numbers">Hiển thị số trang</Label>
            <Switch 
              id="page-numbers"
              class="data-[state=checked]:bg-accent" 
              :model-value="showPageNumbers" 
              @update:model-value="showPageNumbers = $event" 
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button class="bg-accent text-white hover:bg-accent/80 cursor-pointer" @click="showSettings = false">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <CommonScrollTop/>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'


definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()

// State management
const mangaInfo = ref(null)
const manga = ref(null)
const chapters = ref([])
const currentChapter = ref(null)
const currentChapterIndex = ref(-1)
const chapterImages = ref([])
const error = ref(null)
const failedImages = ref(new Set())
const loading = ref(true)

// Reader preferences
const readingMode = ref('vertical') // 'vertical' or 'paged'
const currentPage = ref(0)
const showPageNumbers = ref(true)
const showSettings = ref(false)

// Update reading mode
const updateReadingMode = (mode) => {
  console.log('Changing reading mode to:', mode) // Add logging
  if (mode === 'vertical' || mode === 'paged') {
    readingMode.value = mode
    localStorage.setItem('manga-reader-mode', mode)
    
    // Reset page position for paged mode
    if (mode === 'paged') {
      currentPage.value = 0
    }
  } else {
    console.error('Invalid reading mode:', mode)
  }
}

// Initialize reading preferences from local storage
const initPreferences = () => {
  const savedMode = localStorage.getItem('manga-reader-mode')
  if (savedMode && (savedMode === 'vertical' || savedMode === 'paged')) {
    readingMode.value = savedMode
  } else {
    // Default to vertical and save it
    readingMode.value = 'vertical'
    localStorage.setItem('manga-reader-mode', 'vertical')
  }
  
  const savedPageNumbers = localStorage.getItem('manga-reader-page-numbers')
  if (savedPageNumbers !== null) {
    showPageNumbers.value = savedPageNumbers === 'true'
  }
}

// Toggle settings dialog
const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

// Change page in paged mode
const changePage = (direction) => {
  const newPage = currentPage.value + direction
  if (newPage >= 0 && newPage < chapterImages.value.length) {
    currentPage.value = newPage
    
    // Scroll to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// Select specific chapter from dropdown
const changeChapter = (chapterId) => {
  console.log('Changing chapter to:', chapterId) // Add logging
  const chapter = chapters.value.find(c => c.id === chapterId)
  if (chapter) {
    router.push(`/manga/${manga.value.id}/chapter/${encodeURIComponent(chapter.id)}`)
  }
}

// Get image path for chapter images
const getImagePath = (imageName) => {
  if (!manga.value || !currentChapter.value) return ''
  return `/manga/${manga.value.title}/${currentChapter.value.title}/${imageName}`
}

// Handle image loading errors
const handleImageError = (e, index) => {
  console.error('Image failed to load:', e.target.src, 'at index:', index)
  failedImages.value.add(index)
  e.target.src = '/images/help.png' // Fallback image
  
  // Show error if more than a third of images fail
  if (failedImages.value.size > chapterImages.value.length / 3) {
    error.value = 'Không thể tải nhiều hình ảnh. Vui lòng làm mới trang.'
  }
}


// Fetch manga data from manga.json
const fetchMangaInfo = async () => {
  try {
    const response = await fetch('/manga/manga.json')
    if (!response.ok) {
      throw new Error(`Không thể tải manga.json: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Validate required fields
    if (!data.manga || !Array.isArray(data.manga)) {
      throw new Error('Dữ liệu manga không hợp lệ: thiếu hoặc sai định dạng mảng manga')
    }
    
    const mangaId = route.params.id
    const foundManga = data.manga.find(m => m.id === mangaId)
    
    if (!foundManga) {
      throw new Error(`Không tìm thấy manga với ID "${mangaId}"`)
    }
    
    return foundManga
  } catch (err) {
    console.error('Lỗi khi tải thông tin manga:', err)
    error.value = err.message || 'Không thể tải thông tin manga'
    loading.value = false
    return null
  }
}

// Fetch manga and chapter data from index.json and manga.json
const fetchMangaData = async () => {
  try {
    loading.value = true
    
    // First, get manga info from manga.json
    const mangaTitle = mangaInfo.value;
    const chapterId = decodeURIComponent(route.params.chapterId)
    
    // Then, fetch the chapters information from the manga's index.json
    const response = await fetch(`/manga/${mangaTitle.title}/index.json`)
    if (!response.ok) {
      throw new Error(`Không thể tải index.json: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Validate required fields
    if (!data.title || !Array.isArray(data.chapters)) {
      throw new Error('Dữ liệu manga không hợp lệ: thiếu tiêu đề hoặc danh sách chapter')
    }
    
    // Set manga data, combining info from manga.json and index.json
    manga.value = {
      id: mangaInfo.value.id,
      title: data.title,
      cover: data.cover ? `/manga/${mangaTitle.title}/${data.cover}` : '/placeholder-manga-cover.jpg'
    }
    
    // Set chapters
    chapters.value = data.chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      number: chapter.title.match(/\d+/)?.[0] || '',
      images: chapter.chapterImages
    }))
    
    // Find current chapter
    const chapterIndex = chapters.value.findIndex(c => c.id === chapterId)
    if (chapterIndex === -1) {
      throw new Error(`Không tìm thấy chapter: ${chapterId}`)
    }
    
    currentChapterIndex.value = chapterIndex
    currentChapter.value = chapters.value[chapterIndex]
    chapterImages.value = currentChapter.value.images || []
    
    // Reset page position for paged mode
    currentPage.value = 0
    
    loading.value = false
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu manga:', err)
    error.value = err.message || 'Không thể tải thông tin manga hoặc chapter'
    loading.value = false
  }
}

// Navigate between chapters
const navigateChapter = (direction) => {
  const newIndex = currentChapterIndex.value + direction
  if (newIndex >= 0 && newIndex < chapters.value.length) {
    const nextChapter = chapters.value[newIndex]
    router.push(`/manga/${manga.value.id}/chapter/${encodeURIComponent(nextChapter.id)}`)
    
    // Scroll to top when navigating chapters
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// Add keyboard navigation
const setupKeyboardNavigation = () => {
  const handleKeyDown = (e) => {
    // Don't handle keyboard events if a dialog is open
    if (showSettings.value) return
    
    switch (e.key) {
      case 'ArrowLeft':
        if (readingMode.value === 'paged') {
          changePage(-1)
        } else if (currentChapterIndex.value > 0) {
          navigateChapter(-1)
        }
        break
      case 'ArrowRight':
        if (readingMode.value === 'paged') {
          changePage(1)
        } else if (currentChapterIndex.value < chapters.value.length - 1) {
          navigateChapter(1)
        }
        break
      case ' ': // Space bar
        if (readingMode.value === 'paged') {
          e.preventDefault() // Prevent page scroll
          changePage(1)
        }
        break
      case 's': // Toggle settings
        toggleSettings()
        break
      case 'm': // Toggle reading mode
        updateReadingMode(readingMode.value === 'vertical' ? 'paged' : 'vertical')
        break
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  // Clean up on unmount
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}

// Load data on mount
onMounted(async () => {
  try {
    initPreferences()
    setupKeyboardNavigation()
    
    error.value = null
    failedImages.value.clear()
    chapterImages.value = []
    mangaInfo.value = await fetchMangaInfo()
    await fetchMangaData()
  } catch (err) {
    console.error('Lỗi khi khởi tạo:', err)
    error.value = err.message || 'Không thể khởi tạo trình đọc manga'
    loading.value = false
  }
})

// Watch for route changes
watch(
  () => [route.params.id, route.params.chapterId],
  async () => {
    try {
      error.value = null
      failedImages.value.clear()
      chapterImages.value = []
      currentPage.value = 0
      mangaInfo.value = await fetchMangaInfo()
      await fetchMangaData()
      
      // Scroll to top on chapter change
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } catch (err) {
      console.error('Lỗi khi thay đổi route:', err)
      error.value = err.message || 'Không thể tải dữ liệu manga hoặc chapter'
      loading.value = false
    }
  }
)

// Watch showPageNumbers changes
watch(
  () => showPageNumbers.value,
  (newValue) => {
    localStorage.setItem('manga-reader-page-numbers', newValue)
  }
)
</script>