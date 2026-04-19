// script.js - Simplified for admin permissions
import { 
    fetchUsers, fetchUserById, addUser,
    fetchProducts, fetchProductById, addProduct,
    fetchStatements, fetchStatementById,
    fetchAllPayments, fetchPaymentsByUser
} from './api.js';

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close-btn');
const modalBody = document.getElementById('modal-body');
const loadingSpinner = document.getElementById('loading');

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show corresponding section
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
                loadSectionContent(sectionId);
            }
        });
    });
});

// Modal functions
function openModal(content) {
    modalBody.innerHTML = content;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    modalBody.innerHTML = '';
}

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Loading spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Load section content
async function loadSectionContent(section) {
    showLoading();
    
    try {
        switch(section) {
            case 'products':
                await loadProducts();
                break;
            case 'users':
                await loadUsers();
                break;
            case 'payments':
                await loadPayments();
                break;
            case 'statements':
                await loadStatements();
                break;
        }
    } catch (error) {
        showError(`Error loading ${section}: ${error.message}`);
    } finally {
        hideLoading();
    }
}
async function loadUsers() {
    try {
        const users = await fetchUsers();
        console.log('Users data:', users); // Debug
        
        const container = document.getElementById('users-container');
        
        if (!users || users.length === 0) {
            container.innerHTML = '<p class="no-data">No users found.</p>';
            return;
        }
        
        container.innerHTML = users.map(user => {
            // Now use user.username (from getUsername())
            const displayName = user.username || user.email || 'Unknown';
            const displayEmail = user.email || 'No email';
            const joinDate = user.createdAt || 'Unknown';
            
            return `
                <div class="user-card" data-id="${user.id}">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-info">
                        <h3 class="user-name">${displayName}</h3>
                        <p class="user-email">${displayEmail}</p>
                        <p class="user-ID">ID: ${user.id}</p>
                       
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-sm btn-view" onclick="viewUserDetails(${user.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        showError(`Error loading users: ${error.message}`);
    }
}
function showAddUserForm() {
    const formHTML = `
        <h3><i class="fas fa-user-plus"></i> Add New User</h3>
        <form id="user-form">
            <div class="form-group">
                <label for="user-username">Username *</label>
                <input type="text" id="user-username" required 
                       placeholder="Enter username">
            </div>
            <div class="form-group">
                <label for="user-email">Email *</label>
                <input type="email" id="user-email" required 
                       placeholder="user@example.com">
            </div>
            <div class="form-group">
                <label for="user-password">Password *</label>
                <input type="password" id="user-password" required 
                       placeholder="Enter password">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save User
                </button>
            </div>
        </form>
    `;
    
    openModal(formHTML);
    
    const form = document.getElementById('user-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        
        try {
            const userData = {
                username: document.getElementById('user-username').value, // Use username
                email: document.getElementById('user-email').value,
                password: document.getElementById('user-password').value
            };
            
            const newUser = await addUser(userData);
            showSuccess(`User "${userData.username}" added successfully!`);
            
            closeModal();
            await loadUsers(); // Refresh the list
        } catch (error) {
            showError(`Error adding user: ${error.message}`);
        } finally {
            hideLoading();
        }
    });
}
async function viewUserDetails(userId) {
    showLoading();
    try {
        const user = await fetchUserById(userId);
        console.log('User details:', user); // Debug
        
        const detailsHTML = `
            <h3><i class="fas fa-user"></i> User Details</h3>
            <div class="user-details">
                <p><strong>ID:</strong> ${user.id || 'N/A'}</p>
                <p><strong>Username:</strong> ${user.username || 'Not set'}</p>
                <p><strong>Email:</strong> ${user.email || 'Not set'}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal()">
                    <i class="fas fa-check"></i> Close
                </button>
            </div>
        `;
        
        openModal(detailsHTML);
    } catch (error) {
        showError(`Error fetching user details: ${error.message}`);
    } finally {
        hideLoading();
    }
}
// ========== PRODUCTS SECTION (Admin can: add, get all, get by id) ==========
async function loadProducts() {
    try {
        const products = await fetchProducts();
        const container = document.getElementById('products-container');
        
        if (!products || products.length === 0) {
            container.innerHTML = '<p class="no-data">No products found. Add your first product!</p>';
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/200x150?text=No+Image'}" 
                         alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || 'No description'}</p>
                    <div class="product-details">
                        <span class="product-price">$${product.price?.toFixed(2) || '0.00'}</span>
                        <span class="product-stock">ID: ${product.id}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-sm btn-view" onclick="viewProductDetails(${product.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(`Error loading products: ${error.message}`);
    }
}

function showAddProductForm() {
    const formHTML = `
        <h3><i class="fas fa-box"></i> Add New Product</h3>
        <form id="product-form">
            <div class="form-group">
                <label for="product-name">Product Name *</label>
                <input type="text" id="product-name" required 
                       placeholder="Enter product name">
            </div>
            <div class="form-group">
                <label for="product-description">Description</label>
                <textarea id="product-description" rows="3" 
                          placeholder="Enter product description"></textarea>
            </div>
            <div class="form-group">
                <label for="product-price">Price ($) *</label>
                <input type="number" id="product-price" step="0.01" min="0" required 
                       placeholder="0.00">
            </div>
            <div class="form-group">
                <label for="product-stock">Stock Quantity *</label>
                <input type="number" id="product-stock" min="0" required 
                       placeholder="Enter stock quantity">
            </div>
            <div class="form-group">
                <label for="product-image">Image URL</label>
                <input type="url" id="product-image" 
                       placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Add Product
                </button>
            </div>
        </form>
    `;
    
    openModal(formHTML);
    
    const form = document.getElementById('product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        
        try {
            const productData = {
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value || null,
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                imageUrl: document.getElementById('product-image').value || null
            };
            
            const newProduct = await addProduct(productData);
            showSuccess(`Product "${productData.name}" added successfully!`);
            
            closeModal();
            await loadProducts(); // Refresh the list
        } catch (error) {
            showError(`Error adding product: ${error.message}`);
        } finally {
            hideLoading();
        }
    });
}

async function viewProductDetails(productId) {
    showLoading();
    try {
        const product = await fetchProductById(productId);
        const detailsHTML = `
            <h3><i class="fas fa-box"></i> Product Details</h3>
            <div class="product-details-modal">
                ${product.imageUrl ? `
                    <div class="modal-product-image">
                        <img src="${product.imageUrl}" alt="${product.name}">
                    </div>
                ` : ''}
                <div class="modal-product-info">
                    <p><strong>ID:</strong> ${product.id}</p>
                    <p><strong>Name:</strong> ${product.name}</p>
                    <p><strong>Price:</strong> $${product.price?.toFixed(2) || '0.00'}</p>
                    <p><strong>Stock:</strong> ${product.stock || 0} units</p>
                    ${product.description ? `<p><strong>Description:</strong> ${product.description}</p>` : ''}
                    <p><strong>Created:</strong> ${formatDate(product.createdAt)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal()">
                        <i class="fas fa-check"></i> Close
                    </button>
                </div>
            </div>
        `;
        openModal(detailsHTML);
    } catch (error) {
        showError(`Error fetching product details: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// ========== PAYMENTS SECTION (Admin can: get all, get by user) ==========
async function loadPayments() {
    try {
        const payments = await fetchAllPayments();
        const container = document.getElementById('payments-container');
        
        if (!payments || payments.length === 0) {
            container.innerHTML = '<p class="no-data">No payments found.</p>';
            return;
        }
        
        container.innerHTML = payments.map(payment => `
            <div class="payment-card" data-id="${payment.id}">
                <div class="payment-header">
                    <span class="payment-id">Payment #${payment.id}</span>
                    <span class="payment-status ${payment.status?.toLowerCase() || 'pending'}">
                        ${payment.status || 'PENDING'}
                    </span>
                </div>
                <div class="payment-body">
                    <p><i class="fas fa-user"></i> User ID:  ${payment.user?.id ?? 'N/A'}</p>
                    <p><i class="fas fa-dollar-sign"></i> Amount: $${payment.amount?.toFixed(2) || '0.00'}</p>
                    <p><i class="fas fa-calendar"></i> Date: ${formatDate(payment.paymentDate)}</p>
                   
                </div>
                <div class="payment-actions">
				${payment.user?.id ? `
				<button class="btn btn-sm btn-view" onclick="viewUserPayments(${payment.user.id})">
				    <i class="fas fa-list"></i> View User's Payments
				</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(`Error loading payments: ${error.message}`);
    }
}

async function viewUserPayments(userId) {
	
	if (!userId) {
	      showError('Invalid user ID');
	      return;
	  }
    showLoading();
    try {
        const payments = await fetchPaymentsByUser(userId);
        const container = document.getElementById('payments-container');
        
        if (!payments || payments.length === 0) {
            container.innerHTML = `<p class="no-data">No payments found for User ID: ${userId}</p>`;
            return;
        }
        
        container.innerHTML = `
            <div class="section-subheader">
                <h3>Payments for User ID: ${userId}</h3>
                <button class="btn btn-secondary" onclick="loadPayments()">
                    <i class="fas fa-arrow-left"></i> Back to All Payments
                </button>
            </div>
            ${payments.map(payment => `
                <div class="payment-card" data-id="${payment.id}">
                    <div class="payment-header">
                        <span class="payment-id">Payment #${payment.id}</span>
                        <span class="payment-status ${payment.status?.toLowerCase() || 'pending'}">
                            ${payment.status || 'PENDING'}
                        </span>
                    </div>
                    <div class="payment-body">
                        <p><i class="fas fa-dollar-sign"></i> Amount: $${payment.amount?.toFixed(2) || '0.00'}</p>
                        <p><i class="fas fa-calendar"></i> Date: ${formatDate(payment.paymentDate)}</p>
                       
                    </div>
                </div>
            `).join('')}
        `;
    } catch (error) {
        showError(`Error fetching user payments: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// ========== STATEMENTS SECTION (Admin can: get all, get by id) ==========
async function loadStatements() {
    try {
        const statements = await fetchStatements();
        const container = document.getElementById('statements-container');

        if (!statements || statements.length === 0) {
            container.innerHTML = '<p class="no-data">No payment statements found.</p>';
            return;
        }

        container.innerHTML = statements.map(statement => `
            <div class="statement-card">
                <div class="statement-header">
                    <h3>Transaction</h3>
                    <span class="statement-status ${statement.status.toLowerCase()}">
                        ${statement.status}
                    </span>
                </div>

                <div class="statement-body">
                    <p><strong>Transaction ID:</strong> ${statement.transactionId}</p>
                    <p><strong>Amount:</strong> $${statement.amount.toFixed(2)}</p>
                    <p><strong>User ID:</strong> ${statement.user?.id ?? 'N/A'}</p>
                    <p><strong>Product ID:</strong> ${statement.product?.id ?? 'N/A'}</p>
                    <p><strong>Date:</strong> ${formatDate(statement.createdAt)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(`Error loading statements: ${error.message}`);
    }
}


async function viewStatementDetails(statementId) {
    showLoading();
    try {
        const statement = await fetchStatementById(statementId);

        const detailsHTML = `
            <h3><i class="fas fa-file-invoice"></i> Payment Statement</h3>
            <div class="statement-details">
                <p><strong>ID:</strong> ${statement.id}</p>
                <p><strong>Transaction ID:</strong> ${statement.transactionId}</p>
                <p><strong>Amount:</strong> $${statement.amount.toFixed(2)}</p>
                <p><strong>Status:</strong> ${statement.status}</p>
                <p><strong>User ID:</strong> ${statement.user?.id ?? 'N/A'}</p>
                <p><strong>Product ID:</strong> ${statement.product?.id ?? 'N/A'}</p>
                <p><strong>Date:</strong> ${formatDate(statement.createdAt)}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal()">Close</button>
            </div>
        `;

        openModal(detailsHTML);
    } catch (error) {
        showError(`Error fetching statement details: ${error.message}`);
    } finally {
        hideLoading();
    }
}


// ========== UTILITY FUNCTIONS ==========
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
}

// ========== EVENT LISTENERS ==========
document.getElementById('add-user-btn').addEventListener('click', showAddUserForm);
document.getElementById('add-product-btn').addEventListener('click', showAddProductForm);
document.getElementById('make-payment-btn').style.display = 'none'; // Hide button since admin can't make payments

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Load default section (products)
    loadSectionContent('products');
});

// logout

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simple POST request to logout
            fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            })
            .then(() => {
                // Redirect to login page after logout
                window.location.href = '/login.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                window.location.href = '/login.html';
            });
        });
    }
});



// Make functions available globally
window.viewUserDetails = viewUserDetails;
window.viewProductDetails = viewProductDetails;
window.viewUserPayments = viewUserPayments;
window.viewStatementDetails = viewStatementDetails;
window.closeModal = closeModal;
window.loadPayments = loadPayments;
