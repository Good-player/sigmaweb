const apiKey = '2feb1225b6004eaa824f5dda2508aa52';
const baseURL = 'https://api.aimlapi.com/v1';
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

async function sendMessage() {
    const message = userInput.value;
    if (!message) return;

    appendMessage('You', message);
    userInput.value = '';

    try {
        const response = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 256
            })
        });

        const data = await response.json();
        console.log('API Response:', data);
        appendMessage('Brain damage AI', data.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
        appendMessage('Brain damage AI (real)', 'Sorry, something went wrong.');
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
