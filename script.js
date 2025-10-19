document.addEventListener("DOMContentLoaded", () => {
    const CATEGORIES = [
        "👟 Кроссовки","🥾 Ботинки","🧥 Толстовки, кофты, лёгкие куртки",
        "👕 Футболки, шорты","👖 Штаны, джинсы","🧤 Зимние куртки, пальто",
        "🧦 Носки, майки, нижнее бельё","🕶 Очки, парфюм, украшения, часы",
        "🧢 Головные уборы","👜 Сумки (маленькие)","🎒 Сумки (большие)","📦 Другое"
    ];

    const DELIVERY_PRICES = {
        "👟 Кроссовки": {"normal": 2000, "express": 6500},
        "🥾 Ботинки": {"normal": 2100, "express": 7000},
        "🧥 Толстовки, кофты, лёгкие куртки": {"normal": 1500, "express": 5000},
        "👕 Футболки, шорты": {"normal": 1300, "express": 4500},
        "👖 Штаны, джинсы": {"normal": 1500, "express": 5000},
        "🧤 Зимние куртки, пальто": {"normal": 1700, "express": 5500},
        "🧦 Носки, майки, нижнее бельё": {"normal": 700, "express": 4000},
        "🕶 Очки, парфюм, украшения, часы": {"normal": 700, "express": 4000},
        "🧢 Головные уборы": {"normal": 700, "express": 4000},
        "👜 Сумки (маленькие)": {"normal": 1400, "express": 5000},
        "🎒 Сумки (большие)": {"normal": 1700, "express": 6500},
        "📦 Другое": {"normal": 1500, "express": 5000}
    };

    let cart = [];
    let rub_rate = 13;

    const categoriesDiv = document.getElementById("categories");
    CATEGORIES.forEach((cat, idx) => {
        const div = document.createElement("div");
        div.className = "category-card";
        div.innerHTML = `<strong>${cat}</strong> <button onclick="addToCart(${idx})">+</button>`;
        categoriesDiv.appendChild(div);
    });

    window.addToCart = function(idx){
        const cat = CATEGORIES[idx];
        cart.push({
            category: cat,
            link: "",
            price: "",
            size: "",
            color: "Голубой",
            delivery: "Обычная"
        });
        renderCart();
    }

    window.removeFromCart = function(i){
        cart.splice(i,1);
        renderCart();
    }

    window.setValue = function(i, field, value){
        if(field === "price" && (value === "" || parseFloat(value) <= 0)){
            alert("Введите корректную цену больше 0");
            return;
        }
        cart[i][field] = value;
        renderCart();
    }

    function renderCart(){
        const cartDiv = document.getElementById("cart");
        cartDiv.innerHTML = "";
        let total = 0;
        let commission = cart.length >=3 ? 750*cart.length : 1000;

        cart.forEach((item,i)=>{
            const prices = DELIVERY_PRICES[item.category] || {normal: 2000, express: 6500};
            const deliveryCost = item.delivery === "Экспресс" ? prices.express : prices.normal;
            const priceRub = parseFloat(item.price) ? parseFloat(item.price)*rub_rate : 0;
            total += priceRub + deliveryCost;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.style.background = item.color==="Голубой"?"#d0f0ff":"#d3d3d3";
            div.style.border = item.delivery==="Экспресс"?"2px solid #ffcccb":"1px solid #ccc";

            div.innerHTML = `
                <strong>${item.category}</strong>
                <button onclick="removeFromCart(${i})">-</button><br>
                Ссылка: <input type="text" value="${item.link}" onchange="setValue(${i},'link',this.value)" placeholder="Ссылка"><br>
                Цена (¥): <input type="number" value="${item.price}" onchange="setValue(${i},'price',this.value)" placeholder="Цена"><br>
                Размер: <input type="text" value="${item.size}" onchange="setValue(${i},'size',this.value)" placeholder="Размер"><br>
                Цвет кнопки:
                <select onchange="setValue(${i},'color',this.value)">
                    <option value="Голубой" ${item.color==="Голубой"?"selected":""}>Голубой</option>
                    <option value="Черный" ${item.color==="Черный"?"selected":""}>Черный</option>
                </select><br>
                Доставка:
                <select onchange="setValue(${i},'delivery',this.value)">
                    <option value="Обычная" ${item.delivery==="Обычная"?"selected":""}>Обычная</option>
                    <option value="Экспресс" ${item.delivery==="Экспресс"?"selected":""}>Экспресс</option>
                </select>
            `;
            cartDiv.appendChild(div);
        });

        let totalDiv = document.getElementById("totalSum");
        if(!totalDiv){
            totalDiv = document.createElement("div");
            totalDiv.id="totalSum";
            totalDiv.style.fontWeight="bold";
            totalDiv.style.marginTop="10px";
            cartDiv.appendChild(totalDiv);
        }

        totalDiv.innerHTML = `💰 Итог: ${total.toLocaleString()} ₽`;
    }

    document.getElementById("sendOrder").addEventListener("click", ()=>{
        if(cart.length===0){ alert("Корзина пуста!"); return; }

        for(let i=0;i<cart.length;i++){
            const price=parseFloat(cart[i].price);
            if(isNaN(price)||price<=0){
                alert(`Введите корректную цену для "${cart[i].category}"`);
                return;
            }
        }

        // Сохраняем в JSON
        const orderJSON = JSON.stringify(cart, null, 2);
        console.log("Заказ в JSON:", orderJSON);

        // Можно отправлять через Telegram WebApp:
        if(window.Telegram?.WebApp?.sendData){
            Telegram.WebApp.sendData(orderJSON);
        }

        // Очищаем корзину
        cart=[];
        renderCart();
    });
});

