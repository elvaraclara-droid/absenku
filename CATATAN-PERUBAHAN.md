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

## Perbaikan pendaftaran foto wajah
- Foto dari kamera HP otomatis dikecilkan (maks. 1280 px) sehingga tidak lagi ditolak karena lebih dari 2 MB.
- Tombol baru "Ambil Foto dengan Kamera HP" memakai aplikasi kamera bawaan HP (tidak perlu izin kamera browser).
- Pesan error kamera lebih jelas (izin ditolak, bukan HTTPS, kamera dipakai aplikasi lain).
- Kalau unggah foto ke Supabase Storage gagal, muncul peringatan beserta penyebabnya; data wajah tetap tersimpan dan siswa tetap tampil "Terdaftar".

## config.js (pengaturan Supabase)
- URL dan kunci anon Supabase sekarang dibaca dari `config.js`. Untuk pembaruan berikutnya, cukup ganti file lain tanpa menimpa `config.js` Anda.
- Layar login admin menampilkan diagnosa koneksi ketika login gagal.
- Tombol "Simpan Data Wajah" memberi petunjuk bila siswa belum dipilih, dan aktif otomatis setelah siswa dipilih.
