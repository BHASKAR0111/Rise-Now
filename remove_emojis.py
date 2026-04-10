import os
import re

emoji_pattern = re.compile(
    "["
    u"\u2600-\u2B55"
    u"\U0001f300-\U0001f64f"
    u"\U0001f680-\U0001f6ff"
    u"\U0001f1e0-\U0001f1ff"
    u"\U0001f900-\U0001f9ff"
    "]+", flags=re.UNICODE)

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will keep the Risel star '✦' because it's not a color emoji, it's a sleek symbol.
    # The regex above usually targets pictographs and emoticons. Let's check it.
    
    new_content = emoji_pattern.sub('', content)
    
    # Since we might have lingering empty divs like <div class="card-emoji"></div>
    # let's just leave them, CSS flexbox will just collapse them or they won't look bad without the emoji.
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)
