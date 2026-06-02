# Product Requirements Document (PRD)
## Aethergym Suite - AI-Powered Diet Management

### 1. Latar Belakang & Visi Produk
Aethergym Suite adalah aplikasi manajemen diet terintegrasi yang ditujukan khusus bagi member gym. Aplikasi ini bertujuan menyelesaikan masalah umum bagi para penggiat fitness: sulitnya melacak asupan nutrisi harian (makro & mikro) secara akurat. Dengan memanfaatkan teknologi *Computer Vision* / AI, pengguna cukup mengunggah foto makanan mereka, dan sistem akan mengestimasi kandungan lemak, karbohidrat, dan protein secara otomatis.

### 2. Aktor / Persona Pengguna
1. **Guest (Tamu):**
   * Pengguna yang belum memiliki akun atau belum berlangganan membership gym.
   * **Tujuan:** Melihat penawaran harga membership (Pricing page), mempelajari fitur aplikasi (About page), dan melakukan registrasi.
2. **Member Gym (Pengguna Aktif):**
   * Pengguna yang telah berhasil melakukan registrasi dan menyelesaikan pembayaran membership.
   * **Tujuan:** Menggunakan fitur dashboard diet, mengunggah foto makanan, mencatat rencana diet, dan melihat analitik nutrisi harian/mingguan/bulanan.
3. **Admin (Customer Service / Pengelola):**
   * Staf pengelola gym.
   * **Tujuan:** Mengelola data pengguna, memverifikasi pembayaran (jika ada kendala), menangani keluhan pengguna, dan melakukan pembaruan/kurasi pada database *log makanan* manual.

### 3. User Stories
* Sebagai **Guest**, saya ingin melihat pilihan paket gym dan melakukan pembayaran agar bisa mengakses fitur diet planner.
* Sebagai **Member Gym**, saya ingin mengunggah foto makanan saya agar sistem dapat secara otomatis menghitung kalori dan makronutrisinya tanpa saya harus mengetik manual.
* Sebagai **Member Gym**, saya ingin melihat grafik batang (bar chart) berisi konsumsi Lemak, Karbohidrat, dan Protein saya dalam mode Harian, Mingguan, dan Bulanan agar saya tahu apakah saya *on track* dengan target diet saya.
* Sebagai **Member Gym**, saya ingin membuat rencana diet (Diet Plan) dengan menambahkan daftar makanan dari log yang sudah tersedia agar saya bisa menyiapkan *meal prep* harian.
* Sebagai **Admin**, saya ingin bisa mengedit atau menambahkan informasi pada master data log makanan agar database sistem tetap *up-to-date* dan akurat.

### 4. Fitur Utama (Ruang Lingkup)
1. **Modul Autentikasi & Membership:**
   * Registrasi dan Login (Email/Password).
   * Integrasi Payment Gateway untuk pembelian paket gym.
   * *Paywall*: Fitur manajemen diet terkunci untuk status "Guest".
2. **AI Food Analyzer:**
   * Antarmuka pengunggahan foto makanan (Upload Meal).
   * Pemrosesan gambar untuk mendeteksi jenis makanan dan porsi perkiraan.
   * *Feedback loop*: Pengguna bisa mengonfirmasi/mengedit hasil deteksi AI jika kurang tepat.
3. **Diet & Nutrition Analytics:**
   * Halaman Analitik (*Statistics Page*).
   * *Chart visualization*: Grafik batang untuk Lemak, Karbo, dan Protein.
   * Filter waktu: *Daily, Weekly, Monthly*.
4. **Diet Planner & Manual Logging:**
   * Menambahkan makanan secara manual (tanpa foto) dari *database* lokal (Log Makanan).
   * Menjadwalkan konsumsi makanan untuk sarapan, makan siang, makan malam, dan camilan.

### 5. Metrik Kesuksesan
* **Conversion Rate:** Persentase Guest yang mengubah statusnya menjadi Member Gym.
* **Feature Adoption:** Rata-rata jumlah foto makanan yang diunggah per member dalam satu minggu.
* **Retention Rate:** Persentase member gym yang membuka halaman *Analytics* setidaknya 3 kali seminggu.
