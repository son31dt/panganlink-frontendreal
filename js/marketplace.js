/**
 * Fungsi untuk memuat dan menampilkan semua produk dari API dengan filter.
 * @param {string} searchTerm - Kata kunci pencarian.
 * @param {string} categoryId - ID kategori yang dipilih.
 * @param {string} location - Lokasi yang dipilih.
 */
async function loadProducts(searchTerm = '', categoryId = '', location = '') {
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return;

    // URL backend publik Anda dari Replit
    const backendUrl = 'https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev';
    
    // Bangun URL API secara dinamis dengan parameter filter
    let url = `${backendUrl}/api/produk?search=${searchTerm}&kategori=${categoryId}&lokasi=${location}`;

    try {
        const response = await fetch(url);
        const products = await response.json();

        productContainer.innerHTML = ''; // Kosongkan kontainer sebelum diisi ulang

        if (products.length === 0) {
            productContainer.innerHTML = '<p class="text-center">Produk tidak ditemukan.</p>';
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
                                <div class="text-muted fst-italic mb-2">Toko: ${product.nama_toko} (${product.lokasi})</div>
                                Rp ${parseInt(product.harga).toLocaleString('id-ID')} / ${product.satuan}
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
 * Fungsi baru untuk memuat kategori dan mengisinya ke dropdown filter.
 */
async function loadCategoriesForFilter() {
    const kategoriSelect = document.getElementById('kategori-filter');
    if(!kategoriSelect) return;
    
    const backendUrl = 'https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev';

    try {
        const response = await fetch(`${backendUrl}/api/kategori`);
        const kategori = await response.json();
        kategori.forEach(k => {
            kategoriSelect.innerHTML += `<option value="${k.kategori_id}">${k.nama_kategori}</option>`;
        });
    } catch (error) {
        console.error('Gagal memuat kategori untuk filter:', error);
    }
}


// Event listener utama yang berjalan saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    // Fungsi setupSharedUI dari file auth-shared.js akan menangani nama, logout, dll.
    
    // Panggil fungsi untuk memuat produk awal dan mengisi filter kategori
    loadProducts();
    loadCategoriesForFilter();

    // Event listener baru untuk form filter
    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah halaman refresh
        const searchTerm = document.getElementById('search-input').value;
        const categoryId = document.getElementById('kategori-filter').value;
        const location = document.getElementById('lokasi-filter').value;
        
        // Panggil ulang loadProducts dengan nilai filter yang baru dari form
        loadProducts(searchTerm, categoryId, location);
    });
});

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
    updateCartCount(); // Fungsi ini ada di auth-shared.js
    alert('Produk berhasil ditambahkan ke keranjang!');
}
