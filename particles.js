/**
 * particles.js
 * קובץ זה מוסיף אנימציית חלקיקים תלת-מימדיים לרקע האתר
 * יוצר אפקט של עומק ותנועה ברקע
 */

// יצירת החלקיקים כשהעמוד נטען
document.addEventListener('DOMContentLoaded', function() {
    // יצירת חלקיקים
    createParticles();
    
    // הוספת מאזין לשינוי גודל החלון
    window.addEventListener('resize', function() {
        // מחיקת החלקיקים הקיימים
        const container = document.getElementById('particles');
        container.innerHTML = '';
        
        // יצירת חלקיקים חדשים
        createParticles();
    });
});

/**
 * יוצר את החלקיקים ומוסיף אותם למסמך
 */
function createParticles() {
    const container = document.getElementById('particles');
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    // בדיקה אם המכשיר הוא מובייל
    if (window.innerWidth <= 768) {
        // במובייל נוסיף פחות חלקיקים
        particleCount = 30;
    } else {
        // במחשב נוסיף יותר חלקיקים
        particleCount = 60;
    }
    
    // יצירת החלקיקים
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // הגדרת מיקום אקראי
        const posX = Math.random() * 100; // אחוז מרוחב המסך
        const posY = Math.random() * headerHeight; // בתוך גובה הכותרת
        
        // הגדרת גודל אקראי
        const size = Math.random() * 3 + 1; // בין 1 ל-4 פיקסלים
        
        // הגדרת שקיפות אקראית
        const opacity = Math.random() * 0.5 + 0.1; // בין 0.1 ל-0.6
        
        // הגדרת צבע אקראי
        const colors = ['#ffffff', '#00a2ff', '#ff00aa', '#00ff9e'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // הגדרת מהירות אקראית
        const duration = Math.random() * 20 + 10; // בין 10 ל-30 שניות
        const delay = Math.random() * 5; // בין 0 ל-5 שניות
        
        // הגדרת סגנון החלקיק
        particle.style.left = posX + '%';
        particle.style.top = posY + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.opacity = opacity;
        particle.style.backgroundColor = color;
        
        // הגדרת אנימציה
        particle.style.animation = `floatParticle ${duration}s linear ${delay}s infinite`;
        
        // הוספת החלקיק למיכל
        container.appendChild(particle);
    }
}

// הגדרת אנימציית CSS לחלקיקים
const style = document.createElement('style');
style.textContent = `
@keyframes floatParticle {
    0% {
        transform: translateY(0) translateX(0) rotate(0deg);
    }
    25% {
        transform: translateY(-20px) translateX(10px) rotate(90deg);
    }
    50% {
        transform: translateY(-40px) translateX(-10px) rotate(180deg);
    }
    75% {
        transform: translateY(-60px) translateX(15px) rotate(270deg);
    }
    100% {
        transform: translateY(-100px) translateX(0) rotate(360deg);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);
