/* ==========================================================================
   Animated Purple SVG Architecture Flow Renderer
   ========================================================================== */

function renderAnimatedFlowSvg(steps, lang) {
  if (!steps || !steps.length) return "";
  const w = 720;
  const h = 132;
  const count = steps.length;
  const boxW = Math.min(156, Math.floor((w - 30 - (count - 1) * 28) / count));
  const totalWidth = count * boxW + (count - 1) * 28;
  const startX = Math.max(10, Math.floor((w - totalWidth) / 2));

  const palette = [
    { stroke: "#7c3aed", bg: "#f5f3ff", text: "#4c1d95", dot: "#6d28d9" },
    { stroke: "#9333ea", bg: "#faf5ff", text: "#581c87", dot: "#7e22ce" },
    { stroke: "#6d28d9", bg: "#ede9fe", text: "#2e1065", dot: "#5b21b6" },
    { stroke: "#a855f7", bg: "#fdf4ff", text: "#701a75", dot: "#9333ea" },
    { stroke: "#8b5cf6", bg: "#f5f3ff", text: "#4c1d95", dot: "#7c3aed" }
  ];

  let nodesSvg = "";
  steps.forEach((st, i) => {
    const x = startX + i * (boxW + 28);
    const y = 26;
    const p = palette[i % palette.length];
    const title = typeof st.title === "object" ? (st.title[lang] || st.title.en) : st.title;
    const sub = typeof st.sub === "object" ? (st.sub[lang] || st.sub.en) : st.sub;

    if (i < count - 1) {
      const lineX1 = x + boxW;
      const lineX2 = x + boxW + 28;
      const midY = y + 40;
      nodesSvg += `
        <line x1="${lineX1}" y1="${midY}" x2="${lineX2}" y2="${midY}" stroke="#ddd6fe" stroke-width="2" />
        <line x1="${lineX1}" y1="${midY}" x2="${lineX2}" y2="${midY}" stroke="${p.dot}" stroke-width="2.5" class="flow-path" />
        <polygon points="${lineX2 - 6},${midY - 4} ${lineX2},${midY} ${lineX2 - 6},${midY + 4}" fill="${p.dot}" />
      `;
    }

    nodesSvg += `
      <g>
        <rect x="${x}" y="${y}" width="${boxW}" height="80" rx="14" fill="${p.bg}" stroke="${p.stroke}" stroke-width="1.6" />
        <circle cx="${x + 18}" cy="${y + 20}" r="4.5" fill="${p.dot}" />
        <text x="${x + 28}" y="${y + 24}" font-size="10.5" font-weight="700" fill="${p.dot}" font-family="JetBrains Mono, monospace">0${i + 1}</text>
        <text x="${x + 12}" y="${y + 44}" font-size="11.5" font-weight="700" fill="#2e1065" font-family="Plus Jakarta Sans, sans-serif">${escapeSvg(truncateText(title, 20))}</text>
        <text x="${x + 12}" y="${y + 62}" font-size="10" fill="#5b21b6" font-family="Plus Jakarta Sans, sans-serif">${escapeSvg(truncateText(sub, 22))}</text>
      </g>
    `;
  });

  return `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-auto overflow-visible" role="img" aria-label="System Architecture Flow">
      ${nodesSvg}
    </svg>
  `;
}

function truncateText(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function escapeSvg(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.renderAnimatedFlowSvg = renderAnimatedFlowSvg;
