# Software Requirements Specification (SRS)
## Aethergym Suite - Frontend & Backend Integration

### 1. Tinjauan Teknologi (Berdasarkan Repositori Frontend)
* **Frontend Framework:** React 18, Vite, TypeScript
* **Styling & UI:** Tailwind CSS, shadcn/ui components (Radix UI)
* **Charts/Visualisasi:** Recharts (atau library sejenis yang kompatibel dengan React untuk bar chart)
* **Routing:** React Router DOM (diasumsikan untuk navigasi halaman)
* **Package Manager:** Bun / npm

### 2. Kebutuhan Fungsional (Functional Requirements)
* **FR-01 (Autentikasi):** Sistem harus memungkinkan registrasi, login, dan logout.
* **FR-02 (Pembayaran):** Sistem harus mengarahkan Guest ke *Payment Gateway* untuk memproses membership.
* **FR-03 (Upload Foto):** Sistem harus menyediakan dialog modal untuk mengunggah gambar dengan ekstensi .jpg, .png, .jpeg.
* **FR-04 (Pemrosesan AI):** Sistem harus mengirimkan gambar ke API AI pihak ketiga dan menerima respons berupa format JSON berisi nama makanan dan nilai nutrisi.
* **FR-05 (Dashboard Analitik):** Sistem harus menampilkan *Bar Chart* yang memetakan data agregasi konsumsi makronutrisi berdasar rentang waktu (Hari/Minggu/Bulan).
* **FR-06 (Diet Planner):** Sistem harus memungkinkan pengguna menyimpan relasi antara entitas *User*, *Food Master*, dan *Date/Time* (Rencana Diet).
* **FR-07 (Manajemen Admin):** Sistem harus menyediakan akses antarmuka admin (berbasis role) untuk mengelola tabel `Master_Foods`.

### 3. Kebutuhan Non-Fungsional (Non-Functional Requirements)
* **Performa:** Respons pemrosesan gambar dari API AI maksimal 5-7 detik. Antarmuka harus memberikan indikator *Loading/Skeleton* selama proses.
* **Responsivitas:** UI harus *Mobile-First*, mengingat pengguna kemungkinan besar mengunggah foto makanan melalui *smartphone* mereka di meja makan.
* **Keamanan:** Endpoint API dan Webhook *payment gateway* wajib diamankan menggunakan JWT/Bearer Token dan verifikasi *signature*.

### 4. Skema Data (Data Model Terpadu)
Untuk mendukung alur aplikasi, berikut adalah *Entity Relationship* (Data yang tersimpan):
1. **`Users`**: `user_id`, `name`, `email`, `password_hash`, `role` (Guest, Member, Admin), `target_calories`.
2. **`Memberships`**: `membership_id`, `user_id`, `start_date`, `end_date`, `status` (Active, Expired).
3. **`Payment_Receipts`**: `receipt_id`, `user_id`, `transaction_id` (dari Gateway), `amount`, `payment_method`, `payment_status`, `timestamp`.
4. **`Master_Foods`** (Log Data Admin): `food_id`, `name`, `calories`, `protein`, `carbs`, `fat`, `serving_size`.
5. **`Food_Logs`** (Catatan harian user): `log_id`, `user_id`, `food_name` (bisa dari Master_Foods atau input manual), `calories`, `protein`, `carbs`, `fat`, `consumed_at`.
6. **`AI_Scan_Results`**: `scan_id`, `user_id`, `image_url` (disimpan di Cloud Storage/S3), `raw_ai_response`, `mapped_food_log_id`.
7. **`Diet_Plans`**: `plan_id`, `user_id`, `food_id`, `planned_date`, `meal_type` (Breakfast/Lunch/Dinner/Snacks), `is_consumed` (boolean).

### 5. Alur Data (Data Flow)
**A. Alur Registrasi & Membership:**
1. *Guest* mendaftar akun -> Data tersimpan di tabel `Users` (Role: Guest).
2. *Guest* memilih paket langganan -> FE memanggil API Checkout Backend -> Backend memanggil *Payment Gateway* API.
3. *Payment Gateway* merespons dengan URL Pembayaran -> *Guest* melakukan pembayaran.
4. *Payment Gateway* mengirim Webhook ke Backend -> Backend mengupdate `Payment_Receipts` dan mengubah role `Users` menjadi Member serta mengisi data `Memberships`.
5. *Guest* kini menjadi *Member Gym* dan halaman Dashboard terbuka.

**B. Alur Pengenalan Foto Makanan (AI Food Analyzer):**
1. *Member* membuka `UploadMealDialog.tsx` dan memilih foto.
2. FE mengompresi foto dan mengirim HTTP POST Multipart ke Backend.
3. Backend mengunggah foto ke *Cloud Storage* (contoh: AWS S3) untuk menyimpan *history*.
4. Backend meneruskan URL foto/Base64 ke **Vision API** (misal: OpenAI GPT-4V atau LogMeal).
5. API mengembalikan JSON: `{"food": "Nasi Goreng", "macros": {"protein": 12, "carbs": 45, "fat": 15}}`.
6. Backend menyimpan ke `AI_Scan_Results` dan menambah entri di `Food_Logs`.
7. FE menerima respons sukses dan memperbarui state Dashboard/Animasi Counter.

**C. Alur Analitik (Statistics Page):**
1. *Member* membuka halaman `Statistics.tsx`.
2. FE melakukan *request* ke Backend berdasar filter (Hari/Minggu/Bulan).
3. Backend melakukan *Query Grouping & Aggregation* pada tabel `Food_Logs` berdasarkan `consumed_at`.
4. FE memetakan data JSON ke dalam komponen visual *Recharts* (Bar Chart), membagi seri data menjadi Lemak, Karbo, dan Protein.

### 6. Rekomendasi API & Layanan Pihak Ketiga
* **Payment Gateway:**
  * **Midtrans** atau **Xendit** (Sangat direkomendasikan untuk target pasar Indonesia, mendukung QRIS, Virtual Account, dan E-Wallet).
* **AI Image / Vision API:**
  * **OpenAI Vision API (GPT-4o / GPT-4V):** Sangat cerdas mengenali berbagai masakan, termasuk makanan lokal, dengan prompt untuk mengembalikan format JSON yang ketat.
  * *Alternatif:* **LogMeal API** (API spesifik yang memang dirancang untuk *food image recognition* dan perhitungan gizi) atau **CalorieMama API**.
* **Storage (Foto Makanan):**
  * **AWS S3**, **Supabase Storage**, atau **Cloudinary** (Cloudinary memiliki optimasi gambar otomatis yang baik untuk frontend).
