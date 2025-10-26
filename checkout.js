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

    // НАДЕЖНАЯ проверка Telegram WebApp
    const isTelegramWebApp = () => {
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            return !!(webApp.initData || webApp.initDataUnsafe || webApp.platform || webApp.version);
        }
        return false;
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
        console.log("🏁 Режим:", isTelegram ? "TELEGRAM" : "BROWSER");

        if (isTelegram) {
            setupTelegramMode();
        } else {
            setupBrowserMode();
        }

        // ФИНАЛЬНАЯ ПРОВЕРКА ОБРАБОТЧИКА
        console.log("✅ Обработчик установлен:", !!sendButton.onclick);
    }, 100);

    function setupTelegramMode() {
        console.log("🟢 Настройка Telegram режима");
        sendButton.textContent = "📦 Отправить заказ в Telegram";
        
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();
                
                // Используем MainButton Telegram
                Telegram.WebApp.MainButton.setText("📦 ОТПРАВИТЬ ЗАКАЗ");
                Telegram.WebApp.MainButton.show();
                Telegram.WebApp.MainButton.onClick(handleTelegramSubmit);
                
                sendButton.style.display = 'none';
                
            } catch (error) {
                console.error("Ошибка Telegram, используем стандартную кнопку:", error);
                sendButton.style.display = 'block';
                setupButtonHandler(handleTelegramSubmit);
            }
        } else {
            setupButtonHandler(handleTelegramSubmit);
        }
    }

    function setupBrowserMode() {
        console.log("🟡 Настройка Browser режима");
        sendButton.textContent = "📋 Показать инструкцию";
        setupButtonHandler(handleBrowserSubmit);
    }

    // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ НАСТРОЙКИ ОБРАБОТЧИКА
    function setupButtonHandler(handler) {
        // Очищаем все старые обработчики
        sendButton.onclick = null;
        sendButton.replaceWith(sendButton.cloneNode(true));
        
        // Переполучаем кнопку после клонирования
        sendButton = document.getElementById("sendOrder") || 
                    Array.from(document.querySelectorAll('button')).find(btn => 
                        btn.textContent.includes('Отправить') || 
                        btn.textContent.includes('Оформить') ||
                        btn.textContent.includes('заказ')
                    );

        if (!sendButton) {
            console.error("❌ Кнопка не найдена после клонирования");
            return;
        }

        // Устанавливаем новые обработчики
        sendButton.onclick = handler;
        sendButton.addEventListener('click', handler, true);
        
        // Снимаем возможные блокировки
        sendButton.disabled = false;
        sendButton.style.pointerEvents = 'auto';
        sendButton.style.opacity = '1';

        console.log("✅ Обработчик установлен на кнопку:", sendButton.textContent);
    }

    async function handleTelegramSubmit() {
        console.log("🟡 Начало отправки заказа в Telegram");
        
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
            timestamp: new Date().toISOString(),
            source: 'telegram'
        };

        try {
            // Показываем индикатор загрузки
            if (Telegram.WebApp.MainButton && Telegram.WebApp.MainButton.isVisible) {
                Telegram.WebApp.MainButton.showProgress();
            } else {
                sendButton.disabled = true;
                sendButton.textContent = "Отправка...";
            }

            if (!window.Telegram?.WebApp) {
                throw new Error("Telegram WebApp не доступен");
            }

            Telegram.WebApp.sendData(JSON.stringify(orderData));
            
            showSuccess("✅ Заказ успешно отправлен!");
            
            setTimeout(() => {
                if (window.Telegram?.WebApp?.close) {
                    Telegram.WebApp.close();
                }
            }, 1500);

        } catch (error) {
            console.error("❌ Ошибка отправки:", error);
            
            let errorMessage = "❌ Ошибка отправки. Попробуйте еще раз.";
            showError(errorMessage);
            
            if (Telegram.WebApp.MainButton && Telegram.WebApp.MainButton.isVisible) {
                Telegram.WebApp.MainButton.hideProgress();
            } else {
                sendButton.disabled = false;
                sendButton.textContent = "📦 Отправить заказ в Telegram";
            }
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
        const fullname = document.getElementById("fullname")?.value.trim() || "";
        const phone = document.getElementById("phone")?.value.trim() || "";
        const city = document.getElementById("city")?.value.trim() || "";
        const address = document.getElementById("address")?.value.trim() || "";

        if (!fullname || !phone || !city || !address) {
            showError("Пожалуйста, заполните все поля формы!");
            return { valid: false };
        }

        if (cart.length === 0) {
            showError("Корзина пуста! Добавьте товары перед оформлением заказа.");
            return { valid: false };
        }

        return {
            valid: true,
            user: { fullname, phone, city, address }
        };
    }

    function showBrowserInstruction(orderData) {
        const orderText = formatOrderForManual(orderData);
        
        const instructionHTML = `
            <div class="browser-instruction">
                <h3>❌ Открывайте в Telegram!</h3>
                
                <div class="instruction-steps">
                    <p><strong>Для оформления заказа:</strong></p>
                    <ol>
                        <li>Откройте Telegram</li>
                        <li>Найдите бота: <strong>@av_drops_bot</strong></li>
                        <li>Нажмите <strong>"🛒 Открыть магазин"</strong></li>
                        <li>Добавьте товары и оформите заказ</li>
                    </ol>
                </div>

                <div class="order-summary">
                    <strong>Ваш заказ для ручной отправки:</strong>
                    <div class="order-text" onclick="copyOrderText(this)">
                        ${orderText}
                    </div>
                    <small>💡 Нажмите на текст чтобы скопировать</small>
                </div>

                <div class="contact-info">
                    <p>Или отправьте этот текст менеджеру:</p>
                    <a href="https://t.me/av_manage" target="_blank" class="manager-link">
                        📩 Написать менеджеру
                    </a>
                </div>

                <button onclick="location.reload()">
                    🔄 Новый заказ
                </button>
            </div>
        `;

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
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    function showSuccess(message) {
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
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    }

    window.copyOrderText = function(element) {
        const text = element.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showSuccess("✅ Текст заказа скопирован!");
        }).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            showSuccess("✅ Текст заказа скопирован!");
        });
    };
});