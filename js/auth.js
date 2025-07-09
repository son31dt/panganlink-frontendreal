document.addEventListener("DOMContentLoaded", () => {
  const messageDiv = document.getElementById("message");

  // Logika untuk Form Registrasi
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const nama = document.getElementById("nama").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(
          "https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/users/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ nama, email, password }),
          }
        );
        const result = await response.json();
        if (response.ok) {
          messageDiv.innerHTML = `<p style="color: green;">${result.message}! Anda akan dialihkan ke halaman login.</p>`;
          setTimeout(() => {
            window.location.href = "login.html"; // Alihkan ke halaman login
          }, 2000);
        } else {
          messageDiv.innerHTML = `<p style="color: red;">${result.message}</p>`;
        }
      } catch (error) {
        messageDiv.innerHTML = `<p style="color: red;">Tidak dapat terhubung ke server.</p>`;
      }
    });
  }

  // Logika untuk Form Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        const response = await fetch("https://d8eee579-45d7-4d5d-b836-9850661d5249-00-23v9sbprvwlhn.pike.replit.dev/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (response.ok) {
          // --- PERUBAHAN DI SINI ---
          // 1. Simpan data pengguna ke localStorage
          localStorage.setItem('panganlink_user', JSON.stringify(result.user));

          // 2. Tampilkan pesan dan alihkan ke marketplace.html
          messageDiv.innerHTML = `<p style="color: green;">${result.message}. Mengalihkan ke marketplace...</p>`;
          setTimeout(() => {
            window.location.href = "marketplace.html";
          }, 1500);
        } else {
          messageDiv.innerHTML = `<p style="color: red;">${result.message}</p>`;
        }
      } catch (error) {
        messageDiv.innerHTML = `<p style="color: red;">Tidak dapat terhubung ke server.</p>`;
      }
    });
  }
});