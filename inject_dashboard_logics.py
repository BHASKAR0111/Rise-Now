import re

def main():
    with open('dashboard.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. We need to render the saved resources
    saved_res_js = """
  // Render Saved Resources
  function renderSavedResources() {
    try {
      const saved = JSON.parse(localStorage.getItem('risenow_bookmarks') || '[]');
      const container = document.getElementById('savedResourcesList');
      if (saved.length === 0) {
        container.innerHTML = '<div style="color:var(--muted); font-size:14px;">No resources saved yet. <a href="resources.html" style="color:var(--blue);">Browse resources</a></div>';
        return;
      }
      container.innerHTML = saved.map(r => `
        <a href="${r.url}" target="_blank" class="resource-card-mini" style="background:var(--card); border:1px solid var(--border); border-radius:10px; padding:12px 16px; width:200px; flex-shrink:0; text-decoration:none; display:flex; flex-direction:column; gap:8px; transition:border 0.2s;">
          <div style="font-size:24px;">${r.emoji}</div>
          <div style="color:white; font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.title}</div>
        </a>
      `).join('');
    } catch(e) {}
  }
  """

    # 2. Activity Tracking and Heatmap
    heatmap_js = """
  // Heatmap tracking
  window.trackActivity = async function() {
    if (!userData.activity) userData.activity = {};
    const today = new Date().toISOString().split('T')[0];
    userData.activity[today] = (userData.activity[today] || 0) + 1;
    await saveUserData();
    renderHeatmap();
  };

  function renderHeatmap() {
    const grid = document.getElementById('heatmapGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const activity = userData.activity || {};
    
    // Generate last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    
    // Render squares
    days.forEach(date => {
      const count = activity[date] || 0;
      let bg = 'rgba(255,255,255,0.05)';
      if (count === 1) bg = 'rgba(0,194,255,0.3)';
      else if (count === 2) bg = 'rgba(0,194,255,0.6)';
      else if (count > 2) bg = 'rgba(0,194,255,1)';
      
      const square = document.createElement('div');
      square.title = `${date}: ${count} actions`;
      square.style.width = '16px';
      square.style.height = '16px';
      square.style.borderRadius = '4px';
      square.style.background = bg;
      grid.appendChild(square);
    });
  }
  """

    # Inject these into <script>
    # Find `function renderDashboard() {`
    if 'function renderDashboard() {' in content:
        content = content.replace('function renderDashboard() {', saved_res_js + heatmap_js + '\n  function renderDashboard() {\n    renderSavedResources();\n    renderHeatmap();')
    
    # Track activity on toggleStep
    if 'userData.paths[pid][idx] = !userData.paths[pid][idx];' in content:
        content = content.replace('userData.paths[pid][idx] = !userData.paths[pid][idx];', 'userData.paths[pid][idx] = !userData.paths[pid][idx];\n    if (userData.paths[pid][idx]) trackActivity(); // only track when checking as done')

    # Add pseudo css for hover
    if '</style>' in content:
        content = content.replace('</style>', '  .resource-card-mini:hover { border-color: var(--blue) !important; }\n  </style>')

    with open('dashboard.html', 'w', encoding='utf-8') as f:
        f.write(content)

main()
