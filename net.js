/* Hero centerpiece: a pseudo-3D Massachusetts healthcare-innovation network.
   Nodes live in 3D, slowly rotate, float, and parallax to the pointer and to
   scroll; edges carry a cyan pulse. Pure canvas 2D with a hand-rolled
   perspective projection, so it is light and GitHub Pages friendly.
   Honors prefers-reduced-motion with a single static frame. */
(function () {
  var canvas = document.getElementById('net-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  var W = 0, H = 0, cx = 0, cy = 0, scale = 1;

  // 3D coordinates in roughly [-1,1]. kind drives the look.
  var N = [
    { x: -0.52, y:  0.02, z:  0.10, label: 'UMass Chan',        kind: 'hub' },
    { x:  0.58, y: -0.04, z: -0.16, label: 'Boston / Cambridge', kind: 'hub' },
    { x:  0.86, y: -0.42, z:  0.18, label: 'Harvard Medical',    kind: 'school' },
    { x:  0.90, y:  0.34, z: -0.24, label: 'Boston University',  kind: 'school' },
    { x:  0.54, y: -0.62, z: -0.08, label: 'Tufts',              kind: 'school' },
    { x: -0.86, y: -0.40, z: -0.18, label: 'UMass Lowell',       kind: 'school' },
    { x:  0.16, y:  0.66, z:  0.26, label: 'Nucleate',           kind: 'community' },
    { x:  0.74, y:  0.62, z:  0.12, label: 'Incubators',         kind: 'community' },
    { x: -0.06, y: -0.40, z:  0.34, label: 'Founders',           kind: 'role' },
    { x:  0.06, y:  0.44, z: -0.34, label: 'Investors',          kind: 'role' },
    { x: -0.70, y:  0.56, z:  0.04, label: 'Student teams',      kind: 'role' },
    { x: -0.26, y: -0.72, z: -0.06, label: 'Physician-builders', kind: 'role' },
    { x: -0.40, y:  0.74, z: -0.30, label: 'Student projects',   kind: 'role' }
  ];
  var E = [
    [0,1],[0,5],[0,8],[0,9],[0,10],[0,6],[0,11],[0,12],
    [1,2],[1,3],[1,4],[1,6],[1,7],[1,8],[1,9],
    [8,9],[8,11],[8,10],[6,7],[6,10],[9,7],[4,2],[10,12],[11,8]
  ];

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    if (!W || !H) return;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2; scale = Math.min(W, H) * 0.34;
  }

  var target = { rx: 0, ry: 0 }, cur = { rx: 0, ry: 0 };
  if (!reduce) {
    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      target.ry = ((e.clientX - r.left) / r.width - 0.5) * 0.9;
      target.rx = ((e.clientY - r.top) / r.height - 0.5) * -0.5;
    });
    canvas.addEventListener('pointerleave', function () { target.rx = 0; target.ry = 0; });
  }
  var scrollN = 0;
  if (!reduce) window.addEventListener('scroll', function () {
    scrollN = Math.min(1, (window.pageYOffset || 0) / 700);
  }, { passive: true });

  function project(p, ay, ax, t, i) {
    var y0 = p.y, z0 = p.z, x0 = p.x;
    if (!reduce) { // gentle float
      y0 += Math.sin(t * 0.0006 + i * 1.7) * 0.03;
      x0 += Math.cos(t * 0.0005 + i * 1.1) * 0.02;
    }
    var cY = Math.cos(ay), sY = Math.sin(ay);
    var x1 = x0 * cY - z0 * sY, z1 = x0 * sY + z0 * cY;
    var cX = Math.cos(ax), sX = Math.sin(ax);
    var y1 = y0 * cX - z1 * sX, z2 = y0 * sX + z1 * cX;
    var f = 2.4, s = f / (f - z2);
    return { sx: cx + x1 * scale * s, sy: cy + y1 * scale * s, depth: s, z: z2 };
  }

  function draw(t) {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    cur.rx += (target.rx - cur.rx) * 0.06;
    cur.ry += (target.ry - cur.ry) * 0.06;
    var ay = (reduce ? 0.5 : t * 0.00013 + scrollN * 0.8) + cur.ry;
    var ax = -0.12 + cur.rx + (reduce ? 0 : scrollN * 0.18);

    var P = N.map(function (p, i) { return project(p, ay, ax, t, i); });

    // edges (back to front)
    var order = E.map(function (e, i) { return i; }).sort(function (a, b) {
      return (P[E[a][0]].z + P[E[a][1]].z) - (P[E[b][0]].z + P[E[b][1]].z);
    });
    for (var oi = 0; oi < order.length; oi++) {
      var e = E[order[oi]], a = P[e[0]], b = P[e[1]];
      var hub = e[0] === 0 || e[1] === 0 || e[0] === 1 || e[1] === 1;
      var da = Math.max(0.06, Math.min(0.36, (a.depth + b.depth) / 2 - 0.55));
      ctx.strokeStyle = 'rgba(88,104,234,' + (hub ? da + 0.06 : da) + ')';
      ctx.lineWidth = hub ? 1.35 : 1;
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      if (!reduce) {
        var prog = ((t * 0.00016) + order[oi] * 0.19) % 1;
        var mx = a.sx + (b.sx - a.sx) * prog, my = a.sy + (b.sy - a.sy) * prog;
        var g = ctx.createRadialGradient(mx, my, 0, mx, my, 5);
        g.addColorStop(0, 'rgba(46,211,255,0.95)'); g.addColorStop(1, 'rgba(46,211,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, 5, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(46,211,255,0.95)'; ctx.beginPath(); ctx.arc(mx, my, 1.6, 0, 6.283); ctx.fill();
      }
    }

    // nodes (back to front)
    var ni = N.map(function (_, i) { return i; }).sort(function (a, b) { return P[a].z - P[b].z; });
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    for (var k = 0; k < ni.length; k++) {
      var i = ni[k], p = P[i], n = N[i];
      var base = n.kind === 'hub' ? 8.5 : 5;
      var r = base * (0.7 + (p.depth - 0.7) * 0.9);
      r = Math.max(2.5, r);
      var near = Math.max(0, Math.min(1, (p.depth - 0.72) / 0.5));
      if (n.kind === 'hub') {
        var gg = ctx.createRadialGradient(p.sx, p.sy, 1, p.sx, p.sy, r + 12);
        gg.addColorStop(0, 'rgba(46,211,255,0.30)'); gg.addColorStop(1, 'rgba(46,211,255,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p.sx, p.sy, r + 12, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 0.45 + 0.55 * near;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, 6.283);
      ctx.fillStyle = n.kind === 'hub' ? '#052049' : (n.kind === 'school' ? '#FFFFFF' : '#5868EA');
      ctx.fill();
      ctx.lineWidth = n.kind === 'school' ? 2 : 1.4;
      ctx.strokeStyle = n.kind === 'hub' ? '#2ED3FF' : (n.kind === 'school' ? '#5868EA' : 'rgba(255,255,255,0.8)');
      ctx.stroke();
      // label
      if (near > 0.12) {
        ctx.globalAlpha = Math.min(1, near + 0.25);
        var right = p.sx <= cx;
        ctx.textAlign = right ? 'left' : 'right';
        var lx = right ? p.sx + r + 7 : p.sx - r - 7;
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(244,247,253,0.9)';
        ctx.strokeText(n.label, lx, p.sy);
        ctx.fillStyle = n.kind === 'hub' ? '#052049' : '#1B2B48';
        ctx.fillText(n.label, lx, p.sy);
      }
      ctx.globalAlpha = 1;
    }
  }

  var raf;
  function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
  function start() { resize(); if (reduce) { draw(0); return; } cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduce) draw(0); }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (reduce) draw(0); });
  start();
})();
