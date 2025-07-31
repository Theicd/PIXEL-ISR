/* ===== PIXELEX - ADVANCED MEDIA SEARCH ENGINE ===== */
/* מנוע חיפוש מדיה מתקדם - תמונות, ווידיאו, קולות רקע וגיפים */

// ===== GLOBAL VARIABLES =====
const PIXABAY_API_KEY = '25540812-faf2b76d586c1787d2dd02736';
let currentSearchType = 'photo';
let isSearching = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    createFuturisticBackground();
});

// ===== APP INITIALIZATION =====
function initializeApp() {
    // מחיקת זיכרון הדפדפן בעת טעינת האתר
    clearBrowserCache();
    
    // עדכון טקסט כפתור החיפוש בהתאם לבחירה
    const mediaTypeSelect = document.getElementById('mediaType');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    mediaTypeSelect.addEventListener('change', function() {
        updateSearchButtonText();
    });
    
    // הוספת event listeners
    searchBtn.addEventListener('click', startSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startSearch();
        }
    });
    
    // גלילה אוטומטית כשהמקלדת נפתחת במובייל
    searchInput.addEventListener('focus', function() {
        // בדיקה אם זה מכשיר נייד
        if (window.innerWidth <= 768) {
            // המתנה קצרה לפתיחת המקלדת
            setTimeout(function() {
                // גלילה של 200px למטה
                window.scrollBy({
                    top: 200,
                    behavior: 'smooth'
                });
                
                // וידוא שכפתור החיפוש גלוי
                searchBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });
    
    // עדכון טקסט ראשוני
    updateSearchButtonText();
}

// פונקציה למחיקת זיכרון הדפדפן
function clearBrowserCache() {
    // מחיקת כל ה-localStorage
    localStorage.clear();
    
    // מחיקת כל ה-sessionStorage
    sessionStorage.clear();
    
    // מחיקת עוגיות
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    
    console.log("נמחק זיכרון הדפדפן");
}

// ===== FUTURISTIC BACKGROUND =====
function createFuturisticBackground() {
    const bg = document.getElementById('futuristicBg');
    
    // יצירת קווי מעגל עתידניים
    for (let i = 0; i < 15; i++) {
        const line = document.createElement('div');
        line.className = 'circuit-line';
        line.style.top = Math.random() * 100 + '%';
        line.style.animationDelay = Math.random() * 8 + 's';
        line.style.animationDuration = (8 + Math.random() * 4) + 's';
        bg.appendChild(line);
    }
}

// ===== SEARCH BUTTON TEXT UPDATE =====
function updateSearchButtonText() {
    const mediaType = document.getElementById('mediaType').value;
    const searchBtn = document.getElementById('searchBtn');
    
    const buttonTexts = {
        'photo': '🚀 חפש תמונות',
        'video': '🎥 חפש ווידיאו', 
        'music': '🎵 חפש קולות רקע',
        'gif': '🎭 חפש גיפים'
    };
    
    searchBtn.textContent = buttonTexts[mediaType] || '🚀 חפש';
}

// ===== MAIN SEARCH FUNCTION =====
async function startSearch() {
    const searchInput = document.getElementById('searchInput');
    const mediaTypeSelect = document.getElementById('mediaType');
    const itemCountSelect = document.getElementById('itemCount');
    const query = searchInput.value.trim();
    const mediaType = mediaTypeSelect.value;
    const totalItems = parseInt(itemCountSelect.value);

    if (!query) {
        alert('אנא הכנס מילת חיפוש');
        return;
    }

    if (isSearching) {
        return; // מניעת חיפושים כפולים
    }

    isSearching = true;
    showLoading(mediaType);
    document.getElementById('resultsGrid').innerHTML = '';

    try {
        // תרגום הטקסט לאנגלית
        const englishQuery = await translateText(query);
        document.getElementById('hiddenTranslation').textContent = englishQuery;

        let results;
        // בחירת פונקציית חיפוש בהתאם לסוג המדיה
        switch(mediaType) {
            case 'video':
                results = await searchPixabayVideos(englishQuery, totalItems);
                break;
            default:
                results = await searchPixabayImages(englishQuery, totalItems);
        }

        displayResults(results, mediaType);

    } catch (error) {
        console.error('Search error:', error);
        const mediaTypeText = getMediaTypeText(mediaType);
        document.getElementById('resultsGrid').innerHTML = 
            `<p style="color: #ff6b6b; text-align: center;">שגיאה בחיפוש ${mediaTypeText}. אנא נסה שוב.</p>`;
    } finally {
        hideLoading();
        isSearching = false;
    }
}

// ===== TRANSLATION FUNCTION =====
async function translateText(hebrewText) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=iw&tl=en&dt=t&q=${encodeURIComponent(hebrewText)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        let translatedText = '';
        data[0].forEach(item => {
            if (item[0]) {
                translatedText += item[0];
            }
        });
        
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return hebrewText; // החזרת הטקסט המקורי במקרה של שגיאה
    }
}

// ===== PIXABAY SEARCH FUNCTIONS =====

// חיפוש תמונות
async function searchPixabayImages(query, count = 6) {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${count}&lang=en&safesearch=true`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.hits.map(img => ({
        url: img.webformatURL,
        downloadUrl: img.largeImageURL,
        thumbnail: img.previewURL,
        source: 'Pixabay',
        license: 'Pixabay License (Free)',
        licenseUrl: img.pageURL,
        author: img.user,
        tags: img.tags,
        type: 'image'
    }));
}

// חיפוש ווידיאו
async function searchPixabayVideos(query, count = 6) {
    const url = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${count}&lang=en&safesearch=true`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.hits.map(video => ({
        url: video.videos.medium.url,
        downloadUrl: video.videos.large.url,
        thumbnail: video.picture_id ? 
            `https://cdn.pixabay.com/video/${video.id}/thumbnail.jpg` : 
            video.webformatURL || 'https://via.placeholder.com/400x300?text=Video',
        source: 'Pixabay',
        license: 'Pixabay License (Free)',
        licenseUrl: video.pageURL,
        author: video.user,
        tags: video.tags,
        duration: video.duration,
        type: 'video'
    }));
}

// חיפוש קולות רקע (sound)
async function searchPixabayMusic(query, count = 6) {
    // חיפוש קולות רקע דרך Pixabay API
    // Pixabay לא תומך בחיפוש קולות רקע דרך API הרגיל
    // נחזיר הודעה מתאימה
    return [{
        url: '#',
        downloadUrl: '#',
        thumbnail: 'https://via.placeholder.com/400x300?text=🎵+Sound+Search+Coming+Soon',
        source: 'Pixabay',
        license: 'Pixabay License',
        licenseUrl: 'https://pixabay.com/service/license/',
        author: 'PIXELEX',
        tags: 'sound, audio, background',
        type: 'sound',
        message: 'חיפוש קולות רקע יהיה זמין בקרוב!'
    }];
}

// חיפוש גיפים
async function searchPixabayGifs(query, count = 6) {
    // חיפוש תמונות מונפשות (GIF) דרך Pixabay
    // חשוב להשתמש בפרמטר image_type=animation כדי לקבל רק גיפים
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=animation&per_page=${count}&lang=en&safesearch=true`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.hits && data.hits.length > 0) {
            // בדיקה שיש לנו תוצאות ושהן באמת גיפים
            const results = data.hits.map(gif => ({
                url: gif.webformatURL,
                downloadUrl: gif.largeImageURL,
                thumbnail: gif.previewURL,
                source: 'Pixabay',
                license: 'Pixabay License (Free)',
                licenseUrl: gif.pageURL,
                author: gif.user,
                tags: gif.tags,
                type: 'gif'
            }));
            
            // אם יש תוצאות, נחזיר אותן
            if (results.length > 0) {
                console.log('נמצאו גיפים:', results.length);
                return results;
            }
        }
    } catch (error) {
        console.error('Error fetching GIFs:', error);
    }
    
    // אם אין תוצאות או יש שגיאה, נחזיר הודעת ברירת מחדל
    return [{
        url: '#',
        downloadUrl: '#',
        thumbnail: 'https://via.placeholder.com/400x300?text=No+GIFs+Found',
        source: 'Pixabay',
        license: 'Pixabay License',
        licenseUrl: 'https://pixabay.com/service/license/',
        author: 'PIXELEX',
        tags: 'gif, animation',
        type: 'gif',
        message: 'לא נמצאו גיפים מתאימים. נסה מילות חיפוש אחרות.'
    }];
}

// ===== LOADING MODAL FUNCTIONS =====
function showLoading(mediaType = 'photo') {
    const modal = document.getElementById('loadingModal');
    const title = document.getElementById('loadingTitle');
    const steps = document.querySelectorAll('.loading-step');
    
    // עדכון כותרת בהתאם לסוג המדיה
    const titles = {
        'photo': '🚀 מחפש תמונות...',
        'video': '🎥 מחפש ווידיאו...'
    };
    
    title.textContent = titles[mediaType] || '🚀 מחפש...';
    
    // עדכון שלבי החיפוש
    const stepTexts = {
        'photo': [
            '🔍 מנתח את בקשת החיפוש...',
            '🌐 מחפש תמונות ב-Pixabay...',
            '📊 מעבד את התוצאות...',
            '✨ מציג את התמונות...'
        ],
        'video': [
            '🔍 מנתח את בקשת החיפוש...',
            '🎬 מחפש ווידיאו ב-Pixabay...',
            '📊 מעבד את התוצאות...',
            '✨ מציג את הווידיאו...'
        ],
        'music': [
            '🔍 מנתח את בקשת החיפוש...',
            '🎵 מחפש קולות רקע...',
            '📊 מעבד את התוצאות...',
            '✨ מציג את הקולות...'
        ],
        'gif': [
            '🔍 מנתח את בקשת החיפוש...',
            '🎭 מחפש גיפים ב-Pixabay...',
            '📊 מעבד את התוצאות...',
            '✨ מציג את הגיפים...'
        ]
    };
    
    const currentSteps = stepTexts[mediaType] || stepTexts['photo'];
    
    steps.forEach((step, index) => {
        if (currentSteps[index]) {
            step.textContent = currentSteps[index];
            step.style.display = 'block';
        } else {
            step.style.display = 'none';
        }
    });
    
    modal.style.display = 'flex';
    
    // אנימציית שלבים
    let currentStep = 0;
    const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            updateProgressBar((currentStep + 1) / steps.length * 100);
            currentStep++;
        } else {
            clearInterval(stepInterval);
        }
    }, 1000);
    
    // שמירת interval למחיקה מאוחרת
    modal.stepInterval = stepInterval;
}

function hideLoading() {
    const modal = document.getElementById('loadingModal');
    const steps = document.querySelectorAll('.loading-step');
    
    // ניקוי interval
    if (modal.stepInterval) {
        clearInterval(modal.stepInterval);
    }
    
    // איפוס שלבים
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    updateProgressBar(0);
    modal.style.display = 'none';
}

function updateProgressBar(percentage) {
    const progressBar = document.getElementById('loadingProgress');
    progressBar.style.width = percentage + '%';
}

// ===== RESULTS DISPLAY =====
function displayResults(results, mediaType) {
    const grid = document.getElementById('resultsGrid');
    
    if (results.length === 0) {
        const itemType = getMediaTypeText(mediaType);
        grid.innerHTML = `<p style="text-align: center; color: #4fc3f7;">לא נמצאו ${itemType}. נסה מילות חיפוש אחרות.</p>`;
        return;
    }

    results.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.style.animationDelay = (index * 0.1) + 's';
        
        // יצירת תוכן הכרטיס בהתאם לסוג המדיה
        switch(item.type) {
            case 'video':
                card.innerHTML = createVideoCard(item);
                break;
            default:
                card.innerHTML = createImageCard(item);
        }
        
        grid.appendChild(card);
    });
}

// ===== CARD CREATION FUNCTIONS =====
function createImageCard(item) {
    return `
        <img src="${item.url}" alt="תמונה" loading="lazy" onclick="enlargeImage('${item.url}')">
        <div class="image-info">
            <div class="image-source">מקור: ${item.source}</div>
            <div class="image-license" onclick="window.open('${item.licenseUrl}', '_blank')">${item.license}</div>
            <div class="image-actions">
                <button class="action-btn" onclick="downloadImage('${item.downloadUrl}', 'image.jpg')">📥 הורד</button>
                <button class="action-btn" onclick="shareWhatsApp('${item.url}')">📱 וואטסאפ</button>
                <button class="action-btn" onclick="copyToClipboard('${item.url}')">📋 העתק קישור</button>
                <button class="action-btn" onclick="enlargeImage('${item.url}')">🔍 הגדל</button>
            </div>
        </div>
    `;
}

function createVideoCard(item) {
    // וידוא שיש URL תקין לוידאו ולתמונה ממוזערת
    const videoUrl = item.url || '#';
    // שימוש בתמונה ממוזערת מקומית אם אין תמונה חיצונית
    const thumbnailUrl = item.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IiM0ZmMzZjciPlZpZGVvPC90ZXh0Pjwvc3ZnPg==';
    
    return `
        <div class="video-container">
            <video src="${videoUrl}" controls poster="${thumbnailUrl}" preload="metadata" playsinline>
                הדפדפן שלך לא תומך בנגן וידיאו.
            </video>
            ${item.duration ? `<div class="video-duration">${formatDuration(item.duration)}</div>` : ''}
        </div>
        <div class="image-info">
            <div class="image-source">מקור: ${item.source}</div>
            <div class="image-license" onclick="window.open('${item.licenseUrl}', '_blank')">${item.license}</div>
            <div class="image-actions">
                <button class="action-btn" onclick="downloadImage('${item.downloadUrl || '#'}', 'video.mp4')">📥 הורד</button>
                <button class="action-btn" onclick="shareWhatsApp('${videoUrl}')">📱 וואטסאפ</button>
                <button class="action-btn" onclick="copyToClipboard('${videoUrl}')">📋 העתק קישור</button>
                <button class="action-btn" onclick="window.open('${item.licenseUrl || '#'}', '_blank')">🔗 צפה במקור</button>
            </div>
        </div>
    `;
}

function createMusicCard(item) {
    return `
        <div class="music-container">
            <img src="${item.thumbnail}" alt="קולות רקע" loading="lazy">
            ${item.message ? `<div class="coming-soon">${item.message}</div>` : ''}
            ${item.url !== '#' ? `<audio src="${item.url}" controls></audio>` : ''}
        </div>
        <div class="image-info">
            <div class="image-source">מקור: ${item.source}</div>
            <div class="image-license" onclick="window.open('${item.licenseUrl}', '_blank')">${item.license}</div>
            ${item.url !== '#' ? `
            <div class="image-actions">
                <button class="action-btn" onclick="downloadImage('${item.downloadUrl}', 'sound.mp3')">📥 הורד</button>
                <button class="action-btn" onclick="shareWhatsApp('${item.url}')">📱 וואטסאפ</button>
                <button class="action-btn" onclick="copyToClipboard('${item.url}')">📋 העתק קישור</button>
            </div>` : ''}
        </div>
    `;
}

function createGifCard(item) {
    // אם יש הודעה (כמו במקרה של אין תוצאות), נציג אותה
    if (item.message) {
        return `
            <div class="image-container">
                <img src="${item.thumbnail}" alt="GIF" loading="lazy">
                <div class="coming-soon">${item.message}</div>
            </div>
            <div class="image-info">
                <div class="image-source">מקור: ${item.source}</div>
                <div class="image-license" onclick="window.open('${item.licenseUrl}', '_blank')">${item.license}</div>
            </div>
        `;
    }
    
    // אחרת, נציג את הגיף הרגיל
    return `
        <div class="image-container">
            <img src="${item.url}" alt="${item.tags}" loading="lazy" onclick="enlargeImage('${item.url}')">
        </div>
        <div class="image-info">
            <div class="image-source">מקור: ${item.source}</div>
            <div class="image-license" onclick="window.open('${item.licenseUrl}', '_blank')">${item.license}</div>
            <div class="image-actions">
                <button class="action-btn" onclick="downloadImage('${item.downloadUrl}', 'gif.gif')">📥 הורד</button>
                <button class="action-btn" onclick="shareWhatsApp('${item.url}')">📱 וואטסאפ</button>
                <button class="action-btn" onclick="copyToClipboard('${item.url}')">📋 העתק קישור</button>
                <button class="action-btn" onclick="enlargeImage('${item.url}')">🔍 הגדל</button>
            </div>
        </div>
    `;
}

// ===== UTILITY FUNCTIONS =====
function getMediaTypeText(mediaType) {
    const texts = {
        'photo': 'תמונות',
        'video': 'ווידיאו'
    };
    return texts[mediaType] || 'פריטים';
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ===== ACTION FUNCTIONS =====
function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareWhatsApp(imageUrl) {
    const message = `בדוק את התמונה הזו שמצאתי: ${imageUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('הקישור הועתק ללוח!');
    }).catch(() => {
        alert('שגיאה בהעתקת הקישור');
    });
}

function enlargeImage(imageUrl) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); display: flex; justify-content: center;
        align-items: center; z-index: 9999; cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 10px;';
    
    modal.appendChild(img);
    modal.onclick = () => document.body.removeChild(modal);
    document.body.appendChild(modal);
}

// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
