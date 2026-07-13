let cart = [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Show/Hide sections
function showSection(sectionId, eventTarget) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected section
    const destination = document.getElementById(sectionId);
    if (destination) {
        destination.classList.add('active');
    }

    const clickedButton = eventTarget || (typeof event !== 'undefined' ? event.target : null);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateOrderHistoryUI() {
    const orderHistoryContainer = document.getElementById('order-history');
    if (!orderHistoryContainer) return;

    orderHistoryContainer.innerHTML = '';

    if (orders.length === 0) {
        orderHistoryContainer.innerHTML = '<div class="order-history-empty">No orders yet. Place an order to see it here.</div>';
        return;
    }

    orders.slice().reverse().forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-history-item';
        orderItem.innerHTML = `
            <div class="order-history-header">
                <div>
                    <div><strong>Order #${order.id}</strong></div>
                    <div class="order-history-meta">Placed on ${formatDateTime(order.createdAt)}</div>
                </div>
                <div class="order-history-meta">
                    ${order.name} · ${order.email} · ${order.phone}
                </div>
            </div>
            <div class="order-history-meta">Delivery date: ${order.delivery}</div>
            <div class="order-history-meta">Address: ${order.address}</div>
            <div class="order-history-items">
                ${order.items.map(item => `
                    <div class="order-history-item-entry">
                        <span>${item.name}</span>
                        <strong>₱${item.price}</strong>
                    </div>
                `).join('')}
            </div>
            <div class="summary-row total" style="margin-top: 15px;">
                <span>Total</span>
                <span>₱${order.total}</span>
            </div>
        `;
        orderHistoryContainer.appendChild(orderItem);
    });
}

// Add to cart
function addToCart(itemName, price) {
    cart.push({
        name: itemName,
        price: price,
        id: Date.now()
    });

    updateCartUI();
    showNotification(`${itemName} added to cart!`);
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotal = document.getElementById('subtotal');
    const total = document.getElementById('total');

    // Update cart count
    cartCount.textContent = cart.length;

    // Clear container
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty. Add items from the menu!</div>';
        subtotal.textContent = '₱0';
        total.textContent = '₱0';
        return;
    }

    // Add items to cart
    let totalPrice = 0;
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₱${item.price}</div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
        totalPrice += item.price;
    });

    // Update totals
    subtotal.textContent = `₱${totalPrice}`;
    total.textContent = `₱${totalPrice}`;
}

// Remove from cart
function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updateCartUI();
    showNotification(`${removedItem.name} removed from cart`);
}

// Clear cart
function clearCart() {
    if (cart.length === 0) {
        showNotification('Cart is already empty!');
        return;
    }
    cart = [];
    updateCartUI();
    showNotification('Cart cleared!');
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty! Add items before checkout.');
        return;
    }
    showSection('order');
    showNotification('Please fill in your delivery details.');
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const delivery = document.getElementById('delivery').value;
            const address = document.getElementById('address').value;

            if (cart.length === 0) {
                showNotification('Please add items to your cart first!');
                return;
            }

            // Calculate total
            const total = cart.reduce((sum, item) => sum + item.price, 0);

            const order = {
                id: Date.now(),
                name,
                email,
                phone,
                delivery,
                address,
                items: cart.map(item => ({ name: item.name, price: item.price })),
                total,
                createdAt: new Date().toISOString()
            };

            orders.push(order);
            saveOrders();
            updateOrderHistoryUI();

            // Create order summary
            const orderSummary = `
                Order Confirmation!
                ---
                Name: ${name}
                Email: ${email}
                Phone: ${phone}
                Delivery Date: ${delivery}
                Address: ${address}
                ---
                Items:
                ${cart.map(item => `- ${item.name}: ₱${item.price}`).join('\n')}
                ---
                Total: ₱${total}
            `;

            // Log order (in real app, send to backend)
            console.log(orderSummary);

            // Show success message
            alert(orderSummary + '\n\nThank you for your order! Your order has been saved to history.');

            // Reset form and cart
            orderForm.reset();
            cart = [];
            updateCartUI();
            showSection('orders');
        });
    }

    updateOrderHistoryUI();
});

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);