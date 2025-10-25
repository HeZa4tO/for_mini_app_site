document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");
    const sendButton = document.getElementById("sendOrder");
    const formContainer = document.querySelector(".checkout-form");

    const RUB_RATE = 13;
    
    // Цены доставки ДОЛЖНЫ совпадать с теми, что в script.js
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

    // Проверяем среду выполнения и показываем соответствующий интерфейс
    if (!window.Telegram?.WebApp) {
        showBrowserInstruction();
    }

    sendButton.addEventListener("click", async () => {
        const fullname = document.getElementById("fullname")?.value.trim() || "";
        const phone = document.getElementById("phone")?.value.trim() || "";
        const city = document.getElementById("city")?.value.trim() || "";
        const address = document.getElementById("address")?.value.trim() || "";

        if (!fullname || !phone || !city || !address) {
            showError("Пожалуйста, заполните все поля формы!");
            return;
        }

        if (cart.length === 0) {
            showError("Корзина пуста! Добавьте товары перед оформлением заказа.");
            return;
        }

        const orderData = {
            items: cart,
            total: totalRub,
            user: { 
                fullname, 
                phone, 
                city, 
                address 
            },
            timestamp: new Date().toISOString()
        };

        console.log("Отправляемые данные:", orderData);

        try {
            sendButton.disabled = true;
            sendButton.textContent = "Отправка...";

            // Пытаемся отправить через Telegram WebApp
            if (window.Telegram?.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify(orderData));
                showSuccess("✅ Заказ успешно отправлен через Telegram!");
                
                setTimeout(() => {
                    Telegram.WebApp.close();
                }, 2000);
            } else {
                // РЕЖИМ БРАУЗЕРА - показываем инструкцию
                showBrowserInstruction(orderData);
                sendButton.disabled = false;
                sendButton.textContent = "📦 Отправить заказ";
            }
        } catch (error) {
            console.error("Ошибка отправки:", error);
            showError("❌ Не удалось отправить заказ. Попробуйте еще раз.");
            
            sendButton.disabled = false;
            sendButton.textContent = "📦 Отправить заказ";
        }
    });

    // Функция для показа инструкции в браузере
    function showBrowserInstruction(orderData = null) {
        const orderText = orderData ? formatOrderForManual(orderData) : "Ваш заказ будет здесь...";
        
        const instructionHTML = `
            <div class="browser-instruction" style="
                background: #1e1e1e;
                border: 2px solid #ffeaa7;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            ">
                <h3 style="color: #ffffffff; margin-bottom: 15px;">❌ Открывайте в Telegram!</h3>
                
                <p style="margin-bottom: 15px; color: #ffffffff;">
                    Для оформления заказа откройте этот WebApp в Telegram:
                </p>
                
                <div style="background: #1e1e1e; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>1. Откройте Telegram</strong><br>
                    <strong>2. Найдите бота:</strong> @av_drops_bot<br>
                    <strong>3. Нажмите "🛒 Открыть магазин"</strong><br>
                    <strong>4. Добавьте товары и оформите заказ</strong>
                </div>

                <div style="background: #1e1e1e; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                    <strong>Ваш заказ:</strong>
                    <div style="margin-top: 10px; font-family: monospace; font-size: 12px; background: #1e1e1e; padding: 10px; border-radius: 5px;">
                        ${orderText}
                    </div>
                </div>

                <p style="color: #ffffffff; font-size: 14px;">
                    💡 <strong>Совет:</strong> Сохраните этот текст чтобы отправить менеджеру вручную
                </p>
            </div>
        `;

        // Заменяем форму на инструкцию
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        
        checkoutCart.innerHTML = instructionHTML;
        sendButton.style.display = 'none';
    }

    // Функция для форматирования заказа для ручной отправки
    function formatOrderForManual(orderData) {
        const user = orderData.user;
        const items = orderData.items;
        
        let message = `НОВЫЙ ЗАКАЗ\\n\\n`;
        message += `Клиент: ${user.fullname}\\n`;
        message += `Телефон: ${user.phone}\\n`;
        message += `Адрес: ${user.city}, ${user.address}\\n\\n`;
        
        message += `ТОВАРЫ:\\n`;
        items.forEach((item, index) => {
            message += `${index + 1}. ${item.category}\\n`;
            message += `   Цена: ¥${item.price}\\n`;
            message += `   Размер: ${item.size}\\n`;
            message += `   Цвет: ${item.color}\\n`;
            message += `   Доставка: ${item.delivery}\\n`;
            message += `   Ссылка: ${item.link}\\n\\n`;
        });
        
        message += `ОБЩАЯ СУММА: ₽${orderData.total.toLocaleString()}\\n`;
        message += `ВРЕМЯ: ${new Date().toLocaleString()}`;
        
        return message;
    }

    // Функция для показа ошибок
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

    // Функция для успешных сообщений
    function showSuccess(message) {
        const successDiv = document.createElement("div");
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2ed573;
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

    // CSS анимация
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .browser-instruction {
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});