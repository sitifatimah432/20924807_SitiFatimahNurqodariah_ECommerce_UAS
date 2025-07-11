// Menunggu hingga seluruh konten halaman dimuat sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {

    // --- FUNGSI GLOBAL ---

    /**
     * Fungsi untuk mendapatkan data keranjang dari localStorage.
     * @returns {Array} - Array objek produk di keranjang.
     */
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('cart_siti')) || [];
        } catch (e) {
            console.error('Error reading cart from localStorage', e);
            return [];
        }
    }

    /**
     * Fungsi untuk menyimpan data keranjang ke localStorage.
     * @param {Array} cart - Array objek produk yang akan disimpan.
     */
    function saveCart(cart) {
        try {
            localStorage.setItem('cart_siti', JSON.stringify(cart));
        } catch (e) {
            console.error('Error saving cart to localStorage', e);
        }
    }

    /**
     * Fungsi untuk menampilkan notifikasi custom.
     * @param {string} message - Pesan notifikasi.
     */
    function showNotification(message) {
        let notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.innerText = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Fungsi untuk menambahkan produk ke keranjang.
     * @param {object} product - Objek produk yang akan ditambahkan.
     */
    function addToCart(product) {
        let cart = getCart();
        // Cek apakah produk sudah ada di keranjang
        const existingProductIndex = cart.findIndex(item => item.id === product.id);

        if (existingProductIndex > -1) {
            // Jika sudah ada, tambahkan jumlahnya
            cart[existingProductIndex].quantity += 1;
        } else {
            // Jika belum ada, tambahkan produk baru dengan jumlah 1
            product.quantity = 1;
            cart.push(product);
        }
        saveCart(cart);
        showNotification(`${product.name} telah ditambahkan ke keranjang!`);
        updateCartCount(); // Memperbarui tampilan jumlah item di ikon keranjang
    }

    /**
     * Fungsi untuk memperbarui jumlah item yang ditampilkan di ikon keranjang.
     */
    function updateCartCount() {
        const cart = getCart();
        // Menghitung total item dengan menjumlahkan quantity setiap produk
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            // Menambahkan elemen span untuk menampilkan jumlah jika ada item
            if (totalItems > 0) {
                let countElement = cartIcon.querySelector('.cart-count');
                if (!countElement) {
                    countElement = document.createElement('span');
                    countElement.classList.add('cart-count');
                    cartIcon.appendChild(countElement);
                }
                countElement.innerText = totalItems;
            } else {
                // Menghapus elemen span jika keranjang kosong
                const countElement = cartIcon.querySelector('.cart-count');
                if (countElement) {
                    countElement.remove();
                }
            }
        }
    }


    // --- LOGIKA UNTUK HALAMAN DETAIL PRODUK ---

    // Mencari tombol "Beli" di halaman
    const buyButton = document.getElementById('buy-btn');
    if (buyButton) {
        buyButton.addEventListener('click', () => {
            // Mengambil data produk dari atribut data-* di tombol
            const productId = buyButton.dataset.id;
            const productName = buyButton.dataset.name;
            const productPrice = parseFloat(buyButton.dataset.price);
            const productImage = buyButton.dataset.image;

            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            };

            addToCart(product);
        });
    }


    // --- LOGIKA UNTUK HALAMAN KERANJANG (CART.HTML) ---

    // Mencari kontainer untuk item keranjang
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        displayCartItems();
    }

    /**
     * Fungsi untuk menampilkan item-item di halaman keranjang.
     */
    function displayCartItems() {
        const cart = getCart();
        const cartTotalElement = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartNotEmptyMessage = document.getElementById('cart-not-empty-message');
        const cartSummary = document.querySelector('.cart-summary');

        // Mengosongkan kontainer sebelum menampilkan item baru
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            // Menampilkan pesan jika keranjang kosong
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartNotEmptyMessage) cartNotEmptyMessage.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
        } else {
            // Menyembunyikan pesan keranjang kosong dan menampilkan pesan keranjang tidak kosong serta ringkasan
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
            if (cartNotEmptyMessage) cartNotEmptyMessage.style.display = 'block';
            if (cartSummary) cartSummary.style.display = 'block';

            let total = 0;
            cart.forEach((item, index) => {
                // Membuat elemen HTML untuk setiap item di keranjang
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Jumlah: ${item.quantity}</p>
                        <div class="quantity-controls" aria-label="Kontrol jumlah produk">
                            <button class="decrease-btn" data-index="${index}" aria-label="Kurangi jumlah produk">-</button>
                            <span>${item.quantity}</span>
                            <button class="increase-btn" data-index="${index}" aria-label="Tambah jumlah produk">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <p class="price">Rp ${ (item.price * item.quantity).toLocaleString('id-ID')}</p>
                        <button class="remove-btn" data-index="${index}" aria-label="Hapus produk dari keranjang"><i class="fas fa-trash-alt" aria-hidden="true"></i> Hapus</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
                // Menjumlahkan total harga
                total += item.price * item.quantity;
            });

            // Menampilkan total harga
            if (cartTotalElement) {
                cartTotalElement.innerText = `Rp ${total.toLocaleString('id-ID')}`;
            }

            // Menambahkan event listener untuk semua tombol hapus dan quantity
            addRemoveButtonListeners();
            addQuantityButtonListeners();
        }
    }

    /**
     * Fungsi untuk menambahkan event listener ke tombol "Hapus".
     */
    function addRemoveButtonListeners() {
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                // Mendapatkan indeks item yang akan dihapus dari atribut data-*
                const itemIndex = parseInt(event.currentTarget.dataset.index);
                removeFromCart(itemIndex);
            });
        });
    }

    /**
     * Fungsi untuk menambahkan event listener ke tombol quantity.
     */
    function addQuantityButtonListeners() {
        const decreaseButtons = document.querySelectorAll('.decrease-btn');
        const increaseButtons = document.querySelectorAll('.increase-btn');

        decreaseButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                changeQuantity(index, -1);
            });
        });

        increaseButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                changeQuantity(index, 1);
            });
        });
    }

    /**
     * Fungsi untuk mengubah quantity produk di keranjang.
     * @param {number} index - Indeks produk.
     * @param {number} delta - Perubahan quantity (+1 atau -1).
     */
    function changeQuantity(index, delta) {
        let cart = getCart();
        if (cart[index]) {
            cart[index].quantity += delta;
            if (cart[index].quantity < 1) {
                cart[index].quantity = 1;
            }
            saveCart(cart);
            displayCartItems();
            updateCartCount();
        }
    }

    /**
     * Fungsi untuk menghapus item dari keranjang.
     * @param {number} index - Indeks item yang akan dihapus.
     */
    function removeFromCart(index) {
        let cart = getCart();
        // Menghapus item dari array berdasarkan indeksnya
        cart.splice(index, 1);
        saveCart(cart);
        // Menampilkan ulang item keranjang dan memperbarui hitungan
        displayCartItems();
        updateCartCount();
    }

    // Memanggil fungsi updateCartCount saat halaman pertama kali dimuat
    // untuk memastikan ikon keranjang selalu update.
    updateCartCount();

    // Menambahkan event listener untuk tombol "Hapus Semua"
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin menghapus semua item dari keranjang?')) {
                localStorage.removeItem('cart_siti');
                displayCartItems();
                updateCartCount();
                showNotification('Semua item telah dihapus dari keranjang.');
            }
        });
    }
});
