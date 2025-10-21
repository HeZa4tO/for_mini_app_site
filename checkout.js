document.addEventListener("DOMContentLoaded", () => {
    // Проверка открытия через Telegram WebApp
    if (!window.Telegram?.WebApp) {
        alert("❌ Откройте эту страницу через Telegram WebApp!");
        return;
    }

    const TelegramWebApp = window.Telegram.WebApp;
    TelegramWebApp.ready(); // уведомляем Telegram, что WebApp готов

    // Получаем корзину из sessionStorage
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");

    const RUB_RATE = 13;

    let totalRub = 0;
    cart.forEach(item => {
        const priceYuan = Number(item.price || 0);
        const priceRub = Math.round(priceYuan * RUB_RATE);
        const deliveryRub = Number(item.delivery_price || 2000);
        const taxRub = Math.round(priceRub * 0.1);
        totalRub += priceRub + deliveryRub + taxRub;

        const div = document.createElement("div");
        div.textContent = `${item.category || "Товар"} - ¥${priceYuan} / ₽${priceRub + deliveryRub + taxRub}`;
        checkoutCart.appendChild(div);
    });

    totalSumDiv.textContent = `Общая сумма: ₽${totalRub}`;

    // Настройка кнопки Telegram WebApp
    TelegramWebApp.MainButton.text = "Оформить заказ";
    TelegramWebApp.MainButton.show();

    TelegramWebApp.MainButton.onClick(() => {
        // Отправка данных обратно в бота
        const dataToSend = {
            cart,
            total: totalRub
        };
        TelegramWebApp.sendData(JSON.stringify(dataToSend));
    });

    // Можно добавить кнопку закрытия WebApp
    const closeButton = document.getElementById("closeWebApp");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            TelegramWebApp.close();
        });
    }
});
