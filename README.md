# Data Wasit Akuatik Sulawesi Selatan

Aplikasi ini dirancang untuk memfasilitasi pengelolaan data wasit akuatik. Dibangun dengan React, TypeScript, dan Vite, serta terintegrasi dengan Supabase sebagai backend.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

## 🚀 Panduan Pengaturan Cepat

Ikuti langkah-langkah ini untuk menjalankan aplikasi secara lokal dengan database Supabase Anda sendiri.

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)

### 1. Dapatkan Kredensial Supabase
- Buat proyek baru di [Supabase](https://supabase.com/).
- Buka Dasbor Proyek Anda, lalu navigasi ke **Settings** > **API**.
- Salin **Project URL** dan **anon public key**. Anda akan membutuhkannya di langkah berikutnya.

### 2. Konfigurasi Environment Variables Lokal
- Clone repositori ini ke mesin lokal Anda.
- Di dalam folder proyek, ubah nama file `.env.example` menjadi `.env`.
- Buka file `.env` yang baru Anda buat.
- Isi nilai untuk `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dengan informasi dari langkah 1.
- (Opsional) Sesuaikan `ORGANIZATION_NAME` dan kredensial login admin di `src/config.ts` sesuai kebutuhan Anda.

### 3. Siapkan Database
- Di Dasbor Supabase Anda, buka **SQL Editor**.
- Buat *query* baru dengan mengklik **New query**.
- Salin **seluruh isi skrip SQL di bawah ini** dan tempelkan ke dalam SQL Editor Supabase.
- Klik **Run**. Skrip ini aman untuk dijalankan berulang kali dan akan mengkonfigurasi database Anda dengan benar.

#### Skrip Inisialisasi Database Supabase
```sql
-- =================================================================
-- SKRIP INISIALISASI DATABASE SUPABASE
-- =================================================================
-- Versi: 1.2
-- Catatan: Skrip ini dirancang agar dapat dijalankan ulang (idempotent).
-- Ia akan menghapus tabel dan kebijakan lama sebelum membuatnya kembali.
-- =================================================================

-- ==== BAGIAN 1: PEMBERSIHAN (HAPUS OBJEK LAMA JIKA ADA) ====
-- Hapus kebijakan lama agar tidak ada konflik
DROP POLICY IF EXISTS "Enable all access for anon users" ON public.referees;
DROP POLICY IF EXISTS "Enable all access for anon users" ON public.app_settings;

-- Hapus tabel lama, CASCADE akan menghapus semua objek terkait (seperti trigger)
DROP TABLE IF EXISTS public.referees CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;


-- ==== BAGIAN 2: PEMBUATAN TABEL ====

-- Membuat tabel utama untuk menyimpan data wasit.
CREATE TABLE public.referees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender char(1) NOT NULL CHECK (gender IN ('L', 'P')),
  place_of_birth text,
  date_of_birth date,
  address text,
  phone text,
  email text UNIQUE,
  license_number text,
  highest_license text,
  sport_branch text,
  experience text[],
  photo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.referees IS 'Menyimpan data untuk semua wasit akuatik.';

-- Membuat tabel untuk pengaturan aplikasi global (misalnya: logo).
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.app_settings IS 'Menyimpan pengaturan global aplikasi sebagai pasangan kunci-nilai.';


-- ==== BAGIAN 3: FUNGSI TRIGGER UNTUK UPDATED_AT ====

-- Fungsi ini akan otomatis memperbarui kolom 'updated_at' setiap kali ada perubahan data.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Menerapkan trigger ke tabel 'referees'.
CREATE TRIGGER on_referees_updated
BEFORE UPDATE ON public.referees
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Menerapkan trigger ke tabel 'app_settings'.
CREATE TRIGGER on_app_settings_updated
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();


-- ==== BAGIAN 4: KEAMANAN (ROW-LEVEL SECURITY) ====
-- PENTING: Kebijakan ini mengizinkan SEMUA operasi (baca, tulis, hapus)
-- menggunakan kunci 'anon' publik. Ini diperlukan karena arsitektur aplikasi saat ini
-- menangani otentikasi admin di sisi klien, bukan menggunakan Supabase Auth.

-- Aktifkan RLS untuk tabel 'referees'.
ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for anon users" ON public.referees
FOR ALL -- Berlaku untuk SELECT, INSERT, UPDATE, DELETE
USING (true)
WITH CHECK (true);


-- Aktifkan RLS untuk tabel 'app_settings'.
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for anon users" ON public.app_settings
FOR ALL -- Berlaku untuk SELECT, INSERT, UPDATE, DELETE
USING (true)
WITH CHECK (true);


-- ==== BAGIAN 5: (OPSIONAL) DATA AWAL ====

-- Contoh untuk memasukkan logo default:
-- INSERT INTO public.app_settings (key, value)
-- VALUES ('logo_url', 'https://path.to/your/default_logo.png')
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Pesan Selesai
SELECT 'Skrip inisialisasi database Supabase selesai dijalankan.' as status;
```

### 4. Jalankan Aplikasi Secara Lokal
- Buka terminal di folder proyek dan instal semua dependensi:
  ```bash
  npm install
  ```
- Jalankan server pengembangan:
  ```bash
  npm run dev
  ```
- Buka browser Anda dan navigasi ke `http://localhost:5173` (atau alamat yang ditampilkan di terminal).

---

### 5. Deployment ke Netlify

Aplikasi ini siap untuk di-deploy ke Netlify.

1.  **Push ke Repositori GitHub**: Pastikan kode Anda sudah ada di repositori GitHub.
2.  **Hubungkan ke Netlify**:
    - Login ke Netlify dan pilih "Add new site" -> "Import an existing project".
    - Pilih GitHub dan otorisasi akses ke repositori Anda.
    - Pilih repositori aplikasi Anda.
3.  **Konfigurasi Build**: Netlify akan otomatis mendeteksi file `netlify.toml` dan mengisi pengaturan build dengan benar:
    - **Build command**: `npm run build`
    - **Publish directory**: `dist`
4.  **Tambahkan Environment Variables (WAJIB)**:
    - Di dasbor Netlify, navigasi ke **Site settings > Build & deploy > Environment**.
    - Klik **Edit variables** dan tambahkan variabel berikut:
        - `VITE_SUPABASE_URL`: Isi dengan **Project URL** Anda dari Supabase.
        - `VITE_SUPABASE_ANON_KEY`: Isi dengan **anon public key** Anda dari Supabase.
5.  Klik **Deploy site**.

---

## Fitur Utama

- **Tampilan Publik**: Menampilkan daftar semua wasit beserta rekapitulasi data visual yang kaya.
- **Integrasi Database**: Terhubung dengan Supabase untuk pengelolaan data yang terpusat dan andal.
- **Login Admin**: Akses aman ke dasbor pengelolaan.
- **Dasbor Admin**:
  - **Manajemen Data**:
    - **Input Manual**: Tambah, Edit, dan Hapus data wasit melalui form detail.
    - **Input Massal**: Impor data wasit dalam jumlah besar menggunakan file Excel.
  - **Rekap & Cetak**:
      - Cetak data per wasit.
      - Cetak rekapitulasi keseluruhan.
      - Buat dan cetak kartu nama untuk semua wasit.
  - **Pengaturan & Backup**:
    - Unggah dan kelola logo aplikasi.
    - Lakukan backup data ke format JSON atau Excel.
    - Pulihkan data dari file backup JSON.
    - Hapus semua data dengan konfirmasi.

---

## Catatan Pembaharuan (Changelog)

### v2.1.0
- **Keamanan**: Kredensial Supabase dipindahkan dari kode sumber ke *environment variables* untuk meningkatkan keamanan.
- **Konfigurasi Lokal**: Menambahkan dukungan untuk file `.env` untuk pengembangan lokal.
- **Dokumentasi**: Memperbarui panduan setup dan deployment untuk mencerminkan penggunaan environment variables.

### v2.0.0
- **Refactor ke Vite**: Migrasi proyek dari setup CDN ke build system Vite modern.
- **Manajemen Dependensi**: Semua dependensi (React, Supabase, dll.) sekarang dikelola melalui `package.json`.
- **Konfigurasi Deployment**: Menambahkan file `netlify.toml` untuk deployment otomatis yang mudah.
- **Struktur Proyek**: Mengorganisir semua kode sumber ke dalam direktori `src`.

(Changelog sebelumnya tetap berlaku)
