/**
 * =================================================================
 * KONFIGURASI APLIKASI UTAMA
 * =================================================================
 * File ini berisi semua pengaturan dan variabel yang dapat disesuaikan
 * untuk aplikasi. Ubah nilai di sini untuk menyesuaikan aplikasi
 * dengan kebutuhan organisasi Anda.
 */

// --- KONFIGURASI SUPABASE (WAJIB DIISI JIKA DIGUNAKAN) ---
// Masukkan URL dan Kunci Publik (anon key) dari proyek Supabase Anda.
// Anda bisa mendapatkan informasi ini dari Dasbor Proyek > Settings > API.
export const SUPABASE_URL = 'https://cbxhqualbvmgiwvocdru.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieGhxdWFsYnZtZ2l3dm9jZHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDUzNTksImV4cCI6MjA3MDU4MTM1OX0.dbNB9JTddo0yZkg9buApiBr-SjuKey12c2pu0v0Ac04';

// --- INFORMASI ORGANISASI & BRANDING ---
// Nama organisasi yang akan muncul di seluruh aplikasi.
export const ORGANIZATION_NAME = "Akuatik Sulawesi Selatan";
// Nama dasar aplikasi.
export const APP_NAME = "Data Wasit";
// Judul lengkap aplikasi, akan digabungkan dari APP_NAME dan ORGANIZATION_NAME.
export const APP_TITLE = `${APP_NAME} ${ORGANIZATION_NAME}`;

// --- KREDENSIAL LOGIN ADMIN ---
// Daftar semua akun yang memiliki akses admin.
// Anda bisa menambahkan objek baru ke dalam array ini untuk membuat akun admin baru.
// Contoh: { username: 'adminbaru@example.com', password: 'passwordaman' }
export const ADMIN_CREDENTIALS = [
  { username: 'akuatiksulsel@gmail.com', password: '12345' },
  { username: 'thamrintabe@gmail.com', password: '12345' },
  // Tambahkan akun admin lain di sini jika perlu
];


// --- DATA MASTER APLIKASI ---

// Daftar tingkat lisensi wasit yang tersedia.
// Urutan penting: dari terendah ke tertinggi.
export const LICENSE_LEVELS = [
  "Lisensi D (Daerah/Lokal)",
  "Lisensi C (Nasional)",
  "Lisensi B (Nasional)",
  "Lisensi A (Internasional)",
];

// Daftar cabang olahraga akuatik yang diakui.
export const SPORT_BRANCHES = [
    "Renang",
    "Polo Air",
    "Loncat Indah",
    "Renang Indah",
    "Renang Perairan Terbuka",
    "Master"
];