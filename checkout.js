document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");
    const sendButton = document.getElementById("sendOrder");

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
            }
        };

        console.log("Отправляемые данные:", orderData);

        try {
            if (window.Telegram?.WebApp) {
                // РЕЖИМ TELEGRAM
                sendButton.disabled = true;
                sendButton.textContent = "Отправка...";
                
                Telegram.WebApp.sendData(JSON.stringify(orderData));
                
                showSuccess("✅ Заказ успешно отправлен! Менеджер свяжется с вами.");
                
                setTimeout(() => {
                    Telegram.WebApp.close();
                }, 2000);
                
            } else {
                // ТЕСТОВЫЙ РЕЖИМ - отправляем через функцию
                sendButton.disabled = true;
                sendButton.textContent = "Отправка...";
                
                const result = await sendOrderToBot(orderData);
                
                if (result.success) {
                    showSuccess("✅ Заказ успешно отправлен! (тестовый режим)");
                    sessionStorage.removeItem("cart");
                    
                    // Очищаем форму
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 2000);
                } else {
                    throw new Error(result.error || "Ошибка отправки");
                }
            }
        } catch (error) {
            console.error("Ошибка отправки:", error);
            showError("❌ Не удалось отправить заказ. Попробуйте еще раз или свяжитесь с менеджером.");
            
            sendButton.disabled = false;
            sendButton.textContent = "📦 Отправить заказ";
        }
    });

    // Функция для отправки заказа в тестовом режиме
    async function sendOrderToBot(orderData) {
        try {
            // Сохраняем заказ в localStorage для отладки
            const testOrders = JSON.parse(localStorage.getItem('test_orders') || '[]');
            testOrders.push({
                ...orderData,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('test_orders', JSON.stringify(testOrders));
            
            console.log('✅ Заказ сохранен в localStorage (test_orders):', orderData);
            
            // Имитируем успешную отправку
            return { success: true };
            
        } catch (error) {
            console.error('❌ Ошибка сохранения заказа:', error);
            return { success: false, error: error.message };
        }
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
    `;
    document.head.appendChild(style);
});