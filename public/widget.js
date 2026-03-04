(function () {
    // 1. Locate the script tag to extract client-id
    const scriptTag = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s => s.src.includes('widget.js'));
    const clientId = scriptTag ? scriptTag.getAttribute('data-client-id') : null;
    const dataApiUrl = scriptTag ? scriptTag.getAttribute('data-api-url') : null;

    if (!clientId) {
        console.error('BeeBot: missing data-client-id on script tag');
        return;
    }

    // Configuration (In production, fetch from backend using clientId)
    // For demo/simplicity we read from attributes:
    const config = {
        botName: "Support Bot",
        primaryColor: "#45f3ff",
        apiUrl: dataApiUrl || "http://localhost:5000/api/chat"
    };

    // 2. Create wrapper element
    const container = document.createElement('div');
    container.id = 'beebot-widget-container';
    document.body.appendChild(container);

    // 3. Attach Shadow DOM
    const shadow = container.attachShadow({ mode: 'open' });

    // 4. Inject encapsulated styles
    const styles = document.createElement('style');
    styles.textContent = \`
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    
    #beebot-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: \${config.primaryColor};
      color: #000;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      transition: transform 0.2s ease;
    }
    #beebot-toggle:hover {
      transform: scale(1.05);
    }
    
    #beebot-window {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 350px;
      height: 500px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483647;
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    #beebot-window.open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    
    .beebot-header {
      background: \${config.primaryColor};
      color: #fff;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
    }
    
    .beebot-close {
      background: transparent;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;
    }
    
    .beebot-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9f9f9;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .msg {
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 85%;
      font-size: 14px;
      line-height: 1.4;
      animation: msgFadeIn 0.3s ease forwards;
    }
    
    @keyframes msgFadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .msg.bot {
      align-self: flex-start;
      background: #fff;
      border: 1px solid #eee;
      color: #333;
      border-bottom-left-radius: 4px;
    }
    
    .msg.user {
      align-self: flex-end;
      background: \${config.primaryColor};
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    
    .beebot-input-area {
      padding: 12px;
      background: #fff;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
    }
    
    .beebot-input {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    
    .beebot-input:focus {
      border-color: \${config.primaryColor};
    }
    
    .beebot-send {
      background: \${config.primaryColor};
      color: #fff;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .typing-indicator {
      display: none;
      align-self: flex-start;
      background: #fff;
      border: 1px solid #eee;
      padding: 12px 16px;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      gap: 4px;
    }
    .typing-indicator.active { display: flex; }
    .typing-dot {
      width: 6px; height: 6px; background: #ccc; border-radius: 50%;
      animation: typings 1.4s infinite ease-in-out both;
    }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typings {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  \`;

  // 5. Build Widget HTML
  const iconSVG = \`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>\`;
  const sendSVG = \`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>\`;

  const widgetHTML = \`
    <button id="beebot-toggle">\${iconSVG}</button>
    <div id="beebot-window">
      <div class="beebot-header">
        <span>\${config.botName}</span>
        <button class="beebot-close">&times;</button>
      </div>
      <div id="beebot-messages" class="beebot-messages">
        <div class="msg bot">Hi! How can I help you today?</div>
        <div id="beebot-typing" class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
      <form id="beebot-form" class="beebot-input-area">
        <input type="text" id="beebot-input" class="beebot-input" placeholder="Type a message..." autocomplete="off">
        <button type="submit" class="beebot-send">\${sendSVG}</button>
      </form>
    </div>
  \`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = widgetHTML;
  
  shadow.appendChild(styles);
  shadow.appendChild(wrapper);

  // 6. Logic
  const toggleBtn = shadow.getElementById('beebot-toggle');
  const windowEl = shadow.getElementById('beebot-window');
  const closeBtn = shadow.querySelector('.beebot-close');
  const form = shadow.getElementById('beebot-form');
  const input = shadow.getElementById('beebot-input');
  const messagesBox = shadow.getElementById('beebot-messages');
  const typingIndicator = shadow.getElementById('beebot-typing');

  let isOpen = false;

  const toggleWidget = () => {
    isOpen = !isOpen;
    if (isOpen) {
      windowEl.classList.add('open');
      input.focus();
    } else {
      windowEl.classList.remove('open');
    }
  };

  toggleBtn.addEventListener('click', toggleWidget);
  closeBtn.addEventListener('click', toggleWidget);

  const appendMessage = (text, sender) => {
    const el = document.createElement('div');
    el.className = \`msg \${sender}\`;
    el.textContent = text;
    messagesBox.insertBefore(el, typingIndicator);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    appendMessage(query, 'user');
    input.value = '';
    
    typingIndicator.classList.add('active');
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
      const res = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, clientId })
      });
      
      const data = await res.json();
      typingIndicator.classList.remove('active');
      appendMessage(data.response || "Sorry, I couldn't reach the server.", 'bot');
    } catch (err) {
      typingIndicator.classList.remove('active');
      appendMessage("Network error. Please try again later.", 'bot');
    }
  });

})();
 