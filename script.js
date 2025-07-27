let classifier; 
let imgElement; 

const imageUpload = document.getElementById('imageUpload');
const analyzeButton = document.getElementById('analyzeButton');
const imagePreview = document.getElementById('imagePreview');
const statusMessage = document.getElementById('statusMessage');
const outputList = document.getElementById('outputList');

// --- Inisialisasi Model AI ---
// Kita akan memuat model MobileNet (pre-trained image classification)
// Model ini relatif ringan dan bagus untuk demo di browser.
statusMessage.textContent = 'Memuat model AI (MobileNet)...';
classifier = ml5.imageClassifier('MobileNet', modelReady);

function modelReady() {
    statusMessage.textContent = 'Model AI siap! Silakan unggah gambar.';
    console.log('Model MobileNet siap!');
    // Tombol analisis akan diaktifkan setelah ada gambar yang diunggah
}

// --- Handler Unggah Gambar ---
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Dapatkan file yang diunggah

    if (file) {
        // Buat objek FileReader untuk membaca file
        const reader = new FileReader();

        reader.onload = (e) => {
            // Tampilkan pratinjau gambar
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block'; // Tampilkan elemen gambar

            // Aktifkan tombol analisis karena sudah ada gambar
            analyzeButton.disabled = false;
            statusMessage.textContent = 'Gambar siap dianalisis.';
            outputList.innerHTML = ''; // Bersihkan hasil sebelumnya
        };

        // Baca file sebagai URL data (Base64)
        reader.readAsDataURL(file);
    } else {
        // Jika tidak ada file, sembunyikan pratinjau dan nonaktifkan tombol
        imagePreview.style.display = 'none';
        imagePreview.src = '#'; // Reset src
        analyzeButton.disabled = true;
        statusMessage.textContent = 'Silakan unggah gambar.';
        outputList.innerHTML = '';
    }
});

// --- Handler Tombol Analisis ---
analyzeButton.addEventListener('click', () => {
    if (imagePreview.src && imagePreview.src !== '#') {
        statusMessage.textContent = 'Menganalisis gambar... Mohon tunggu.';
        outputList.innerHTML = ''; // Bersihkan hasil sebelumnya

        // Menganalisis gambar yang sudah dimuat ke imagePreview
        // Pastikan model sudah siap sebelum melakukan klasifikasi
        if (classifier) {
            classifier.classify(imagePreview, gotResult);
        } else {
            statusMessage.textContent = 'Model AI belum siap. Coba lagi sebentar.';
        }
    } else {
        statusMessage.textContent = 'Tidak ada gambar untuk dianalisis. Silakan unggah gambar terlebih dahulu.';
    }
});

// --- Fungsi Callback Setelah Analisis Selesai ---
function gotResult(error, results) {
    if (error) {
        console.error(error);
        statusMessage.textContent = 'Terjadi kesalahan saat klasifikasi gambar.';
        outputList.innerHTML = `<li style="color: red;">Error: ${error.message}</li>`;
    } else {
        console.log('Hasil Klasifikasi:', results);
        statusMessage.textContent = 'Analisis Selesai!';
        outputList.innerHTML = ''; // Bersihkan daftar hasil

        if (results && results.length > 0) {
            // Tampilkan 5 hasil teratas (atau kurang jika hasilnya tidak sampai 5)
            const topResults = results.slice(0, Math.min(results.length, 5));

            topResults.forEach(result => {
                const li = document.createElement('li');
                // Format label: hapus angka di awal (e.g., "001 cat" -> "cat")
                const formattedLabel = result.label.replace(/^\d+\s/, '');
                const confidencePercentage = (result.confidence * 100).toFixed(2);
                li.innerHTML = `<span>${formattedLabel}</span> <span>${confidencePercentage}%</span>`;
                outputList.appendChild(li);
            });
        } else {
            outputList.innerHTML = `<li>Tidak ada hasil yang dapat diidentifikasi.</li>`;
        }
    }
    analyzeButton.disabled = false; // Aktifkan kembali tombol setelah analisis
});
