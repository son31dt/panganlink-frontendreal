document.addEventListener('DOMContentLoaded', () => {
    setupSharedUI();
});

async function setupSharedUI() {
    const userContainer = document.getElementById('userName');
    const logoutButton = document.getElementById('logoutButton');
    const cartCountElement = document.getElementById('cart-count');
    const sellerActionPlaceholder = document.getElementById('seller-action-placeholder');
    
    const user = JSON.parse(localStorage.getItem('panganlink_user'));

    // Jika tidak login, alihkan ke halaman login
    if (!user) {
        if (!document.body.classList.contains('is-public-page')) {
            alert('Anda harus login terlebih dahulu.');
            window.location.href = 'login.html';
        }
        return;
    }

    // Tampilkan nama & tombol logout jika elemennya ada
    if (userContainer) userContainer.textContent = user.nama;
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('panganlink_user');
            localStorage.removeItem('panganlink_cart');
            alert('Anda telah logout.');
            window.location.href = 'index.html';
        });
    }

    // Update hitungan keranjang jika elemennya ada
    if (cartCountElement) updateCartCount();
    
    // PERUBAHAN UTAMA: Cek status toko pengguna dan tampilkan tombol yang sesuai
    if (sellerActionPlaceholder) {
        try {
            const tokoResponse = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/toko/by-user/${user.user_id}`);
            if (tokoResponse.ok) {
                // Jika punya toko, tampilkan link ke dashboard
                sellerActionPlaceholder.innerHTML = `<a class="nav-link" href="dashboard-penjual.html">Dashboard Penjual</a>`;
            } else {
                // Jika tidak punya toko (404), tampilkan tombol untuk buat toko
                sellerActionPlaceholder.innerHTML = `<a class="btn btn-success me-3" href="buat-toko.html">Buka Toko</a>`;
            }
        } catch (error) {
            console.error("Gagal memeriksa status toko:", error);
        }
    }
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    const cart = JSON.parse(localStorage.getItem('panganlink_cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElement.textContent = totalItems;
}