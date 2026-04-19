// User shopping functionality
import { 
    fetchProducts, 
    getCart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    logout
} from './api.js';

// Global variables
let cart = { items: [], total: 0 };
let products = [];

// DOM Elements
const productsContainer = document.getElementById('products-container');
const cartContainer = document.getElementById('cart-container');
const cartCount = document.getElementById('cart-count');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.content-section');
const checkoutBtn = document.getElementById('checkout-btn');
const logoutBtn = document.getElementById('logout-btn');
const loading = document.getElementById('loading');

// ===================== INIT =====================
import { checkAuth } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        loading.style.display = 'flex';

      
        await loadProducts();
        await loadCart();
        setupEventListeners();

    } catch (error) {
        console.error('Init error:', error);
        window.location.href = '/login.html';
    } finally {
        loading.style.display = 'none';
    }
});

// ===================== PRODUCTS =====================
async function loadProducts() {
    try {
        products = await fetchProducts();
        displayProducts();
    } catch (error) {
        console.error(error);
        showNotification('Failed to load products', 'error');
    }
}
function displayProducts() {
    if (!products.length) {
        productsContainer.innerHTML =
            '<div class="empty-state">No products available</div>';
        return;
    }

    productsContainer.innerHTML = products.map(p => `
        <div class="product-card">
            <img 
                class="product-image"
                src="${p.imageUrl || 'https://via.placeholder.com/300'}" 
                alt="${p.name}"
            />

            <div class="product-body">
                <h3 class="product-title">${p.name}</h3>

                <p class="product-description">
                    ${p.description ? p.description : 'No description available'}
                </p>

                <div class="product-footer">
                    <span class="product-price">$${p.price.toFixed(2)}</span>
                    <button class="add-to-cart" data-id="${p.id}">
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async () => {
            await addToCart(btn.dataset.id);
            await loadCart();
        });
    });
}


// ===================== CART =====================
async function loadCart() {
    try {
        cart = await getCart();

        // SYNC CART (FIX)
        window.cart = cart;
        localStorage.setItem('cart', JSON.stringify(cart));

        updateCartUI();
    } catch (error) {
        console.error(error);
    }
}

function updateCartUI() {
    const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
    cartCount.textContent = totalItems;

    if (!cart.items.length) {
        cartContainer.innerHTML = '<div class="empty-state">Your cart is empty</div>';
        return;
    }

    cartContainer.innerHTML = cart.items.map(item => `
        <div class="cart-item">
            <h4>${item.product.name}</h4>
            <span>$${item.product.price.toFixed(2)}</span>
            <div>
                <button class="minus" data-id="${item.product.id}">-</button>
                <span>${item.quantity}</span>
                <button class="plus" data-id="${item.product.id}">+</button>
                <button class="remove" data-id="${item.product.id}">x</button>
            </div>
        </div>
    `).join('') + `
        <h3>Total: $${cart.total.toFixed(2)}</h3>
    `;

    document.querySelectorAll('.minus').forEach(b =>
        b.onclick = async () => {
            const item = cart.items.find(i => i.product.id == b.dataset.id);
            if (item.quantity > 1) {
                await updateCartQuantity(b.dataset.id, item.quantity - 1);
                await loadCart();
            }
        }
    );

    document.querySelectorAll('.plus').forEach(b =>
        b.onclick = async () => {
            const item = cart.items.find(i => i.product.id == b.dataset.id);
            await updateCartQuantity(b.dataset.id, item.quantity + 1);
            await loadCart();
        }
    );

    document.querySelectorAll('.remove').forEach(b =>
        b.onclick = async () => {
            await removeFromCart(b.dataset.id);
            await loadCart();
        }
    );
}

// ===================== EVENTS =====================
function setupEventListeners() {
    navLinks.forEach(link => {
        link.onclick = e => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(link.dataset.section).classList.add('active');
        };
    });

    logoutBtn.onclick = async e => {
        e.preventDefault();
        localStorage.clear();
        await logout();
        window.location.href = '/login.html';
    };

    checkoutBtn.onclick = handleCheckout;
}

// ===================== CHECKOUT =====================
async function handleCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart'));

    if (!cart || !cart.items.length) {
        alert('Cart is empty');
        return;
    }

    loading.style.display = 'flex';

    try {
        for (const item of cart.items) {
            const res = await fetch(
                `http://localhost:8088/api/payments/product/${item.product.id}`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );

            if (!res.ok) {
                throw new Error(await res.text());
            }
        }

        localStorage.setItem('cart', JSON.stringify({ items: [], total: 0 }));
        window.cart = { items: [], total: 0 };
        updateCartUI();

        alert('Payment successful');

    } catch (err) {
        console.error(err);
        alert('Payment failed');
    } finally {
        loading.style.display = 'none';
    }
}

// ===================== NOTIFICATIONS =====================
function showNotification(message, type = 'info') {
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}
