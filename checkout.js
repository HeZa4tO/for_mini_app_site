document.addEventListener("DOMContentLoaded", () => {
    // Берём корзину из sessionStorage
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");

    // Элементы страницы
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");
    const sendButton = document.getElementById("sendOrder");

    const RUB_RATE = 13;

    // Рассчитываем итоги и выводим
    let totalRub = 0;
    cart.forEach(item => {
        const priceYuan = Number(item.price || 0);
        const priceRub = Math.ceil(priceYuan * RUB_RATE);
        const deliveryRub = Math.ceil(item.delivery_price || 2000);
        const taxRub = Math.ceil(priceRub * 0.1);
        const itemTotalRub = priceRub + deliveryRub + taxRub;
        totalRub += itemTotalRub;

        const div = document.createElement("div");
        div.textContent = `${item.category} - ¥${priceYuan} / ₽${itemTotalRub}`;
        checkoutCart.appendChild(div);
    });

    totalSumDiv.textContent = `💰 Общая сумма: ₽${totalRub}`;

    sendButton.addEventListener("click", async () => {
        // Сбор данных пользователя
        const fullname = document.getElementById("fullname")?.value.trim() || "";
        const phone = document.getElementById("phone")?.value.trim() || "";
        const city = document.getElementById("city")?.value.trim() || "";
        const address = document.getElementById("address")?.value.trim() || "";

        if (!fullname || !phone || !city || !address) {
            alert("Пожалуйста, заполните все поля!");
            return;
        }

        const orderData = {
            cart,
            total: totalRub,
            user: { fullname, phone, city, address }
        };

        try {
            // Отправка на локальный FastAPI
            const res = await fetch("http://127.0.0.1:8000/save_order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) throw new Error("Ошибка при отправке на сервер");

            alert("✅ Заказ успешно отправлен!");

            // Если Telegram WebApp доступен — отправляем туда
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.sendData(JSON.stringify(orderData));
            }

            // Можно очистить корзину
            sessionStorage.removeItem("cart");

        } catch (e) {
            console.error(e);
            alert("❌ Не удалось отправить заказ. Попробуйте снова.");
        }
    });
});
