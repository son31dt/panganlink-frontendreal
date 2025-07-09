document.addEventListener('DOMContentLoaded', () => {
    // State aplikasi
    let currentToko = null;
    let editMode = false;
    let currentProductId = null;

    // Elemen DOM
    const storeNamePlaceholder = document.getElementById('store-name-placeholder');
    const tableBody = document.getElementById('my-products-table-body');
    const productForm = document.getElementById('product-form');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('productModalLabel');
    const addProductBtn = document.getElementById('add-product-btn');

    // Ambil data user dari localStorage
    const user = JSON.parse(localStorage.getItem('panganlink_user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Fungsi utama untuk memuat data toko dan produknya
    async function initializeDashboard() {
        try {
            // 1. Ambil data toko
            const tokoResponse = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/toko/by-user/${user.user_id}`);
            if (!tokoResponse.ok) {
                // Jika tidak punya toko, mungkin arahkan ke halaman buat toko
                storeNamePlaceholder.textContent = 'Anda belum memiliki toko. Buat toko sekarang!';
                return;
            }
            currentToko = await tokoResponse.json();
            storeNamePlaceholder.textContent = `Mengelola produk untuk: ${currentToko.nama_toko}`;

            // 2. Ambil dan tampilkan produk
            loadAndRenderProducts();
            loadAndRenderOrders();

            // 3. Muat kategori untuk form
            loadCategories();

        } catch (error) {
            console.error('Error inisialisasi dashboard:', error);
        }
    }
    
    // Fungsi untuk memuat dan menampilkan produk
    async function loadAndRenderProducts() {
        if (!currentToko) return;
        try {
            const productsResponse = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/toko/${currentToko.toko_id}/produk`);
            const products = await productsResponse.json();
            
            tableBody.innerHTML = ''; // Kosongkan tabel
            if (products.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Anda belum memiliki produk.</td></tr>';
            } else {
                products.forEach(p => {
                    tableBody.innerHTML += `
                        <tr>
                            <td><img src="${p.url_gambar}" alt="${p.nama_produk}" width="60" class="img-thumbnail"></td>
                            <td>${p.nama_produk}</td>
                            <td>Rp ${p.harga}</td>
                            <td>${p.stok} ${p.satuan}</td>
                            <td>
                                <button class="btn btn-sm btn-warning btn-edit" data-id="${p.produk_id}">Edit</button>
                                <button class="btn btn-sm btn-danger btn-delete" data-id="${p.produk_id}">Hapus</button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch (error) {
            console.error('Error memuat produk:', error);
        }
    }

    // Fungsi untuk memuat kategori ke dalam select form
    async function loadCategories() {
        const kategoriSelect = document.getElementById('kategori_id');
        try {
            // Panggil API yang baru kita buat
            const response = await fetch('https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/kategori');
            const kategori = await response.json();

            // Kosongkan pilihan lama dan isi dengan yang baru dari database
            kategoriSelect.innerHTML = '<option value="">-- Pilih Kategori --</option>'; // Tambahkan opsi default
            kategori.forEach(k => {
                kategoriSelect.innerHTML += `<option value="${k.kategori_id}">${k.nama_kategori}</option>`;
            });

        } catch (error) {
            console.error('Gagal memuat kategori:', error);
            kategoriSelect.innerHTML = '<option value="">Gagal memuat kategori</option>';
        }
    }
    // Fungsi untuk memuat dan menampilkan pesanan masuk
    async function loadAndRenderOrders() {
        if (!currentToko) return;
        const ordersTableBody = document.getElementById('orders-table-body');
        try {
            const response = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/pesanan/toko/${currentToko.toko_id}`);
            const orders = await response.json();

            ordersTableBody.innerHTML = '';
            if (orders.length === 0) {
                ordersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada pesanan yang masuk.</td></tr>';
            } else {
                orders.forEach(order => {
                    ordersTableBody.innerHTML += `
                        <tr>
                            <td>#${order.pesanan_id}</td>
                            <td>${new Date(order.tanggal_pesanan).toLocaleDateString('id-ID')}</td>
                            <td>${order.nama_pembeli}</td>
                            <td>Rp ${parseInt(order.total_harga).toLocaleString('id-ID')}</td>
                            <td><span class="badge bg-primary">${order.status_pesanan}</span></td>
                        </tr>
                    `;
                });
            }
        } catch (error) {
            console.error('Error memuat pesanan:', error);
        }
    }

    // Event listener untuk tombol "Tambah Produk Baru"
    addProductBtn.addEventListener('click', () => {
        editMode = false;
        currentProductId = null;
        modalTitle.textContent = 'Tambah Produk Baru';
        productForm.reset();
    });
    
    // Event listener untuk form submit (Tambah & Edit)
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productData = {
            nama_produk: document.getElementById('nama_produk').value,
            deskripsi: document.getElementById('deskripsi').value,
            harga: document.getElementById('harga').value,
            satuan: document.getElementById('satuan').value,
            stok: document.getElementById('stok').value,
            kategori_id: document.getElementById('kategori_id').value,
            url_gambar: document.getElementById('url_gambar').value,
            toko_id: currentToko.toko_id,
        };

        let response;
        if (editMode) {
            // Mode Edit (PUT request)
            response = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/produk/${currentProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Mode Tambah (POST request)
            response = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/produk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            productModal.hide();
            loadAndRenderProducts(); // Muat ulang daftar produk
        } else {
            alert('Gagal menyimpan produk.');
        }
    });

    // Event delegation untuk tombol Edit dan Hapus
    tableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const productId = target.dataset.id;

        if (target.classList.contains('btn-delete')) {
            if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                const response = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/produk/${productId}`, { method: 'DELETE' });
                if (response.ok) {
                    loadAndRenderProducts();
                } else {
                    alert('Gagal menghapus produk.');
                }
            }
        }

        if (target.classList.contains('btn-edit')) {
            editMode = true;
            currentProductId = productId;
            modalTitle.textContent = 'Edit Produk';
            
            // Ambil data produk dan isi form
            const response = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/produk/${productId}`);
            const product = await response.json();

            document.getElementById('product-id').value = product.produk_id;
            document.getElementById('nama_produk').value = product.nama_produk;
            document.getElementById('deskripsi').value = product.deskripsi;
            document.getElementById('harga').value = product.harga;
            document.getElementById('satuan').value = product.satuan;
            document.getElementById('stok').value = product.stok;
            document.getElementById('kategori_id').value = product.kategori_id;
            document.getElementById('url_gambar').value = product.url_gambar;

            productModal.show();
        }
    });

    // Inisialisasi dashboard saat halaman dimuat
    initializeDashboard();
});