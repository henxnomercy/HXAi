
// Variabel global untuk model AI
let classifier; 
// Kita tidak perlu imgElement di sini karena kita langsung menggunakan imagePreview
// untuk feed ke classifier.classify()

// --- Dapatkan Elemen DOM ---
// Pastikan semua ID HTML cocok dengan yang ada di index.html
const imageUpload = document.getElementById('imageUpload');
const analyzeButton = document.getElementById('analyzeButton');
const imagePreview = document.getElementById('imagePreview');
const statusMessage = document.getElementById('statusMessage');
const outputList = document.getElementById('outputList');

// --- State Aplikasi ---
// Variabel untuk melacak apakah model AI sudah siap
let isModelReady = false; 

// --- Inisialisasi Model AI ---
// Fungsi untuk memuat model MobileNet (pre-trained image classification)
function loadModel() {
    statusMessage.textContent = 'Memuat model AI (MobileNet)... Ini mungkin membutuhkan waktu beberapa detik.';
    analyzeButton.disabled = true; // Nonaktifkan tombol saat memuat model
    console.log('Mulai memuat model MobileNet...');
    
    // Pastikan ML5.js sudah tersedia sebelum memanggil imageClassifier
    if (typeof ml5 !== 'undefined') {
        classifier = ml5.imageClassifier('MobileNet', {}, modelReady); // Objek kosong untuk options
    } else {
        statusMessage.textContent = 'Error: ML5.js tidak dimuat dengan benar. Periksa koneksi internet atau script tag.';
        console.error('ML5.js library not found!');
    }
}

// Callback setelah model berhasil dimuat
function modelReady() {
    isModelReady = true; // Set status model menjadi siap
    statusMessage.textContent = 'Model AI siap! Unggah gambar untuk memulai analisis.';
    console.log('Model MobileNet siap dan berjalan!');
    // Tombol analisis akan diaktifkan setelah ada gambar dan model siap
    // Logika pengaktifan tombol akan dipindahkan ke handler unggah gambar
}

// --- Handler Unggah Gambar ---
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Dapatkan file yang diunggah

    if (file) {
        // Hanya izinkan file gambar
        if (!file.type.startsWith('image/')) {
            statusMessage.textContent = 'Mohon unggah file gambar yang valid (JPG, PNG, GIF, dll.).';
            imagePreview.style.display = 'none';
            analyzeButton.disabled = true;
            return; // Hentikan eksekusi jika bukan gambar
        }

        const reader = new FileReader();

        reader.onloadstart = () => {
            statusMessage.textContent = 'Membaca gambar...';
            analyzeButton.disabled = true; // Nonaktifkan tombol selama membaca file
            imagePreview.style.display = 'none'; // Sembunyikan pratinjau lama
            outputList.innerHTML = ''; // Bersihkan hasil lama
        };

        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block'; // Tampilkan pratinjau gambar

            // Aktifkan tombol analisis hanya jika model sudah siap
            if (isModelReady) {
                analyzeButton.disabled = false;
                statusMessage.textContent = 'Gambar siap dianalisis. Tekan tombol "Mulai Analisis".';
            } else {
                statusMessage.textContent = 'Model AI sedang dimuat atau belum siap. Mohon tunggu.';
                analyzeButton.disabled = true;
            }
        };

        reader.onerror = () => {
            statusMessage.textContent = 'Gagal membaca file gambar.';
            analyzeButton.disabled = true;
            console.error('Error reading file:', reader.error);
        };

        reader.readAsDataURL(file);
    } else {
        // Jika tidak ada file yang dipilih
        imagePreview.style.display = 'none';
        imagePreview.src = '#'; 
        analyzeButton.disabled = true;
        statusMessage.textContent = 'Silakan unggah gambar Anda.';
        outputList.innerHTML = '';
    }
});

// --- Handler Tombol Analisis ---
analyzeButton.addEventListener('click', () => {
    // Pastikan ada gambar yang dimuat dan model siap sebelum menganalisis
    if (imagePreview.src && imagePreview.src !== '#' && isModelReady) {
        statusMessage.textContent = 'Menganalisis gambar... Mohon tunggu.';
        analyzeButton.disabled = true; // Nonaktifkan tombol selama analisis
        outputList.innerHTML = ''; // Bersihkan hasil sebelumnya

        classifier.classify(imagePreview, gotResult);
    } else if (!isModelReady) {
        statusMessage.textContent = 'Model AI belum siap. Mohon tunggu atau refresh halaman.';
    } else {
        statusMessage.textContent = 'Tidak ada gambar untuk dianalisis. Silakan unggah gambar terlebih dahulu.';
    }
});

// --- Fungsi Callback Setelah Analisis Selesai ---
function gotResult(error, results) {
    if (error) {
        console.error('Error klasifikasi:', error);
        statusMessage.textContent = 'Terjadi kesalahan saat klasifikasi gambar. Lihat konsol untuk detail.';
        outputList.innerHTML = `<li style="color: red;">Error: ${error.message || 'Unknown error'}</li>`;
    } else {
        console.log('Hasil Klasifikasi:', results);
        statusMessage.textContent = 'Analisis Selesai!';
        outputList.innerHTML = ''; // Bersihkan daftar hasil

        if (results && results.length > 0) {
            // Tampilkan hingga 5 hasil teratas
            const topResults = results.slice(0, Math.min(results.length, 5));

            topResults.forEach((result, index) => {
                const li = document.createElement('li');
                // Format label: hapus angka di awal (e.g., "001 cat" -> "cat")
                const formattedLabel = result.label.replace(/^\d+\s/, '');
                const confidencePercentage = (result.confidence * 100).toFixed(2);
                li.innerHTML = `<span>${formattedLabel}</span> <span>${confidencePercentage}%</span>`;
                outputList.appendChild(li);
            });
            // Tambahkan pesan jika ada lebih banyak hasil yang tidak ditampilkan
            if (results.length > 5) {
                const liMore = document.createElement('li');
                liMore.innerHTML = `<span>...dan ${results.length - 5} hasil lainnya.</span>`;
                outputList.appendChild(liMore);
            }

        } else {
            outputList.innerHTML = `<li>Tidak ada objek yang dapat diidentifikasi secara pasti.</li>`;
        }
    }
    analyzeButton.disabled = false; // Aktifkan kembali tombol setelah analisis (baik berhasil atau error)
}

// --- Inisialisasi Saat Halaman Dimuat ---
// Panggil fungsi loadModel saat DOMContentLoaded untuk memastikan semua elemen HTML tersedia
document.addEventListener('DOMContentLoaded', loadModel);
