import re
import json

def process_interview_html():
    with open('interview.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all categories and their Q&As
    qa_sections_match = re.search(r'<div class="qa-section">(.*?)<!-- FOOTER -->', content, re.DOTALL)
    if not qa_sections_match:
        print("Could not find qa-section")
        return
    
    qa_sections_html = qa_sections_match.group(1)
    
    # We will build a dictionary: tab_id -> { title: "...", qs: [ {q: "", a: "", tip: "", diff: ""} ] }
    tabs_html = re.findall(r'<div id="(tab-[^"]+)"[^>]*>(.*?)</div>\s*<!--', qa_sections_html + "<!--", re.DOTALL)
    
    # Actually it's safer to split by '<div id="tab-'
    tabs_split = qa_sections_html.split('<div id="tab-')
    
    flashcard_data = {}
    
    for split in tabs_split[1:]:
        tab_id_raw = split.split('"', 1)[0]
        tab_id = "tab-" + tab_id_raw
        
        # Get section label
        label_match = re.search(r'<div class="section-label">(.*?)</div>', split)
        label = label_match.group(1) if label_match else tab_id
        
        questions = []
        qa_items = split.split('<div class="qa-item"')[1:]
        
        for item in qa_items:
            q_match = re.search(r'<div class="qa-q-text">(.*?)</div>', item)
            a_match = re.search(r'<p><strong style="color:white">Model Answer:</strong> (.*?)</p>', item)
            if not a_match: # fallback
                a_match = re.search(r'<div class="qa-answer-inner">(.*?)</div>', item, re.DOTALL)
                
            tip_match = re.search(r'<div class="qa-tip">(.*?)</div>', item)
            diff_match = re.search(r'<span class="diff-badge[^>]*>(.*?)</span>', item)
            
            q = q_match.group(1).strip() if q_match else ""
            a = a_match.group(1).strip() if a_match else ""
            # Clean up 'a' if it's the raw inner HTML fallback
            if '<p>' in a and not a.startswith('"'): 
                a = re.sub(r'<div class="qa-tip".*?</div>', '', a, flags=re.DOTALL).strip()
                
            tip = tip_match.group(1).strip() if tip_match else ""
            diff = diff_match.group(1).strip() if diff_match else "Medium"
            
            questions.append({
                "q": q.replace("'", "\\'"),
                "a": a.replace("'", "\\'"),
                "tip": tip.replace("'", "\\'"),
                "diff": diff
            })
            
        flashcard_data[tab_id_raw] = {
            "title": label,
            "questions": questions
        }

    # Now, generate the new replacement HTML and JS
    flashcard_html = """
<!-- FLASHCARD SYSTEM -->
<div class="flashcard-container" style="max-width:800px; margin:0 auto; padding:0 40px 60px;">
  <div id="flashcard-ui" style="background:var(--card); border:1px solid var(--border); border-radius:16px; padding:40px; text-align:center; min-height:400px; display:flex; flex-direction:column; justify-content:center;">
    
    <div id="fc-start-screen">
      <div style="font-size:48px; margin-bottom:20px;">🎯</div>
      <h2 style="font-size:24px; margin-bottom:12px;" id="fc-title">Select a category to start</h2>
      <p style="color:var(--muted); margin-bottom:30px;">Practice with interactive flashcards and space repetition.</p>
      <button onclick="startSession()" style="padding:14px 32px; background:linear-gradient(135deg, var(--blue), var(--blue)); color:#000; border:none; border-radius:12px; font-weight:700; font-size:16px; cursor:pointer;" id="fc-start-btn" disabled>Start Practice Session</button>
    </div>

    <div id="fc-card-screen" style="display:none; text-align:left; height:100%; display:none; flex-direction:column;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border);">
        <span style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:1px;" id="fc-progress">Question 1/5</span>
        <span id="fc-difficulty" class="diff-badge" style="font-size:10px;">Medium</span>
      </div>
      
      <div style="font-size:20px; font-weight:600; line-height:1.5; margin-bottom:40px;" id="fc-question"></div>
      
      <div id="fc-answer-area" style="display:none; flex:1;">
        <div style="font-size:13px; font-weight:700; color:var(--blue); text-transform:uppercase; margin-bottom:12px; letter-spacing:1px;">Model Answer</div>
        <div style="font-size:15px; color:var(--text); line-height:1.7; margin-bottom:24px; padding:20px; background:rgba(255,255,255,0.02); border-radius:12px; border:1px solid var(--border);" id="fc-answer"></div>
        <div class="qa-tip" id="fc-tip" style="margin-bottom:40px;"></div>
        
        <div style="text-align:center;">
          <div style="font-size:12px; color:var(--muted); margin-bottom:16px;">How did you do?</div>
          <div style="display:flex; justify-content:center; gap:12px;">
            <button onclick="nextCard('Hard')" style="padding:10px 24px; background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.3); color:#ff4757; border-radius:8px; cursor:pointer; font-weight:600;">Hard</button>
            <button onclick="nextCard('Good')" style="padding:10px 24px; background:rgba(255,165,0,0.1); border:1px solid rgba(255,165,0,0.3); color:#ffa500; border-radius:8px; cursor:pointer; font-weight:600;">Good</button>
            <button onclick="nextCard('Easy')" style="padding:10px 24px; background:rgba(0,230,118,0.1); border:1px solid rgba(0,230,118,0.3); color:#00e676; border-radius:8px; cursor:pointer; font-weight:600;">Easy</button>
          </div>
        </div>
      </div>
      
      <button id="fc-reveal-btn" onclick="revealAnswer()" style="padding:14px; background:var(--bg); border:1px solid var(--border); color:white; font-weight:600; border-radius:12px; cursor:pointer; margin-top:auto;">Reveal Answer</button>
    </div>

    <div id="fc-end-screen" style="display:none; flex-direction:column; align-items:center;">
      <div style="font-size:56px; margin-bottom:20px;">🏆</div>
      <h2 style="font-size:24px; margin-bottom:12px;">Session Complete!</h2>
      <p style="color:var(--muted); margin-bottom:30px;">You've reviewed all questions in this category.</p>
      
      <div style="display:flex; gap:16px; margin-bottom:40px;">
        <div style="background:rgba(0,230,118,0.1); padding:16px 24px; border-radius:12px; border:1px solid rgba(0,230,118,0.2);">
          <div style="font-size:24px; font-weight:800; color:#00e676;" id="fc-score-easy">0</div>
          <div style="font-size:11px; color:var(--muted); text-transform:uppercase;">Easy</div>
        </div>
        <div style="background:rgba(255,165,0,0.1); padding:16px 24px; border-radius:12px; border:1px solid rgba(255,165,0,0.2);">
          <div style="font-size:24px; font-weight:800; color:#ffa500;" id="fc-score-good">0</div>
          <div style="font-size:11px; color:var(--muted); text-transform:uppercase;">Good</div>
        </div>
        <div style="background:rgba(255,71,87,0.1); padding:16px 24px; border-radius:12px; border:1px solid rgba(255,71,87,0.2);">
          <div style="font-size:24px; font-weight:800; color:#ff4757;" id="fc-score-hard">0</div>
          <div style="font-size:11px; color:var(--muted); text-transform:uppercase;">Hard</div>
        </div>
      </div>
      
      <button onclick="resetSession()" style="padding:14px 32px; background:transparent; border:1px solid var(--border); color:white; font-weight:600; border-radius:12px; cursor:pointer;">Practice Again</button>
    </div>

  </div>
</div>
"""

    flashcard_js = f"""
  const fcData = {json.dumps(flashcard_data)};
  let currentGroup = '';
  let activeQuestions = [];
  let currentIndex = 0;
  let scores = {{ Easy: 0, Good: 0, Hard: 0 }};

  function showTab(tabId, btn) {{
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    currentGroup = tabId;
    const data = fcData[tabId];
    
    document.getElementById('fc-start-screen').style.display = 'block';
    document.getElementById('fc-card-screen').style.display = 'none';
    document.getElementById('fc-end-screen').style.display = 'none';
    
    document.getElementById('fc-title').innerText = data ? data.title + ' Practice' : 'Select a category';
    document.getElementById('fc-start-btn').disabled = !data;
  }}

  function startSession() {{
    activeQuestions = [...fcData[currentGroup].questions];
    // Shuffle
    activeQuestions.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    scores = {{ Easy: 0, Good: 0, Hard: 0 }};
    
    document.getElementById('fc-start-screen').style.display = 'none';
    document.getElementById('fc-card-screen').style.display = 'flex';
    document.getElementById('fc-end-screen').style.display = 'none';
    
    renderCard();
  }}

  function renderCard() {{
    if (currentIndex >= activeQuestions.length) {{
      endSession();
      return;
    }}
    
    const q = activeQuestions[currentIndex];
    document.getElementById('fc-progress').innerText = `Question ${{currentIndex + 1}} / ${{activeQuestions.length}}`;
    
    const diffEl = document.getElementById('fc-difficulty');
    diffEl.innerText = q.diff;
    diffEl.className = 'diff-badge diff-' + q.diff.toLowerCase();
    
    document.getElementById('fc-question').innerText = q.q;
    document.getElementById('fc-answer').innerHTML = q.a; // contains html tags
    
    const tipEl = document.getElementById('fc-tip');
    if (q.tip) {{
      tipEl.style.display = 'block';
      tipEl.innerHTML = q.tip;
    }} else {{
      tipEl.style.display = 'none';
    }}
    
    document.getElementById('fc-answer-area').style.display = 'none';
    document.getElementById('fc-reveal-btn').style.display = 'block';
  }}

  function revealAnswer() {{
    document.getElementById('fc-answer-area').style.display = 'block';
    document.getElementById('fc-reveal-btn').style.display = 'none';
  }}

  window.nextCard = function(rating) {{
    scores[rating]++;
    currentIndex++;
    renderCard();
  }};

  function endSession() {{
    document.getElementById('fc-card-screen').style.display = 'none';
    document.getElementById('fc-end-screen').style.display = 'flex';
    
    document.getElementById('fc-score-easy').innerText = scores.Easy;
    document.getElementById('fc-score-good').innerText = scores.Good;
    document.getElementById('fc-score-hard').innerText = scores.Hard;
  }}

  function resetSession() {{
    startSession();
  }}

  // Auto-init first tab
  document.addEventListener('DOMContentLoaded', () => {{
    showTab('hr', document.querySelector('.tab'));
  }});
"""

    
    # Replace <div class="qa-section">...</div>
    new_content = content.replace(qa_sections_match.group(0), flashcard_html + '\n<!-- FOOTER -->')
    
    # Replace JS script logic
    # Find <script> block and replace legacy showTab and toggleQA
    script_match = re.search(r'<script>(.*?)</script>', new_content, re.DOTALL)
    if script_match:
        new_content = new_content.replace(script_match.group(1), flashcard_js)
    else:
        new_content = new_content.replace('</body>', '<script>' + flashcard_js + '</script>\n</body>')
        
    with open('interview.html', 'w', encoding='utf-8') as f:
        f.write(new_content)

process_interview_html()
