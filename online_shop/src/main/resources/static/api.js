// api.js - Complete API for Online Shop
const API_BASE_URL = 'http://localhost:8088/api';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Call: ${method} ${url}`, data);
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
        const error = await response.text();
        console.error(`API Error ${response.status}:`, error);
        throw new Error(`API Error (${response.status}): ${error}`);
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    if (typeof document === 'undefined') return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 
                          type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}

// ========== AUTHENTICATION ==========
export async function login(username, password) {
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
            credentials: 'include'
        });
        
        if (response.redirected) {
            const redirectedUrl = response.url;
            if (redirectedUrl.includes('admin.html')) {
                return { success: true, role: 'ADMIN', redirect: '/admin.html' };
            } else if (redirectedUrl.includes('shop.html')) {
                return { success: true, role: 'USER', redirect: '/shop.html' };
            }
        }
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

export async function logout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        localStorage.clear();
        sessionStorage.clear();
        
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login.html';
    }
}

export async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/check-auth`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const auth = await response.json();
            // Store user info
            if (auth.userType === 'ADMIN') {
                localStorage.setItem('userRole', 'ADMIN');
                localStorage.setItem('adminId', auth.adminId);
            } else {
                localStorage.setItem('userRole', 'USER');
                localStorage.setItem('userId', auth.userId);
            }
            localStorage.setItem('username', auth.username);
            return auth;
        }
        return null;
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}

// ========== USERS API ==========
export async function fetchUsers() {
    try {
        const users = await apiCall('/users');
        console.log('Users from API:', users);
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        showNotification('Error loading users: ' + error.message, 'error');
        return [];
    }
}

export async function fetchUserById(userId) {
    try {
        const user = await apiCall(`/users/${userId}`);
        console.log(`User ${userId}:`, user);
        return user;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
}

export async function addUser(userData) {
    try {
        console.log('Adding user with data:', userData);
        
        const dataToSend = {
            username: userData.username,
            email: userData.email,
            password: userData.password
        };
        
        console.log('Sending to API:', dataToSend);
        const result = await apiCall('/users', 'POST', dataToSend);
        console.log('User added successfully:', result);
        showNotification('User added successfully', 'success');
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
}

export async function deleteUser(userId) {
    try {
        await apiCall(`/users/${userId}`, 'DELETE');
        showNotification('User deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

// ========== PRODUCTS API ==========
export async function fetchProducts() {
    try {
        const products = await apiCall('/products');
        console.log('Products from API:', products);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Error loading products: ' + error.message, 'error');
        return [];
    }
}

export async function fetchProductById(productId) {
    try {
        const product = await apiCall(`/products/${productId}`);
        console.log(`Product ${productId}:`, product);
        return product;
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        throw error;
    }
}

export async function addProduct(productData) {
    try {
        console.log('Adding product:', productData);
        const result = await apiCall('/products', 'POST', productData);
        console.log('Product added:', result);
        showNotification('Product added successfully', 'success');
        return result;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

export async function updateProduct(productId, productData) {
    try {
        const result = await apiCall(`/products/${productId}`, 'PUT', productData);
        showNotification('Product updated successfully', 'success');
        return result;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

export async function deleteProduct(productId) {
    try {
        await apiCall(`/products/${productId}`, 'DELETE');
        showNotification('Product deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// ========== CART FUNCTIONS ==========
export async function getCart() {
    try {
        // Check localStorage first
        const localCart = localStorage.getItem('cart');
        if (localCart) {
            return JSON.parse(localCart);
        }
        
        // Try to get cart from API
        try {
            const response = await apiCall('/cart');
            return response;
        } catch (error) {
            // If no cart API, return empty cart
            return { items: [], total: 0 };
        }
    } catch (error) {
        console.error('Error getting cart:', error);
        return { items: [], total: 0 };
    }
}

export async function addToCart(productId) {
    try {
        // Fetch products to get product details
        const products = await fetchProducts();
        const product = products.find(p => p.id == productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        let cart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"total":0}');
        
        const existingItem = cart.items.find(item => item.product.id == productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.items.push({
                product: product,
                quantity: 1
            });
        }
        
        cart.total = parseFloat((cart.total + product.price).toFixed(2));
        localStorage.setItem('cart', JSON.stringify(cart));
        
        showNotification(`${product.name} added to cart!`, 'success');
        return cart;
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
        throw error;
    }
}

export async function removeFromCart(productId) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"total":0}');
        
        const itemIndex = cart.items.findIndex(item => item.product.id == productId);
        if (itemIndex !== -1) {
            const item = cart.items[itemIndex];
            const itemTotal = parseFloat((item.product.price * item.quantity).toFixed(2));
            cart.total = parseFloat((cart.total - itemTotal).toFixed(2));
            
            if (cart.total < 0) cart.total = 0;
            
            cart.items.splice(itemIndex, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            
            showNotification('Item removed from cart', 'success');
            return cart;
        }
        
        return cart;
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing from cart', 'error');
        throw error;
    }
}

export async function updateCartQuantity(productId, quantity) {
    try {
        if (quantity < 1) {
            return await removeFromCart(productId);
        }
        
        let cart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"total":0}');
        const item = cart.items.find(item => item.product.id == productId);
        
        if (item) {
            // Recalculate total
            const oldTotal = parseFloat((item.product.price * item.quantity).toFixed(2));
            cart.total = parseFloat((cart.total - oldTotal).toFixed(2));
            
            item.quantity = quantity;
            const newTotal = parseFloat((item.product.price * quantity).toFixed(2));
            cart.total = parseFloat((cart.total + newTotal).toFixed(2));
            
            localStorage.setItem('cart', JSON.stringify(cart));
            return cart;
        }
        
        return cart;
    } catch (error) {
        console.error('Error updating cart:', error);
        showNotification('Error updating cart quantity', 'error');
        throw error;
    }
}

export async function clearCart() {
    try {
        localStorage.setItem('cart', JSON.stringify({ items: [], total: 0 }));
        return { items: [], total: 0 };
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
}

// ========== PAYMENTS API ==========

export async function makePayment(userId, productId) {
    try {
        console.log(`Making payment for user ${userId}, product ${productId}`);
        
        // First check if we're still logged in
        const auth = await checkAuth();
        if (!auth) {
            showNotification('Session expired. Please login again.', 'error');
            await logout();
            return null;
        }
        
        const response = await apiCall(`/payments/${userId}/product/${productId}`, 'POST');
        showNotification('Payment successful!', 'success');
        return response;
    } catch (error) {
        console.error('Payment error:', error);
        
        // Check if it's an auth error
        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('Session expired. Please login again.', 'error');
            await logout();
        } else {
            showNotification('Payment failed: ' + error.message, 'error');
        }
        throw error;
    }
}

export async function fetchAllPayments() {
    try {
        return await apiCall('/payments');
    } catch (error) {
        console.error('Error fetching payments:', error);
        showNotification('Error loading payments: ' + error.message, 'error');
        return [];
    }
}

export async function fetchPaymentsByUser(userId) {
    try {
        return await apiCall(`/payments/user/${userId}`);
    } catch (error) {
        console.error(`Error fetching payments for user ${userId}:`, error);
        throw error;
    }
}



async function checkSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/check-auth`, {
            method: 'GET',
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}
// ========== STATEMENTS API ==========
export async function fetchStatements() {
    try {
        return await apiCall('/statements');
    } catch (error) {
        console.error('Error fetching statements:', error);
        showNotification('Error loading statements: ' + error.message, 'error');
        return [];
    }
}

export async function fetchStatementById(statementId) {
    try {
        return await apiCall(`/statements/${statementId}`);
    } catch (error) {
        console.error(`Error fetching statement ${statementId}:`, error);
        throw error;
    }
}

// ========== ADMIN SPECIFIC ==========
export async function fetchDashboardStats() {
    try {
        return await apiCall('/admin/stats');
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { users: 0, products: 0, payments: 0, revenue: 0 };
    }
}

export async function fetchRecentActivity() {
    try {
        return await apiCall('/admin/recent-activity');
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
    }
}