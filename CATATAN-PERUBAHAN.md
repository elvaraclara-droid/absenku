# SEMPAJANG - catatan perubahan

1. **Waktu shalat**: Subuh, Dhuha, Dzuhur, Ashar, Maghrib, Isya. Satu siswa hanya bisa absen sekali per waktu per hari.
   - Admin > tab Wajah > "Waktu Shalat & Verifikasi Gerakan": pilih waktu aktif (atau Otomatis mengikuti jam WITA).
   - Staf (piket/wali/admin) memilih data shalat yang dilihat lewat pilihan di bawah menu peran.
   - Penyimpanan: kolom `bulan` berisi `YYYY-MM` untuk Dzuhur (waktu utama, sama dengan data lama) dan `YYYY-MM@ashar` dst. untuk waktu lain. Tidak perlu mengubah skema.
   - Waktu utama bisa diganti di konstanta `WAKTU_UTAMA` (index.html).
   - Pastikan kolom `bulan` bertipe text tanpa batas panjang 7: `ALTER TABLE absensi ALTER COLUMN bulan TYPE text;`
   - Jadwal otomatis di server (Edge Function) hanya membaca waktu utama.
2. **Liveness**: setelah wajah cocok, siswa diminta kedip ATAU tengok (acak), lalu wajah dicocokkan ulang. Guru piket bisa mengaktifkannya di pengaturan yang sama.
3. **Resolusi**: kamera 640x480 (sebelumnya 320x240), detektor 320 px; pendaftaran foto 416 px.
4. **Banyak foto**: sampai 5 foto per siswa (centang "Tambahkan ke foto yang sudah terdaftar"). Pencocokan memakai jarak terkecil.
5. **Model AI offline**: face-api.js 0.22.2 dan model ada di `lib/` dan `models/`, di-cache service worker (`sempajang-v2`).
6. Perbaikan: `todayStr()` salah tanggal setelah ~16.00 WITA pada perangkat berzona waktu WITA.

## Absen Mapel (guru mata pelajaran)
- Menu **MAPEL**: login guru (akun tabel `guru`), tambah mapel & kelas yang diajar, Buka/Tutup Absen, scan wajah siswa dengan kamera guru, ubah status manual, "Belum absen -> Alpa", rekap bulanan + Excel.
- Siswa: tab **SISWA -> Mapel** (khusus scan wajah). Siswa otomatis tercatat ke sesi mapel yang sedang dibuka untuk kelasnya hari itu.
- Beberapa guru mapel boleh dipakai bersamaan; tiap kelas hanya punya satu sesi terbuka (membuka sesi baru menutup yang lama).
- Data disimpan di tabel `absensi` dengan `bulan` = `YYYY-MM@m_<nama-mapel>`, terpisah dari shalat.
- Jalankan `supabase-mapel.sql` di Supabase (sudah termasuk di `supabase-setup.sql` versi baru).
- Perbaikan: kartu "Berhasil" absen wajah siswa sempat error di v2 awal.
