const inputField = document.createElement('input');
inputField.placeholder = 'Ketik pesan Anda...';
document.body.appendChild(inputField);

const sendButton = document.createElement('button');
sendButton.textContent = 'Kirim';
document.body.appendChild(sendButton);

const chatOutput = document.createElement('div');
chatOutput.id = 'chatOutput';
document.body.appendChild(chatOutput);

sendButton.addEventListener('click', () => {
    const userMessage = inputField.value.toLowerCase();
    let botResponse = "Maaf, saya tidak mengerti.";

    if (userMessage.includes("halo") || userMessage.includes("hai")) {
        botResponse = "Halo! Ada yang bisa saya bantu?";
    } else if (userMessage.includes("apa kabar")) {
        botResponse = "Saya baik, terima kasih! Anda bagaimana?";
    } else if (userMessage.includes("siapa kamu")) {
        botResponse = "Saya adalah AI sederhana yang dibuat untuk berinteraksi.";
    } else if (userMessage.includes("terima kasih")) {
        botResponse = "Sama-sama!";
    }

    chatOutput.innerHTML += `<p><strong>Anda:</strong> ${userMessage}</p>`;
    chatOutput.innerHTML += `<p><strong>Bot:</strong> ${botResponse}</p>`;
    inputField.value = ''; // Kosongkan input
    chatOutput.scrollTop = chatOutput.scrollHeight; // Gulir ke bawah
});
