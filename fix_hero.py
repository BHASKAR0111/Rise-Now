import os

for f in os.listdir('.'):
    if f.endswith('.html') and f != 'index.html':
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        changed = False
        
        # Replace only if not already styled
        if '<div class="hero">' in content:
            content = content.replace('<div class="hero">', '<div class="hero" style="min-height: auto !important; padding-top: 140px !important; padding-bottom: 40px !important;">')
            changed = True
            
        if '<section class="hero">' in content:
            content = content.replace('<section class="hero">', '<section class="hero" style="min-height: auto !important; padding-top: 140px !important; padding-bottom: 40px !important;">')
            changed = True

        if changed:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            print("Fixed hero gap on", f)
