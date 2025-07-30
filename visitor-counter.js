/**
 * visitor-counter.js
 * מונה מבקרים לאתר PIXEL-ISR
 * מתחיל מ-3820 ומתעדכן בכל כניסה חדשה
 */

document.addEventListener('DOMContentLoaded', function() {
    // מספר התחלתי של מבקרים
    let initialCount = 3820;
    
    // בדיקה אם יש ערך שמור ב-localStorage
    const storedCount = localStorage.getItem('visitorCount');
    let currentCount;
    
    if (storedCount) {
        // אם יש ערך שמור, נשתמש בו
        currentCount = parseInt(storedCount);
    } else {
        // אם אין ערך שמור, נשתמש במספר ההתחלתי ונוסיף 1
        currentCount = initialCount + 1;
        localStorage.setItem('visitorCount', currentCount);
    }
    
    // הצגת המספר באלמנט המתאים
    const visitorCountElement = document.getElementById('visitorCount');
    if (visitorCountElement) {
        // אנימציה קטנה למספר
        animateCounter(visitorCountElement, initialCount, currentCount);
    }
    
    // פונקציה להנפשת המספר
    function animateCounter(element, start, end) {
        let current = start;
        const increment = Math.ceil((end - start) / 20); // מהירות האנימציה
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = current;
        }, 50);
    }
    
    // עדכון המספר בכל ביקור חדש (אחרי 24 שעות)
    const lastVisit = localStorage.getItem('lastVisit');
    const now = new Date().getTime();
    
    if (!lastVisit || (now - parseInt(lastVisit)) > 24 * 60 * 60 * 1000) {
        // עדכון המספר רק אם עברו 24 שעות מהביקור האחרון
        localStorage.setItem('lastVisit', now);
        
        // הגדלת המספר ב-1
        currentCount++;
        localStorage.setItem('visitorCount', currentCount);
    }
});
