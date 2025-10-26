document.addEventListener("DOMContentLoaded", () => {
    // ==================== СИСТЕМА ЛОГИРОВАНИЯ ====================
    // Создаем контейнер для логов
    const logContainer = document.createElement('div');
    logContainer.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 400px;
        height: 300px;
        background: rgba(0,0,0,0.95);
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        padding: 15px;
        overflow-y: auto;
        z-index: 9999;
        border: 2px solid #1e1e1e;
        border-radius: 10px;
        display: block;
        line-height: 1.4;
    `;
    logContainer.id = 'debug-log-container';
    document.body.appendChild(logContainer);

    // Функция для вывода логов на экран
    function showLog(message) {
        const originalConsoleLog = console.log;
        originalConsoleLog(message);
        
        const logEntry = document.createElement('div');
        logEntry.style.cssText = `
            margin-bottom: 5px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
            word-wrap: break-word;
        `;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    // Кнопка для показа/скрытия логов
    const toggleLogsBtn = document.createElement('button');
    toggleLogsBtn.textContent = '❌ Закрыть логи';
    toggleLogsBtn.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        z-index: 10000;
        padding: 10px 15px;
        background: #ff4757;
        color: white;
        border: 2px solid #ff4757;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
    `;
    toggleLogsBtn.onclick = () => {
        const isVisible = logContainer.style.display === 'block';
        logContainer.style.display = isVisible ? 'none' : 'block';
        toggleLogsBtn.textContent = isVisible ? '📋 Показать логи' : '❌ Закрыть логи';
        toggleLogsBtn.style.background = isVisible ? '#1e1e1e' : '#ff4757';
    };
    document.body.appendChild(toggleLogsBtn);

    // Индикатор статуса Telegram
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        position: fixed;
        top: 15px;
        left: 15px;
        background: #1e1e1e;
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: bold;
        z-index: 10000;
        border: 2px solid #1e1e1e;
    `;
    statusDiv.id = 'telegram-status';
    document.body.appendChild(statusDiv);

    // Переопределяем console.log для автоматического логирования
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = function(...args) {
        originalConsoleLog.apply(console, args);
        showLog('🔵 ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
    };
    
    console.error = function(...args) {
        originalConsoleError.apply(console, args);
        showLog('🔴 ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
    };

    // ==================== ОСНОВНОЙ КОД ====================
    console.log("🚀 Приложение загружено! Начинаем инициализацию...");

    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");
    const sendButton = document.getElementById("sendOrder");

    console.log("📦 Корзина из sessionStorage:", cart);
    console.log("🔍 Элементы DOM:", {
        checkoutCart: !!checkoutCart,
        totalSumDiv: !!totalSumDiv,
        sendButton: !!sendButton
    });

    const RUB_RATE = 13;
    
    // Цены доставки
    const DELIVERY_PRICES = {
        "👟 Кроссовки": {"Обычная 🚚": 2000, "Экспресс 🚀": 6500},
        "🥾 Ботинки": {"Обычная 🚚": 2100, "Экспресс 🚀": 7000},
        "🧥 Толстовки, кофты, лёгкие куртки": {"Обычная 🚚": 1500, "Экспресс 🚀": 5000},
        "👕 Футболки, шорты": {"Обычная 🚚": 1300, "Экспресс 🚀": 4500},
        "👖 Штаны, джинсы": {"Обычная 🚚": 1500, "Экспресс 🚀": 5000},
        "🧤 Зимние куртки, пальто": {"Обычная 🚚": 1700, "Экспресс 🚀": 5500},
        "🧦 Носки, майки, нижнее бельё": {"Обычная 🚚": 700, "Экспресс 🚀": 4000},
        "🕶 Очки, парфюм, украшения, часы": {"Обычная 🚚": 700, "Экспресс 🚀": 4000},
        "🧢 Головные уборы": {"Обычная 🚚": 700, "Экспресс 🚀": 4000},
        "👜 Сумки (маленькие)": {"Обычная 🚚": 1400, "Экспресс 🚀": 5000},
        "🎒 Сумки (большие)": {"Обычная 🚚": 1700, "Экспресс 🚀": 6500},
        "📦 Другое": {"Обычная 🚚": 1500, "Экспресс 🚀": 5000}
    };

    // Функция для отладки Telegram WebApp
    function debugTelegramWebApp() {
        console.log("=== 🔍 DEBUG TELEGRAM WEBAPP ===");
        console.log("Telegram object exists:", !!window.Telegram);
        console.log("WebApp object exists:", !!window.Telegram?.WebApp);
        
        if (window.Telegram?.WebApp) {
            const webApp = Telegram.WebApp;
            console.log("initData:", webApp.initData ? "✅ ЕСТЬ" : "❌ НЕТ");
            console.log("initDataUnsafe:", webApp.initDataUnsafe ? "✅ ЕСТЬ" : "❌ НЕТ");
            console.log("platform:", webApp.platform || "❌ НЕТ");
            console.log("version:", webApp.version || "❌ НЕТ");
            console.log("colorScheme:", webApp.colorScheme || "❌ НЕТ");
            console.log("isExpanded:", webApp.isExpanded);
            console.log("viewportHeight:", webApp.viewportHeight);
            console.log("MainButton available:", !!webApp.MainButton);
        }
        console.log("User Agent:", navigator.userAgent);
        
        // Проверка URL параметров
        const urlParams = new URLSearchParams(window.location.search);
        console.log("URL tgWebAppData:", urlParams.has('tgWebAppData'));
        console.log("URL tgWebAppVersion:", urlParams.has('tgWebAppVersion'));
        console.log("=== END DEBUG ===");
    }

    // СУПЕР-НАДЕЖНАЯ проверка Telegram WebApp
    const isTelegramWebApp = () => {
        // Способ 1: Проверка глобального объекта Telegram
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            
            // Проверяем различные признаки Telegram WebApp
            if (webApp.initData || webApp.initDataUnsafe || webApp.platform) {
                console.log("✅ Обнаружен Telegram WebApp по основным признакам");
                return true;
            }
            
            // Проверяем версию WebApp
            if (webApp.version) {
                console.log("✅ Обнаружен Telegram WebApp по версии:", webApp.version);
                return true;
            }
            
            // Проверяем расширенный объект
            if (webApp.colorScheme || webApp.themeParams) {
                console.log("✅ Обнаружен Telegram WebApp по themeParams");
                return true;
            }
        }
        
        // Способ 2: Проверка User Agent
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('telegram') || userAgent.includes('webapp')) {
            console.log("✅ Обнаружен Telegram WebApp по User Agent");
            return true;
        }
        
        // Способ 3: Проверка URL параметров (Telegram Mini Apps часто имеют tgWebAppData)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('tgWebAppData') || urlParams.has('tgWebAppVersion')) {
            console.log("✅ Обнаружен Telegram WebApp по URL параметрам");
            return true;
        }
        
        // Способ 4: Проверка на наличие Telegram-специфичных методов
        if (typeof window.TelegramWebviewProxy !== 'undefined') {
            console.log("✅ Обнаружен Telegram WebApp по TelegramWebviewProxy");
            return true;
        }
        
        console.log("❌ Режим: Браузер (Telegram не обнаружен)");
        return false;
    };

    // Отображаем товары в корзине
    console.log("🛒 Начинаем отображение корзины...");
    let totalRub = 0;
    checkoutCart.innerHTML = "";

    cart.forEach((item, index) => {
        const priceYuan = Number(item.price || 1);
        const priceRub = Math.ceil(priceYuan * RUB_RATE);
        const deliveryPrice = DELIVERY_PRICES[item.category]?.[item.delivery] || 2000;
        const deliveryRub = Math.ceil(deliveryPrice);
        const taxRub = Math.ceil(priceRub * 0.1);
        const itemTotalRub = Math.ceil(priceRub + deliveryRub + taxRub);
        totalRub += itemTotalRub;

        console.log(`📦 Товар ${index + 1}:`, {
            category: item.category,
            priceYuan: priceYuan,
            priceRub: priceRub,
            delivery: deliveryRub,
            total: itemTotalRub
        });

        const div = document.createElement("div");
        div.className = "checkout-item";
        div.innerHTML = `
            <div class="checkout-item-header">
                <strong>${item.category}</strong>
            </div>
            <div class="checkout-item-details">
                <div>Ссылка: ${item.link || 'не указана'}</div>
                <div>Цена: ¥${priceYuan} (₽${priceRub})</div>
                <div>Размер: ${item.size || 'не указан'}</div>
                <div>Цвет: ${item.color}</div>
                <div>Доставка: ${item.delivery} (₽${deliveryRub})</div>
                <div class="item-total">Итого: ₽${itemTotalRub}</div>
            </div>
        `;
        checkoutCart.appendChild(div);
    });

    totalSumDiv.textContent = `💰 Общая сумма: ₽${Math.ceil(totalRub).toLocaleString()}`;
    console.log("💰 Итоговая сумма:", totalRub);

    // ДЕБАГ: Проверяем что кнопка существует и на нее назначен обработчик
    console.log("🔍 Проверка кнопки отправки:");
    console.log("sendButton элемент:", sendButton);
    console.log("sendButton текст:", sendButton.textContent);
    console.log("sendButton onclick до:", sendButton.onclick);

    // Ждем немного для инициализации Telegram WebApp (иногда он грузится с задержкой)
    setTimeout(() => {
        console.log("🔍 Окончательная проверка окружения:");
        
        const isTelegram = isTelegramWebApp();
        console.log("🏁 ФИНАЛЬНЫЙ РЕЖИМ:", isTelegram ? "TELEGRAM" : "BROWSER");

        // Обновляем индикатор статуса
        const statusElement = document.getElementById('telegram-status');
        if (isTelegram) {
            statusElement.textContent = '✅ Telegram Mode';
            statusElement.style.background = '#1e1e1e';
            statusElement.style.borderColor = '#1e1e1e';
        } else {
            statusElement.textContent = '❌ Browser Mode';
            statusElement.style.background = '#ff4757';
            statusElement.style.borderColor = '#ff4757';
        }

        // Вызываем отладку
        debugTelegramWebApp();

        // Показываем соответствующий интерфейс
        if (isTelegram) {
            setupTelegramMode();
        } else {
            setupBrowserMode();
        }
    }, 100);

    function setupTelegramMode() {
        console.log("🟢 НАСТРОЙКА РЕЖИМА: Telegram WebApp");
        sendButton.textContent = "📦 Отправить заказ в Telegram";
        
        // Инициализируем Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                Telegram.WebApp.ready();
                Telegram.WebApp.expand(); // Раскрываем на весь экран
                console.log("✅ Telegram WebApp инициализирован");
                
                // Показываем основную кнопку Telegram
                Telegram.WebApp.MainButton.setText("📦 ОТПРАВИТЬ ЗАКАЗ");
                Telegram.WebApp.MainButton.show();
                Telegram.WebApp.MainButton.onClick(handleTelegramSubmit);
                
                // Скрываем нашу кнопку, используем Telegram кнопку
                sendButton.style.display = 'none';
                console.log("✅ MainButton Telegram активирована");
                
            } catch (error) {
                console.error("❌ Ошибка инициализации Telegram:", error);
                // Если Telegram кнопка не работает, оставляем нашу
                sendButton.style.display = 'block';
                sendButton.onclick = handleTelegramSubmit;
                console.log("🔄 Используем стандартную кнопку");
            }
        } else {
            console.error("❌ Telegram WebApp не доступен");
            sendButton.onclick = handleTelegramSubmit;
        }

        // Двойная проверка обработчика
        console.log("sendButton onclick после:", sendButton.onclick);
        console.log("sendButton display:", sendButton.style.display);
    }

    function setupBrowserMode() {
        console.log("🟡 НАСТРОЙКА РЕЖИМА: Браузер");
        sendButton.textContent = "📋 Показать инструкцию";
        
        sendButton.onclick = handleBrowserSubmit;
        console.log("✅ Обработчик установлен для браузера");
    }

    // ДОБАВЛЯЕМ ОБРАБОТЧИКИ ДЛЯ ДЕБАГА
    console.log("🎯 Устанавливаем обработчики для дебага...");

    // Обработчик для ВСЕХ кликов на кнопки
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
            console.log("🚨 КЛИК НА ЛЮБУЮ КНОПКУ:", {
                text: button.textContent,
                id: button.id,
                class: button.className
            });
        }
    });

    // Специальный обработчик для кнопки отправки
    const originalOnClick = sendButton.onclick;
    sendButton.onclick = function(e) {
        console.log("🎯 КНОПКА ОТПРАВКИ НАЖАТА! Событие:", e);
        console.log("🔍 Информация о кнопке:", {
            id: this.id,
            text: this.textContent,
            disabled: this.disabled
        });
        
        if (originalOnClick) {
            console.log("🔄 Вызываем оригинальный обработчик");
            originalOnClick.call(this, e);
        } else {
            console.log("❌ Нет оригинального обработчика! Вызываем handleTelegramSubmit напрямую");
            handleTelegramSubmit();
        }
    };

    // Дублируем через addEventListener для надежности
    sendButton.addEventListener('click', function(e) {
        console.log("🎯 addEventListener: Кнопка отправки нажата!");
    }, true);

    console.log("✅ Обработчики установлены");

    async function handleTelegramSubmit() {
        console.log("🟡 1. НАЧАЛО ОТПРАВКИ ЗАКАЗА - КНОПКА НАЖАТА");
        
        // Принудительно показываем логи
        const logContainer = document.getElementById('debug-log-container');
        if (logContainer) {
            logContainer.style.display = 'block';
        }
        
        const formData = getFormData();
        console.log("🟡 2. Данные формы:", formData);
        
        if (!formData.valid) {
            console.log("🔴 3. Форма не валидна - ПРЕРЫВАЕМ");
            return;
        }
        
        console.log("🟢 4. Форма валидна, готовим данные");

        // Добавляем расчет доставки в рублях для каждого товара
        const itemsWithDelivery = cart.map(item => {
            const deliveryPrice = DELIVERY_PRICES[item.category]?.[item.delivery] || 2000;
            return {
                ...item,
                delivery_rub: deliveryPrice
            };
        });

        const orderData = {
            items: itemsWithDelivery,
            total: totalRub,
            user: formData.user,
            timestamp: new Date().toISOString(),
            source: 'telegram'
        };

        console.log("📦 5. Данные для отправки:", orderData);

        try {
            console.log("🟡 6. Показываем индикатор загрузки");
            
            // Показываем индикатор загрузки
            if (Telegram.WebApp.MainButton && Telegram.WebApp.MainButton.isVisible) {
                Telegram.WebApp.MainButton.showProgress();
                console.log("✅ MainButton progress показан");
            } else {
                sendButton.disabled = true;
                sendButton.textContent = "Отправка...";
                console.log("✅ Стандартная кнопка обновлена");
            }

            // Проверяем, что Telegram WebApp доступен
            if (!window.Telegram?.WebApp) {
                throw new Error("Telegram WebApp не доступен");
            }

            console.log("🟡 7. Проверяем initData:", Telegram.WebApp.initData ? "✅ ЕСТЬ" : "❌ НЕТ");

            console.log("🔵 8. Пытаемся отправить через Telegram WebApp...");
            
            // Отправляем данные
            Telegram.WebApp.sendData(JSON.stringify(orderData));
            
            console.log("✅ 9. Данные отправлены в Telegram");
            showSuccess("✅ Заказ успешно отправлен!");
            
            // Даем время увидеть сообщение об успехе
            setTimeout(() => {
                console.log("🔵 10. Закрываем приложение");
                if (window.Telegram?.WebApp?.close) {
                    Telegram.WebApp.close();
                }
            }, 1500);

        } catch (error) {
            console.error("❌ 11. ОШИБКА ОТПРАВКИ В TELEGRAM:", error);
            
            // Показываем детальную ошибку
            let errorMessage = "❌ Ошибка отправки. ";
            if (error.message.includes("initData")) {
                errorMessage += "Попробуйте перезагрузить приложение.";
            } else {
                errorMessage += "Попробуйте еще раз.";
            }
            
            showError(errorMessage);
            
            // Восстанавливаем кнопку
            if (Telegram.WebApp.MainButton && Telegram.WebApp.MainButton.isVisible) {
                Telegram.WebApp.MainButton.hideProgress();
                console.log("✅ MainButton progress скрыт");
            } else {
                sendButton.disabled = false;
                sendButton.textContent = "📦 Отправить заказ в Telegram";
                console.log("✅ Стандартная кнопка восстановлена");
            }
        }
    }

    function handleBrowserSubmit() {
        console.log("🟡 Обработчик браузера вызван");
        const formData = getFormData();
        if (!formData.valid) return;

        // Добавляем расчет доставки в рублях для каждого товара
        const itemsWithDelivery = cart.map(item => {
            const deliveryPrice = DELIVERY_PRICES[item.category]?.[item.delivery] || 2000;
            return {
                ...item,
                delivery_rub: deliveryPrice
            };
        });

        const orderData = {
            items: itemsWithDelivery,
            total: totalRub,
            user: formData.user,
            timestamp: new Date().toLocaleString(),
            source: 'browser'
        };

        showBrowserInstruction(orderData);
    }

    function getFormData() {
        console.log("🔍 ПРОВЕРКА ПОЛЕЙ ФОРМЫ:");
        
        const fullname = document.getElementById("fullname")?.value.trim() || "";
        const phone = document.getElementById("phone")?.value.trim() || "";
        const city = document.getElementById("city")?.value.trim() || "";
        const address = document.getElementById("address")?.value.trim() || "";

        console.log("ФИО:", fullname);
        console.log("Телефон:", phone);
        console.log("Город:", city);
        console.log("Адрес:", address);
        console.log("Корзина:", cart.length, "товаров");

        if (!fullname || !phone || !city || !address) {
            console.log("🔴 Не все поля заполнены!");
            showError("Пожалуйста, заполните все поля формы!");
            return { valid: false };
        }

        if (cart.length === 0) {
            console.log("🔴 Корзина пуста!");
            showError("Корзина пуста! Добавьте товары перед оформлением заказа.");
            return { valid: false };
        }

        console.log("🟢 Все проверки пройдены");
        return {
            valid: true,
            user: { fullname, phone, city, address }
        };
    }

    function showBrowserInstruction(orderData) {
        console.log("🟡 Показываем инструкцию для браузера");
        const orderText = formatOrderForManual(orderData);
        
        const instructionHTML = `
            <div class="browser-instruction" style="background: #1e1e1e; border: 2px solid #1e1e1e; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #ffffffff; margin-bottom: 15px;">❌ Открывайте в Telegram!</h3>
                
                <div class="instruction-steps" style="background: #1e1e1e; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                    <p style="margin-bottom: 10px;"><strong>Для оформления заказа:</strong></p>
                    <ol style="margin-left: 20px;">
                        <li style="margin-bottom: 8px;">Откройте Telegram</li>
                        <li style="margin-bottom: 8px;">Найдите бота: <strong>@av_drops_bot</strong></li>
                        <li style="margin-bottom: 8px;">Нажмите <strong>"🛒 Открыть магазин"</strong></li>
                        <li style="margin-bottom: 8px;">Добавьте товары и оформите заказ</li>
                    </ol>
                </div>

                <div class="order-summary" style="background: #1e1e1e; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                    <strong>Ваш заказ для ручной отправки:</strong>
                    <div class="order-text" style="font-family: monospace; font-size: 12px; background: #1e1e1e; padding: 10px; border-radius: 5px; margin: 10px 0; cursor: pointer; border: 1px solid #1e1e1e; white-space: pre-wrap;"
                         onclick="copyOrderText(this)">
                        ${orderText}
                    </div>
                    <small style="color: #ffffffff;">💡 Нажмите на текст чтобы скопировать</small>
                </div>

                <div class="contact-info" style="margin-top: 15px;">
                    <p style="margin-bottom: 10px;">Или отправьте этот текст менеджеру:</p>
                    <a href="https://t.me/av_manage" target="_blank" class="manager-link" 
                       style="display: inline-block; background: #1e1e1e; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none;">
                        📩 Написать менеджеру
                    </a>
                </div>

                <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #1e1e1e; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Новый заказ
                </button>
            </div>
        `;

        // Заменяем основной контент
        const mainContent = document.querySelector("main") || document.querySelector(".container") || document.body;
        mainContent.innerHTML = instructionHTML;
    }

    function formatOrderForManual(orderData) {
        const user = orderData.user;
        const items = orderData.items;
        
        let message = `🛒 НОВЫЙ ЗАКАЗ ИЗ БРАУЗЕРА\n\n`;
        message += `👤 Клиент: ${user.fullname}\n`;
        message += `📞 Телефон: ${user.phone}\n`;
        message += `🏠 Адрес: ${user.city}, ${user.address}\n\n`;
        
        message += `📦 ТОВАРЫ:\n`;
        
        const RUB_RATE = 13;
        
        items.forEach((item, index) => {
            const priceYuan = Number(item.price || 1);
            const priceRub = Math.ceil(priceYuan * RUB_RATE);
            const deliveryPrice = DELIVERY_PRICES[item.category]?.[item.delivery] || 2000;
            const deliveryRub = Math.ceil(deliveryPrice);
            const taxRub = Math.ceil(priceRub * 0.1);
            
            message += `${index + 1}. ${item.category}\n`;
            message += `   💰 Цена товара: ¥${item.price}\n`;
            message += `   🚚 Стоимость доставки: ¥${Math.ceil(deliveryPrice / RUB_RATE)}\n`;
            message += `   💰 Комиссия: ¥${Math.ceil(taxRub / RUB_RATE)}\n`;
            message += `   📏 Размер: ${item.size}\n`;
            message += `   🎨 Цвет: ${item.color}\n`;
            message += `   🚚 Доставка: ${item.delivery}\n`;
            message += `   🔗 Ссылка: ${item.link}\n\n`;
        });
        
        message += `💰 Общая сумма: ₽${orderData.total.toLocaleString()}\n`;
        message += `⏰ Время: ${new Date().toLocaleString()}\n`;
        message += `🌐 Источник: Браузер`;
        
        return message;
    }

    function showError(message) {
        console.error("❌ Показываем ошибку:", message);
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-weight: 500;
            max-width: 90%;
            text-align: center;
            animation: slideDown 0.3s ease;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    function showSuccess(message) {
        console.log("✅ Показываем успех:", message);
        const successDiv = document.createElement("div");
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e1e1e;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-weight: 500;
            max-width: 90%;
            text-align: center;
            animation: slideDown 0.3s ease;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }

    // Глобальная функция для копирования текста
    window.copyOrderText = function(element) {
        const text = element.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showSuccess("✅ Текст заказа скопирован!");
        }).catch(() => {
            // Fallback для старых браузеров
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            showSuccess("✅ Текст заказа скопирован!");
        });
    };

    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .order-text:hover {
            background: #1e1e1e !important;
        }
        
        /* Стили для контейнера логов */
        #debug-log-container::-webkit-scrollbar {
            width: 8px;
        }
        #debug-log-container::-webkit-scrollbar-track {
            background: #1a1a1a;
        }
        #debug-log-container::-webkit-scrollbar-thumb {
            background: #1e1e1e;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    console.log("✅ ВСЕ СИСТЕМЫ ЗАПУЩЕНЫ!");
    console.log("💡 Логи открыты автоматически. Нажмите '❌ Закрыть логи' чтобы скрыть");
});