document.addEventListener('DOMContentLoaded', async () => {
    const checkoutForm = document.getElementById('checkout-form');
    const orderSummaryContainer = document.getElementById('order-summary-container');
    const cartTotalElement = document.getElementById('cart-total');
    const namaPenerimaInput = document.getElementById('nama-penerima');

    // Ambil data pengguna dan keranjang dari localStorage
    const user = JSON.parse(localStorage.getItem('panganlink_user'));
    const cart = JSON.parse(localStorage.getItem('panganlink_cart')) || [];

    // Isi nama penerima secara otomatis
    if (user) {
        namaPenerimaInput.value = user.nama;
    }
    
    // Jika keranjang kosong, alihkan ke halaman marketplace
    if (cart.length === 0) {
        alert('Keranjang Anda kosong. Silakan belanja terlebih dahulu.');
        window.location.href = 'marketplace.html';
        return;
    }

    let totalHarga = 0;
    orderSummaryContainer.innerHTML = ''; // Kosongkan kontainer

    // Tampilkan ringkasan pesanan
    for (const item of cart) {
        const response = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/produk/${item.id}`);
        const product = await response.json();
        if (response.ok) {
            totalHarga += product.harga * item.quantity;
            const summaryItemHTML = `
                <div class="d-flex justify-content-between">
                    <p class="small">${product.nama_produk} (x${item.quantity})</p>
                    <p class="small">Rp ${ (product.harga * item.quantity).toLocaleString('id-ID')}</p>
                </div>
            `;
            orderSummaryContainer.insertAdjacentHTML('beforeend', summaryItemHTML);
        }
    }

    cartTotalElement.textContent = `Rp ${totalHarga.toLocaleString('id-ID')}`;

    // Ganti event listener yang lama dengan yang ini
    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Mencegah form dikirim

        // 1. Kumpulkan semua data yang akan dikirim
        const user = JSON.parse(localStorage.getItem('panganlink_user'));
        const cart = JSON.parse(localStorage.getItem('panganlink_cart')) || [];
        const alamat = document.getElementById('alamat-pengiriman').value;

        // Hitung ulang total harga untuk keamanan
        let finalTotalHarga = 0;
        for (const item of cart) {
            const response = await fetch(`https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/produk/${item.id}`);
            const product = await response.json();
            finalTotalHarga += product.harga * item.quantity;
        }

        const orderData = {
            user_id: user.user_id,
            total_harga: finalTotalHarga,
            alamat_pengiriman: alamat,
            items: cart // Kirim item-item di keranjang
        };

        try {
            // 2. Kirim data ke backend
            const response = await fetch('https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/pesanan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (response.ok) {
                // 3. Jika berhasil, kosongkan keranjang dan arahkan ke marketplace
                alert('Terima kasih! Pesanan Anda telah berhasil dibuat.');
                localStorage.removeItem('panganlink_cart');
                window.location.href = 'marketplace.html';
            } else {
                alert(`Gagal membuat pesanan: ${result.message}`);
            }

        } catch (error) {
            console.error('Error checkout:', error);
            alert('Terjadi kesalahan koneksi saat checkout.');
        }
    });
});