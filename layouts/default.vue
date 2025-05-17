<script setup lang="ts">
import { ref } from 'vue'

const fallbackImage = 'images/help.png'

useHead({
  titleTemplate: '%s - VNKeyFC Manga',
  meta: [
    {
      name: 'description',
      content: 'Đọc truyện manga yêu thích của bạn miễn phí, nhanh chóng với ứng dụng đọc truyện tiện lợi của chúng tôi.'
    },
    {
      name: 'keywords',
      content: 'manga, truyện tranh, đọc truyện online, VNKFC, manga reader'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    }
  ]
})

function onError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = fallbackImage
}

</script>

<template>
  <div class="min-h-screen text-foreground transition-colors duration-300">
    <!-- Navigation -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/75 flex items-center justify-center">
      <div class="container h-16 mx-2 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="assets/images/VNKFC-Logo.png" alt="VNKeyFC Manga" class="h-8 md:h-10" @error="onError" />
          <span class="font-bold text-lg md:text-xl hidden sm:inline-block text-accent">
            Vietnam Key FanClub - Manga
          </span>
        </NuxtLink>

        <!-- Right side actions: search, darkmode -->
        <div class="flex items-center gap-4">
          <ClientOnly>
            <CommonDarkMode />
          </ClientOnly>
          <Button variant="outline">
            <NuxtLink
            to="https://vnkeyfc.com/"
            aria-label="Trang chủ VNKFC"
            class="flex justify-center items-center">
              <NuxtIcon name="lucide:home" class="h-4 w-4 mr-2" /> Vietnam Key FanClub
            </NuxtLink>
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t mt-12 bg-background container mx-auto">
      <div class="container py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-4">Vietnam Key FanClub - Manga</h3>
            <p class="text-foreground/80">
              Vietnam Key FanClub - Manga Translation Team chủ yếu dịch các manga liên quan đến Key - hãng phát triển visual novel nổi tiếng với các tác phẩm như "Kanon", "AIR", "CLANNAD", "Little Busters!", "Rewrite", "Angel Beats!", v.v… Nhóm cũng dịch một số tác phẩm bên ngoài để công việc được phong phú hơn.
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4">Liên kết</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/#" class="text-foreground/80 hover:text-primary transition-colors">
                  Giới thiệu
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/#" class="text-foreground/80 hover:text-primary transition-colors">
                  Chính sách bảo mật
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/#" class="text-foreground/80 hover:text-primary transition-colors">
                  Điều khoản sử dụng
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4">Theo dõi chúng tôi</h3>
            <div class="flex space-x-4">
              <a href="https://facebook.com/vnkeyfc" target="_blank" rel="noopener noreferrer" class="hover:text-primary" aria-label="Facebook">
                <NuxtIcon name="lucide:facebook" class="size-6" />
              </a>
              <a href="https://twitter.com/vnkeyfc" target="_blank" rel="noopener noreferrer" class="hover:text-primary" aria-label="Twitter">
                <NuxtIcon name="lucide:twitter" class="size-6" />
              </a>
              <a href="https://discord.gg/vnkeyfc" target="_blank" rel="noopener noreferrer" class="hover:text-primary" aria-label="Discord">
                <NuxtIcon name="uil:discord" class="size-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>