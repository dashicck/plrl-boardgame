(() => {
  'use strict';

  const CART_KEY = 'laptaCart';
  const DELIVERY_PRICE = 199;
  const MAX_QTY = 99;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';

  function readCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(stored)) return [];
      return stored
        .filter(item => item && window.PRODUCTS?.[item.id])
        .map(item => {
          const product = window.PRODUCTS[item.id];
          return {
            id: item.id,
            name: product.name,
            price: Number(product.price),
            qty: Math.min(MAX_QTY, Math.max(1, Math.floor(Number(item.qty) || 1)))
          };
        });
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function showToast(message) {
    const toast = $('.toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function addToCart(productId, quantity) {
    const product = window.PRODUCTS?.[productId];
    if (!product) return;

    const qty = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(quantity) || 1)));
    const cart = readCart();
    const line = cart.find(item => item.id === productId);

    if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
    else cart.push({ id: productId, name: product.name, price: product.price, qty });

    writeCart(cart);
    showToast('Добавлено в корзину');
  }

  function renderProductPage() {
    const productId = document.body.dataset.product;
    const root = $('#product-root');
    const product = window.PRODUCTS?.[productId];
    if (!root || !product) return;

    const otherId = productId === 'small' ? 'large' : 'small';
    const productImages = productId === 'small'
      ? ['assets/small-box.png', 'assets/small-set.png']
      : ['assets/large-box.webp', 'assets/large-set.webp'];

    root.innerHTML = `
      <div class="crumbs"><a href="index.html">Главная</a>　/　Большая лапта в ударе　/　${product.name}</div>
      <main>
        <section class="pdp">
          <div class="pdp-media">
            <div class="gallery-main pdp-gallery" id="gallery">
              <div class="pdp-gallery-slide is-active" data-gallery-slide="0">
                <div class="pdp-box-panel ${productId === 'small' ? 'pdp-box-panel--small' : 'pdp-box-panel--large'}">
                  <div class="card-box-stage pdp-box-stage">
                    <div class="catalog-box ${productId === 'small' ? 'catalog-box--small' : 'catalog-box--large'}">
                      <div class="catalog-box-front"></div>
                      <div class="catalog-box-spine"></div>
                      <div class="catalog-box-top"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pdp-gallery-slide pdp-gallery-photo" data-gallery-slide="1" hidden>
                <img src="${productImages[1]}" alt="${product.name} — комплектация" loading="lazy">
              </div>
              <button type="button" class="gallery-arrow gallery-prev" aria-label="Предыдущее фото" data-gallery-step="-1">‹</button>
              <button type="button" class="gallery-arrow gallery-next" aria-label="Следующее фото" data-gallery-step="1">›</button>
            </div>
            <div class="thumbs pdp-thumbs">
              <button type="button" class="photo-thumb pdp-thumb pdp-thumb--box active" aria-label="Фото коробки" data-gallery-index="0">
                <span class="pdp-thumb-box ${productId === 'small' ? 'catalog-box--small' : 'catalog-box--large'}"><i></i><b></b><em></em></span>
              </button>
              <button type="button" class="photo-thumb pdp-thumb" aria-label="Фото комплектации" data-gallery-index="1">
                <img src="${productImages[1]}" alt="" loading="lazy">
              </button>
            </div>
          </div>

          <div class="pdp-info">
            <h1>Большая лапта<br><em>в ударе</em></h1>
            <p class="pdp-lead">Увлекательная настольная адаптация традиционной русской игры. Здесь вам предстоит продумывать стратегию, рисковать и радоваться победам!</p>
            <div class="price">${money(product.price)}</div>
            <div class="buyrow">
              <div class="quantity" aria-label="Количество">
                <button type="button" data-minus aria-label="Уменьшить количество">−</button>
                <input id="qty" value="1" min="1" max="${MAX_QTY}" step="1" type="number" inputmode="numeric" aria-label="Количество товаров">
                <button type="button" data-plus aria-label="Увеличить количество">+</button>
              </div>
              <button class="buy" type="button" data-add>Добавить в корзину</button>
            </div>
            <button class="buy secondary" type="button" data-fast>Перейти к оформлению</button>
            <p class="delivery-note">Способ оплаты уточняется.<br>
              <a class="text-link" href="${otherId}.html">Посмотреть ${productId === 'small' ? 'большой' : 'маленький'} формат</a>
            </p>
          </div>
        </section>

        <section class="tabs-wrap">
          <div class="tabs">
            <button class="tab active" type="button" data-tab="about">О товаре</button>
            <button class="tab" type="button" data-tab="specs">Характеристики</button>
            <button class="tab" type="button" data-tab="docs">Инструкция</button>
          </div>
          <div class="tab-panel" id="tab-panel"></div>
        </section>
      </main>
      <div class="toast" aria-live="polite"></div>
    `;

    const panels = {
      about: '<p>Увлекательная настольная адаптация традиционной русской игры. Здесь вам предстоит продумывать стратегию, рисковать и радоваться победам!</p><p class="muted">Подробные правила — в инструкции к игре.</p>',
      specs: `<p class="specs-lead">Для 2 игроков · от 8 лет · около 15 минут на партию. Можно сыграть несколько раз подряд!</p>
        <table>
          <tr><td>Размер короба</td><td>${product.size}</td></tr>
          <tr><td>Размер коробки</td><td>${productId === 'small' ? '78 × 110 × 20 мм' : '200 × 150 × 30 мм'}</td></tr>
          <tr><td>Комплектация</td><td>${productId === 'small'
            ? 'Игровое поле;<br>кубики;<br>инструкция;<br>красные и синие пластиковые фишки.'
            : 'Игровое поле;<br>12 карточек героев;<br>4 кубика;<br>инструкция.'}</td></tr>
        </table>`,
      docs: '<p><a href="https://psv4.userapi.com/s/v1/d2/gz9M1MAZrtQd42Ie4kx5ZdQ3NMPim2QZ1hcwqB3v01Ag-B3d_zdByNZJ_-2SJ2A-mLp5yljeTac9KKqH2TATwT4HFDgib93MWBzDL8txuyf-xGY0Sa94o_V8JXwW1MkBcV7ddc8g6mpu/Instruktsia_A6_105kh148_2026-06_12_str_2_print.pdf" target="_blank" rel="noreferrer">Инструкция к игре (PDF) ↗</a></p>'
    };

    const panel = $('#tab-panel');
    const tabs = $$('[data-tab]', root);
    function activateTab(tab) {
      tabs.forEach(button => button.classList.toggle('active', button === tab));
      panel.innerHTML = panels[tab.dataset.tab] || '';
    }
    tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab)));
    activateTab(tabs[0]);

    const quantityInput = $('#qty', root);
    const getQuantity = () => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(quantityInput.value) || 1)));
    $('[data-minus]', root).addEventListener('click', () => {
      quantityInput.value = Math.max(1, getQuantity() - 1);
    });
    $('[data-plus]', root).addEventListener('click', () => {
      quantityInput.value = Math.min(MAX_QTY, getQuantity() + 1);
    });
    quantityInput.addEventListener('change', () => { quantityInput.value = getQuantity(); });
    $('[data-add]', root).addEventListener('click', () => addToCart(productId, getQuantity()));
    $('[data-fast]', root).addEventListener('click', () => {
      addToCart(productId, getQuantity());
      window.location.href = 'checkout.html';
    });
  }

  function renderCheckout() {
    const root = $('#checkout-cart');
    const form = $('#order-form');
    if (!root || !form) return;

    function draw() {
      const cart = readCart();
      if (!cart.length) {
        root.innerHTML = '<div class="cart-empty"><p>Корзина пока пуста.</p><a href="index.html#choose">Вернуться к выбору игры</a></div>';
        form.hidden = true;
        return;
      }

      form.hidden = false;
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const total = subtotal + DELIVERY_PRICE;

      root.innerHTML = `
        <div class="cart-list">
          <h2 class="cart-heading">Ваш заказ</h2>
          ${cart.map(item => `
            <article class="cart-line" data-cart-line="${item.id}">
              <div class="cart-product">
                <strong>${item.name}</strong>
                <span class="cart-unit-price">${money(item.price)} / шт.</span>
                <div class="cart-controls">
                  <button type="button" data-quantity-change="-1" data-id="${item.id}" aria-label="Уменьшить количество ${item.name}">−</button>
                  <input type="number" min="1" max="${MAX_QTY}" step="1" value="${item.qty}" data-quantity-input="${item.id}" aria-label="Количество ${item.name}">
                  <button type="button" data-quantity-change="1" data-id="${item.id}" aria-label="Увеличить количество ${item.name}">+</button>
                  <button type="button" class="cart-remove" data-remove="${item.id}">Удалить</button>
                </div>
              </div>
              <strong class="cart-line-total">${money(item.price * item.qty)}</strong>
            </article>
          `).join('')}
          <div class="totals">
            <div class="total-row"><span>Товары</span><span>${money(subtotal)}</span></div>
            <div class="total-row"><span>Доставка</span><span>${money(DELIVERY_PRICE)}</span></div>
            <div class="total-row final"><span>Итого</span><strong>${money(total)}</strong></div>
          </div>
        </div>
      `;
    }

    root.addEventListener('click', event => {
      const changeButton = event.target.closest('[data-quantity-change]');
      const removeButton = event.target.closest('[data-remove]');

      if (removeButton) {
        const nextCart = readCart().filter(item => item.id !== removeButton.dataset.remove);
        writeCart(nextCart);
        draw();
        return;
      }

      if (changeButton) {
        const id = changeButton.dataset.id;
        const step = Number(changeButton.dataset.quantityChange);
        const cart = readCart();
        const item = cart.find(entry => entry.id === id);
        if (!item) return;
        item.qty = Math.min(MAX_QTY, Math.max(1, item.qty + step));
        writeCart(cart);
        draw();
      }
    });

    root.addEventListener('change', event => {
      const input = event.target.closest('[data-quantity-input]');
      if (!input) return;
      const cart = readCart();
      const item = cart.find(entry => entry.id === input.dataset.quantityInput);
      if (!item) return;
      item.qty = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(input.value) || 1)));
      writeCart(cart);
      draw();
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!readCart().length) return;
      const success = $('#order-notice');
      if (success) {
        success.hidden = false;
        success.textContent = 'Форма заполнена. Это HTML-прототип: заказ пока не отправляется в CRM. Перед запуском подключим отправку заявки в Tilda CRM.';
      }
    });

    draw();
  }

  function initGallery() {
    const slides = $$('[data-gallery-slide]');
    if (!slides.length) return;
    const thumbs = $$('.pdp-thumb');
    let activeIndex = Math.max(0, slides.findIndex(slide => !slide.hidden));

    function show(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.hidden = i !== activeIndex;
        slide.classList.toggle('is-active', i === activeIndex);
      });
      thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === activeIndex));
    }

    document.addEventListener('click', event => {
      const thumb = event.target.closest('[data-gallery-index]');
      if (thumb) {
        show(Number(thumb.dataset.galleryIndex) || 0);
        return;
      }
      const arrow = event.target.closest('[data-gallery-step]');
      if (arrow) show(activeIndex + Number(arrow.dataset.galleryStep));
    });
  }

  renderProductPage();
  initGallery();
  renderCheckout();
})();
