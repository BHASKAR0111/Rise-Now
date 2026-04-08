import os

with open('dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the old `nextStepCard` from right sidebar
old_card = """      <!-- NEXT STEP -->
      <div class="sidebar-card" id="nextStepCard" style="display:none;">
        <h4>Next Step</h4>
        <div id="nextStepContent"></div>
      </div>"""

content = content.replace(old_card, "")

# 2. Add the Daily Mission Container at the top of left-col
left_col_start = '    <!-- LEFT: MAIN COLUMN -->\n    <div class="left-col" style="display: flex; flex-direction: column; min-width:0;">'
mission_ui = """
      <!-- DAILY MISSION -->
      <div id="dailyMissionContainer" style="display:none; background:linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,0,0,0)); border:1px solid rgba(0,194,255,0.3); border-radius:16px; padding:24px; margin-bottom:40px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:12px; font-weight:800; color:var(--blue); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Daily 15-Minute Mission</div>
            <div style="font-size:24px; font-weight:700; color:white; margin-bottom:6px;" id="missionTitle">Watch: Video Concept Basics</div>
            <div style="font-size:14px; color:var(--muted); margin-bottom:20px;" id="missionPath">Path: Video Editing · Step 1</div>
            <div style="display:flex; gap:12px; align-items:center;">
              <a href="#" target="_blank" id="missionLink" style="display:inline-block; padding:12px 24px; background:var(--blue); color:#000; font-weight:700; text-decoration:none; border-radius:8px; transition:transform 0.2s;" onclick="if(window.addXP) window.addXP(10, 'Started Daily Mission')">Start Mission →</a>
              <span style="font-size:12px; color:var(--muted); font-weight:600;">+10 XP</span>
            </div>
          </div>
          <div style="font-size:48px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
        </div>
      </div>
"""
content = content.replace(left_col_start, left_col_start + mission_ui)

# 3. Update the Javascript logic to populate it
old_js = """      if (nextIdx !== -1) {
        document.getElementById('nextStepCard').style.display = 'block';
        document.getElementById('nextStepContent').innerHTML = `
          <div class="next-step-highlight">
            <div class="next-step-label">Up Next</div>
            <div class="next-step-text">${career.steps[nextIdx].name}</div>
            <div class="next-step-path">${career.emoji} ${career.title} · Step ${nextIdx+1}</div>
          </div>
          <a href="${career.steps[nextIdx].url}" target="_blank" style="display:block;padding:10px 14px;background:rgba(0,230,118,0.1);border:1px solid rgba(0,230,118,0.2);border-radius:10px;color:var(--blue);font-size:13px;font-weight:600;text-decoration:none;text-align:center;">
            Start on ${career.steps[nextIdx].resource} →
          </a>
        `;
        nextStepFound = true;
        break;
      }
    }
    if (!nextStepFound) document.getElementById('nextStepCard').style.display = 'none';"""

new_js = """      if (nextIdx !== -1) {
        document.getElementById('dailyMissionContainer').style.display = 'block';
        document.getElementById('missionTitle').innerText = career.steps[nextIdx].name;
        document.getElementById('missionPath').innerText = career.title + ' · Step ' + (nextIdx+1);
        document.getElementById('missionLink').href = career.steps[nextIdx].url;
        document.getElementById('missionLink').innerText = 'Start on ' + career.steps[nextIdx].resource + ' →';
        nextStepFound = true;
        break;
      }
    }
    if (!nextStepFound) document.getElementById('dailyMissionContainer').style.display = 'none';"""

# Replace exact string cautiously
if old_js in content:
    content = content.replace(old_js, new_js)
else:
    print("Could not find old_js block exactly.")

# Also add XP when step is toggled complete
# userData.paths[pid][idx] = !userData.paths[pid][idx];
# if (userData.paths[pid][idx]) trackActivity(); // only track when checking as done
xp_js = """userData.paths[pid][idx] = !userData.paths[pid][idx];
    if (userData.paths[pid][idx]) {
      trackActivity();
      if(window.addXP) window.addXP(20, 'Completed a step!');
    }"""
    
content = content.replace(
    'userData.paths[pid][idx] = !userData.paths[pid][idx];\n    if (userData.paths[pid][idx]) trackActivity(); // only track when checking as done',
    xp_js
)

with open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)
