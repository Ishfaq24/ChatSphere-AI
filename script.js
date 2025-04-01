
    // DOM Elements
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message');
    const typingIndicator = document.getElementById('typing-indicator');
    const voiceBtn = document.getElementById('voice-btn');
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');

    // Initialize Speech Recognition
    let recognition;
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            sendMessage();
        };

        voiceBtn.onclick = () => {
            recognition.start();
            voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        };

        recognition.onend = () => {
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
    } else {
        voiceBtn.disabled = true;
        console.warn('Speech recognition not supported');
    }

    // Event Listeners
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Navigation Handling
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const text = this.textContent.trim();
            if(text === 'Settings') {
                document.querySelector('.chat-container').style.display = 'none';
                document.querySelector('.settings-panel').style.display = 'block';
            } else {
                document.querySelector('.chat-container').style.display = 'flex';
                document.querySelector('.settings-panel').style.display = 'none';
            }
        });
    });

    // Chat Functions
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        messageInput.value = '';
        showTypingIndicator();

        try {
            const response = await getAIResponse(message);
            addMessage(response, 'bot');
        } catch (error) {
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            console.error('Error:', error);
        }
        hideTypingIndicator();
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            ${text}
            <div class="timestamp">${new Date().toLocaleTimeString()}</div>
        `;
        chatBox.insertBefore(messageDiv, typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    // AI Integration
    async function getAIResponse(userInput) {
        const API_KEY = 'sk-your-openai-api-key-here';
        const response = await fetch('https://api.openai.com/v1/chat/completions/dontHaveone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userInput }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
