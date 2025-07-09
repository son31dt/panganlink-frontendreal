// Fungsi utama untuk menggambar seluruh isi keranjang
async function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    
    // Ambil data keranjang dari localStorage
    const cart = JSON.parse(localStorage.getItem('panganlink_cart')) || [];

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center">Keranjang Anda masih kosong.</p>';
        cartTotalElement.textContent = 'Rp 0';
        checkoutButton.classList.add('disabled'); // Nonaktifkan tombol checkout
        updateCartCount(); // Update ikon di navigasi
        return;
    }

    let totalHarga = 0;
    cartItemsContainer.innerHTML = ''; // Kosongkan kontainer sebelum diisi ulang

    for (const item of cart) {
        try {
            const response = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/produk/${item.id}`);
            if (!response.ok) continue; // Lewati item jika produknya tidak ditemukan
            
            const product = await response.json();
            const itemTotal = product.harga * item.quantity;
            totalHarga += itemTotal;

            // Template HTML baru dengan tombol +, -, dan Hapus
            const cartItemHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div class="d-flex flex-row align-items-center">
                                <div>
                                    <img src="${product.url_gambar}" class="img-fluid rounded-3" alt="${product.nama_produk}" style="width: 65px;">
                                </div>
                                <div class="ms-3">
                                    <h5>${product.nama_produk}</h5>
                                    <p class="small mb-0">Rp ${parseInt(product.harga).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                            <div class="d-flex flex-row align-items-center">
                                <button class="btn btn-link px-2" onclick="changeQuantity(${item.id}, -1)">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="btn btn-link px-2" onclick="changeQuantity(${item.id}, 1)">
                                    <i class="bi bi-plus"></i>
                                </button>
                                <h5 class="mb-0 ms-4" style="width: 120px;">Rp ${itemTotal.toLocaleString('id-ID')}</h5>
                                <a href="#!" style="color: #cecece;" class="ms-3" onclick="removeFromCart(${item.id})"><i class="bi bi-trash-fill"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        } catch (error) {
            console.error('Gagal mengambil detail produk:', error);
        }
    }

    cartTotalElement.textContent = `Rp ${totalHarga.toLocaleString('id-ID')}`;
    checkoutButton.classList.remove('disabled');
    updateCartCount(); // Update ikon di navigasi
}

// Fungsi untuk mengubah jumlah item
function changeQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('panganlink_cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        // Jika jumlahnya 0 atau kurang, hapus item dari keranjang
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }

    localStorage.setItem('panganlink_cart', JSON.stringify(cart));
    renderCart(); // Gambar ulang seluruh keranjang
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('panganlink_cart')) || [];
    // Buat array baru yang tidak berisi produk yang akan dihapus
    const newCart = cart.filter(item => item.id !== productId);

    localStorage.setItem('panganlink_cart', JSON.stringify(newCart));
    renderCart(); // Gambar ulang seluruh keranjang
}


// Jalankan fungsi renderCart saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', renderCart);