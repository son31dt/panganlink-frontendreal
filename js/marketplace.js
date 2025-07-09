// Menunggu hingga seluruh halaman HTML dimuat sebelum menjalankan script
document.addEventListener('DOMContentLoaded', () => {
    const userContainer = document.getElementById('userName');
    const logoutButton = document.getElementById('logoutButton');

    // 1. Cek status login dari localStorage
    const user = JSON.parse(localStorage.getItem('panganlink_user'));

    // Jika tidak ada data user, paksa kembali ke halaman login
    if (!user) {
        alert('Anda harus login terlebih dahulu.');
        window.location.href = 'login.html';
        return; // Hentikan eksekusi kode selanjutnya
    }

    // 2. Tampilkan nama pengguna di navigasi
    userContainer.textContent = user.nama;

    // 3. Tambahkan fungsi untuk tombol logout
    logoutButton.addEventListener('click', () => {
        // Hapus data user dan keranjang dari localStorage
        localStorage.removeItem('panganlink_user');
        localStorage.removeItem('panganlink_cart');
        alert('Anda telah logout.');
        // Arahkan kembali ke halaman utama
        window.location.href = 'index.html';
    });
    
    // 4. Panggil fungsi untuk memuat produk dan mengupdate hitungan keranjang
    loadProducts();
    updateCartCount();
});

/**
 * Fungsi untuk memuat dan menampilkan semua produk dari API.
 */
async function loadProducts() {
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return;

    try {
        const response = await fetch('https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/produk');
        const products = await response.json();

        productContainer.innerHTML = ''; // Kosongkan kontainer dulu

        if (products.length === 0) {
            productContainer.innerHTML = '<p class="text-center">Belum ada produk untuk ditampilkan.</p>';
            return;
        }

        // Loop untuk setiap produk dan buat kartu HTML-nya
        products.forEach(product => {
            const productCard = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100">
                        <img class="card-img-top" src="${product.url_gambar || 'assets/img/portfolio/thumbnails/default.jpg'}" alt="${product.nama_produk}" style="height: 200px; object-fit: cover;">
                        <div class="card-body p-4">
                            <div class="text-center">
                                <h5 class="fw-bolder">${product.nama_produk}</h5>
                                Rp ${product.harga} / ${product.satuan}
                            </div>
                        </div>
                        <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                            <div class="text-center">
                                <button class="btn btn-outline-dark mt-auto" onclick="addToCart(${product.produk_id})">
                                    Tambah ke Keranjang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productContainer.insertAdjacentHTML('beforeend', productCard);
        });
    } catch (error) {
        console.error('Gagal memuat produk:', error);
        productContainer.innerHTML = '<p class="text-center text-danger">Gagal memuat produk.</p>';
    }
}

/**
 * Fungsi untuk menambahkan produk ke keranjang di localStorage.
 * @param {number} productId - ID dari produk yang akan ditambahkan.
 */
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('panganlink_cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex > -1) {
        // Jika produk sudah ada, tambahkan jumlahnya
        cart[existingProductIndex].quantity += 1;
    } else {
        // Jika belum, tambahkan sebagai item baru
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('panganlink_cart', JSON.stringify(cart));
    updateCartCount();
    alert('Produk berhasil ditambahkan ke keranjang!');
}

/**
 * Fungsi untuk mengupdate angka pada ikon keranjang di navigasi.
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    const cart = JSON.parse(localStorage.getItem('panganlink_cart')) || [];
    // Hitung total item dengan menjumlahkan semua quantity
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElement.textContent = totalItems;
}