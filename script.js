// Load Products
const apiPath = 'products.json';
const grid = document.getElementById('product-grid');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

if (grid) {
  fetch(apiPath)
    .then(res => res.json())
    .then(products => {
      products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>$${product.price.toFixed(2)}</p>
          <button data-id="${product.id}">Add to Cart</button>
        `;
        grid.append(card);
      });

      grid.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
          const productId = +e.target.dataset.id;
          fetch(apiPath)
            .then(res => res.json())
            .then(products => {
              const prod = products.find(p => p.id === productId);
              cart.push(prod);
              localStorage.setItem('cart', JSON.stringify(cart));
              alert(`${prod.name} added to cart!`);
            });
        }
      });
    });
}

// Load Cart
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

if (cartItems) {
  let total = 0;
  cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <h4>${item.name}</h4>
      <p>$${item.price.toFixed(2)}</p>
    `;
    cartItems.append(div);
    total += item.price;
  });
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}
