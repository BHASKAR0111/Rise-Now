import os
import glob
import re

html_files = glob.glob('*.html')

# Base meta tags
meta_tags = """  <meta name="description" content="RiseNow — Helping Strugglers Stand Again. A fully responsive career guidance & motivation platform built for job seekers, career switchers, and people starting over."/>
  <meta property="og:title" content="RiseNow — Stand Again"/>
  <meta property="og:description" content="Free career paths, daily motivation, real success stories and powerful tools — all in one platform."/>
  <meta property="og:type" content="website"/>
"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add meta tags if not present
    if 'og:title' not in content:
        content = content.replace('<title>', meta_tags + '  <title>')

    # Add link to style.css if not present
    if 'style.css' not in content:
        content = content.replace('</head>', '  <link rel="stylesheet" href="style.css"/>\n</head>')

    # For index/dashboard/careers/job-tracker, inject auth.js import
    if file in ['index.html', 'dashboard.html', 'careers.html', 'job-tracker.html']:
        if 'auth.js' not in content:
            # We will just inject it before the closing body
            content = content.replace('</body>', '  <script type="module" src="auth.js"></script>\n</body>')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Refactoring complete.")
