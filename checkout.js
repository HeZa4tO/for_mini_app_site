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

    // Элементы страницы
    const checkoutCart = document.getElementById("checkoutCart");
    const totalSumDiv = document.getElementById("totalSum");
    const sendButton = TelegramWebApp.MainButton;

    const RUB_RATE = 13;

    // Рассчитываем итоги и выводим
    let totalRub = 0;
    cart.forEach(item => {
        const priceYuan = Number(item.price || 0);
        const priceRub = Math.ceil(priceYuan * RUB_RATE);
        const deliveryRub = Math.ceil(DELIVERY_PRICES[item.category][item.delivery] || 2000);
        const taxRub = Math.ceil(priceRub * 0.1);
        const itemTotalRub = priceRub + deliveryRub + taxRub;
        totalRub += itemTotalRub;

        const div = document.createElement("div");
        div.textContent = `${item.category} - ¥${priceYuan} / ₽${itemTotalRub}`;
        checkoutCart.appendChild(div);
    });

    totalSumDiv.textContent = `💰 Общая сумма: ₽${totalRub}`;

    // Настройка кнопки Telegram WebApp
    sendButton.text = "Оформить заказ";
    sendButton.show();
    sendButton.enable();

    sendButton.onClick(() => {
        // Сбор данных пользователя
        const userData = {
            name: document.getElementById("name").value || "",
            phone: document.getElementById("phone").value || "",
            city: document.getElementById("city").value || "",
            address: document.getElementById("address").value || ""
        };

        // Проверка заполненности всех полей
        if (!userData.name || !userData.phone || !userData.city || !userData.address) {
            alert("Пожалуйста, заполните все поля пользователя!");
            return;
        }

        // Подготовка данных для отправки
        const orderData = {
            cart,
            total: totalRub,
            user: userData
        };

        // Отправка данных боту
        TelegramWebApp.sendData(JSON.stringify(orderData));

        // Деактивируем кнопку, чтобы пользователь не отправил дважды
        sendButton.disable();

        // Можно закрыть WebApp автоматически (опционально)
        // TelegramWebApp.close();
    });

    // Опционально: кнопка закрытия WebApp
    const closeButton = document.getElementById("closeWebApp");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            TelegramWebApp.close();
        });
    }
});
