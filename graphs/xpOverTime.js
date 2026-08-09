// graphs/xpOverTime.js
// SVG line chart — cumulative XP earned over time

export function renderXPOverTime(container, transactions) {
  const NS = 'http://www.w3.org/2000/svg';

  const W = 600, H = 300;
  const PAD = { top: 20, right: 20, bottom: 50, left: 70 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Build cumulative XP data points
  let cumulative = 0;
  const points = transactions.map(t => {
    cumulative += t.amount;
    return { date: new Date(t.createdAt), xp: cumulative };
  });

  if (points.length === 0) {
    container.textContent = 'No XP data available.';
    return;
  }

  const minDate = points[0].date.getTime();
  const maxDate = points[points.length - 1].date.getTime();
  const maxXP   = points[points.length - 1].xp;

  const scaleX = d => PAD.left + ((d.getTime() - minDate) / (maxDate - minDate || 1)) * innerW;
  const scaleY = xp => PAD.top + innerH - (xp / maxXP) * innerH;

  // Helper to create SVG elements
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

    // Y axis labels
    const xpVal = Math.round(maxXP - (maxXP / gridCount) * i);
    const label = el('text', {
      x: PAD.left - 8, y: y + 4,
      'text-anchor': 'end', class: 'graph-label',
    });
    label.textContent = xpVal >= 1000 ? `${(xpVal / 1000).toFixed(1)}k` : xpVal;
    svg.appendChild(label);
  }

  // Line path
  const d = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${scaleX(p.date).toFixed(1)} ${scaleY(p.xp).toFixed(1)}`
  ).join(' ');

  // Gradient fill under line
  const defs = el('defs', {});
  const grad = el('linearGradient', { id: 'xpGrad', x1: '0', y1: '0', x2: '0', y2: '1' });
  const stop1 = el('stop', { offset: '0%', 'stop-color': 'var(--accent)', 'stop-opacity': '0.3' });
  const stop2 = el('stop', { offset: '100%', 'stop-color': 'var(--accent)', 'stop-opacity': '0' });
  grad.append(stop1, stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const fillPath = el('path', {
    d: `${d} L ${scaleX(points[points.length-1].date).toFixed(1)} ${PAD.top + innerH} L ${PAD.left} ${PAD.top + innerH} Z`,
    fill: 'url(#xpGrad)', stroke: 'none',
  });
  svg.appendChild(fillPath);

  const linePath = el('path', {
    d, fill: 'none',
    stroke: 'var(--accent)', 'stroke-width': '2.5',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  });
  svg.appendChild(linePath);

  // X axis date labels — spaced evenly across the TIME range (not by point index),
  // so labels don't bunch up when transactions cluster early on.
  // Also skips any label that would land too close (in pixels) to the previous one.
  const desiredLabels = Math.min(4, points.length);
  const minPixelGap = 45;
  const placedX = [];

  for (let i = 0; i < desiredLabels; i++) {
    const targetTime = desiredLabels === 1
      ? minDate
      : minDate + (i / (desiredLabels - 1)) * (maxDate - minDate);

    // find the actual data point closest to this target time
    let closest = points[0];
    let minDiff = Infinity;
    for (const p of points) {
      const diff = Math.abs(p.date.getTime() - targetTime);
      if (diff < minDiff) { minDiff = diff; closest = p; }
    }

    const x = scaleX(closest.date);
    if (placedX.some(px => Math.abs(px - x) < minPixelGap)) continue;
    placedX.push(x);

    const label = el('text', {
      x, y: PAD.top + innerH + 20,
      'text-anchor': 'middle', class: 'graph-label',
    });
    label.textContent = closest.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    svg.appendChild(label);
  }

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