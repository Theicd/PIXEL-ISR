/**
 * visitor-counter.js
 * מונה מבקרים לאתר PIXEL-ISR
 * מתחיל מ-3820 ומתעדכן בכל כניסה חדשה
 */

document.addEventListener('DOMContentLoaded', function() {
    // מספר התחלתי של מבקרים
    const initialCount = 3820;
    
    // ניסיון לקבל את הספירה מהשרת (API מדומה)
    fetchVisitorCount()
        .then(serverCount => {
            // הצגת המספר באלמנט המתאים
            const visitorCountElement = document.getElementById('visitorCount');
            if (visitorCountElement) {
                // אנימציה קטנה למספר
                animateCounter(visitorCountElement, initialCount, serverCount);
            }
        })
        .catch(error => {
            console.error('Error fetching visitor count:', error);
            // במקרה של שגיאה, נשתמש בנתונים מקומיים
            useLocalVisitorCount();
        });
    
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
            element.textContent = current.toLocaleString('he-IL');
        }, 50);
    }
    
    // פונקציה לקבלת ספירת מבקרים מהשרת
    function fetchVisitorCount() {
        return new Promise((resolve, reject) => {
            // במקום זה יהיה קריאת API אמיתית
            // כרגע אנחנו מדמים את התהליך עם ספירה מקומית והגדלה שלה
            setTimeout(() => {
                try {
                    // בדיקה אם יש ערך שמור ב-localStorage
                    const storedCount = localStorage.getItem('visitorCount');
                    let currentCount;
                    
                    if (storedCount) {
                        // אם יש ערך שמור, נשתמש בו
                        currentCount = parseInt(storedCount);
                    } else {
                        // אם אין ערך שמור, נשתמש במספר ההתחלתי
                        currentCount = initialCount;
                    }
                    
                    // בדיקה אם זה ביקור חדש
                    const lastVisit = localStorage.getItem('lastVisit');
                    const now = new Date().getTime();
                    
                    // הגדלת המונה בכל ביקור חדש
                    if (!lastVisit || (now - parseInt(lastVisit)) > 1000 * 60 * 5) { // 5 דקות במקום 24 שעות לבדיקה מהירה
                        currentCount++;
                        localStorage.setItem('visitorCount', currentCount);
                        localStorage.setItem('lastVisit', now);
                    }
                    
                    resolve(currentCount);
                } catch (error) {
                    reject(error);
                }
            }, 500);
        });
    }
    
    // פונקציה לשימוש בספירה מקומית במקרה של שגיאה
    function useLocalVisitorCount() {
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
            visitorCountElement.textContent = currentCount.toLocaleString('he-IL');
        }
    }
});
