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
    if (!message.trim() || isLoading) return;
    
    appendMessage(message, true);
    conversationHistory.push({ role: "user", content: message });
    chatHistories[currentChatIndex] = [...conversationHistory];

    try {
        setLoading(true);
        const messageDiv = appendMessage('', false);
        let fullResponse = '';
        
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: conversationHistory }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    fullResponse += data;
                    messageDiv.innerHTML = marked.parse(fullResponse);
                }
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        conversationHistory.push({ role: "assistant", content: fullResponse });
        chatHistories[currentChatIndex] = [...conversationHistory];
        saveChatHistories();
        setLoading(false);
    } catch (error) {
        console.error('Error:', error);
        setLoading(false);
        appendMessage('Sorry, there was an error: ' + error.message, false);
    }
}

// UI Updates
function appendMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-3 rounded-lg ${isUser ? 'bg-blue-600 ml-auto' : 'bg-gray-700'} max-w-[80%]`;
    
    // Render markdown for AI responses, plain text for user
    if (isUser) {
        messageDiv.textContent = content;
    } else {
        const rendered = marked.parse(content);
        messageDiv.innerHTML = rendered;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// Event Listeners
sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (message) {
        userInput.value = '';
        await sendMessage(message);
    }
});

userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

newChatButton.addEventListener('click', createNewChat);
deleteChatButton.addEventListener('click', deleteCurrentChat);

function createNewChat() {
    chatHistories.push([]);
    currentChatIndex = chatHistories.length - 1;
    clearChat();
    saveChatHistories();
}

function deleteCurrentChat() {
    if (chatHistories.length > 1) {
        chatHistories.splice(currentChatIndex, 1);
        currentChatIndex = Math.max(0, currentChatIndex - 1);
        saveChatHistories();
        switchToChat(currentChatIndex);
    }
}

// Initialize
loadChatHistories();
if (chatHistories[currentChatIndex].length === 0) {
    appendMessage("Welcome to Faustus. How can I assist you today?", false);
}

// Initialize with a welcome message
appendMessage("Welcome to Faustus. How can I assist you today?", false);
