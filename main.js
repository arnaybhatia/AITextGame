/**
 * Main chat interface for Faustus - An AI-powered chat application
 * This file handles the frontend logic, chat history management, and API communication
 */

// DOM element references
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

/**
 * Core state management
 * conversationHistory: Current chat messages
 * isLoading: Tracks API request status
 * chatHistories: All saved conversations
 * currentChatIndex: Active chat session index
 */
let conversationHistory = [];
let isLoading = false;
let chatHistories = [[]]; // Array of conversation histories
let currentChatIndex = 0;

/**
 * Loads saved chat histories from localStorage
 * Restores previous conversations and UI state
 */
function loadChatHistories() {
    const saved = localStorage.getItem('chatHistories');
    if (saved) {
        chatHistories = JSON.parse(saved);
        currentChatIndex = parseInt(localStorage.getItem('currentChatIndex') || '0');
        updateChatHistoryUI();
        switchToChat(currentChatIndex);
    }
}

/**
 * Persists chat histories to localStorage
 * Saves both chat content and current chat index
 */
function saveChatHistories() {
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
    localStorage.setItem('currentChatIndex', currentChatIndex.toString());
    updateChatHistoryUI();
}

/**
 * Updates the sidebar with chat history
 * Displays chat previews and handles selection
 */
function updateChatHistoryUI() {
    const historyContainer = document.getElementById('chat-history');
    historyContainer.innerHTML = '';
    
    chatHistories.forEach((history, index) => {
        const title = history[0]?.content || 'New Chat';
        const chatButton = document.createElement('button');
        chatButton.className = `w-full text-left px-4 py-2 rounded-lg ${
            index === currentChatIndex ? 'bg-blue-600' : 'bg-gray-700'
        } hover:bg-blue-700 truncate`;
        chatButton.textContent = `Chat ${index + 1}: ${title.substring(0, 30)}...`;
        chatButton.onclick = () => switchToChat(index);
        historyContainer.appendChild(chatButton);
    });
}

/**
 * Adds a new message to the chat UI
 * @param {string} content - Message text
 * @param {boolean} isUser - True if message is from user, false for AI
 */
function appendMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-3 rounded-lg ${isUser ? 'bg-blue-600 ml-auto' : 'bg-gray-700'} max-w-[80%]`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Manages loading state and visual feedback
 * @param {boolean} loading - Current loading state
 */
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

function clearChat() {
    chatMessages.innerHTML = '';
    conversationHistory = [];
    chatHistories[currentChatIndex] = [];
    appendMessage("Welcome to Faustus. How can I assist you today?", false);
    saveChatHistories();
}

function switchToChat(index) {
    currentChatIndex = index;
    conversationHistory = chatHistories[index];
    chatMessages.innerHTML = '';
    
    // Replay the conversation
    conversationHistory.forEach(msg => {
        appendMessage(msg.content, msg.role === "user");
    });
    updateChatHistoryUI();
}

async function sendMessage(message) {
    if (!message.trim() || isLoading) return;
    
    appendMessage(message, true);
    conversationHistory.push({ role: "user", content: message });
    chatHistories[currentChatIndex] = [...conversationHistory];

    try {
        setLoading(true);
        console.log("Sending request with:", { messages: conversationHistory });
        
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: conversationHistory }),
        });

        const data = await response.json();
        console.log("Received response:", data);
        setLoading(false);

        if (!response.ok || !data.content) {
            throw new Error(data.error || 'Invalid response from server');
        }

        const aiResponse = data.content;
        appendMessage(aiResponse, false);
        conversationHistory.push({ role: "assistant", content: aiResponse });
        chatHistories[currentChatIndex] = [...conversationHistory];
        saveChatHistories();
    } catch (error) {
        console.error('Error details:', error);
        setLoading(false);
        appendMessage('Sorry, there was an error: ' + error.message, false);
    }
}

sendButton.addEventListener('click', () => {
    if (isLoading) return;
    const message = userInput.value;
    userInput.value = '';
    sendMessage(message);
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isLoading) {
        const message = userInput.value;
        userInput.value = '';
        sendMessage(message);
    }
});

// Initialize with welcome message
appendMessage("Welcome to Faustus. How can I assist you today?", false);

function createNewChat() {
    chatHistories.push([]);
    currentChatIndex = chatHistories.length - 1;
    clearChat();
    saveChatHistories();
}

document.getElementById('new-chat').addEventListener('click', createNewChat);

// Initialize
loadChatHistories();
if (chatHistories[currentChatIndex].length === 0) {
    appendMessage("Welcome to Faustus. How can I assist you today?", false);
}

// Add delete chat functionality
function deleteCurrentChat() {
    if (chatHistories.length > 1) {
        chatHistories.splice(currentChatIndex, 1);
        currentChatIndex = Math.max(0, currentChatIndex - 1);
        saveChatHistories();
        switchToChat(currentChatIndex);
    }
}

document.getElementById('delete-chat').addEventListener('click', deleteCurrentChat);