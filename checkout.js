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

    // Конфигурация бота
    const BOT_CONFIG = {
        token: '8366570428:AAEeqDHl75ouB3JkbVqg7acdESgDoTKUX9U',
        chatId: '1363888506'
    };

    // УЛУЧШЕННАЯ проверка Telegram WebApp
    const isTelegramWebApp = () => {
        console.log("🔍 Проверка Telegram WebApp...");
        
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            console.log("📱 Telegram WebApp обнаружен:", {
                initData: !!webApp.initData,
                initDataUnsafe: !!webApp.initDataUnsafe,
                platform: webApp.platform,
                version: webApp.version
            });
            
            if (webApp.initData || webApp.platform) {
                console.log("✅ Telegram WebApp подтвержден");
                return true;
            }
        }
        
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
    let totalItemsPrice = 0;
    let totalDelivery = 0;
    let totalCommission = 0;
    
    checkoutCart.innerHTML = "";

    cart.forEach((item, index) => {
        const priceYuan = Number(item.price || 1);
        const priceRub = Math.ceil(priceYuan * RUB_RATE);
        const deliveryPrice = DELIVERY_PRICES[item.category]?.[item.delivery] || 2000;
        const deliveryRub = Math.ceil(deliveryPrice);
        const taxRub = Math.ceil(priceRub * 0.1);
        const itemTotalRub = Math.ceil(priceRub + deliveryRub + taxRub);
        
        totalRub += itemTotalRub;
        totalItemsPrice += priceRub;
        totalDelivery += deliveryRub;
        totalCommission += taxRub;

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
        
        sendButton.style.display = 'block';
        sendButton.textContent = "📦 Отправить заказ";
        
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                console.log("🔧 Инициализация Telegram WebApp...");
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();
                
                console.log("✅ Telegram WebApp инициализирован");
                
                try {
                    Telegram.WebApp.MainButton.setText("📦 ОТПРАВИТЬ ЗАКАЗ");
                    Telegram.WebApp.MainButton.show();
                    Telegram.WebApp.MainButton.onClick(handleOrderSubmit);
                    console.log("✅ MainButton активирована");
                } catch (mainButtonError) {
                    console.warn("⚠️ MainButton не работает:", mainButtonError);
                }
                
            } catch (error) {
                console.error("❌ Ошибка инициализации Telegram:", error);
            }
        }
        
        setupButtonHandler(handleOrderSubmit);
    }

    function setupBrowserMode() {
        console.log("🟡 Настройка Browser режима");
        sendButton.textContent = "📦 Отправить заказ";
        setupButtonHandler(handleOrderSubmit);
    }

    function setupButtonHandler(handler) {
        console.log("🔧 Установка обработчика на кнопку...");
        
        sendButton.onclick = null;
        
        const newButton = sendButton.cloneNode(true);
        sendButton.parentNode.replaceChild(newButton, sendButton);
        sendButton = newButton;

        sendButton.onclick = function(e) {
            console.log("🎯 КНОПКА НАЖАТА!");
            e.preventDefault();
            e.stopPropagation();
            handler.call(this, e);
        };
        
        sendButton.addEventListener('click', function(e) {
            console.log("🎯 addEventListener: Кнопка нажата!");
            e.preventDefault();
            e.stopPropagation();
            handler.call(this, e);
        }, true);
        
        sendButton.disabled = false;
        sendButton.style.pointerEvents = 'auto';
        sendButton.style.opacity = '1';
        sendButton.style.display = 'block';

        console.log("✅ Обработчик установлен на кнопку:", sendButton.textContent);
    }

    async function handleOrderSubmit() {
        console.log("🟡 НАЧАЛО ОТПРАВКИ ЗАКАЗА");
        
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
            timestamp: new Date().toLocaleString(),
            source: isTelegramWebApp() ? 'telegram' : 'browser',
            breakdown: {
                items: totalItemsPrice,
                delivery: totalDelivery,
                commission: totalCommission
            }
        };

        const orderMessage = formatOrderMessage(orderData);

        console.log("📦 Данные для отправки:", orderMessage);

        try {
            console.log("🔄 Показываем индикатор загрузки...");
            sendButton.disabled = true;
            sendButton.textContent = "Отправка...";

            await sendOrderToTelegram(orderMessage);
            
            console.log("✅ Заказ успешно отправлен!");
            showSuccess("✅ Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.");
            
            sessionStorage.removeItem("cart");
            
            if (isTelegramWebApp() && window.Telegram?.WebApp?.close) {
                setTimeout(() => {
                    console.log("🔒 Закрываем приложение...");
                    Telegram.WebApp.close();
                }, 2000);
            } else {
                setTimeout(() => {
                    sendButton.disabled = false;
                    sendButton.textContent = "🔄 Сделать новый заказ";
                    sendButton.onclick = () => location.reload();
                }, 3000);
            }

        } catch (error) {
            console.error("❌ ОШИБКА ОТПРАВКИ:", error);
            
            showError("❌ Ошибка отправки. Попробуйте еще раз или свяжитесь с нами напрямую.");
            
            sendButton.disabled = false;
            sendButton.textContent = "📦 Отправить заказ";
        }
    }

    // Функция для форматирования заказа в нужный формат
    function formatOrderMessage(orderData) {
        const user = orderData.user;
        const items = orderData.items;
        
        let message = `🛒 НОВЫЙ ЗАКАЗ ИЗ ${orderData.source === 'telegram' ? 'TELEGRAM' : 'БРАУЗЕРА'}\n\n`;
        message += `👤 Клиент: ${user.fullname}\n`;
        message += `📞 Телефон: ${user.phone}\n`;
        message += `🏠 Адрес: ${user.address}\n\n`; // Убрал city, оставил только address
        
        message += `📦 Товары:\n`;
        
        items.forEach((item, index) => {
            const priceYuan = Number(item.price || 1);
            const priceRub = Math.ceil(priceYuan * 13);
            
            message += `${index + 1}. ${item.category}\n`;
            message += `   💰 Цена: ¥${priceYuan} (₽${priceRub})\n`; // Добавил цену в рублях
            message += `   📏 Размер: ${item.size}\n`;
            message += `   🎨 Цвет кнопки: ${item.color}\n`;
            message += `   🚚 Доставка: ${item.delivery}\n`;
            message += `   🔗 Ссылка: ${item.link}\n\n`;
        });
        
        // Добавляем разбивку стоимости
        message += `💰 Стоимость заказа:\n`;
        message += `   Товары: ₽${orderData.breakdown.items.toLocaleString()}\n`;
        message += `   Доставка: ₽${orderData.breakdown.delivery.toLocaleString()}\n`;
        message += `   Комиссия: ₽${orderData.breakdown.commission.toLocaleString()}\n`;
        message += `   Общая сумма: ₽${orderData.total.toLocaleString()}\n\n`;
        
        message += `⏰ Время: ${orderData.timestamp}\n`;
        message += `🌐 Источник: ${orderData.source === 'telegram' ? 'Telegram' : 'Браузер'}`;
        
        return message;
    }

    async function sendOrderToTelegram(message) {
        const { token, chatId } = BOT_CONFIG;
        
        if (!token || !chatId) {
            throw new Error("Не настроен токен бота или chat ID");
        }
        
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Ошибка отправки в Telegram:', errorText);
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        return await response.json();
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
});