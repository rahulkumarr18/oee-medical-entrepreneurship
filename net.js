/* Animated hero: the Massachusetts healthcare-innovation network.
   Vanilla canvas 2D. Nodes drift and react to the pointer; edges carry a
   slow pulse. Honors prefers-reduced-motion with a single static frame. */
(function () {
  var canvas = document.getElementById('net-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  var W = 0, H = 0;

  // positions are fractions of the canvas box; kind sets the look
  var nodes = [
    { x: 0.31, y: 0.52, label: 'UMass Chan',        kind: 'hub' },
    { x: 0.73, y: 0.45, label: 'Boston / Cambridge', kind: 'hub' },
    { x: 0.87, y: 0.25, label: 'Harvard Medical',    kind: 'school' },
    { x: 0.90, y: 0.62, label: 'Boston University',  kind: 'school' },
    { x: 0.72, y: 0.20, label: 'Tufts',              kind: 'school' },
    { x: 0.15, y: 0.27, label: 'UMass Lowell',       kind: 'school' },
    { x: 0.58, y: 0.79, label: 'Nucleate',           kind: 'community' },
    { x: 0.86, y: 0.83, label: 'Incubators',         kind: 'community' },
    { x: 0.46, y: 0.28, label: 'Founders',           kind: 'role' },
    { x: 0.50, y: 0.71, label: 'Investors',          kind: 'role' },
    { x: 0.20, y: 0.80, label: 'Student teams',      kind: 'role' }
  ];
  var edges = [
    [0,1],[0,5],[0,8],[0,9],[0,10],[0,6],
    [1,2],[1,3],[1,4],[1,6],[1,7],[1,8],[1,9],
    [8,9],[8,10],[6,7],[6,10],[9,7],[4,2]
  ];

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    if (!W || !H) return;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  var mouse = { x: -1, y: -1, active: false };
  if (!reduce) {
    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
    });
    canvas.addEventListener('pointerleave', function () { mouse.active = false; });
  }

  function pos(n, i, t) {
    var px = n.x * W, py = n.y * H;
    if (!reduce) {
      px += Math.sin(t * 0.00042 + i * 1.3) * 0.013 * W;
      py += Math.cos(t * 0.00036 + i * 0.9) * 0.013 * H;
      if (mouse.active) {
        var dx = px - mouse.x, dy = py - mouse.y, d = Math.hypot(dx, dy) || 1;
        var infl = Math.max(0, 1 - d / 150);
        px += (dx / d) * infl * 16; py += (dy / d) * infl * 16;
      }
    }
    return [px, py];
  }

  function radius(n) { return n.kind === 'hub' ? 8.5 : 5.5; }

  function draw(t) {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    var P = nodes.map(function (n, i) { return pos(n, i, t); });

    // edges
    for (var e = 0; e < edges.length; e++) {
      var a = P[edges[e][0]], b = P[edges[e][1]];
      var hub = edges[e][0] === 0 || edges[e][1] === 0 || edges[e][0] === 1 || edges[e][1] === 1;
      ctx.strokeStyle = hub ? 'rgba(88,104,234,0.28)' : 'rgba(88,104,234,0.16)';
      ctx.lineWidth = hub ? 1.3 : 1;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      if (!reduce) {
        var prog = ((t * 0.00013) + e * 0.17) % 1;
        var mx = a[0] + (b[0] - a[0]) * prog, my = a[1] + (b[1] - a[1]) * prog;
        ctx.beginPath(); ctx.arc(mx, my, 1.9, 0, 6.283);
        ctx.fillStyle = 'rgba(108,177,242,0.85)'; ctx.fill();
      }
    }

    // nodes
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], p = P[i], r = radius(n);
      if (n.kind === 'hub') {
        var g = ctx.createRadialGradient(p[0], p[1], 1, p[0], p[1], r + 8);
        g.addColorStop(0, 'rgba(88,104,234,0.28)'); g.addColorStop(1, 'rgba(88,104,234,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r + 8, 0, 6.283); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.283);
      if (n.kind === 'hub') { ctx.fillStyle = '#052049'; }
      else if (n.kind === 'school') { ctx.fillStyle = '#FFFFFF'; }
      else { ctx.fillStyle = '#5868EA'; }
      ctx.fill();
      ctx.lineWidth = n.kind === 'school' ? 2 : 1.5;
      ctx.strokeStyle = n.kind === 'hub' ? '#6CB1F2' : (n.kind === 'school' ? '#5868EA' : 'rgba(255,255,255,0.75)');
      ctx.stroke();

      var right = n.x <= 0.6;
      ctx.textAlign = right ? 'left' : 'right';
      var lx = right ? p[0] + r + 7 : p[0] - r - 7;
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; // halo for legibility on gradient
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.strokeText(n.label, lx, p[1]);
      ctx.fillStyle = n.kind === 'hub' ? '#052049' : '#1B2B48';
      ctx.fillText(n.label, lx, p[1]);
    }
  }

  var raf;
  function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
  function start() {
    resize();
    if (reduce) { draw(0); return; }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (reduce) draw(0); }, 120);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (reduce) draw(0); });
  start();
})();
