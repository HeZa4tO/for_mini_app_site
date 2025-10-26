document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");
    const sendButton = document.getElementById("sendOrder");

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
        // Проверяем несколько признаков Telegram WebApp
        if (typeof window.Telegram === 'undefined') return false;
        if (!window.Telegram.WebApp) return false;
        
        // Telegram WebApp всегда имеет platform и version
        const webApp = window.Telegram.WebApp;
        return !!(webApp.platform && webApp.version);
    };

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

    // Определяем окружение при загрузке
    console.log("🔍 Проверка окружения:");
    console.log("Telegram:", !!window.Telegram);
    console.log("Telegram.WebApp:", !!window.Telegram?.WebApp);
    console.log("Telegram.WebApp.platform:", window.Telegram?.WebApp?.platform);
    console.log("Telegram.WebApp.version:", window.Telegram?.WebApp?.version);
    console.log("Режим:", isTelegramWebApp() ? "TELEGRAM" : "BROWSER");

    // Показываем соответствующий интерфейс
    if (isTelegramWebApp()) {
        setupTelegramMode();
    } else {
        setupBrowserMode();
    }

    function setupTelegramMode() {
        console.log("🟢 Режим: Telegram WebApp");
        sendButton.textContent = "📦 Отправить заказ в Telegram";
        
        sendButton.onclick = handleTelegramSubmit;
    }

    function setupBrowserMode() {
        console.log("🟡 Режим: Браузер");
        sendButton.textContent = "📋 Показать инструкцию";
        
        sendButton.onclick = handleBrowserSubmit;
    }

    async function handleTelegramSubmit() {
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
            timestamp: new Date().toISOString(),
            source: 'telegram'
        };

        console.log("📦 Отправка через Telegram:", orderData);

        try {
            sendButton.disabled = true;
            sendButton.textContent = "Отправка...";

            Telegram.WebApp.sendData(JSON.stringify(orderData));
            showSuccess("✅ Заказ успешно отправлен!");
            
            setTimeout(() => {
                Telegram.WebApp.close();
            }, 2000);

        } catch (error) {
            console.error("❌ Ошибка Telegram:", error);
            showError("❌ Ошибка отправки. Попробуйте еще раз.");
            sendButton.disabled = false;
            sendButton.textContent = "📦 Отправить заказ в Telegram";
        }
    }

    function handleBrowserSubmit() {
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
            timestamp: new Date().toISOString(),
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
    `;
    document.head.appendChild(style);
});