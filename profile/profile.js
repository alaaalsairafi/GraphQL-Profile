// profile/profile.js
import { Auth }              from '../auth/auth.js';
import { navigate }          from '../utils/router.js';
import { fetchUser, fetchXP, fetchAuditRatio } from '../graphql/queries.js';
import { renderXPOverTime }   from '../graphs/xpOverTime.js';
import { renderXPPerProject } from '../graphs/xpPerProject.js';
 
export async function render(container) {
  loadStyles('../style/profile.css');
 
  // ── Shell ──
  container.innerHTML = `
    <nav class="nav">
      <span class="nav-brand">&lt;/&gt; dev.profile</span>
      <button id="btn-logout" class="btn-logout">Log out</button>
    </nav>
 
    <main class="profile-main">
 
      <section class="info-grid">
        <div class="info-card" id="card-user">
          <span class="card-label">User</span>
          <span class="card-value" id="val-login">—</span>
          <span class="card-sub"  id="val-id">id: —</span>
        </div>
        <div class="info-card" id="card-xp">
          <span class="card-label">Total XP</span>
          <span class="card-value" id="val-xp">—</span>
          <span class="card-sub">experience points</span>
        </div>
        <div class="info-card" id="card-audit">
          <span class="card-label">Audit Ratio</span>
          <span class="card-value" id="val-ratio">—</span>
          <div class="audit-bar-wrap">
            <div class="audit-bar-track">
              <div class="audit-bar-fill" id="audit-bar"></div>
            </div>
            <span class="card-sub" id="val-audit-detail">up — / down —</span>
          </div>
        </div>
      </section>
 
      <section class="graphs-section">
        <div class="graph-card">
          <h2 class="graph-title">XP Over Time</h2>
          <div class="graph-container" id="graph-xp-time"></div>
        </div>
        <div class="graph-card">
          <h2 class="graph-title">XP per Project</h2>
          <div class="graph-container" id="graph-xp-project"></div>
        </div>
      </section>
 
    </main>
  `;
 
  // ── Logout ──
  document.getElementById('btn-logout').addEventListener('click', () => {
    Auth.clearToken();
    navigate('login');
  });
 
  // ── Fetch & populate ──
  try {
    const [user, xpTx, audit] = await Promise.all([
      fetchUser(),
      fetchXP(),
      fetchAuditRatio(),
    ]);
 
    // User card
    document.getElementById('val-login').textContent = user.login;
    document.getElementById('val-id').textContent    = `id: ${user.id}`;
 
    // XP card
    const totalXP = xpTx.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('val-xp').textContent =
      totalXP >= 1000 ? `${(totalXP / 1000).toFixed(1)} kB` : `${totalXP} B`;
 
    // Audit card
    const ratio = audit.auditRatio?.toFixed(1) ?? '—';
    document.getElementById('val-ratio').textContent = ratio;
 
    const up   = fmt(audit.totalUp);
    const down = fmt(audit.totalDown);
    document.getElementById('val-audit-detail').textContent = `↑ ${up}  ↓ ${down}`;
 
    const pct = Math.min((audit.auditRatio / 2) * 100, 100);
    document.getElementById('audit-bar').style.width = `${pct}%`;
    document.getElementById('audit-bar').style.background =
      audit.auditRatio >= 1 ? 'var(--success)' : 'var(--error)';
 
    // Graphs
    renderXPOverTime(document.getElementById('graph-xp-time'), xpTx);
    renderXPPerProject(document.getElementById('graph-xp-project'), xpTx);
 
  } catch (err) {
    console.error('Profile load error:', err);
  }
}
 
function fmt(bytes) {
  if (!bytes) return '0 B';
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  if (bytes >= 1_000)     return `${(bytes / 1_000).toFixed(1)} kB`;
  return `${bytes} B`;
}
 
function loadStyles(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel   = 'stylesheet';
  link.href  = href;
  document.head.appendChild(link);
}