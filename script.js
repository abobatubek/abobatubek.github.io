// Конфигурация видео - загружается из файла videos.js
let videos = [];

// DOM элементы
const videoGrid = document.getElementById('videoGrid');
const searchInput = document.getElementById('searchInput');
const videoModal = document.getElementById('videoModal');
const modalTitle = document.getElementById('modalTitle');
const videoPlayer = document.getElementById('videoPlayer');
const closeModal = document.getElementById('closeModal');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadVideos().then(() => {
        renderVideos(videos);
    });
    setupEventListeners();
}); 

// Загрузка видео из конфигурационного файла
async function loadVideos() {
    try {
        const response = await fetch('videos.js');
        const text = await response.text();
        
        // Извлекаем массив видео из файла
        const match = text.match(/videos\s*=\s*(\[[\s\S]*\]);/);
        if (match) {
            const videoData = eval(match[1]);
            videos = videoData.map(video => ({
                url: video.videourl || video.url,
                title: video.videoname || video.title,
                thumbnail: generateThumbnail(video.videourl || video.url)
            }));
        }
    } catch (error) {
        console.error('Ошибка загрузки видео:', error);
        // Загружаем тестовые данные если файл не найден
        videos = [
            {
                url: "https://drive.google.com/file/d/1uc2EaWVP8Z2IEjgIiB4VR11u1mmavFyk/preview",
                title: "Все треки ShadowRaze!",
                thumbnail: "https://via.placeholder.com/320x180/ff0000/ffffff?text=Video"
            }
        ];
    }
}

// Генерация превью для Google Drive видео
function generateThumbnail(url) {
    if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (fileId) {
            return `https://drive.google.com/thumbnail?id=${fileId[1]}&sz=w320-h180`;
        }
    }
    return "https://via.placeholder.com/320x180/ff0000/ffffff?text=Video";
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const filteredVideos = videos.filter(video => 
            video.title.toLowerCase().includes(query)
        );
        renderVideos(filteredVideos);
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });

    // Мобильное меню
    menuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
}

// Отрисовка сетки видео
function renderVideos(videoList) {
    videoGrid.innerHTML = '';
    
    if (videoList.length === 0) {
        videoGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #606060;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>Видео не найдены</p>
            </div>
        `;
        return;
    }

    videoList.forEach(video => {
        const videoCard = createVideoCard(video);
        videoGrid.appendChild(videoCard);
    });
}

// Создание карточки видео
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    // Конвертируем Google Drive URL в embed URL
    const embedUrl = convertToEmbedUrl(video.url);
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
        </div>
        <div class="video-info">
            <div class="video-title">${video.title}</div>
            <div class="video-meta">
                <i class="fas fa-play"></i> Смотреть видео
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        openVideoModal(video.title, embedUrl);
    });
    
    return card;
}

// Конвертация Google Drive URL в embed URL
function convertToEmbedUrl(url) {
    if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (fileId) {
            return `https://drive.google.com/file/d/${fileId[1]}/preview`;
        }
    }
    return url;
}

// Открытие модального окна с видео
function openVideoModal(title, videoUrl) {
    modalTitle.textContent = title;
    videoPlayer.src = videoUrl;
    videoModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна
function closeVideoModal() {
    videoModal.style.display = 'none';
    videoPlayer.src = '';
    document.body.style.overflow = 'auto';
}

// Функция для обновления видео (может быть вызвана извне)
function updateVideos() {
    loadVideos().then(() => {
        renderVideos(videos);
    });
} 