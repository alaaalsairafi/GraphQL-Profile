
export function renderXPPerProject(container, transactions) {
  const NS = 'http://www.w3.org/2000/svg';

  // Aggregate XP per project name
  const map = {};
  transactions.forEach(t => {
    const name = t.object?.name ?? 'unknown';
    map[name] = (map[name] || 0) + t.amount;
  });

  // Top 10 by XP
  const projects = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (projects.length === 0) {
    container.textContent = 'No project data available.';
    return;
  }

  const W = 600, H = 320;
  const PAD = { top: 20, right: 20, bottom: 100, left: 70 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxXP    = Math.max(...projects.map(p => p[1]));
  const barW     = innerW / projects.length;
  const barGap   = barW * 0.25;

  const el = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  };

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'graph-svg' });

  // Grid lines
  const gridCount = 5;
  for (let i = 0; i <= gridCount; i++) {
    const y = PAD.top + (innerH / gridCount) * i;
    svg.appendChild(el('line', {
      x1: PAD.left, y1: y, x2: PAD.left + innerW, y2: y,
      stroke: 'var(--border)', 'stroke-width': '1',
    }));

    const xpVal = Math.round(maxXP - (maxXP / gridCount) * i);
    const label = el('text', {
      x: PAD.left - 8, y: y + 4,
      'text-anchor': 'end', class: 'graph-label',
    });
    label.textContent = xpVal >= 1000 ? `${(xpVal / 1000).toFixed(1)}k` : xpVal;
    svg.appendChild(label);
  }

  // Bars
  projects.forEach(([name, xp], i) => {
    const barH = (xp / maxXP) * innerH;
    const x    = PAD.left + i * barW + barGap / 2;
    const y    = PAD.top + innerH - barH;
    const w    = barW - barGap;

    // Bar
    const rect = el('rect', {
      x, y, width: w, height: barH,
      fill: 'var(--accent)', rx: '4',
      opacity: '0.85',
    });
    svg.appendChild(rect);

    // Project name label (rotated)
    const label = el('text', {
      x: x + w / 2,
      y: PAD.top + innerH + 14,
      'text-anchor': 'end',
      class: 'graph-label',
      transform: `rotate(-40, ${x + w / 2}, ${PAD.top + innerH + 14})`,
    });
    // Truncate long names
    label.textContent = name.length > 14 ? name.slice(0, 13) + '…' : name;
    svg.appendChild(label);
  });

  // Axes
  svg.appendChild(el('line', {
    x1: PAD.left, y1: PAD.top, x2: PAD.left, y2: PAD.top + innerH,
    stroke: 'var(--border)', 'stroke-width': '1',
  }));
  svg.appendChild(el('line', {
    x1: PAD.left, y1: PAD.top + innerH, x2: PAD.left + innerW, y2: PAD.top + innerH,
    stroke: 'var(--border)', 'stroke-width': '1',
  }));

  container.appendChild(svg);
}