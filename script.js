document.addEventListener('DOMContentLoaded', () => {

    const A4_WIDTH_PX = 842;
    const A4_HEIGHT_PX = 595;


    const IMAGE_URLS = {
        background: {
            'Pre A1': 'https://static.tildacdn.com/tild3536-3336-4837-b261-343363643766/bg.svg',
            'A1': 'https://static.tildacdn.com/tild6466-3361-4135-a563-653739613033/bg_orange.svg',
            'A1+': 'https://static.tildacdn.com/tild6466-3361-4135-a563-653739613033/bg_orange.svg',
            'A2': 'https://static.tildacdn.com/tild3636-6432-4964-a261-366131353962/bg_violet.svg',
            // Фон по умолчанию, если уровень не выбран или для него нет фона
            'default': 'https://static.tildacdn.com/tild3536-3336-4837-b261-343363643766/bg.svg'
        },
        logo: 'https://static.tildacdn.com/tild6135-6461-4964-b365-376634663433/HWS__mono_full_white.svg',
        holo: 'https://static.tildacdn.com/tild3161-6561-4931-a566-323966633562/Holo_1.png'
    };

    // --- Ссылки на DOM-элементы ---
    const a4Page = document.getElementById('a4Page');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const dateInput = document.getElementById('dateInputField');
    const studentNameInput = document.getElementById('studentNameInput');
    const levelSelect = document.getElementById('levelSelect');
    
    const dateDisplay = document.getElementById('dateDisplay');
    const nameText = document.getElementById('nameText');
    const levelDisplay = document.getElementById('levelDisplay');

    const messageBox = document.getElementById('messageBox');
    const messageBoxText = document.getElementById('messageBoxText');

    const logoImage = document.getElementById('logoImage');
    const backgroundImage = document.getElementById('backgroundImage');
    const holoImage = document.getElementById('holoImage');

    function debounce(func, delay = 250) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    function scaleA4Page() {
        if (!a4Page || !a4Page.parentElement) return;
        const containerWidth = a4Page.parentElement.clientWidth;
        const availableWidth = containerWidth - 30;
        const scale = Math.min(1, availableWidth / A4_WIDTH_PX);
        a4Page.style.transform = `scale(${scale})`;
        a4Page.style.marginBottom = `${(A4_HEIGHT_PX * scale) - A4_HEIGHT_PX}px`;
    }

    function showMessageBox(message, autoHide = true, duration = 2000) {
        if (!messageBox || !messageBoxText) {
            alert(message);
            return;
        }
        messageBoxText.textContent = message;
        messageBox.classList.remove('hidden');
        if (autoHide) {
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, duration);
        }
    }

     * Обновляет текстовое содержимое И ФОН сертификата на основе данных из полей ввода.
     */
    function updateCertificateContent() {
        if (dateInput && dateDisplay) {
            dateDisplay.textContent = dateInput.value;
        }
        if (studentNameInput && nameText) {
            nameText.textContent = studentNameInput.value || "Имя ученика";
        }
        if (levelSelect && levelDisplay) {
            const selectedLevel = levelSelect.value;
            levelDisplay.textContent = selectedLevel;

            // НОВАЯ ЛОГИКА: Обновляем фон
            // Ищем URL для выбранного уровня. Если его нет, используем URL по умолчанию.
            const newBackgroundUrl = IMAGE_URLS.background[selectedLevel] || IMAGE_URLS.background.default;
            
            // Меняем фон, только если он действительно отличается, чтобы избежать лишней загрузки
            if (backgroundImage.src !== newBackgroundUrl) {
                backgroundImage.src = newBackgroundUrl;
            }
        }
    }

    /**
     * Экспортирует текущее состояние сертификата в PDF. (без изменений)
     */
    async function exportToPdf() {
        if (!a4Page) {
            showMessageBox("Ошибка: Элемент страницы для экспорта не найден.");
            return;
        }
        showMessageBox("Генерация PDF, пожалуйста, подождите...", false);
        const originalTransform = a4Page.style.transform;
        const originalMarginBottom = a4Page.style.marginBottom;
        a4Page.style.transform = 'scale(1)';
        a4Page.style.marginBottom = '0';
        try {
            const canvas = await html2canvas(a4Page, {
                scale: 4,
                useCORS: true,
                logging: false
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [A4_WIDTH_PX, A4_HEIGHT_PX]
            });
            pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_PX, A4_HEIGHT_PX, null, 'FAST');
            pdf.save(`Сертификат_${studentNameInput.value || 'ученик'}.pdf`);
            showMessageBox("PDF успешно сгенерирован!", true, 3000);
        } catch (error) {
            console.error("Ошибка при генерации PDF:", error);
            showMessageBox(`Ошибка при генерации PDF: ${error.message}`, true, 5000);
        } finally {
            a4Page.style.transform = originalTransform;
            a4Page.style.marginBottom = originalMarginBottom;
        }
    }

    // --- Начальная настройка и привязка событий ---
    function initializeApp() {
        // Устанавливаем изображения из констант
        // ИЗМЕНЕНИЕ 3: При запуске ставим фон по умолчанию
        backgroundImage.src = IMAGE_URLS.background.default;
        logoImage.src = IMAGE_URLS.logo;
        holoImage.src = IMAGE_URLS.holo;

        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
        updateCertificateContent();
        scaleA4Page();
        dateInput.addEventListener('input', updateCertificateContent);
        studentNameInput.addEventListener('input', updateCertificateContent);
        levelSelect.addEventListener('change', updateCertificateContent);
        exportPdfBtn.addEventListener('click', exportToPdf);
        window.addEventListener('resize', debounce(scaleA4Page, 150));
    }
    
    initializeApp();
});
