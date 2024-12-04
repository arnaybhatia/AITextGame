import { MistralCore } from "@mistralai/mistralai/core.js";

const mistral = new MistralCore({
    apiKey: process.env["MISTRAL_API_KEY"] ?? "",
});

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

let conversationHistory = [];

function appendMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-3 rounded-lg ${isUser ? 'bg-blue-600 ml-auto' : 'bg-gray-700'} max-w-[80%]`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage(message) {
    if (!message.trim()) return;
    
    // Add user message to UI and history
    appendMessage(message, true);
    conversationHistory.push({ role: "user", content: message });

    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: conversationHistory }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const aiResponse = data.content;
        
        // Add AI response to UI and history
        appendMessage(aiResponse, false);
        conversationHistory.push({ role: "assistant", content: aiResponse });
    } catch (error) {
        console.error('Error:', error);
        appendMessage('Sorry, there was an error processing your message.', false);
    }
}

sendButton.addEventListener('click', () => {
    const message = userInput.value;
    userInput.value = '';
    sendMessage(message);
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = userInput.value;
        userInput.value = '';
        sendMessage(message);
    }
});

// Initialize with welcome message
appendMessage("Welcome to Faustus. How can I assist you today?", false);