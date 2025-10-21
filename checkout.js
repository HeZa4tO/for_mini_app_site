document.addEventListener("DOMContentLoaded", () => {
    const RUB_RATE = 13;
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

    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");

    let totalRub = 0;

    // Вывод корзины
    cart.forEach(item => {
        const priceYuan = Number(item.price || 0);
        const priceRub = Math.round(priceYuan * RUB_RATE);
        const deliveryRub = Math.round(DELIVERY_PRICES[item.category][item.delivery] || 0);
        const taxRub = Math.round(priceRub * 0.1);
        const itemTotal = priceRub + deliveryRub + taxRub;

        // Сохраняем данные для отправки в Telegram
        item.delivery_price = deliveryRub;
        item.tax = taxRub;
        item.total_price_rub = itemTotal;

        totalRub += itemTotal;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div class="item-info">
                <strong>${item.category}</strong><br>
                Ссылка: ${item.link || "-"}<br>
                Размер: ${item.size || "-"}<br>
                Цвет: ${item.color || "-"}<br>
                Доставка: ${item.delivery}
            </div>
            <div class="item-cost">
                Цена товара: ₽${priceRub.toLocaleString()} (¥${priceYuan})<br>
                Доставка: ₽${deliveryRub.toLocaleString()}<br>
                Комиссия: ₽${taxRub.toLocaleString()}<br>
                <strong>Итого: ₽${itemTotal.toLocaleString()}</strong>
            </div>
        `;
        checkoutCart.appendChild(div);
    });

    totalSumDiv.textContent = `💰 Общая сумма: ₽${Math.round(totalRub).toLocaleString()}`;

    // Обработка кнопки "Купить"
    document.getElementById("buyBtn").addEventListener("click", () => {
        const city = document.getElementById("city").value.trim();
        const address = document.getElementById("address").value.trim();
        const fullname = document.getElementById("fullname").value.trim();
        const phoneRaw = document.getElementById("phone").value.replace(/\D/g, "");
        const phone = phoneRaw.startsWith("7") ? phoneRaw : "7" + phoneRaw;

        ["city","address","fullname","phone"].forEach(id => {
            document.getElementById(id).classList.remove("error");
            const el = document.getElementById(id+"Error");
            if(el) el.classList.remove("show");
        });

        let valid = true;
        if(!city){ 
            document.getElementById("city").classList.add("error");
            const el = document.getElementById("cityError");
            el.textContent = "Введите город"; el.classList.add("show");
            valid = false;
        }
        if(!address){ 
            document.getElementById("address").classList.add("error");
            const el = document.getElementById("addressError");
            el.textContent = "Введите адрес"; el.classList.add("show");
            valid = false;
        }
        if(!fullname){ 
            document.getElementById("fullname").classList.add("error");
            const el = document.getElementById("fullnameError");
            el.textContent = "Введите ФИО"; el.classList.add("show");
            valid = false;
        }
        if(!/^7\d{10}$/.test(phone)){ 
            document.getElementById("phone").classList.add("error");
            const el = document.getElementById("phoneError");
            el.textContent = "Введите корректный номер в формате +7xxxxxxxxxx";
            el.classList.add("show");
            valid = false;
        }

        if(!valid) return;

        const orderData = { city, address, fullname, phone, cart };

        // Отправка через Telegram WebApp
        if(window.Telegram && window.Telegram.WebApp){
            Telegram.WebApp.sendData(JSON.stringify(orderData));
            alert("✅ Заказ отправлен через Telegram!");
        } else {
            alert("⚠️ Telegram WebApp недоступен. Заказ не отправлен.");
        }

        sessionStorage.removeItem("cart");
    });
});
