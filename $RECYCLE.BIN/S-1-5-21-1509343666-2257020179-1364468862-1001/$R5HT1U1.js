        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        setLogLevel('debug'); // Enable Firestore logging

        // --- 0. FIREBASE GLOBAL SETUP ---
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        let app, db, auth;
        let userId = null; 
        let isAuthReady = false; 

        // --- 1. PRODUCT & RATE DATA ---
        const DELIVERY_RATES = [
    { city: "Select Delivery Location...", cost: 0.00 },
    { city: "Ariyalur", cost: 42.00 },
    { city: "Chengalpattu", cost: 48.00 },
    { city: "Chennai", cost: 56.00 },
    { city: "Coimbatore", cost: 72.00 },
    { city: "Cuddalore", cost: 32.00 },
    { city: "Dharmapuri", cost: 58.00 },
    { city: "Dindigul", cost: 74.00 },
    { city: "Erode", cost: 88.00 },
    { city: "Kallakurichi", cost: 35.00 },
    { city: "Kancheepuram", cost: 54.00 },
    { city: "Kanniyakumari", cost: 105.00 },
    { city: "Karur", cost: 75.00 },
    { city: "Krishnagiri", cost: 60.00 },
    { city: "Madurai", cost: 83.00 },
    { city: "Mayiladuthurai", cost: 25.00 },
    { city: "Nagapattinam", cost: 48.00 },
    { city: "Namakkal", cost: 63.00 },
    { city: "Nilgiris", cost: 86.00 },
    { city: "Perambalur", cost: 48.00 },
    { city: "Pudukkottai", cost: 65.00 },
    { city: "Ramanathapuram", cost: 76.00 },
    { city: "Ranipet", cost: 45.00 },
    { city: "Salem", cost: 52.00 },
    { city: "Sivaganga", cost: 53.00 },
    { city: "Tenkasi", cost: 73.00 },
    { city: "Thanjavur", cost: 53.00 },
    { city: "Theni", cost: 83.00 },
    { city: "Thoothukudi", cost: 23.00 },
    { city: "Tiruchirappalli", cost: 0.00 },
    { city: "Tirunelveli", cost: 65.00 },
    { city: "Tirupathur", cost: 33.00 },
    { city: "Tiruppur", cost: 62.00 },
    { city: "Tiruvallur", cost: 26.00 },
    { city: "Tiruvannamalai", cost: 23.00 },
    { city: "Tiruvarur", cost: 34.00 },
    { city: "Vellore", cost: 43.00 },
    { city: "Viluppuram", cost: 23.00 },
    { city: "Virudhunagar", cost: 56.00 }
];


        const PRODUCTS = {
            'soap': {
                name: "Homemade Soap",
                icon: "fas fa-bath",
                products: [
                    { id: 's1', name: 'Lavender Calm Bar', price: 80.00, desc: 'Relaxing, small-batch cold process soap.', image_hint: 'Lavender Soap Bar' },
                    { id: 's2', name: 'Coffee Scrub Soap', price: 95.00, desc: 'Exfoliating and energizing with fresh coffee grounds.', image_hint: 'Coffee Scrub Soap' },
                ]
            },
            'hair': {
                name: "Hair Products",
                icon: "fas fa-spray-can",
                products: [
                    { id: 'h1', name: 'Rosemary Growth Oil', price: 150.00, desc: 'Infused with rosemary and castor oil for strength.', image_hint: 'Rosemary Oil Bottle' },
                    { id: 'h2', name: 'Argan Shine Serum', price: 185.00, desc: 'Lightweight serum for frizz control and shine.', image_hint: 'Argan Shine Serum' },
                ]
            },
            'cosmetics': {
                name: "Cosmetic Products",
                icon: "fas fa-palette",
                products: [
                    { id: 'c1', name: 'Beetroot Lip Stain', price: 120.00, desc: 'Natural color with moisturizing oils.', image_hint: 'Beetroot Lip Stain' },
                    { id: 'c2', name: 'Natural Mineral Foundation', price: 220.00, desc: 'Light coverage, breathable mineral powder.', image_hint: 'Mineral Powder Foundation' },
                ]
            },
            'eatable': {
                name: "Eatable Items",
                icon: "fas fa-cookie-bite",
                products: [
                    { id: 'e1', name: 'Almond Butter Cookies', price: 100.00, desc: 'Gluten-free, made with raw almond butter.', image_hint: 'Almond Butter Cookies' },
                    { id: 'e2', name: 'Spicy Herb Mix', price: 65.00, desc: 'Hand-blended spice mix for seasoning.', image_hint: 'Spicy Herb Mix' },
                ]
            },
            'tea': {
                name: "Tea Products",
                icon: "fas fa-mug-hot",
                products: [
                    { id: 't1', name: 'Hibiscus Tea', price: 110.00, desc: 'Vibrant, tart tea from hibiscus flower and powder.', image_hint: 'Hibiscus Flower Tea Powder' },
                    { id: 't2', name: 'Blue Pea Tea', price: 130.00, desc: 'Naturally blue tea with antioxidant properties.', image_hint: 'Blue Pea Flower Tea' },
                    { id: 't3', name: 'Herbal Tea', price: 90.00, desc: 'A soothing blend of traditional herbs and spices.', image_hint: 'Mixed Herbs Spices Tea' },
                    { id: 't4', name: 'Sugar Detox Tea', price: 150.00, desc: 'Designed to support blood sugar management.', image_hint: 'Cinnamon Herbs Detox Tea' },
                    { id: 't5', name: 'Fat Burn Tea', price: 160.00, desc: 'Metabolism-boosting blend of green tea and spices.', image_hint: 'Green Tea Leaves Spices' },
                    { id: 't6', name: 'Java Plum Tea', price: 125.00, desc: 'Made from Java plum seeds, beneficial for health.', image_hint: 'Java Plum Seed Tea' },
                    { id: 't7', name: 'Immunity Tea', price: 140.00, desc: 'Packed with immunity-boosting natural ingredients.', image_hint: 'Turmeric Ginger Lemon Tea' },
                    { id: 't8', name: 'Avarampoo Tea', price: 105.00, desc: 'Traditional South Indian herbal tea from Avaram Senna flowers.', image_hint: 'Avarampoo Flower Tea' },
                    { id: 't9', name: 'Rose Petal Tea', price: 95.00, desc: 'Fragrant and delicate tea made from dried rose petals.', image_hint: 'Rose Petals Dried Tea' }
                ]
            }
        };

        /** * Utility to find a product object by its ID across all categories. */
        function findProductById(productId) {
            for (const categoryKey in PRODUCTS) {
                const product = PRODUCTS[categoryKey].products.find(p => p.id === productId);
                if (product) {
                    return product;
                }
            }
            return null; 
        }

        // --- 2. GLOBAL STATE & UTILITIES ---
        let cart = {}; 
        let submittedOrders = []; 
        let customerDetails = { 
            name: '', 
            phone: '', 
            email: '', 
            deliveryAddress: '',
            deliveryLocation: DELIVERY_RATES[0], 
        };
        let currentView = 'welcome';
        
        const contentArea = document.getElementById('content-area');
        const cartCountEl = document.getElementById('cart-count');
        const messageBox = document.getElementById('message-box');
        const navButtonsEl = document.getElementById('nav-buttons'); 
        
        /** Generates a descriptive placeholder image URL. */
        const getPlaceholderImage = (text) => {
            const placeholderText = encodeURIComponent(text.replace(/ /g, '+').slice(0, 25)); 
            return `https://placehold.co/150x150/FFFFFF/1E6E1E?text=${placeholderText}`;
        }

        /** Shows a temporary message to the user (replaces alert()). */
        function showMessage(message, type = 'success') {
            const el = document.createElement('div');
            const color = type === 'success' ? 'bg-gold-accent text-white' : 'bg-red-600 text-white'; 
            el.className = `${color} px-4 py-3 rounded-xl shadow-xl transition-all duration-300 font-semibold`;
            el.textContent = message;

            messageBox.appendChild(el);

            setTimeout(() => {
                el.classList.add('opacity-0', 'scale-90');
                el.addEventListener('transitionend', () => messageBox.removeChild(el));
            }, 3000);
        }
        
        /** Updates the cart count displayed in the header. */
        function updateCartDisplay() {
            const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
            cartCountEl.textContent = totalItems;
        }

        /** Updates the user profile icon in the header using the first initial of the customer's name. */
        function updateProfileDisplay() {
            const profileEl = document.getElementById('user-profile-icon');
            if (!profileEl) return;

            if (customerDetails.name) {
                const initial = customerDetails.name.charAt(0).toUpperCase();
                profileEl.textContent = initial;
            } else {
                profileEl.innerHTML = `<i class="fas fa-user"></i>`;
            }
        }
        
        /** Shows the modal after order "submission" */
        function showOrderSuccessModal(orderDataText, totalAmount) {
            const modalBody = document.querySelector('#order-modal > div');
            
            modalBody.querySelectorAll('.modal-action-buttons').forEach(el => el.remove());
            
            const confirmationMessage = `
                <div class="space-y-3">
                    <p class="text-gray-700 font-semibold text-lg">
                        Thank you! We have successfully recorded the following details for your review:
                    </p>
                    <div class="bg-gray-100 p-4 rounded-lg border border-gold-accent/50">
                        <p class="text-sm text-charcoal-theme font-medium mb-1">Customer Details:</p>
                        <p class="text-base font-bold text-gold-accent">${customerDetails.name}</p>
                        <p class="text-sm text-gray-700">${customerDetails.phone} | ${customerDetails.email}</p>
                        <p class="text-sm text-gray-700 mt-1 truncate">
                            Delivery Address: ${customerDetails.deliveryAddress} 
                            <span class="font-semibold text-xs text-red-600">(in ${customerDetails.deliveryLocation.city})</span>
                        </p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border-2 border-gold-accent text-center shadow-inner">
                        <p class="text-lg font-medium text-charcoal-theme">Your Total Order Value is:</p>
                        <p class="text-4xl font-extrabold text-gold-accent mt-2">₹${totalAmount.toFixed(2)}</p>
                    </div>
                    <p class="text-sm text-gray-600 pt-2">
                        Our team will contact you shortly to confirm the final details.
                    </p>
                </div>
            `;
            document.getElementById('order-confirmation-message').innerHTML = confirmationMessage;

            modalBody.insertAdjacentHTML('beforeend', `
                <div class="mt-6 flex flex-col space-y-3 modal-action-buttons">
                    <button onclick="document.getElementById('order-modal').classList.remove('open'); renderCustomerEdit();" class="w-full py-3 rounded-xl text-lg font-bold shadow-lg bg-red-600 text-white hover:bg-red-700 transition">
                        <i class="fas fa-edit mr-2"></i> Edit Customer Details
                    </button>
                    <button onclick="
                        cart = {}; 
                        updateCartDisplay(); 
                        document.getElementById('order-modal').classList.remove('open'); 
                        renderCategories();
                    " class="w-full bg-gold-accent py-3 rounded-xl text-lg font-bold text-charcoal-theme shadow-lg hover:bg-[#388E3C] hover:text-white transition">
                        Continue Shopping (Clear Order)
                    </button>
                </div>
            `);

            document.getElementById('order-modal').classList.add('open');
        }

        // --- 3. FIREBASE AUTHENTICATION FUNCTIONS ---
        
        /** Sets up Firebase services and handles initial authentication state. */
        async function setupFirebase() {
            try {
                app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                db = getFirestore(app);
            } catch (error) {
                console.error("Firebase Initialization Failed:", error);
                return;
            }

            return new Promise((resolve) => {
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        userId = user.uid;
                    } else {
                        // Sign in anonymously as a fallback for database access if needed later
                        try {
                            if (initialAuthToken) {
                                await signInWithCustomToken(auth, initialAuthToken);
                            } else {
                                await signInAnonymously(auth);
                            }
                            userId = auth.currentUser?.uid || null;
                            console.log("Authenticated for session access.");
                        } catch (error) {
                            console.error("Authentication failed:", error);
                        }
                    }
                    
                    updateProfileDisplay();
                    isAuthReady = true;
                    // Proceed with app rendering once auth is confirmed
                    if (currentView === 'loading') {
                        renderWelcome();
                    }
                    resolve();
                });
            });
        }

        // --- 4. VIEW RENDERING FUNCTIONS ---
        
        /** Renders the initial welcome form / sign-in prompt. */
        function renderWelcome() {
            contentArea.innerHTML = `
                <div class="max-w-md mx-auto bg-white p-6 md:p-8 rounded-xl shadow-xl border-t-4 border-gold-accent">
                    <h2 class="text-3xl font-bold text-charcoal-theme mb-6 text-center">Enter Your Details to Shop</h2>
                    <p class="text-gray-600 mb-6 text-center">Please enter your contact details to proceed to the storefront.</p>

                    <form id="welcome-form" class="space-y-4">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">Your Full Name (Required)</label>
                            <input type="text" id="name" value="${customerDetails.name}" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">
                        </div>
                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number (10 digits required)</label>
                            <input type="tel" id="phone" value="${customerDetails.phone}" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal" maxlength="10">
                        </div>
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Gmail ID (must be @gmail.com)</label>
                            <input type="email" id="email" value="${customerDetails.email}" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">
                        </div>
                        <button type="submit" class="w-full main-button py-3 rounded-xl text-lg font-bold shadow-lg mt-6 hover:bg-gold-accent hover:text-charcoal-theme">
                            Start Shopping <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </form>
                </div>
            `;
            
            document.getElementById('welcome-form').addEventListener('submit', handleWelcomeSubmit);
        }

        /** Handles submission of the manual customer details form. */
        function handleWelcomeSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim(); 

            if (!name || !phone || !email) { 
                showMessage('Please fill in all details (Name, Phone, Email) to continue.', 'error');
                return;
            }
            
            // 1. Phone Number Validation
            if (phone.length !== 10 || isNaN(phone)) {
                showMessage('Please enter a valid 10-digit phone number.', 'error');
                return;
            }

            // 2. Email ID Validation (basic)
            const emailRegex = /\S+@\S+\.\S+/; 
            if (!emailRegex.test(email) || !email.toLowerCase().endsWith('@gmail.com')) {
                 showMessage('The Email ID must be valid and end with @gmail.com for primary contact.', 'error');
                 return;
            }

            customerDetails.name = name;
            customerDetails.phone = phone;
            customerDetails.email = email; 
            updateProfileDisplay(); // Update the header icon
            renderCategories(); 
        }

        /** Renders the product categories (the main shop view). */
        function renderCategories() {
            currentView = 'categories';
            if (navButtonsEl) navButtonsEl.classList.remove('hidden'); 
            contentArea.innerHTML = `
                <div class="text-center mb-8">
                    <h2 class="text-2xl text-charcoal-theme font-semibold">
                        Welcome, <span class="text-gold-accent">${customerDetails.name || 'Customer'}</span>!
                    </h2>
                    <p class="mt-2 text-gray-500">Select a category to explore our natural collections.</p>
                </div>
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    ${Object.entries(PRODUCTS).map(([key, category]) => `
                        <div 
                            data-category="${key}"
                            class="category-card p-4 md:p-6 rounded-xl text-center flex flex-col items-center justify-center hover:bg-gray-50 transform hover:scale-[1.02] transition duration-200"
                        >
                            <i class="${category.icon} text-3xl text-gold-accent mb-3"></i>
                            <h3 class="text-lg font-semibold text-charcoal-theme">${category.name}</h3>
                            <p class="text-xs text-gray-500 mt-1">Shop Collection</p>
                        </div>
                    `).join('')}
                </div>
            `;
            // Attach event listeners to category cards
            contentArea.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const key = e.currentTarget.dataset.category;
                    renderProductList(key);
                });
            });
        }

        /** Renders the product list for a specific category. */
        function renderProductList(categoryKey) {
            currentView = 'products';
            const categoryData = PRODUCTS[categoryKey];

            contentArea.innerHTML = `
                <button onclick="renderCategories()" class="text-charcoal-theme hover:text-gold-accent mb-6 flex items-center space-x-2 transition">
                    <i class="fas fa-arrow-left"></i>
                    <span class="text-sm font-medium">Back to Collections</span>
                </button>
                <h2 class="text-3xl font-bold text-charcoal-theme mb-8">${categoryData.name}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${categoryData.products.map((p) => `
                        <div class="product-card p-4 rounded-xl flex space-x-4">
                            <img src="${getPlaceholderImage(p.image_hint || p.name)}" alt="${p.name}" class="w-24 h-24 object-cover rounded-lg flex-shrink-0">
                            <div class="flex-grow">
                                <h4 class="text-xl font-semibold text-charcoal-theme">${p.name}</h4>
                                <p class="text-sm text-gray-500 mt-1">${p.desc}</p>
                                <p class="text-lg font-bold text-gold-accent mt-2">₹${p.price.toFixed(2)}</p>
                                
                                <!-- ADDED: Inline Quantity Input -->
                                <div class="flex items-center space-x-3 mt-3">
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value="1" 
                                        id="qty-${p.id}" 
                                        class="w-16 p-2 border border-gray-300 rounded-lg text-center text-sm focus-charcoal"
                                    >
                                    <button 
                                        data-id="${p.id}" 
                                        data-category="${categoryKey}"
                                        class="add-to-cart-btn flex-grow main-button py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gold-accent hover:text-charcoal-theme"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            // Attach event listeners
            contentArea.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.currentTarget.dataset.id;
                    const catKey = e.currentTarget.dataset.category;
                    const quantityInput = document.getElementById(`qty-${productId}`);
                    const quantity = parseInt(quantityInput.value) || 1;
                    addToCart(catKey, productId, quantity);
                });
            });
        }

        /** Renders the cart summary. (Rest of the rendering functions remain the same for brevity) */
        function renderCart() {
            currentView = 'cart';
            if (navButtonsEl) navButtonsEl.classList.remove('hidden'); 
            const cartItems = Object.values(cart).filter(item => item.quantity > 0);
            const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.item.price, 0);

            contentArea.innerHTML = `
                <h2 class="text-3xl font-bold text-charcoal-theme mb-8">Your Shopping Cart</h2>
                ${cartItems.length === 0 ? 
                    `<div class="text-center py-10 bg-white rounded-xl shadow-inner border-t-4 border-gold-accent/50">
                        <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                        <p class="text-lg text-gray-600">Your cart is empty. Start your order now!</p>
                        <button onclick="renderCategories()" class="mt-4 main-button py-2 px-6 rounded-lg font-semibold hover:bg-gold-accent hover:text-charcoal-theme">Start Shopping</button>
                    </div>` 
                    : `
                    <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-gold-accent">
                        <ul class="space-y-4 border-b pb-4">
                            ${cartItems.map(item => `
                                <li class="flex justify-between items-center py-3 border-b last:border-b-0 flex-wrap gap-y-2">
                                    <div class="flex flex-col flex-grow min-w-[40%]">
                                        <span class="font-semibold text-charcoal-theme">${item.item.name}</span>
                                        <span class="text-sm text-gray-500 mt-1">₹${item.item.price.toFixed(2)} ea</span>
                                    </div>
                                    
                                    <div class="flex items-center space-x-4">
                                        <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                            <button data-id="${item.item.id}" class="quantity-btn decrement-btn px-3 py-1 bg-gray-100 hover:bg-gray-200 text-charcoal-theme font-bold transition duration-150">
                                                -
                                            </button>
                                            <span class="px-3 font-semibold text-charcoal-theme w-8 text-center">${item.quantity}</span>
                                            <button data-id="${item.item.id}" class="quantity-btn increment-btn px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gold-accent font-bold transition duration-150">
                                                +
                                            </button>
                                        </div>
                                        
                                        <span class="font-bold text-lg text-gold-accent min-w-[70px] text-right">₹${(item.item.price * item.quantity).toFixed(2)}</span>
                                        
                                        <button data-id="${item.item.id}" class="remove-item-btn text-red-500 hover:text-red-700 p-2 rounded-full transition">
                                            <i class="fas fa-trash text-base"></i>
                                        </button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                        
                        <div class="flex justify-between items-center mt-6">
                            <span class="text-xl font-bold text-charcoal-theme">Subtotal:</span>
                            <span class="text-2xl font-extrabold text-gold-accent">₹${subtotal.toFixed(2)}</span>
                        </div>

                        <div class="mt-8 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                            <button onclick="renderCategories()" class="w-full py-3 px-6 rounded-xl text-lg font-bold shadow-lg text-charcoal-theme bg-gray-100 border-2 border-charcoal-theme/50 hover:bg-gray-200 transition">
                                <i class="fas fa-plus-circle mr-2"></i> Add More Product
                            </button>
                            <button id="checkout-button" class="w-full main-button py-3 px-6 rounded-xl text-lg font-bold shadow-lg hover:bg-gold-accent hover:text-charcoal-theme">
                                <i class="fas fa-money-check-alt mr-2"></i> Proceed to Checkout
                            </button>
                        </div>
                    </div>
                `}
            `;
            
            if (cartItems.length > 0) {
                document.getElementById('checkout-button').addEventListener('click', renderCheckout);
                
                contentArea.querySelectorAll('.decrement-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        decrementQuantity(e.currentTarget.dataset.id);
                    });
                });
                contentArea.querySelectorAll('.increment-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        incrementQuantity(e.currentTarget.dataset.id);
                    });
                });
                
                contentArea.querySelectorAll('.remove-item-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const productId = e.currentTarget.dataset.id;
                        removeItemFromCart(productId);
                    });
                });
            }
        }
        
        /** Renders the checkout form for delivery details. (No changes) */
        function renderCheckout() {
            currentView = 'checkout';
            const cartItems = Object.values(cart).filter(item => item.quantity > 0);
            const subtotal = cartItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);

            const selectedRate = customerDetails.deliveryLocation;
            const totalAmount = subtotal + selectedRate.cost;
            
            const isLocationSelected = DELIVERY_RATES.findIndex(rate => rate.city === selectedRate.city) !== 0;


            contentArea.innerHTML = `
                <button onclick="renderCart()" class="text-charcoal-theme hover:text-gold-accent mb-6 flex items-center space-x-2 transition">
                    <i class="fas fa-arrow-left"></i>
                    <span class="text-sm font-medium">Back to Cart</span>
                </button>
                <h2 class="text-3xl font-bold text-charcoal-theme mb-6">Finalize Delivery & Order</h2>
                <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-gold-accent">
                    <p class="text-lg font-semibold text-charcoal-theme mb-2">Customer: ${customerDetails.name}</p>
                    <p class="text-sm font-medium text-gray-600 mb-4">${customerDetails.phone} | ${customerDetails.email}</p>
                    <form id="checkout-form" class="space-y-4">
                        
                        <div>
                            <label for="address" class="block text-sm font-medium text-gray-700">Full Delivery Address (Street, House No., Landmark)</label>
                            <textarea id="address" rows="3" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">${customerDetails.deliveryAddress}</textarea>
                        </div>
                        
                        <div>
                            <label for="delivery-location" class="block text-sm font-medium text-gray-700">Delivery Location & Cost (from your rate sheet)</label>
                            <select id="delivery-location" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">
                                ${DELIVERY_RATES.map((rate, index) => `
                                    <option 
                                        value="${index}"
                                        data-cost="${rate.cost.toFixed(2)}"
                                        ${rate.city === selectedRate.city ? 'selected' : ''}
                                    >
                                        ${rate.city} - ₹${rate.cost.toFixed(2)}
                                    </option>
                                `).join('')}
                            </select>
                            <p id="delivery-cost-text" class="mt-2 text-sm font-medium text-gray-500">
                                Delivery Fee: <span class="text-red-500">₹${selectedRate.cost.toFixed(2)}</span>
                            </p>
                            ${!isLocationSelected ? `
                                <div id="location-warning" class="mt-2 p-2 bg-red-100 border-l-4 border-red-500 text-red-700">
                                    <p class="text-sm font-semibold">Please select a valid delivery location before submitting.</p>
                                </div>
                            ` : ''}
                        </div>

                        
                        <!-- Order Summary -->
                        <div class="pt-4 border-t border-gray-200 space-y-2">
                            <div class="flex justify-between font-medium">
                                <span>Subtotal:</span>
                                <span>₹${subtotal.toFixed(2)}</span>
                            </div>
                            <div class="flex justify-between font-medium text-red-500">
                                <span>Delivery Fee:</span>
                                <span id="final-delivery-cost">₹${selectedRate.cost.toFixed(2)}</span>
                            </div>
                            <div class="flex justify-between text-xl font-bold text-gold-accent pt-2 border-t border-gray-300">
                                <span>Total Amount:</span>
                                <span id="final-total-amount">₹${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <!-- Submit button is disabled if no location is selected -->
                        <button type="submit" id="submit-order-btn" 
                            class="w-full py-3 rounded-xl text-lg font-bold shadow-lg transition 
                            ${isLocationSelected ? 'main-button hover:bg-gold-accent hover:text-charcoal-theme' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}"
                            ${!isLocationSelected ? 'disabled' : ''}
                        >
                            <i class="fas fa-paper-plane mr-2"></i> Submit Order
                        </button>

                        <p class="text-xs text-center text-gray-500">
                            **Crucial Note:** This action simulates sending the order data to a secure Python server. The cart will remain active for editing until you choose 'Continue Shopping' on the next screen.
                        </p>
                    </form>
                </div>
            `;

            const locationSelect = document.getElementById('delivery-location');
            locationSelect.addEventListener('change', updateDeliveryCost);
            
            document.getElementById('checkout-form').addEventListener('submit', handleOrderPlacement);
        }

        /** Renders a dedicated page for editing all customer and delivery details. (No changes) */
        function renderCustomerEdit() {
            currentView = 'edit-customer';
            const selectedIndex = DELIVERY_RATES.findIndex(rate => rate.city === customerDetails.deliveryLocation.city);
            
            const cartItems = Object.values(cart).filter(item => item.quantity > 0);
            const subtotal = cartItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
            
            contentArea.innerHTML = `
                <button onclick="renderCart()" class="text-charcoal-theme hover:text-gold-accent mb-6 flex items-center space-x-2 transition">
                    <i class="fas fa-arrow-left"></i>
                    <span class="text-sm font-medium">Back to Cart / Checkout</span>
                </button>
                <h2 class="text-3xl font-bold text-red-600 mb-6">Edit Customer and Delivery Details</h2>
                <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-600">
                    <p class="text-gray-600 mb-4">Update your information and **re-confirm** the order.</p>
                    <form id="edit-customer-form" class="space-y-4">
                        <h3 class="font-bold text-lg text-charcoal-theme pt-2 border-t">Contact Information</h3>
                        <div>
                            <label for="edit-name" class="block text-sm font-medium text-gray-700">Your Full Name</label>
                            <input type="text" id="edit-name" value="${customerDetails.name}" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">
                        </div>
                        <div>
                            <label for="edit-phone" class="block text-sm font-medium text-gray-700">Phone Number (10 digits)</label>
                            <input type="tel" id="edit-phone" value="${customerDetails.phone}" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">
                        </div>
                        <div>
                            <label for="edit-email" class="block text-sm font-medium text-gray-700">Gmail ID (@gmail.com required)</label>
                            <input type="email" id="edit-email" value="${customerDetails.email}" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">
                        </div>
                        
                        <h3 class="font-bold text-lg text-charcoal-theme pt-4 border-t">Delivery Information</h3>
                        <div>
                            <label for="edit-address" class="block text-sm font-medium text-gray-700">Full Delivery Address</label>
                            <textarea id="edit-address" rows="3" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">${customerDetails.deliveryAddress}</textarea>
                        </div>
                        
                        <div>
                            <label for="edit-location" class="block text-sm font-medium text-gray-700">Delivery Location</label>
                            <select id="edit-location" required class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus-charcoal">
                                ${DELIVERY_RATES.map((rate, index) => `
                                    <option 
                                        value="${index}"
                                        ${index === selectedIndex ? 'selected' : ''}
                                    >
                                        ${rate.city} - ₹${rate.cost.toFixed(2)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="pt-4 border-t border-gray-200 space-y-2">
                            <p class="text-lg font-bold">Current Order Value: <span class="text-gold-accent">₹${subtotal.toFixed(2)} (Subtotal)</span></p>
                        </div>

                        <button type="submit" class="w-full py-3 rounded-xl text-lg font-bold shadow-lg bg-red-600 text-white hover:bg-red-700 transition mt-6">
                            <i class="fas fa-check-circle mr-2"></i> Confirm Order Details
                        </button>
                    </form>
                </div>
            `;
            
            document.getElementById('edit-customer-form').addEventListener('submit', handleCustomerEditSubmit);
        }

        /** Handles submission from the edit customer details page. (No changes) */
        function handleCustomerEditSubmit(e) {
            e.preventDefault();
            
            const name = document.getElementById('edit-name').value.trim();
            const phone = document.getElementById('edit-phone').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const address = document.getElementById('edit-address').value.trim();
            const locationIndex = document.getElementById('edit-location').value;
            
            if (!name || !phone || !email || !address || parseInt(locationIndex) === 0) { 
                showMessage('All fields must be filled and a valid location selected.', 'error');
                return;
            }
            if (phone.length !== 10 || isNaN(phone)) {
                showMessage('Please enter a valid 10-digit phone number.', 'error');
                return;
            }
            const emailRegex = /\S+@\S+\.\S+/; 
            if (!emailRegex.test(email) || !email.toLowerCase().endsWith('@gmail.com')) {
                 showMessage('The Gmail ID must be valid and end with @gmail.com.', 'error');
                 return;
            }

            customerDetails.name = name;
            customerDetails.phone = phone;
            customerDetails.email = email;
            customerDetails.deliveryAddress = address;
            customerDetails.deliveryLocation = DELIVERY_RATES[locationIndex];
            updateProfileDisplay(); // Update the header icon
            handleOrderPlacement(e);
        }

        /** Renders the list of all past submitted orders. (No changes) */
        function renderOrderHistory() {
            currentView = 'history';
            if (navButtonsEl) navButtonsEl.classList.remove('hidden'); 
            
            contentArea.innerHTML = `
                <button onclick="renderCategories()" class="text-charcoal-theme hover:text-gold-accent mb-6 flex items-center space-x-2 transition">
                    <i class="fas fa-arrow-left"></i>
                    <span class="text-sm font-medium">Back to Shop</span>
                </button>
                <h2 class="text-3xl font-bold text-charcoal-theme mb-8">Your Past Orders (${submittedOrders.length})</h2>
                
                <div class="bg-white p-4 md:p-6 rounded-xl shadow-md">
                    ${submittedOrders.length === 0 
                        ? `<div class="text-center py-10 text-gray-600">
                                <i class="fas fa-box text-6xl text-gray-300 mb-4"></i>
                                <p class="text-lg">No submitted orders found yet.</p>
                                <p class="text-sm mt-2">Place your first order to see it here!</p>
                            </div>` 
                        : `<ul class="space-y-3">
                            ${submittedOrders.map((order, index) => `
                                <li 
                                    data-order-id="${order.id}" 
                                    class="order-history-item p-4 border border-gray-200 rounded-lg transition duration-150 flex justify-between items-center flex-wrap gap-2"
                                >
                                    <div class="flex flex-col">
                                        <span class="text-xs font-medium text-gray-500">Order #${submittedOrders.length - index} (ID: ${order.id})</span>
                                        <span class="text-lg font-bold text-gold-accent">₹${order.totalAmount.toFixed(2)}</span>
                                        <span class="text-sm text-gray-600 mt-1">${order.timestamp}</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-sm font-semibold text-charcoal-theme block">${order.customerSnapshot.deliveryLocation.city}</span>
                                        <button class="view-order-details mt-2 text-sm text-charcoal-theme hover:text-gold-accent font-medium transition">
                                            View Details <i class="fas fa-chevron-right ml-1 text-xs"></i>
                                        </button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>`
                    }
                </div>
            `;

            contentArea.querySelectorAll('.order-history-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const orderId = parseInt(e.currentTarget.dataset.orderId);
                    renderOrderDetail(orderId);
                });
            });
        }

        /** Renders the detailed view for a single past order. (No changes) */
        function renderOrderDetail(orderId) {
            currentView = 'order-detail';
            const order = submittedOrders.find(o => o.id === orderId);

            if (!order) {
                showMessage('Error: Order not found.', 'error');
                renderOrderHistory();
                return;
            }

            contentArea.innerHTML = `
                <button onclick="renderOrderHistory()" class="text-charcoal-theme hover:text-gold-accent mb-6 flex items-center space-x-2 transition">
                    <i class="fas fa-arrow-left"></i>
                    <span class="text-sm font-medium">Back to Order History</span>
                </button>
                <h2 class="text-3xl font-bold text-charcoal-theme mb-6">Order Details (ID: ${order.id})</h2>
                
                <div class="bg-white p-6 rounded-xl shadow-md space-y-6 border-t-4 border-gold-accent">
                    <div class="border-b pb-4">
                        <h3 class="text-xl font-bold text-charcoal-theme mb-2">Customer & Delivery</h3>
                        <p class="text-gray-700"><span class="font-semibold text-gold-accent">Name:</span> ${order.customerSnapshot.name}</p>
                        <p class="text-gray-700"><span class="font-semibold text-gold-accent">Contact:</span> ${order.customerSnapshot.phone} | ${order.customerSnapshot.email}</p>
                        <p class="text-gray-700"><span class="font-semibold text-gold-accent">Address:</span> ${order.customerSnapshot.deliveryAddress} (${order.customerSnapshot.deliveryLocation.city})</p>
                        <p class="text-sm text-gray-500 mt-2">Placed On: ${order.timestamp}</p>
                    </div>

                    <div>
                        <h3 class="text-xl font-bold text-charcoal-theme mb-3">Products Ordered</h3>
                        <ul class="space-y-3">
                            ${order.items.map(item => `
                                <li class="flex justify-between items-center border-b border-gray-100 py-2">
                                    <span class="font-medium text-gray-800">${item.name}</span>
                                    <div class="flex items-center space-x-4">
                                        <span class="text-sm font-semibold text-gray-600">${item.quantity} x ₹${item.price.toFixed(2)}</span>
                                        <span class="font-bold text-md text-gold-accent">₹${item.total.toFixed(2)}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="pt-4 border-t border-gray-200 space-y-2">
                        <div class="flex justify-between font-medium">
                            <span>Subtotal:</span>
                            <span>₹${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between font-medium text-red-500">
                            <span>Delivery Fee:</span>
                            <span>₹${order.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between text-2xl font-bold text-gold-accent pt-2 border-t border-gray-300">
                            <span>TOTAL AMOUNT:</span>
                            <span>₹${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <button onclick="reorderItems(${orderId})" class="w-full main-button py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-gold-accent hover:text-charcoal-theme mt-6">
                        <i class="fas fa-redo-alt mr-2"></i> Re-order this Cart
                    </button>

                </div>
            `;
        }
        
        /** Replaces the current cart with the items from a past order. (No changes) */
        function reorderItems(orderId) {
            const order = submittedOrders.find(o => o.id === orderId);
            if (!order) {
                showMessage('Error: Could not retrieve order for re-ordering.', 'error');
                return;
            }
            
            cart = {};
            
            order.items.forEach(pastItem => {
                const productTemplate = findProductById(pastItem.name); 
                
                if (productTemplate) {
                    cart[productTemplate.id] = {
                        item: productTemplate,
                        quantity: pastItem.quantity 
                    };
                } else {
                    console.error(`Product not found for re-order: ${pastItem.name}`);
                }
            });
            
            updateCartDisplay();
            showMessage(`Order #${submittedOrders.length - submittedOrders.findIndex(o => o.id === orderId)} loaded into cart!`);
            renderCart();
        }

        /** Updates the delivery cost and total amount on the checkout page. (No changes) */
        function updateDeliveryCost(e) {
            const selectedIndex = e.target.value;
            const newRate = DELIVERY_RATES[selectedIndex];
            customerDetails.deliveryLocation = newRate;

            const cartItems = Object.values(cart).filter(item => item.quantity > 0);
            const subtotal = cartItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
            const newTotal = subtotal + newRate.cost;
            
            document.getElementById('delivery-cost-text').innerHTML = `Delivery Fee: <span class="text-red-500">₹${newRate.cost.toFixed(2)}</span>`;
            document.getElementById('final-delivery-cost').textContent = `₹${newRate.cost.toFixed(2)}`;
            document.getElementById('final-total-amount').textContent = `₹${newTotal.toFixed(2)}`;

            const submitButton = document.getElementById('submit-order-btn');
            const isLocationSelected = parseInt(selectedIndex) !== 0;
            const locationWarning = document.getElementById('location-warning');

            if (isLocationSelected) {
                submitButton.disabled = false;
                submitButton.classList.replace('bg-gray-400', 'main-button');
                submitButton.classList.replace('text-gray-700', 'text-white');
                submitButton.classList.remove('cursor-not-allowed');
                if(locationWarning) locationWarning.classList.add('hidden');
            } else {
                submitButton.disabled = true;
                submitButton.classList.replace('main-button', 'bg-gray-400');
                submitButton.classList.replace('text-white', 'text-gray-700');
                submitButton.classList.add('cursor-not-allowed');
                if(locationWarning) locationWarning.classList.remove('hidden');
            }
        }

        // --- 5. CART & ORDER LOGIC ---

        /** Adds a product to the cart or increments its quantity. (No changes) */
        function addToCart(catKey, productId, quantity = 1) {
            let product = findProductById(productId);

            if (product) {
                if (cart[productId]) {
                    cart[productId].quantity += quantity;
                } else {
                    cart[productId] = { item: product, quantity: quantity };
                }
                showMessage(`${quantity} x ${product.name} added to cart!`);
                updateCartDisplay();
            } else {
                showMessage('Error: Product not found.', 'error');
            }
        }
        
        /** Increases the quantity of a product in the cart. (No changes) */
        function incrementQuantity(productId) {
            if (cart[productId]) {
                cart[productId].quantity++;
                updateCartDisplay();
                renderCart(); 
            }
        }

        /** Decreases the quantity of a product in the cart. (No changes) */
        function decrementQuantity(productId) {
            if (cart[productId] && cart[productId].quantity > 1) {
                cart[productId].quantity--;
                updateCartDisplay();
                renderCart(); 
            } else if (cart[productId] && cart[productId].quantity === 1) {
                removeItemFromCart(productId); 
            }
        }

        /** Removes an item completely from the cart. (No changes) */
        function removeItemFromCart(productId) {
            if (cart[productId]) {
                delete cart[productId];
                showMessage('Item removed from cart.', 'error');
                updateCartDisplay();
                renderCart(); 
            }
        }

        /** Handles the final order submission, capturing and storing the order data. (No changes) */
        function handleOrderPlacement(e) {
            e.preventDefault();

            const cartItems = Object.values(cart).filter(item => item.quantity > 0);
            const subtotal = cartItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
            
            if (cartItems.length === 0) {
                 showMessage('Your cart is empty. Please add items before submitting an order.', 'error');
                 return;
            }
            
            let finalDeliveryCost = customerDetails.deliveryLocation.cost;
            let selectedIndex = DELIVERY_RATES.findIndex(rate => rate.city === customerDetails.deliveryLocation.city);


            if (currentView === 'checkout') {
                const locationSelect = document.getElementById('delivery-location');
                selectedIndex = parseInt(locationSelect?.value) || 0;
                
                if (selectedIndex === 0) {
                    showMessage('Please select a valid Delivery Location to submit your order.', 'error');
                    return;
                }
                
                customerDetails.deliveryLocation = DELIVERY_RATES[selectedIndex];
                customerDetails.deliveryAddress = document.getElementById('address')?.value || customerDetails.deliveryAddress;
                finalDeliveryCost = customerDetails.deliveryLocation.cost;

            } else if (currentView === 'edit-customer') {
                if (selectedIndex === 0) {
                    showMessage('Please select a valid Delivery Location on the Edit Details page.', 'error');
                    return;
                }
                finalDeliveryCost = customerDetails.deliveryLocation.cost;
            }

            const totalAmount = subtotal + finalDeliveryCost;

            const orderObject = {
                id: Date.now(), 
                timestamp: new Date().toLocaleString(),
                customerSnapshot: JSON.parse(JSON.stringify(customerDetails)), 
                items: cartItems.map(item => ({
                    name: item.item.id, // Storing ID for reorder lookup
                    quantity: item.quantity,
                    price: item.item.price,
                    total: item.item.price * item.quantity
                })),
                subtotal: subtotal,
                deliveryFee: finalDeliveryCost,
                totalAmount: totalAmount,
            };

            submittedOrders.unshift(orderObject); 

            showOrderSuccessModal(null, totalAmount);
        }

        // --- 6. INITIALIZATION & EVENT LISTENERS ---

        /** Initializes the application. */
        function initApp() {
            // Set initial view to loading while Firebase configures
            currentView = 'loading';
            setupFirebase().then(() => {
                // Once auth is ready, render the welcome screen immediately
                renderWelcome(); 
            });

            updateCartDisplay();
            updateProfileDisplay();

            // Global navigation listeners
            document.getElementById('cart-button').addEventListener('click', () => {
                // Require customer details before navigating away from welcome/init
                if (!customerDetails.name) {
                     showMessage('Please enter your contact details first.', 'error');
                     renderWelcome();
                     return;
                }
                renderCart();
            });
            document.getElementById('home-button').addEventListener('click', () => {
                if (customerDetails.name) {
                    renderCategories();
                    showMessage('Please enter your contact details first.', 'error');
                } else {
                    renderWelcome();
                }
            });

            document.getElementById('history-button').addEventListener('click', () => {
                if (!customerDetails.name) {
                     showMessage('Please enter your contact details first to view your order history.', 'error');
                     renderWelcome();
                     return;
                }
                renderOrderHistory();
            });
        }

        window.onload = initApp;