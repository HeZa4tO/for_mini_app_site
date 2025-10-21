document.addEventListener("DOMContentLoaded", () => {
    const CATEGORIES = [
        "👟 Кроссовки","🥾 Ботинки","🧥 Толстовки, кофты, лёгкие куртки",
        "👕 Футболки, шорты","👖 Штаны, джинсы","🧤 Зимние куртки, пальто",
        "🧦 Носки, майки, нижнее бельё","🕶 Очки, парфюм, украшения, часы",
        "🧢 Головные уборы","👜 Сумки (маленькие)","🎒 Сумки (большие)","📦 Другое"
    ];

    const COLORS = ["Голубой", "Черный"];
    const COLOR_CODES = { "Голубой": "#00bfff", "Черный": "#2c3e50" };
    const DELIVERY_OPTIONS = ["Обычная 🚚", "Экспресс 🚀"];
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

    let cart = [];
    const categoriesDiv = document.getElementById("categories");
    const cartDiv = document.getElementById("cart");

    // создание карточек категорий
    CATEGORIES.forEach((cat, idx) => {
        const div = document.createElement("div");
        div.className = "category-card";
        div.innerHTML = `
            <span class="category-name">${cat}</span>
            <div class="controls">
                <button class="btn" onclick="addToCart(${idx})">+</button>
                <span class="count" id="count-${idx}">0</span>
            </div>
        `;
        categoriesDiv.appendChild(div);
    });

    window.addToCart = function(idx){
        const cat = CATEGORIES[idx];
        cart.push({
            category: cat,
            link: "",
            price: 1,
            size: "",
            color: "Голубой",
            delivery: "Обычная 🚚"
        });
        renderCart();
    }

    window.removeFromCart = function(i){
        cart.splice(i,1);
        renderCart();
    }

    window.setValue = function(i, field, value){
        if(field === "price"){
            value = parseFloat(value);
            if(isNaN(value) || value <= 0) value = 1;
        }
        cart[i][field] = value;
        renderCart();
    }

    function renderCart(){
        cartDiv.innerHTML = "";
        let totalRub = 0;

        cart.forEach((item,i)=>{
            const priceYuan = Number(item.price || 1);
            const priceRub = Math.round(priceYuan * RUB_RATE);
            const deliveryRub = Math.round(DELIVERY_PRICES[item.category][item.delivery] || 0);
            const taxRub = Math.round(priceRub * 0.1);
            const itemTotalRub = Math.round(priceRub + deliveryRub + taxRub);
            totalRub += itemTotalRub;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:6px;">
                    <strong>${item.category}</strong>
                    <button class="remove-btn" onclick="removeFromCart(${i})">×</button>
                </div>
                <label>Ссылка: <input type="text" value="${item.link}" onchange="setValue(${i},'link',this.value)" placeholder="Ссылка"></label>
                <label>Цена (¥): <input type="number" value="${item.price}" onchange="setValue(${i},'price',this.value)" placeholder="Цена"></label>
                <label>Размер: <input type="text" value="${item.size}" onchange="setValue(${i},'size',this.value)" placeholder="Размер"></label>
                <div class="custom-select-wrapper">
                    <label>Цвет:</label>
                    <div class="custom-select" data-index="${i}">
                        <div class="selected">
                            <span class="color-square" style="background-color:${COLOR_CODES[item.color]}"></span>
                            <span class="color-name">${item.color}</span>
                        </div>
                        <div class="options">
                            ${COLORS.map(c=>`<div class="option" data-color="${c}"><span class="color-square" style="background-color:${COLOR_CODES[c]}"></span>${c}</div>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="custom-delivery-wrapper">
                    <label>Доставка:</label>
                    <div class="custom-delivery" data-index="${i}">
                        <div class="selected">${item.delivery}</div>
                        <div class="options">
                            ${DELIVERY_OPTIONS.map(d=>`<div class="option" data-delivery="${d}">${d}</div>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="item-total">Итого: ₽${itemTotalRub.toLocaleString()} (¥${priceYuan})</div>
            `;
            cartDiv.appendChild(div);
        });

        const totalDiv = document.createElement("div");
        totalDiv.id = "cartTotal";
        totalDiv.style.fontWeight = "700";
        totalDiv.style.fontSize = "18px";
        totalDiv.style.marginTop = "15px";
        totalDiv.textContent = `💰 Общая сумма: ₽${Math.round(totalRub).toLocaleString()}`;
        cartDiv.appendChild(totalDiv);

        initCustomSelect();
        initCustomDelivery();
        updateCount();
    }

    function initCustomSelect(){
        document.querySelectorAll(".custom-select").forEach(select=>{
            const selected = select.querySelector(".selected");
            const options = select.querySelector(".options");
            const index = select.dataset.index;

            selected.onclick = ()=> options.classList.toggle("show");

            options.querySelectorAll(".option").forEach(opt=>{
                opt.onclick = ()=>{
                    const color = opt.dataset.color;
                    cart[index].color = color;
                    renderCart();
                }
            });
        });
    }

    function initCustomDelivery(){
        document.querySelectorAll(".custom-delivery").forEach(delivery=>{
            const selected = delivery.querySelector(".selected");
            const options = delivery.querySelector(".options");
            const index = delivery.dataset.index;

            selected.onclick = ()=> options.classList.toggle("show");

            options.querySelectorAll(".option").forEach(opt=>{
                opt.onclick = ()=>{
                    const value = opt.dataset.delivery;
                    cart[index].delivery = value;
                    renderCart();
                }
            });
        });
    }

    // один обработчик для всего окна
    window.onclick = function(e){
        if(!e.target.closest(".custom-select")){
            document.querySelectorAll(".custom-select .options").forEach(opt=>opt.classList.remove("show"));
        }
        if(!e.target.closest(".custom-delivery")){
            document.querySelectorAll(".custom-delivery .options").forEach(opt=>opt.classList.remove("show"));
        }
    }

    function updateCount(){
        CATEGORIES.forEach((cat, idx)=>{
            const count = cart.filter(i=>i.category===cat).length;
            document.getElementById(`count-${idx}`).textContent = count;
        });
    }

    document.getElementById("sendOrder").addEventListener("click", ()=>{
        if(cart.length === 0){ alert("Корзина пуста!"); return; }
        for(let i=0; i<cart.length; i++){
            const item = cart[i];
            if(!item.link || !item.price || !item.size){
                alert(`Пожалуйста, заполните все поля для товара "${item.category}"`);
                return;
            }
        }
        sessionStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = "checkout.html";
    });

    renderCart();
});
