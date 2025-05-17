const fs = require('fs');
const path = require('path');

// Function to create SEO-friendly name, optimized for Vietnamese text
function createSeoName(str) {
  return str
    // Convert to lowercase for consistency
    .toLowerCase()
    // Normalize to decompose Vietnamese diacritics (e.g., "á" -> "a" + combining mark)
    .normalize('NFD')
    // Remove diacritical marks (combining characters)
    .replace(/[\u0300-\u036f]/g, '')
    // Replace Vietnamese-specific characters if needed (e.g., "đ" -> "d")
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces with a single hyphen
    .replace(/\s+/g, '-')
    // Trim leading/trailing spaces and hyphens
    .trim()
    .replace(/^-+|-+$/g, '');
}

const root = path.join(__dirname, '../public/manga');
const mangaJsonPath = path.join(__dirname, '../public/manga/manga.json');

// Initialize or load the main manga.json file
let globalMangaIndex = { manga: [] };
if (fs.existsSync(mangaJsonPath)) {
  try {
    globalMangaIndex = JSON.parse(fs.readFileSync(mangaJsonPath, 'utf8'));
  } catch (error) {
    console.error(`Error reading manga.json: ${error.message}`);
    // Initialize with empty array if file exists but is corrupted
    globalMangaIndex = { manga: [] };
  }
} else {
  // Create directory if it doesn't exist
  const mangaDir = path.dirname(mangaJsonPath);
  if (!fs.existsSync(mangaDir)) {
    fs.mkdirSync(mangaDir, { recursive: true });
  }
}

// Process each manga directory
fs.readdirSync(root).forEach((comic) => {
  const mangaDir = path.join(root, comic);
  
  if (!fs.lstatSync(mangaDir).isDirectory()) {
    return;
  }
  
  console.log(`Processing manga: ${comic}`);
  
  // Find cover image
  let coverImage = null;
  const coverFiles = fs.readdirSync(mangaDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
  if (coverFiles.length > 0) {
    coverImage = coverFiles[0];
  }
  
  // Get chapters information
  const mangaEntries = fs.readdirSync(mangaDir, { withFileTypes: true });
  const chapters = [];
  
  mangaEntries.forEach(entry => {
    if (entry.isDirectory() && entry.name !== "cover") {
      const chapterDir = path.join(mangaDir, entry.name);
      const chapterImages = fs.readdirSync(chapterDir)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      
      if (chapterImages.length > 0) {
        chapters.push({
          id: createSeoName(entry.name),
          title: entry.name,
          chapterImages: chapterImages
        });
      }
    }
  });
  
  // Sort chapters numerically
  chapters.sort((a, b) => {
    const numA = parseInt(a.title.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.title.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });
  
  // Create the manga index.json for individual manga folder
  const mangaId = createSeoName(comic);
  const coverPath = coverImage ? `/manga/${comic}/${coverImage}` : null;
  
  const mangaIndex = {
    id: mangaId,
    title: comic,
    cover: coverImage,
    chapters: chapters
  };
  
  fs.writeFileSync(
    path.join(mangaDir, "index.json"),
    JSON.stringify(mangaIndex, null, 2)
  );
  
  console.log(`Generated index.json for ${comic}`);
  
  // Update the global manga.json file
  const existingMangaIndex = globalMangaIndex.manga.findIndex(item => item.id === mangaId);
  
  if (existingMangaIndex !== -1) {
    // Update existing manga entry
    globalMangaIndex.manga[existingMangaIndex].title = comic;
    globalMangaIndex.manga[existingMangaIndex].cover = coverPath;
    // Preserve other fields that might have been set manually
  } else {
    // Add new manga entry with default values for other fields
    globalMangaIndex.manga.push({
      id: mangaId,
      title: comic,
      cover: coverPath,
      description: null,
      author: null,
      artist: null,
      status: null,
      genres: [],
      noted: null,
      lastUpdated: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    });
  }
});

// Sort the manga list alphabetically by title
globalMangaIndex.manga.sort((a, b) => a.title.localeCompare(b.title));

// Save the updated manga.json file
fs.writeFileSync(
  mangaJsonPath,
  JSON.stringify(globalMangaIndex, null, 2)
);

console.log(`Updated global manga.json with ${globalMangaIndex.manga.length} entries`);