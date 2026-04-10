import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

script_tag = '<script src="risel_widget.js"></script>'

for file in html_files:
    if file == 'rize.html':
        continue # Don't need the float on the actual risel AI page
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    if script_tag not in content:
        # Insert before </body>
        content = content.replace('</body>', f'{script_tag}\n</body>')
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
