import os
import re

link_tag = '<link rel="stylesheet" href="footer.css"/>'

def add_css_link(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if link_tag in content:
        print(f'Already has footer.css: {file_path}')
        return

    # find </head> and insert right before it
    if '</head>' in content:
        new_content = content.replace('</head>', f'  {link_tag}\n</head>')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Added footer.css to {file_path}')
    else:
        print(f'No </head> found in {file_path}')

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
for file in html_files:
    add_css_link(file)
