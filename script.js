    // Весь код выполняется после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {

    // --- Глобальные константы и конфигурация ---
    const A4_WIDTH_PX = 842;
    const A4_HEIGHT_PX = 595;
    const IMAGE_URLS = {
        background: 'https://static.tildacdn.com/tild3536-3336-4837-b261-343363643766/bg.svg',
        logo: 'https://static.tildacdn.com/tild6135-6461-4964-b365-376634663433/HWS__mono_full_white.svg',
        // Исправленный и единый URL для голограммы
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

    // --- Вспомогательные функции ---

    /**
     * Предотвращает слишком частый вызов функции (например, при resize).
     * @param {Function} func Функция для вызова.
     * @param {number} delay Задержка в миллисекундах.
     * @returns {Function}
     */
    function debounce(func, delay = 250) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    /**
     * Масштабирует страницу A4, чтобы она помещалась в контейнер.
     */
    function scaleA4Page() {
        if (!a4Page || !a4Page.parentElement) return;

        const containerWidth = a4Page.parentElement.clientWidth;
        // Учитываем padding родителя (15px * 2)
        const availableWidth = containerWidth - 30;
        const scale = Math.min(1, availableWidth / A4_WIDTH_PX);
        
        a4Page.style.transform = `scale(1)`;
        // Корректируем отступ снизу, чтобы компенсировать "пустое" пространство от transform-origin
        a4Page.style.marginBottom = `0px`;
    }

    /**
     * Показывает всплывающее сообщение.
     * @param {string} message Текст сообщения.
     * @param {boolean} autoHide Скрывать ли автоматически.
     * @param {number} duration Длительность показа в мс.
     */
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

    /**
     * Обновляет текстовое содержимое сертификата на основе данных из полей ввода.
     */
    function updateCertificateContent() {
        if (dateInput && dateDisplay) {
            dateDisplay.textContent = dateInput.value;
        }
        if (studentNameInput && nameText) {
            // Устанавливаем значение по умолчанию, если поле пустое
            nameText.textContent = studentNameInput.value || "Имя ученика";
        }
        if (levelSelect && levelDisplay) {
            levelDisplay.textContent = levelSelect.value;
        }
    }

    /**
     * Экспортирует текущее состояние сертификата в PDF.
     */
    async function exportToPdf() {
        if (!a4Page) {
            showMessageBox("Ошибка: Элемент страницы для экспорта не найден.");
            return;
        }

        showMessageBox("Генерация PDF, пожалуйста, подождите...", false);

        const originalTransform = a4Page.style.transform;
        const originalMarginBottom = a4Page.style.marginBottom;

        // Временно сбрасываем масштабирование для захвата в полном разрешении
        a4Page.style.transform = 'scale(1)';
        a4Page.style.marginBottom = '0';

        try {
            // Увеличиваем масштаб рендеринга для лучшего качества в PDF
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
            // Возвращаем исходные стили после завершения
            a4Page.style.transform = originalTransform;
            a4Page.style.marginBottom = originalMarginBottom;
        }
    }

    // --- Начальная настройка и привязка событий ---

    function initializeApp() {
        // Установка изображений из констант
        backgroundImage.src = IMAGE_URLS.background;
        logoImage.src = IMAGE_URLS.logo;
        holoImage.src = IMAGE_URLS.holo;

        // Установка текущей даты по умолчанию
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];

        // Первичное обновление контента и масштабирование
        updateCertificateContent();
        scaleA4Page();

        // Добавление слушателей событий
        dateInput.addEventListener('input', updateCertificateContent);
        studentNameInput.addEventListener('input', updateCertificateContent);
        levelSelect.addEventListener('change', updateCertificateContent);
        exportPdfBtn.addEventListener('click', exportToPdf);
        window.addEventListener('resize', debounce(scaleA4Page, 150));
    }
    
    // Запуск приложения
    initializeApp();
});
