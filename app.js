import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    const dateNavContainer = document.getElementById('date-nav');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const menuContainer = document.getElementById('menu-container');
    const btnLeft = document.getElementById('scroll-left');
    const btnRight = document.getElementById('scroll-right');

    // Number of days to show in the date selector (e.g. 7 days before, 7 days after)
    const DAYS_BEFORE = 3;
    const DAYS_AFTER = 10;
    
    // Format date objects to strings like YYYY-MM-DD
    function formatDateToString(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Format date string for display (e.g., 20 Mayıs Pazartesi)
    function formatDateForDisplay(dateString) {
        const d = new Date(dateString);
        return d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    // Generate date navigation elements
    function generateDateNav() {
        const today = new Date();
        // Reset Time to midnight for clean calculations
        today.setHours(0,0,0,0);
        
        let initialLoadDateStr = formatDateToString(today);

        // Calculate start date
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - DAYS_BEFORE);

        for (let i = 0; i <= (DAYS_BEFORE + DAYS_AFTER); i++) {
            const currentIterDate = new Date(startDate);
            currentIterDate.setDate(startDate.getDate() + i);
            
            const dateStr = formatDateToString(currentIterDate);
            const displayDay = currentIterDate.toLocaleDateString('tr-TR', { day: 'numeric' });
            const displayMonth = currentIterDate.toLocaleDateString('tr-TR', { month: 'short' });
            const displayWeekday = currentIterDate.toLocaleDateString('tr-TR', { weekday: 'short' });

            const item = document.createElement('div');
            item.className = `date-item flex flex-col items-center justify-center p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200/80 hover:bg-white hover:shadow-md transition-all duration-300 text-gray-600 shrink-0 select-none snap-center relative overflow-hidden`;
            item.dataset.date = dateStr;
            
            item.innerHTML = `
                <span class="text-[10px] font-bold uppercase tracking-widest text-brand-bold opacity-80 mb-0.5">${displayMonth}</span>
                <span class="text-2xl font-black my-0.5 text-gray-800 day-number tracking-tighter">${displayDay}</span>
                <span class="text-xs font-medium tracking-wide">${displayWeekday}</span>
            `;

            // If it's today's date, mark as active initially
            if (dateStr === initialLoadDateStr) {
                item.classList.add('active');
            }

            item.addEventListener('click', () => {
                // Remove active from all
                document.querySelectorAll('.date-item').forEach(el => {
                    el.classList.remove('active');
                    // Reset internal text colors
                    el.querySelector('.day-number').classList.remove('text-white');
                    el.querySelector('.day-number').classList.add('text-gray-800');
                });
                
                // Add active to clicked
                item.classList.add('active');
                item.querySelector('.day-number').classList.remove('text-gray-800');
                item.querySelector('.day-number').classList.add('text-white');
                
                // Load Menu
                loadMenuForDate(dateStr);
            });

            dateNavContainer.appendChild(item);
        }

        // Initially load today's menu
        loadMenuForDate(initialLoadDateStr);
        
        // Scroll to active item on init
        setTimeout(() => {
            const activeEl = document.querySelector('.date-item.active');
            if(activeEl) {
                // Calculate scroll position to center the active element somewhat
                const containerHalfWidth = dateNavContainer.clientWidth / 2;
                const elLeft = activeEl.offsetLeft;
                const elHalfWidth = activeEl.clientWidth / 2;
                
                dateNavContainer.scrollTo({
                    left: elLeft - containerHalfWidth + elHalfWidth,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }

    async function loadMenuForDate(dateStr) {
        selectedDateDisplay.textContent = formatDateForDisplay(dateStr) + " Menüsü";
        
        menuContainer.innerHTML = `
            <div class="col-span-full flex justify-center py-12" id="loading-spinner">
                <svg class="animate-spin h-8 w-8 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        `;

        try {
            const docRef = doc(db, "menus", dateStr);
            const docSnap = await getDoc(docRef);

            menuContainer.innerHTML = ''; // Clear loading

            if (docSnap.exists()) {
                const data = docSnap.data();
                renderMenu(data);
            } else {
                // No menu for this date
                menuContainer.innerHTML = `
                    <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <h3 class="text-xl font-medium text-gray-600 mb-1">Menü Bulunamadı</h3>
                        <p class="text-gray-400">Bu tarihe ait henüz bir menü girişi yapılmamış.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error fetching menu:", error);
            menuContainer.innerHTML = `
                <div class="col-span-full text-center text-red-500 py-10 bg-red-50 rounded-xl">
                    Menü yüklenirken bir bağlantı hatası oluştu.
                </div>
            `;
        }
    }

    function renderMenu(menuData) {
        // Appending to menuContainer. We'll use nice modern cards.
        
        const categories = [
            { id: 'corba', title: 'Çorba', icon: '🍲', color: 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 border border-blue-200/50', val: menuData.corba },
            { id: 'anaYemek', title: 'Ana Yemek', icon: '🍽️', color: 'bg-gradient-to-br from-red-100 to-red-50 text-red-600 border border-red-200/50', val: menuData.anaYemek },
            { id: 'yanYemek', title: 'Yan Yemek', icon: '🍚', color: 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 border border-indigo-200/50', val: menuData.yanYemek },
            { id: 'garnitur', title: 'Garnitür / İçecek', icon: '🥗', color: 'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-200/50', val: menuData.garnitur }
        ];

        categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = `flex flex-col p-6 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:bg-white/80 transition-all duration-500 group relative overflow-hidden`;
            
            card.innerHTML = `
                <!-- Decorative background bloom -->
                <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${cat.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500"></div>
                
                <div class="flex items-center gap-5 relative z-10 w-full">
                    <div class="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${cat.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        ${cat.icon}
                    </div>
                    <div class="flex flex-col justify-center flex-1 min-w-0">
                        <h4 class="text-[11px] font-extrabold text-brand uppercase tracking-[0.2em] mb-1 drop-shadow-sm">${cat.title}</h4>
                        <p class="text-xl sm:text-2xl font-black text-gray-800 leading-tight capitalize tracking-tight truncate whitespace-normal break-words">${cat.val}</p>
                    </div>
                </div>
            `;
            
            menuContainer.appendChild(card);
        });
    }

    // Initialize
    generateDateNav();

    // Scroll Handlers
    if (btnLeft && btnRight) {
        btnLeft.addEventListener('click', () => {
            dateNavContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
        btnRight.addEventListener('click', () => {
            dateNavContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
});
