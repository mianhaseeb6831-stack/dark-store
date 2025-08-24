console.log("Dark Store: enhanced shop loaded ✅");

document.addEventListener("DOMContentLoaded", () => {
  updateActiveNav();
  updateCartCount();
  initProductsPage();
  initCartPage();
});

/* ---------- Cart Utilities ---------- */
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  countEl.textContent = totalQty;
}

/* ---------- Nav Active Link ---------- */
function updateActiveNav() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(a => {
    if (a.getAttribute("href") === current) {
      a.style.color = "#ff9800";
    }
  });
}

/* ---------- Products Page ---------- */
async function initProductsPage() {
  const grid = document.getElementById("product-grid");
  if (!grid) return; // not on products page

  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort-select");

  // Load products.json
  let products = [];
  try {
    const res = await fetch("products.json");
    products = await res.json();
  } catch (e) {
    grid.innerHTML = "<p>Failed to load products.</p>";
    console.error(e);
    return;
  }

  // State
  let filtered = [...products];

  function discountPct(p) {
    if (!p.oldPrice || p.oldPrice <= p.price) return 0;
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  }

  function render(list) {
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = "<p style='text-align:center;'>No products found.</p>";
      return;
    }
    list.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      const pct = discountPct(p);
      card.innerHTML = `
        ${pct ? `<div class="badge">-${pct}%</div>` : ""}
        <img src="${p.image}" alt="${p.name}"/>
        <h3>${p.name}</h3>
        <div class="price-line">
          <strong>Rs ${p.price.toLocaleString()}</strong>
          ${p.oldPrice ? `<span class="old">Rs ${p.oldPrice.toLocaleString()}</span>` : ""}
        </div>
        <div style="font-size:13px;opacity:.8;margin-bottom:8px;">⭐ ${p.rating || "4.0"} • ${p.category}</div>
        <button class="btn add-to-cart" data-id="${p.id}">Add to Cart</button>
      `;
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    const q = (searchInput.value || "").toLowerCase().trim();
    const cat = categoryFilter.value;

    filtered = products.filter(p => {
      const matchesQ =
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q);
      const matchesCat = cat === "All" || p.category === cat;
      return matchesQ && matchesCat;
    });

    switch (sortSelect.value) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "discount-desc":
        filtered.sort((a, b) => (b.oldPrice - b.price) - (a.oldPrice - a.price));
        break;
      default:
        // featured: keep original order
        break;
    }

    render(filtered);
  }

  // Initial render + listeners
  render(filtered);
  [searchInput, categoryFilter, sortSelect].forEach(el =>
    el && el.addEventListener("input", applyFilters)
  );
  sortSelect && sortSelect.addEventListener("change", applyFilters);

  // Delegate Add to Cart
  grid.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    const id = Number(btn.getAttribute("data-id"));
    const product = products.find(p => p.id === id);
    if (!product) return;

    const cart = getCart();
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        sku: product.sku,
        qty: 1
      });
    }
    saveCart(cart);
    alert(`Added: ${product.name}`);
  });
}

/* ---------- Cart Page ---------- */
function initCartPage() {
  const tbody = document.getElementById("cart-body");
  if (!tbody) return; // not on cart page

  const itemsCountEl = document.getElementById("cart-items-count");
  const totalEl = document.getElementById("cart-total");
  const clearBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout");

  function format(n) {
    return "Rs " + n.toLocaleString();
  }

  function renderCart() {
    const cart = getCart();
    tbody.innerHTML = "";
    if (!cart.length) {
      tbody.innerHTML = `<tr><td colspan="5">Your cart is empty.</td></tr>`;
    } else {
      cart.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <div class="cart-row">
              <img src="${item.image}" alt="${item.name}"/>
              <div>
                <div style="font-weight:700">${item.name}</div>
                <div style="opacity:.8;font-size:12px;">${item.sku || ""}</div>
              </div>
            </div>
          </td>
          <td>${format(item.price)}</td>
          <td>
            <div class="qty-controls">
              <button class="dec" data-id="${item.id}">−</button>
              <span>${item.qty}</span>
              <button class="inc" data-id="${item.id}">+</button>
            </div>
          </td>
          <td>${format(item.price * item.qty)}</td>
          <td><button class="remove" data-id="${item.id}">Remove</button></td>
        `;
        tbody.appendChild(tr);
      });
    }

    const cart2 = getCart();
    const items = cart2.reduce((s, i) => s + i.qty, 0);
    const total = cart2.reduce((s, i) => s + i.price * i.qty, 0);
    itemsCountEl.textContent = items;
    totalEl.textContent = format(total);
    updateCartCount();
  }

  // Events
  tbody.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    const idAttr = e.target.getAttribute("data-id");
    if (!idAttr) return;
    const id = Number(idAttr);
    let cart = getCart();

    if (e.target.classList.contains("inc")) {
      const it = cart.find(i => i.id === id);
      if (it) it.qty += 1;
    } else if (e.target.classList.contains("dec")) {
      const it = cart.find(i => i.id === id);
      if (it && it.qty > 1) it.qty -= 1;
      else cart = cart.filter(i => i.id !== id);
    } else if (e.target.classList.contains("remove")) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart(cart);
    renderCart();
  });

  clearBtn?.addEventListener("click", () => {
    if (confirm("Clear all items?")) {
      saveCart([]);
      renderCart();
    }
  });

  checkoutBtn?.addEventListener("click", () => {
    const total = getCart().reduce((s, i) => s + i.price * i.qty, 0);
    if (!total) return alert("Your cart is empty.");
    alert(`This is a demo checkout.\nTotal: Rs ${total.toLocaleString()}\n(Integrate real payments later)`);
  });

  renderCart();
}
