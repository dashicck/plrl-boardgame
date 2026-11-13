(() => {
  const tabs = document.querySelector('.tabs');
  const panel = document.querySelector('#tab-panel');
  if (!tabs || !panel) return;

  tabs.querySelector('[data-tab="about"]')?.remove();
  const reviewsTab = document.createElement('button');
  reviewsTab.className = 'tab';
  reviewsTab.dataset.tab = 'reviews';
  reviewsTab.textContent = 'Отзывы';
  tabs.append(reviewsTab);

  const productId = document.body.dataset.product || 'product';
  const storageKey = `lapta-reviews-${productId}`;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const render = () => {
    let reviews = [];
    try { reviews = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}
    panel.innerHTML = `<div class="reviews-list">${reviews.length
      ? reviews.map(review => `<article class="review-item"><div class="review-heading"><strong>${escapeHtml(review.name)}</strong><span>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span></div><p>${escapeHtml(review.text).replace(/\n/g, '<br>')}</p></article>`).join('')
      : '<p class="muted">Отзывов пока нет. Будьте первыми!</p>'
    }</div><form class="review-form"><h3>Оставить отзыв</h3><label>Ваше имя<input name="name" required maxlength="60" placeholder="Как к вам обращаться"></label><label>Оценка<select name="rating" required><option value="5">5 – отлично</option><option value="4">4 – хорошо</option><option value="3">3 – нормально</option><option value="2">2 – плохо</option><option value="1">1 – очень плохо</option></select></label><label>Текст отзыва<textarea name="text" required rows="4" maxlength="1000" placeholder="Расскажите о впечатлениях от игры"></textarea></label><button class="buy" type="submit">Опубликовать отзыв</button></form>`;
    panel.querySelector('.review-form').addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      reviews.unshift({ name: form.get('name').trim(), rating: Number(form.get('rating')), text: form.get('text').trim() });
      try { localStorage.setItem(storageKey, JSON.stringify(reviews)); } catch {}
      render();
    });
  };

  reviewsTab.addEventListener('click', () => {
    tabs.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === reviewsTab));
    render();
  });
  tabs.querySelector('[data-tab="specs"]')?.click();
})();

