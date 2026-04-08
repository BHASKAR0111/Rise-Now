import re

with open('dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Inside renderDashboard, there is `list.innerHTML = savedPaths.map(pid => {`
# We should change our logic. The assessment recommend array is in risenow_assessment.
# But savedPaths doesn't contain all paths, it only contains what the user "saved".
# Actually, if the user finishes the assessment, we WANT to automatically save the recommended paths!!

# In `assessment.html`:
# ```js
#    localStorage.setItem('risenow_assessment', JSON.stringify([primary, secondary]));
# ```

# And we want them to appear in the dashboard automatically!
# So in `dashboard.html` inside `onAuthStateChanged` when it loads the paths, if `risenow_assessment` exists, we merge it into user paths!

inject_code = """
    // Merge assessment recommendations
    try {
      const assessmentPaths = JSON.parse(localStorage.getItem('risenow_assessment'));
      if (assessmentPaths && Array.isArray(assessmentPaths)) {
        let changed = false;
        assessmentPaths.forEach(ap => {
          if (!userData.paths[ap]) {
            userData.paths[ap] = {};
            changed = true;
          }
        });
        if (changed) {
          saveUserData();
          // Remove to avoid adding them again arbitrarily if they remove them later
          localStorage.removeItem('risenow_assessment');
        }
      }
    } catch(e) {}
"""

# Let's inject this right at the start of renderDashboard or inside loadUserData
# Actually, the start of renderDashboard is great:
insert_pos = 'function renderDashboard() {'
if insert_pos in content:
    content = content.replace(insert_pos, insert_pos + inject_code)

# Now, we also want to visually highlight them! But if we remove it from localStorage, we lose the 'recommended' status.
# Let's NOT remove it from localStorage. Just merge if missing.
inject_code_safe = """
    // Merge assessment recommendations
    let recommended = [];
    try {
      recommended = JSON.parse(localStorage.getItem('risenow_assessment') || '[]');
      if (recommended.length > 0) {
        let changed = false;
        recommended.forEach(ap => {
          if (!userData.paths[ap]) {
            userData.paths[ap] = {};
            changed = true;
          }
        });
        if (changed) saveUserData();
      }
    } catch(e) {}
"""

content = content.replace(insert_pos +
"""
    // Merge assessment recommendations
    try {
      const assessmentPaths = JSON.parse(localStorage.getItem('risenow_assessment'));
      if (assessmentPaths && Array.isArray(assessmentPaths)) {
        let changed = false;
        assessmentPaths.forEach(ap => {
          if (!userData.paths[ap]) {
            userData.paths[ap] = {};
            changed = true;
          }
        });
        if (changed) {
          saveUserData();
          // Remove to avoid adding them again arbitrarily if they remove them later
          localStorage.removeItem('risenow_assessment');
        }
      }
    } catch(e) {}
""", "")

content = content.replace(insert_pos, insert_pos + inject_code_safe)

# Now in `list.innerHTML = savedPaths.map(pid => {` ...
# We add a badge if pid in recommended.
target_line = '<div class="path-title">${career.title}</div>'
replace_line = """
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="path-title">${career.title}</div>
                ${recommended.includes(pid) ? '<span style="background:rgba(0,194,255,0.1); color:var(--blue); font-size:10px; padding:2px 8px; border-radius:10px; font-weight:800; border:1px solid var(--blue); text-transform:uppercase;">Recommended</span>' : ''}
              </div>
"""
if target_line in content:
    content = content.replace(target_line, replace_line)

with open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)
