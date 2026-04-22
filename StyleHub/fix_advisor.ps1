$content = Get-Content advisor.html -Raw -Encoding UTF8
$scriptStart = $content.IndexOf('<script>')
$scriptEnd = $content.LastIndexOf('</script>') + 9
$before = $content.Substring(0, $scriptStart)
$after = $content.Substring($scriptEnd)

$newScript = @'
<script>
    const input = document.getElementById('chat-input');
    const messagesEl = document.getElementById('chat-messages');

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    function sendQuick(btn) {
      input.value = btn.textContent;
      document.getElementById('quick-chips').style.display = 'none';
      sendMessage();
    }

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      appendMsg('user', text);
      input.value = '';
      input.style.height = 'auto';
      showTyping();
      setTimeout(() => {
        removeTyping();
        const reply = getReply(text);
        appendMsg('bot', reply, text, reply);
      }, 900 + Math.random() * 600);
    }

    function getReply(q) {
      const query = q.toLowerCase();
      if (query.includes('wedding')) {
        if (query.includes('guest')) return 'As a wedding guest, avoid white, ivory, or cream. Great choices: dusty rose, sage green, navy, burgundy, or gold. For Indian weddings, opt for lehengas, sarees, or sherwanis. For Western weddings, a midi dress or tailored suit works perfectly.';
        return 'For a wedding, choose elegant attire. Women: sarees, lehengas, anarkalis, or formal gowns. Men: sherwanis for Indian weddings, suits or tuxedos for Western. Avoid casual wear and jeans.';
      }
      if (query.includes('interview') || query.includes('job')) return 'For a job interview, dress one level above the dress code. Corporate roles: formal suit in navy, charcoal, or black. Creative roles: smart casual - tailored trousers and a neat shirt or blouse.';
      if (query.includes('dark skin') || query.includes('brown skin')) return 'For dark skin tones - Best colors: Emerald green, royal blue, deep purple, burgundy, terracotta, mustard, coral, fuchsia, cobalt, white and ivory.';
      if (query.includes('fair skin') || query.includes('light skin')) return 'For fair skin tones - Best colors: Navy, cobalt blue, forest green, burgundy, plum, coral, peach, blush pink, lavender, mint.';
      if (query.includes('quiet luxury') || query.includes('old money')) return 'Quiet Luxury is about understated elegance. Key pieces: cashmere sweaters, tailored trousers, crisp white shirts, loafers, minimal leather bags. Color palette: beige, camel, ivory, cream, navy, grey - no loud prints or logos.';
      if (query.includes('saree') || query.includes('sari')) return 'Saree styling tips - Draping: The Nivi drape is most common and flattering. Blouse: Well-fitted is key, deep back and off-shoulder styles are trending. Accessories: Keep jewelry minimal if the saree is heavy. Footwear: Block heels are comfortable for long events.';
      if (query.includes('summer')) return 'Best summer outfit ideas - Fabrics: Linen, cotton, chambray - breathable and sweat-resistant. Colors: White, sky blue, coral, mint, yellow, pastels. For women: Flowy midi dresses, linen co-ord sets. For men: Linen shirts, cotton polos, chino shorts.';
      if (query.includes('color') || query.includes('colour') || query.includes('combination')) return 'Top color combination rules - Complementary: Blue + Orange, Purple + Yellow - bold and high contrast. Analogous: Blue + Purple + Pink - harmonious. Rule of Three: Max 3 colors per outfit. One dominant (60%), one secondary (30%), one accent (10%).';
      if (query.includes('casual')) return 'Casual outfit formula - Top: Plain tee, oversized shirt, or casual blouse. Bottom: Well-fitted jeans, chinos, or casual trousers. Shoes: White sneakers, loafers, or clean casual shoes. Elevate it: Add a denim jacket, a minimal watch, or a crossbody bag.';
      if (query.includes('formal') || query.includes('office') || query.includes('work')) return 'Formal/office dressing guide - Men: Tailored suit (navy or charcoal), crisp white shirt, leather shoes. Women: Tailored blazer + trousers, pencil skirt + blouse, or a structured midi dress. Colors: Navy, charcoal, black, white, grey, burgundy.';
      if (query.includes('denim') || query.includes('jeans')) return 'Denim styling guide - Slim fit: versatile, works for casual and smart casual. Wide-leg: trendy, pair with fitted top. Straight leg: the most universally flattering. Dark wash: more formal. Light wash: casual, summer-friendly.';
      if (query.includes('trend') || query.includes('2025') || query.includes('2026')) return 'Top fashion trends (2025-2026): 1. Quiet Luxury - Understated, logo-free basics. 2. Dopamine Dressing - Bold, saturated colors. 3. Eco Chic - Sustainable fabrics, earthy tones. 4. Gorpcore - Outdoor utility meets street style. 5. Wide-leg everything.';
      if (query.includes('ethnic') || query.includes('kurta') || query.includes('lehenga') || query.includes('indian')) return 'Indian ethnic wear guide - Women: Saree, Lehenga, Anarkali, Kurta + palazzo. Men: Sherwani, Kurta + churidar, Nehru jacket. Festive colors: Red, gold, emerald, royal blue, maroon, mustard.';
      if (query.includes('shoe') || query.includes('footwear') || query.includes('sneaker') || query.includes('heel')) return 'Footwear guide - White sneakers: the most versatile shoe ever. Loafers: smart casual, great for office and casual. Block heels: comfortable and stylish for events. Ankle boots: elevate any casual outfit. Nude/beige shoes elongate legs and go with everything.';
      const defaults = [
        'For "' + q + '", the key principles are: 1) Fit over brand - always. 2) Build on neutrals, accent with color. 3) Dress for the occasion but make it yours.',
        'Fashion is about expressing yourself confidently. Start with fit - well-fitted clothes in any style look better than expensive ill-fitting ones. What occasion are you dressing for?',
        'Build a capsule wardrobe of neutral basics (white shirt, dark jeans, black trousers, navy blazer) and add personality through accessories. What occasion are you dressing for?'
      ];
      return defaults[Math.floor(Math.random() * defaults.length)];
    }

    const PEXELS_KEY = 'YOUR_PEXELS_KEY_HERE';

    async function fetchImages(query) {
      try {
        const res = await fetch('https://api.pexels.com/v1/search?query=' + encodeURIComponent(query) + '&per_page=3&orientation=portrait', {
          headers: { 'Authorization': PEXELS_KEY }
        });
        const data = await res.json();
        return (data.photos || []).map(p => p.src.medium);
      } catch { return []; }
    }

    function extractImageQuery(userText, aiReply) {
      const t = (userText + ' ' + (aiReply || '')).toLowerCase();
      if (t.includes('wedding')) {
        if (t.includes('sherwani') || t.includes('groom')) return 'indian groom sherwani wedding';
        if (t.includes('lehenga') || t.includes('bride')) return 'bridal lehenga indian wedding';
        if (t.includes('guest')) return 'wedding guest elegant dress';
        return 'indian wedding outfit';
      }
      if (t.includes('interview')) return 'professional job interview outfit suit';
      if (t.includes('office') || t.includes('formal')) return 'formal office outfit blazer';
      if (t.includes('saree') || t.includes('sari')) return 'silk saree draping elegant';
      if (t.includes('lehenga')) return 'lehenga choli festive fashion';
      if (t.includes('kurta')) return 'kurta ethnic wear fashion';
      if (t.includes('casual')) return 'casual street style outfit';
      if (t.includes('summer')) return 'summer linen cotton outfit';
      if (t.includes('denim') || t.includes('jeans')) return 'denim jeans street fashion';
      if (t.includes('sneaker')) return 'sneakers street fashion shoes';
      if (t.includes('heel')) return 'high heels elegant women shoes';
      if (t.includes('quiet luxury') || t.includes('old money')) return 'quiet luxury minimal fashion beige';
      if (t.includes('party')) return 'party night out fashion outfit';
      if (t.includes('ethnic') || t.includes('indian')) return 'indian ethnic festive fashion';
      const stopWords = ['what','should','i','wear','to','a','the','for','how','best','outfit','style','fashion'];
      const words = userText.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.includes(w));
      return (words.slice(0, 3).join(' ') || 'fashion outfit') + ' style';
    }

    async function appendMsg(role, text, userText, aiReply) {
      userText = userText || '';
      aiReply = aiReply || '';
      const now = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      const div = document.createElement('div');
      div.className = 'msg ' + role;
      let imagesHtml = '';
      if (role === 'bot' && userText) {
        const query = extractImageQuery(userText, aiReply);
        const imgs = await fetchImages(query);
        if (imgs.length) {
          imagesHtml = '<div class="msg-images">' + imgs.map(src => '<img src="' + src + '" alt="fashion" loading="lazy"/>').join('') + '</div>';
        }
      }
      div.innerHTML = '<div class="msg-avatar">' + (role === 'bot' ? '&#10024;' : '&#128100;') + '</div><div><div class="msg-bubble">' + text + imagesHtml + '</div><div class="msg-time">' + now + '</div></div>';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'msg bot';
      div.id = 'typing-msg';
      div.innerHTML = '<div class="msg-avatar">&#10024;</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function removeTyping() {
      const t = document.getElementById('typing-msg');
      if (t) t.remove();
    }

    window.addEventListener('load', () => {
      const user = JSON.parse(localStorage.getItem('sh_user') || 'null');
      const name = user ? user.name : 'there';
      setTimeout(() => {
        appendMsg('bot', 'Hi ' + name + '! I am your AI Style Advisor. Ask me anything about fashion - outfits, colors, occasions, trends, and more!');
      }, 400);
    });
</script>
'@

$result = $before + $newScript + $after
Set-Content advisor.html -Value $result -Encoding UTF8
Write-Host "Done"
