import glob
import re

LOGO_HTML = '''<a href="index.html" class="nav-logo">
  <img src="images/risel_logo.png" alt="Risel" style="width:36px;height:36px;border-radius:9px;object-fit:contain;background:#000;"/>
  <div class="logo-text" style="color:#00C2FF !important; background:transparent !important; font-weight:800; font-size:22px;">Risel</div>
</a>'''

html_files = glob.glob('*.html') + ['style.css']

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    if filepath.endswith('.html'):
        # 1. Standardize Header Logo
        content = re.sub(r'<a[^>]*class="nav-logo"[^>]*>.*?</a>', LOGO_HTML, content, flags=re.DOTALL)

    # 2. Fix cyan rectangle texts
    # Case A: background:var(--blue);color:var(--blue);
    content = re.sub(
        r'background:\s*var\(--blue\)\s*;\s*color:\s*var\(--blue\)\s*;?',
        r'background: transparent !important; color: var(--blue) !important;',
        content
    )

    # Case B: background:var(--blue) !important;color:var(--blue) !important;
    content = re.sub(
        r'background:\s*var\(--blue\)\s*!important\s*;\s*color:\s*var\(--blue\)\s*!important\s*;?',
        r'background: transparent !important; color: var(--blue) !important;',
        content
    )

    # Case C: linear-gradient background + text color + background-clip
    # Because background-clip without -webkit- on Chrome renders a box with blue text (mix up)
    content = re.sub(
        r'background:\s*linear-gradient[^\;]+\;\s*color:\s*var\(--blue\)\s*\;\s*background-clip:\s*text\s*\;?',
        r'background: transparent !important; color: var(--blue) !important;',
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")
