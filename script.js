// Variabel global untuk model AI
let classifier; 

// --- Dapatkan Elemen DOM ---
const imageUpload = document.getElementById('imageUpload');
const analyzeButton = document.getElementById('analyzeButton');
const imagePreview = document.getElementById('imagePreview');
const statusMessage = document.getElementById('statusMessage');
const outputList = document.getElementById('outputList');

// --- State Aplikasi ---
let isModelReady = false; 
let currentImageFile = null; // Untuk menyimpan referensi file gambar yang sedang diunggah

// --- Fungsi untuk Mengupdate Status Tombol Analisis ---
function updateAnalyzeButtonState() {
    // Tombol aktif jika model siap DAN ada gambar yang valid
    if (isModelReady && currentImageFile) {
        analyzeButton.disabled = false;
        statusMessage.textContent = 'Gambar siap dianalisis. Tekan tombol "Mulai Analisis".';
    } else {
        analyzeButton.disabled = true;
        if (!isModelReady) {
            statusMessage.textContent = 'Model AI sedang dimuat atau belum siap. Mohon tunggu.';
        } else if (!currentImageFile) {
            statusMessage.textContent = 'Silakan unggah gambar Anda.';
        }
    }
    console.log(`[DEBUG] Button State Update: isModelReady=${isModelReady}, currentImageFile=${!!currentImageFile}, analyzeButton.disabled=${analyzeButton.disabled}`);
}


// --- Inisialisasi Model AI ---
function loadModel() {
    statusMessage.textContent = 'Memuat model AI (MobileNet)... Ini mungkin membutuhkan waktu beberapa detik.';
    updateAnalyzeButtonState(); // Pastikan tombol dinonaktifkan saat memuat
    console.log('Mulai memuat model MobileNet...');
    
    if (typeof ml5 !== 'undefined') {
        classifier = ml5.imageClassifier('MobileNet', {}, () => {
            // Callback ini akan dipanggil setelah model siap
            modelReady();
        }); 
    } else {
        statusMessage.textContent = 'Error: ML5.js tidak dimuat dengan benar. Periksa koneksi internet atau script tag.';
        console.error('ML5.js library not found! Make sure the script tag is correct and internet is available.');
    }
}

// Callback setelah model berhasil dimuat
function modelReady() {
    isModelReady = true; 
    console.log('Model MobileNet siap dan berjalan!');
    updateAnalyzeButtonState(); // Perbarui status tombol setelah model siap
}

// --- Handler Unggah Gambar ---
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0]; 
    currentImageFile = null; // Reset file saat ada perubahan input

    if (file) {
        if (!file.type.startsWith('image/')) {
            statusMessage.textContent = 'Mohon unggah file gambar yang valid (JPG, PNG, GIF, dll.).';
            imagePreview.style.display = 'none';
            imagePreview.src = '#';
            currentImageFile = null;
            updateAnalyzeButtonState();
            return; 
        }

        currentImageFile = file; // Simpan referensi file yang valid
        const reader = new FileReader();

        reader.onloadstart = () => {
            statusMessage.textContent = 'Membaca gambar...';
            updateAnalyzeButtonState(); // Nonaktifkan tombol selama membaca file
            imagePreview.style.display = 'none'; 
            outputList.innerHTML = ''; 
        };

        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block'; 
            updateAnalyzeButtonState(); // Perbarui status tombol setelah gambar dimuat
        };

        reader.onerror = () => {
            statusMessage.textContent = 'Gagal membaca file gambar. Coba gambar lain.';
            currentImageFile = null;
            updateAnalyzeButtonState();
            console.error('Error reading file:', reader.error);
        };

        reader.readAsDataURL(file);
    } else {
        // Jika tidak ada file yang dipilih (misal user membatalkan dialog file)
        imagePreview.style.display = 'none';
        imagePreview.src = '#'; 
        currentImageFile = null;
        updateAnalyzeButtonState();
        outputList.innerHTML = '';
    }
});

// --- Handler Tombol Analisis ---
analyzeButton.addEventListener('click', () => {
    // Pastikan ada gambar yang dimuat dan model siap sebelum menganalisis
    if (imagePreview.src && imagePreview.src !== '#' && isModelReady) {
        statusMessage.textContent = 'Menganalisis gambar... Mohon tunggu.';
        updateAnalyzeButtonState(); // Nonaktifkan tombol selama analisis
        outputList.innerHTML = ''; 

        // PENAMBAHAN PENTING: Validasi elemen gambar sebelum klasifikasi
        // Pastikan gambar sudah fully loaded dan siap untuk dianalisis
        if (imagePreview.complete && imagePreview.naturalHeight !== 0) {
            console.log('[DEBUG] Gambar siap untuk klasifikasi.');
            if (classifier) {
                classifier.classify(imagePreview, gotResult);
            } else {
                statusMessage.textContent = 'Error: Model AI belum diinisialisasi. Coba muat ulang halaman.';
                console.error('Classifier is not initialized!');
                updateAnalyzeButtonState();
            }
        } else {
            statusMessage.textContent = 'Gambar belum sepenuhnya dimuat atau tidak valid. Coba lagi atau unggah gambar lain.';
            console.error('[DEBUG] Gambar belum siap untuk klasifikasi. complete:', imagePreview.complete, 'naturalHeight:', imagePreview.naturalHeight);
            updateAnalyzeButtonState(); // Aktifkan kembali tombol karena gagal menganalisis
        }
    } else {
        if (!isModelReady) {
            statusMessage.textContent = 'Model AI belum siap. Mohon tunggu atau refresh halaman.';
        } else if (!currentImageFile) {
            statusMessage.textContent = 'Tidak ada gambar untuk dianalisis. Silakan unggah gambar terlebih dahulu.';
        }
        updateAnalyzeButtonState(); 
    }
});

// --- Fungsi Callback Setelah Analisis Selesai ---
function gotResult(error, results) {
    if (error) {
        console.error('Error klasifikasi dari ML5.js:', error); // Log objek error secara penuh
        
        let errorMessage = 'Terjadi kesalahan saat klasifikasi gambar.';
        if (error.message) {
            errorMessage += ` Detail: ${error.message}`;
        } else if (typeof error === 'string') {
            errorMessage += ` Detail: ${error}`;
        }
        statusMessage.textContent = errorMessage;
        outputList.innerHTML = `<li style="color: red;">${errorMessage}</li>`;
    } else {
        console.log('Hasil Klasifikasi:', results);
        statusMessage.textContent = 'Analisis Selesai!';
        outputList.innerHTML = ''; 

        if (results && results.length > 0) {
            const topResults = results.slice(0, Math.min(results.length, 5));

            topResults.forEach((result, index) => {
                const li = document.createElement('li');
                const formattedLabel = result.label.replace(/^\d+\s/, '');
                const confidencePercentage = (result.confidence * 100).toFixed(2);
                li.innerHTML = `<span>${formattedLabel}</span> <span>${confidencePercentage}%</span>`;
                outputList.appendChild(li);
            });
            if (results.length > 5) {
                const liMore = document.createElement('li');
                liMore.innerHTML = `<span>...dan ${results.length - 5} hasil lainnya.</span>`;
                outputList.appendChild(liMore);
            }

        } else {
            outputList.innerHTML = `<li>Tidak ada objek yang dapat diidentifikasi secara pasti.</li>`;
        }
    }
    updateAnalyzeButtonState(); 
}

// --- Inisialisasi Saat Halaman Dimuat ---
document.addEventListener('DOMContentLoaded', loadModel);
