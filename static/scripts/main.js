// Chat history management
let conversationHistory = [];
let chatHistories = [[]];
let currentChatIndex = 0;
let isLoading = false;

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat');
const deleteChatButton = document.getElementById('delete-chat');
const chatHistoryContainer = document.getElementById('chat-history');

// Loading state management
function setLoading(loading) {
    isLoading = loading;
    sendButton.disabled = loading;
    userInput.disabled = loading;
    sendButton.textContent = loading ? 'Sending...' : 'Send';

    if (loading) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-message';
        loadingDiv.className = 'p-3 rounded-lg bg-gray-700 max-w-[80%] animate-pulse';
        loadingDiv.textContent = 'Thinking...';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
        const loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) loadingDiv.remove();
    }
}

// Chat management functions
function clearChat() {
    chatMessages.innerHTML = '';
    conversationHistory = [];
    appendMessage("Welcome to Faustus. How can I assist you today?", false);
}

function switchToChat(index) {
    currentChatIndex = index;
    conversationHistory = [...(chatHistories[index] || [])];
    chatMessages.innerHTML = '';
    
    if (conversationHistory.length === 0) {
        appendMessage("Welcome to Faustus. How can I assist you today?", false);
    } else {
        conversationHistory.forEach(msg => {
            appendMessage(msg.content, msg.role === "user");
        });
    }
    
    // Update UI to show active chat
    updateChatHistoryUI();
}

function loadChatHistories() {
    const saved = localStorage.getItem('chatHistories');
    if (saved) {
        chatHistories = JSON.parse(saved);
        currentChatIndex = parseInt(localStorage.getItem('currentChatIndex') || '0');
        switchToChat(currentChatIndex);
    }
}

function saveChatHistories() {
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
    localStorage.setItem('currentChatIndex', currentChatIndex.toString());
    updateChatHistoryUI();
}

function updateChatHistoryUI() {
    const historyContainer = document.getElementById('chat-history');
    historyContainer.innerHTML = '';
    
    chatHistories.forEach((history, index) => {
        const preview = history[0]?.content || 'New Chat';
        const button = document.createElement('button');
        button.className = `w-full text-left px-4 py-2 rounded-lg ${
            index === currentChatIndex ? 'bg-blue-600' : 'bg-gray-700'
        } hover:bg-blue-700 truncate`;
        button.textContent = `Chat ${index + 1}: ${preview.substring(0, 30)}...`;
        button.onclick = () => switchToChat(index);
        historyContainer.appendChild(button);
    });
}

// Message handling
async function sendMessage(message) {
    if (!message.trim() || isLoading) return;
    
    appendMessage(message, true);
    conversationHistory.push({ role: "user", content: message });
    
    try {
        setLoading(true);
        let aiMessageDiv = null;
        let fullResponse = '';
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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
                    if (!aiMessageDiv) {
                        aiMessageDiv = appendMessage(fullResponse, false);
                    } else {
                        aiMessageDiv.innerHTML = marked.parse(fullResponse);
                    }
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }
        }

        // Save the complete conversation
        conversationHistory.push({ role: "assistant", content: fullResponse });
        chatHistories[currentChatIndex] = [...conversationHistory];
        saveChatHistories();
        updateChatHistoryUI();

    } catch (error) {
        console.error('Error:', error);
        const errorDiv = appendMessage('Sorry, there was an error: ' + error.message, false);
    } finally {
        setLoading(false);
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

// Initialize (replace existing initialization code)
function initialize() {
    // Clear any existing messages
    chatMessages.innerHTML = '';
    
    // Load saved chats or create new one
    const saved = localStorage.getItem('chatHistories');
    if (saved) {
        chatHistories = JSON.parse(saved);
        currentChatIndex = parseInt(localStorage.getItem('currentChatIndex') || '0');
    } else {
        chatHistories = [[]];
        currentChatIndex = 0;
    }
    
    // Show initial message only if it's a new chat
    if (chatHistories[currentChatIndex].length === 0) {
        appendMessage("Welcome to Faustus. How can I assist you today?", false);
    } else {
        switchToChat(currentChatIndex);
    }
    
    updateChatHistoryUI();
}

// Replace multiple initialization calls with single initialize()
initialize();
