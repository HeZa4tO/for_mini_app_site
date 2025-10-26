document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Приложение загружено! Начинаем инициализацию...");

    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");
    
    // НАДЕЖНЫЙ ПОИСК КНОПКИ
    let sendButton = document.getElementById("sendOrder");
    if (!sendButton) {
        console.warn("❌ Кнопка не найдена по ID, ищем по тексту...");
        sendButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Отправить') || 
            btn.textContent.includes('Оформить') ||
            btn.textContent.includes('заказ')
        );
    }

    console.log("🔍 Элементы DOM:", {
        checkoutCart: !!checkoutCart,
        totalSumDiv: !!totalSumDiv,
        sendButton: !!sendButton
    });

    if (!sendButton) {
        console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: Кнопка отправки не найдена!");
        return;
    }

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

    // УЛУЧШЕННАЯ проверка Telegram WebApp
    const isTelegramWebApp = () => {
        console.log("🔍 Проверка Telegram WebApp...");
        
        // Основная проверка
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            console.log("📱 Telegram WebApp обнаружен:", {
                initData: !!webApp.initData,
                initDataUnsafe: !!webApp.initDataUnsafe,
                platform: webApp.platform,
                version: webApp.version
            });
            
            // Если есть initData или platform - это точно Telegram
            if (webApp.initData || webApp.platform) {
                console.log("✅ Telegram WebApp подтвержден");
                return true;
            }
        }
        
        // Дополнительные проверки
        const userAgent = navigator.userAgent.toLowerCase();
        const isTelegramUserAgent = userAgent.includes('telegram') || userAgent.includes('webapp');
        
        const urlParams = new URLSearchParams(window.location.search);
        const hasTelegramParams = urlParams.has('tgWebAppData') || urlParams.has('tgWebAppVersion');
        
        console.log("📱 Дополнительные проверки:", {
            userAgent: isTelegramUserAgent,
            urlParams: hasTelegramParams
        });
        
        return isTelegramUserAgent || hasTelegramParams;
    };

    // Отображаем товары в корзине
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

    // Инициализация обработчиков
    setTimeout(() => {
        const isTelegram = isTelegramWebApp();
        console.log("🏁 ФИНАЛЬНЫЙ РЕЖИМ:", isTelegram ? "TELEGRAM" : "BROWSER");

        if (isTelegram) {
            console.log("🟢 Запускаем Telegram режим");
            setupTelegramMode();
        } else {
            console.log("🟡 Запускаем Browser режим");
            setupBrowserMode();
        }
    }, 100);

    function setupTelegramMode() {
        console.log("🟢 Настройка Telegram режима");
        
        // Обязательно показываем нашу кнопку
        sendButton.style.display = 'block';
        sendButton.textContent = "📦 Отправить заказ в Telegram";
        
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                console.log("🔧 Инициализация Telegram WebApp...");
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();
                
                console.log("✅ Telegram WebApp инициализирован");
                
                // Пробуем использовать MainButton, но не скрываем нашу кнопку
                try {
                    Telegram.WebApp.MainButton.setText("📦 ОТПРАВИТЬ ЗАКАЗ");
                    Telegram.WebApp.MainButton.show();
                    Telegram.WebApp.MainButton.onClick(handleTelegramSubmit);
                    console.log("✅ MainButton активирована");
                } catch (mainButtonError) {
                    console.warn("⚠️ MainButton не работает:", mainButtonError);
                }
                
            } catch (error) {
                console.error("❌ Ошибка инициализации Telegram:", error);
            }
        }
        
        // ВСЕГДА устанавливаем обработчик на нашу кнопку
        setupButtonHandler(handleTelegramSubmit);
    }

    function setupBrowserMode() {
        console.log("🟡 Настройка Browser режима");
        sendButton.textContent = "📋 Показать инструкцию";
        setupButtonHandler(handleBrowserSubmit);
    }

    // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ НАСТРОЙКИ ОБРАБОТЧИКА
    function setupButtonHandler(handler) {
        console.log("🔧 Установка обработчика на кнопку...");
        
        // Очищаем все старые обработчики
        sendButton.onclick = null;
        
        // Удаляем все event listeners
        const newButton = sendButton.cloneNode(true);
        sendButton.parentNode.replaceChild(newButton, sendButton);
        sendButton = newButton;

        // Устанавливаем новые обработчики
        sendButton.onclick = function(e) {
            console.log("🎯 КНОПКА НАЖАТА!");
            e.preventDefault();
            e.stopPropagation();
            handler.call(this, e);
        };
        
        // Дублируем через addEventListener
        sendButton.addEventListener('click', function(e) {
            console.log("🎯 addEventListener: Кнопка нажата!");
            e.preventDefault();
            e.stopPropagation();
            handler.call(this, e);
        }, true);
        
        // Снимаем возможные блокировки
        sendButton.disabled = false;
        sendButton.style.pointerEvents = 'auto';
        sendButton.style.opacity = '1';
        sendButton.style.display = 'block';

        console.log("✅ Обработчик установлен на кнопку:", sendButton.textContent);
    }

    async function handleTelegramSubmit() {
        console.log("🟡 НАЧАЛО ОТПРАВКИ В TELEGRAM");
        
        const formData = getFormData();
        if (!formData.valid) {
            console.log("🔴 Форма не валидна");
            return;
        }

        console.log("🟢 Форма валидна, готовим данные...");

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

        console.log("📦 Данные для отправки:", orderData);

        try {
            console.log("🔄 Показываем индикатор загрузки...");
            sendButton.disabled = true;
            sendButton.textContent = "Отправка...";

            if (!window.Telegram?.WebApp) {
                throw new Error("Telegram WebApp не доступен");
            }

            console.log("📤 Отправляем данные через Telegram WebApp...");
            Telegram.WebApp.sendData(JSON.stringify(orderData));
            
            console.log("✅ Данные отправлены!");
            showSuccess("✅ Заказ успешно отправлен!");
            
            setTimeout(() => {
                console.log("🔒 Закрываем приложение...");
                if (window.Telegram?.WebApp?.close) {
                    Telegram.WebApp.close();
                }
            }, 2000);

        } catch (error) {
            console.error("❌ ОШИБКА ОТПРАВКИ:", error);
            
            showError("❌ Ошибка отправки. Попробуйте еще раз.");
            
            sendButton.disabled = false;
            sendButton.textContent = "📦 Отправить заказ в Telegram";
        }
    }

    function handleBrowserSubmit() {
        console.log("🟡 Обработчик браузера вызван");
        const formData = getFormData();
        if (!formData.valid) return;

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
        console.log("🔍 Проверка полей формы...");
        
        const fullname = document.getElementById("fullname")?.value.trim() || "";
        const phone = document.getElementById("phone")?.value.trim() || "";
        const city = document.getElementById("city")?.value.trim() || "";
        const address = document.getElementById("address")?.value.trim() || "";

        console.log("📝 Данные формы:", { fullname, phone, city, address });

        if (!fullname || !phone || !city || !address) {
            showError("Пожалуйста, заполните все поля формы!");
            return { valid: false };
        }

        if (cart.length === 0) {
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
            <div class="browser-instruction" style="
                max-width: 500px;
                margin: 20px auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                color: white;
                font-family: 'Segoe UI', system-ui, sans-serif;
            ">
                <!-- Заголовок -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📱</div>
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Откройте в Telegram</h2>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Для быстрого оформления заказа</p>
                </div>

                <!-- Шаги -->
                <div style="
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 25px;
                    margin-bottom: 25px;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid rgba(255,255,255,0.2);
                    ">
                        <div style="font-size: 24px; margin-right: 15px;">👆</div>
                        <div>
                            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">4 простых шага</h3>
                            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">и ваш заказ готов!</p>
                        </div>
                    </div>

                    <div style="display: grid; gap: 15px;">
                        <div style="display: flex; align-items: flex-start; gap: 15px;">
                            <div style="
                                background: rgba(255,255,255,0.2);
                                border-radius: 50%;
                                width: 30px;
                                height: 30px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: bold;
                                font-size: 14px;
                                flex-shrink: 0;
                            ">1</div>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 2px;">Откройте Telegram</div>
                                <div style="font-size: 14px; opacity: 0.9;">Запустите приложение Telegram на вашем устройстве</div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: flex-start; gap: 15px;">
                            <div style="
                                background: rgba(255,255,255,0.2);
                                border-radius: 50%;
                                width: 30px;
                                height: 30px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: bold;
                                font-size: 14px;
                                flex-shrink: 0;
                            ">2</div>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 2px;">Найдите нашего бота</div>
                                <div style="font-size: 14px; opacity: 0.9;">В поиске введите: <strong style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 6px; font-family: monospace;">@av_drops_bot</strong></div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: flex-start; gap: 15px;">
                            <div style="
                                background: rgba(255,255,255,0.2);
                                border-radius: 50%;
                                width: 30px;
                                height: 30px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: bold;
                                font-size: 14px;
                                flex-shrink: 0;
                            ">3</div>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 2px;">Откройте магазин</div>
                                <div style="font-size: 14px; opacity: 0.9;">Нажмите кнопку <strong>"🛒 Открыть магазин"</strong> в меню бота</div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: flex-start; gap: 15px;">
                            <div style="
                                background: rgba(255,255,255,0.2);
                                border-radius: 50%;
                                width: 30px;
                                height: 30px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: bold;
                                font-size: 14px;
                                flex-shrink: 0;
                            ">4</div>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 2px;">Оформите заказ</div>
                                <div style="font-size: 14px; opacity: 0.9;">Добавьте товары и завершите оформление</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ваш заказ -->
                <div style="
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 20px;
                    margin-bottom: 20px;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;
                        gap: 10px;
                    ">
                        <div style="font-size: 20px;">📋</div>
                        <div style="font-weight: 600; font-size: 16px;">Ваш заказ для ручной отправки</div>
                    </div>
                    
                    <div class="order-text" onclick="copyOrderText(this)" style="
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 10px;
                        padding: 15px;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #fff;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        max-height: 200px;
                        overflow-y: auto;
                        margin-bottom: 10px;
                    " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
                    onmouseout="this.style.background='rgba(0,0,0,0.3)'">
                        ${orderText}
                    </div>
                    
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 12px;
                        opacity: 0.8;
                    ">
                        <div>💡</div>
                        <div>Нажмите на текст чтобы скопировать заказ</div>
                    </div>
                </div>

                <!-- Кнопки действий -->
                <div style="display: grid; gap: 12px;">
                    <a href="https://t.me/av_drops_bot" target="_blank" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        border-radius: 12px;
                        padding: 15px 20px;
                        color: white;
                        text-decoration: none;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        text-align: center;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'" 
                    onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                        <span>🚀</span>
                        <span>Перейти в бота @av_drops_bot</span>
                    </a>

                    <a href="https://t.me/av_manage" target="_blank" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        background: linear-gradient(135deg, #1e1e1e, #2d2d2d);
                        border: none;
                        border-radius: 12px;
                        padding: 15px 20px;
                        color: white;
                        text-decoration: none;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.2)'" 
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <span>💬</span>
                        <span>Написать менеджеру</span>
                    </a>

                    <button onclick="location.reload()" style="
                        background: rgba(255,255,255,0.9);
                        border: none;
                        border-radius: 12px;
                        padding: 15px 20px;
                        color: #667eea;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 14px;
                    " onmouseover="this.style.background='#fff'; this.style.transform='translateY(-2px)'" 
                    onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='translateY(0)'">
                        🔄 Начать новый заказ
                    </button>
                </div>

                <!-- Футер -->
                <div style="
                    text-align: center;
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.2);
                    font-size: 12px;
                    opacity: 0.7;
                ">
                    <div style="margin-bottom: 5px;">💡 Открывайте в Telegram для быстрого оформления</div>
                    <div>⏱️ Экономьте время с автоматической отправкой заказа</div>
                </div>
            </div>
        `;

        const mainContent = document.querySelector("main") || document.querySelector(".container") || document.body;
        mainContent.innerHTML = instructionHTML;
        
        // Добавляем анимацию появления
        const instructionElement = mainContent.querySelector('.browser-instruction');
        if (instructionElement) {
            instructionElement.style.opacity = '0';
            instructionElement.style.transform = 'translateY(20px)';
            instructionElement.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                instructionElement.style.opacity = '1';
                instructionElement.style.transform = 'translateY(0)';
            }, 100);
        }
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
        console.error("❌ Ошибка:", message);
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            font-weight: 500;
            max-width: 90%;
            text-align: center;
            opacity: 0;
            transition: all 0.3s ease;
            border-left: 4px solid #ff4757;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        // Анимация появления
        setTimeout(() => {
            errorDiv.style.opacity = '1';
            errorDiv.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 5000);
    }

    function showSuccess(message) {
        console.log("✅ Успех:", message);
        const successDiv = document.createElement("div");
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background: linear-gradient(135deg, #1e1e1e, #2d2d2d);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            font-weight: 500;
            max-width: 90%;
            text-align: center;
            opacity: 0;
            transition: all 0.3s ease;
            border-left: 4px solid #1e1e1e;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        // Анимация появления
        setTimeout(() => {
            successDiv.style.opacity = '1';
            successDiv.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        setTimeout(() => {
            successDiv.style.opacity = '0';
            successDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }

    window.copyOrderText = function(element) {
        const text = element.textContent;
        
        // Визуальная обратная связь
        const originalBackground = element.style.background;
        element.style.background = 'rgba(255,255,255,0.3)';
        element.style.transform = 'scale(0.98)';
        
        navigator.clipboard.writeText(text).then(() => {
            showSuccess("✅ Заказ скопирован в буфер обмена!");
        }).catch(() => {
            // Fallback для старых браузеров
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            showSuccess("✅ Заказ скопирован в буфер обмена!");
        }).finally(() => {
            setTimeout(() => {
                element.style.background = originalBackground;
                element.style.transform = 'scale(1)';
            }, 300);
        });
    };
});