const apiKey = '2feb1225b6004eaa824f5dda2508aa52';
const chatContainer = document.getElementById('chat-container');
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const backToHubButton = document.getElementById('back-to-hub');

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

backToHubButton.addEventListener('click', () => {
    window.location.href = 'hub.html'; // Change this to the actual hub URL
});

function sendMessage() {
    const message = userInput.value;
    if (!message) return;

    appendMessage('You', message);
    userInput.value = '';

    fetch('https://api.example.com/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        console.log('API Response:', data); // Debug log
        appendMessage('AI', data.reply);
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('AI', 'Sorry, something went wrong.');
    });
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
