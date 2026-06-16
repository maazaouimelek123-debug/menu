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
  const checkout = document.getElementById('cart-checkout');
  if (cart.length > 0) checkout.classList.add('visible');
  else checkout.classList.remove('visible');
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

function checkout() {
  const summary = document.getElementById('checkout-summary');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  summary.innerHTML = cart.map(item =>
    `<div class="checkout-row">
      <span class="checkout-row-name">${item.name} × ${item.qty}</span>
      <span class="checkout-row-price">${(item.price * item.qty).toFixed(3)} DT</span>
    </div>`
  ).join('') +
  `<div class="checkout-total-row">
    <span>Total</span>
    <span>${total.toFixed(3)} DT</span>
  </div>`;

  document.getElementById('qr-box').classList.remove('active');
  document.getElementById('qr-start-btn').classList.remove('hidden');
  document.getElementById('qr-success').classList.remove('show');
  document.getElementById('checkout-panel').classList.add('open');
  toggleCart();
}

function closeCheckout() {
  document.getElementById('checkout-panel').classList.remove('open');
  stopScan();
}

let scanStream = null;
let scanInterval = null;

function startScan() {
  const video = document.getElementById('qr-video');
  const box = document.getElementById('qr-box');
  const btn = document.getElementById('qr-start-btn');

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      scanStream = stream;
      video.srcObject = stream;
      box.classList.add('active');
      btn.classList.add('hidden');

      const canvas = document.getElementById('qr-canvas');
      const ctx = canvas.getContext('2d');

      scanInterval = setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = typeof jsQR !== 'undefined' ? jsQR(img.data, img.width, img.height) : null;
          if (code) {
            onScanSuccess(code.data);
          }
        }
      }, 300);
    })
    .catch(() => {
      onScanSuccess('BISOU-TABLE-01');
    });
}

function stopScan() {
  if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
  clearInterval(scanInterval);
  document.getElementById('qr-box').classList.remove('active');
}

function onScanSuccess(data) {
  stopScan();
  document.getElementById('qr-hint').textContent = data;
  document.getElementById('qr-success').classList.add('show');

  const order = {
    id: Date.now(),
    ref: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('fr-FR'),
    items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    total: cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(3),
    status: 'en attente'
  };
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  }).catch(() => {
    const orders = JSON.parse(localStorage.getItem('bisou_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('bisou_orders', JSON.stringify(orders));
  });

  setTimeout(() => {
    cart.length = 0;
    renderCart();
    closeCheckout();
  }, 2500);
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
