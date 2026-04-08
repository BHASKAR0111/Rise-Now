import re

def process_file():
    with open('resources.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to match:
    # <a href="URL" ...>
    #   <div class="card-top">
    #     <div class="card-emoji">EMOJI</div>
    #     <span ...>TYPE</span>
    #   </div>
    #   <div class="card-title">TITLE</div>
    
    # We will just add the bookmark-btn to <div class="card-top">
    # Because we need the URL and TITLE for the onclick event, we parse card by card.
    
    # It's better to add the bookmark button right after the <div class="card-top"> opening tag
    # But wait, extracting URL and Title requires matching the whole block.
    
    cards = re.split(r'(<a.*?class="resource-card".*?>)', content)
    
    new_content = cards[0]
    
    for i in range(1, len(cards), 2):
        a_tag = cards[i]
        body = cards[i+1]
        
        # Extract URL
        url_match = re.search(r'href="([^"]+)"', a_tag)
        url = url_match.group(1) if url_match else ""
        
        # Extract Title from body
        title_match = re.search(r'<div class="card-title">(.*?)</div>', body)
        title = title_match.group(1).replace("'", "\\'") if title_match else "Resource"
        
        # Extract Emoji
        emoji_match = re.search(r'<div class="card-emoji">(.*?)</div>', body)
        emoji = emoji_match.group(1) if emoji_match else "📚"
        
        # Build bookmark span
        bookmark_html = f'''
        <button class="bookmark-btn" onclick="event.preventDefault(); toggleBookmark(this, '{url}', '{title}', '{emoji}')" style="position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.1); border:none; border-radius:6px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; transition:all 0.2s; z-index:10;" title="Save Resource">🔖</button>'''
        
        # Insert bookmark_html after <div class="card-top">
        # Also need to make the card relative if it isn't. The CSS for .resource-card probably is relative, but inline style works or we check css.
        
        # Instead of absolute positioning, we can just put it in card-top which is a flex container?
        # If card-top is flex, we can do display:flex; justify-content:space-between;
        
        body = body.replace('<div class="card-top">', '<div class="card-top" style="display:flex; justify-content:space-between; align-items:flex-start; width:100%;">' + bookmark_html, 1)
        
        # The card actually already has:
        # .card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: ... }
        # So it's already flex! Let's just put it near the emoji. Actually, inside card-top there is card-emoji and card-type. 
        # Better: put it next to card-type.
        
        new_content += a_tag + body

    with open('resources.html', 'w', encoding='utf-8') as f:
        f.write(new_content)

process_file()
