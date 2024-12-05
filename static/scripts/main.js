// Chat history management
let currentChatId = null;
let chatHistory = [];

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat');
const deleteChatButton = document.getElementById('delete-chat');
const chatHistoryContainer = document.getElementById('chat-history');

// Message handling
async function sendMessage(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{
                    role: "user",
                    content: message
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('Error:', error);
        return `Sorry, there was an error: ${error.message}`;
    }
}

// UI Updates
function addMessageToUI(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-3 rounded-lg ${isUser ? 'bg-blue-600 ml-auto' : 'bg-gray-700'} max-w-[80%] text-left`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event Listeners
sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (message) {
        addMessageToUI(message, true);
        userInput.value = '';
        
        const response = await sendMessage(message);
        addMessageToUI(response);
    }
});

userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

// Initialize with a welcome message
addMessageToUI('Welcome to Faustus. How can I assist you today?');
