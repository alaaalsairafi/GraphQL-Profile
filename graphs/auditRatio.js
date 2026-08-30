// graphs/auditRatio.js

export function renderAuditRatio(container, auditData) {
  const NS = 'http://www.w3.org/2000/svg';
  const { totalUp, totalDown, auditRatio } = auditData;

  const total = (totalUp + totalDown) || 1;
  const upPct   = (totalUp / total) * 100;
  const downPct = (totalDown / total) * 100;

  const W = 600, H = 340;
  const PAD = { top: 70, right: 60, bottom: 60, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const el = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  };

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'graph-svg' });

  // ── Defs: gradients + glow ──
  const defs = el('defs', {});

  const gradUp = el('linearGradient', { id: 'auditGradUp', x1: '0', y1: '0', x2: '0', y2: '1' });
  gradUp.append(
    el('stop', { offset: '0%',   'stop-color': '#d8b4fe' }),
    el('stop', { offset: '100%', 'stop-color': 'var(--accent)' })
  );

  const gradDown = el('linearGradient', { id: 'auditGradDown', x1: '0', y1: '0', x2: '0', y2: '1' });
  gradDown.append(
    el('stop', { offset: '0%',   'stop-color': 'var(--accent)' }),
    el('stop', { offset: '100%', 'stop-color': '#6d28d9' })
  );

  const glow = el('filter', { id: 'auditGlow', x: '-50%', y: '-50%', width: '200%', height: '200%' });
  const blur = el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '6', result: 'blur' });
  const merge = el('feMerge', {});
  merge.append(el('feMergeNode', { in: 'blur' }), el('feMergeNode', { in: 'SourceGraphic' }));
  glow.append(blur, merge);

  defs.append(gradUp, gradDown, glow);
  svg.appendChild(defs);

  // ── Center ratio callout ──
  const ratioText = el('text', {
    x: W / 2, y: 34, 'text-anchor': 'middle', class: 'graph-label',
    style: 'font-size: 28px; font-weight: 700; fill: var(--accent);',
  });
  ratioText.textContent = auditRatio.toFixed(2);
  svg.appendChild(ratioText);

  const ratioSub = el('text', {
    x: W / 2, y: 52, 'text-anchor': 'middle', class: 'graph-label',
    style: 'font-size: 12px; letter-spacing: 1px; opacity: 0.6; text-transform: uppercase;',
  });
  ratioSub.textContent = 'Audit Ratio';
  svg.appendChild(ratioSub);

  // ── Bars ──
  const bars = [
    { label: 'Given',    pct: upPct,   raw: totalUp,   fill: 'url(#auditGradUp)'   },
    { label: 'Received', pct: downPct, raw: totalDown, fill: 'url(#auditGradDown)' },
  ];

  const barW  = 110;
  const gap   = innerW - barW * 2;
  const xs    = [PAD.left + gap / 3, PAD.left + gap / 3 * 2 + barW];

  bars.forEach((bar, i) => {
    const barH = (bar.pct / 100) * innerH;
    const x = xs[i];
    const y = PAD.top + innerH - barH;

    const rect = el('rect', {
      x, y, width: barW, height: barH,
      rx: '14', fill: bar.fill, filter: 'url(#auditGlow)',
    });
    svg.appendChild(rect);

    // Percentage on top of bar
    const pctLabel = el('text', {
      x: x + barW / 2, y: y - 12,
      'text-anchor': 'middle', class: 'graph-label',
      style: 'font-size: 18px; font-weight: 700; fill: var(--accent);',
    });
    pctLabel.textContent = `${bar.pct.toFixed(0)}%`;
    svg.appendChild(pctLabel);

    // Category label below axis
    const nameLabel = el('text', {
      x: x + barW / 2, y: PAD.top + innerH + 24,
      'text-anchor': 'middle', class: 'graph-label',
      style: 'font-size: 13px; font-weight: 600;',
    });
    nameLabel.textContent = bar.label;
    svg.appendChild(nameLabel);

    // Raw XP value below that
    const rawLabel = el('text', {
      x: x + barW / 2, y: PAD.top + innerH + 40,
      'text-anchor': 'middle', class: 'graph-label',
      style: 'font-size: 11px; opacity: 0.55;',
    });
    rawLabel.textContent = fmt(bar.raw);
    svg.appendChild(rawLabel);
  });

  // Baseline
  svg.appendChild(el('line', {
    x1: PAD.left - 10, y1: PAD.top + innerH, x2: W - PAD.right + 10, y2: PAD.top + innerH,
    stroke: 'var(--border)', 'stroke-width': '1',
  }));

  container.appendChild(svg);
}

function fmt(bytes) {
  if (!bytes) return '0 B';
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  if (bytes >= 1_000)     return `${(bytes / 1_000).toFixed(1)} kB`;
  return `${bytes} B`;
}