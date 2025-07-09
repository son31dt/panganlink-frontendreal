document.addEventListener('DOMContentLoaded', () => {
    const createStoreForm = document.getElementById('create-store-form');
    const messageDiv = document.getElementById('message');
    const user = JSON.parse(localStorage.getItem('panganlink_user'));

    // Jika belum login, tidak bisa buat toko
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    createStoreForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nama_toko = document.getElementById('nama_toko').value;
        const deskripsi = document.getElementById('deskripsi_toko').value;

        try {
            const response = await fetch('https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/toko', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    nama_toko: nama_toko,
                    deskripsi: deskripsi
                })
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = `<p style="color: green;">Toko berhasil dibuat! Anda akan diarahkan ke dashboard...</p>`;
                setTimeout(() => {
                    window.location.href = 'dashboard-penjual.html';
                }, 2000);
            } else {
                messageDiv.innerHTML = `<p style="color: red;">${result.message}</p>`;
            }
        } catch (error) {
            messageDiv.innerHTML = `<p style="color: red;">Terjadi kesalahan. Coba lagi.</p>`;
        }
    });
});