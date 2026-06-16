const cart = [];

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price: parseFloat(price), qty: 1 });
  }
  renderCart();
  animateBubble();
}

function removeFromCart(name) {
  const idx = cart.findIndex(i => i.name === name);
  if (idx === -1) return;
  if (cart[idx].qty > 1) {
    cart[idx].qty--;
  } else {
    cart.splice(idx, 1);
  }
  renderCart();
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-bubble').style.display = count > 0 ? 'flex' : 'none';

  const list = document.getElementById('cart-list');
  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#a05030;font-size:0.85rem;padding:2rem 0;">Votre panier est vide</p>';
  } else {
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <span class="cart-row-name">${item.name}</span>
        <div class="cart-row-right">
          <button class="cart-qty-btn" onclick="removeFromCart('${item.name.replace(/'/g,"\\'")}')">−</button>
          <span class="cart-row-qty">${item.qty}</span>
          <button class="cart-qty-btn" onclick="addToCart('${item.name.replace(/'/g,"\\'")}', ${item.price})">+</button>
          <span class="cart-row-price">${(item.price * item.qty).toFixed(3)}</span>
        </div>`;
      list.appendChild(row);
    });
  }

  document.getElementById('cart-total').textContent = total.toFixed(3) + ' DT';
}

function animateBubble() {
  const bubble = document.getElementById('cart-bubble');
  bubble.classList.remove('bounce');
  void bubble.offsetWidth;
  bubble.classList.add('bounce');

  const notif = document.createElement('div');
  notif.className = 'cart-notif';
  notif.textContent = '+1';
  document.body.appendChild(notif);

  const rect = bubble.getBoundingClientRect();
  notif.style.left = (rect.left + rect.width / 2 - 18) + 'px';
  notif.style.top = (rect.top - 10) + 'px';

  setTimeout(() => notif.remove(), 900);
}

function toggleCart() {
  const panel = document.getElementById('cart-panel');
  panel.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown-item').forEach(item => {
    const name = item.querySelector('.dropdown-item-name').textContent.trim();
    const price = item.querySelector('.dropdown-item-price').textContent.trim();
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(name, price);

      item.classList.add('added');
      setTimeout(() => item.classList.remove('added'), 600);
    });
  });

  renderCart();
});
