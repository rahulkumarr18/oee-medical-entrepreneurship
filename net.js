/* Hero + Network map: a wide Massachusetts healthcare-innovation map.
   Nodes hold a stable west-to-east geography (Worcester on the left, Boston /
   Cambridge on the right) and only sway gently, so labels stay readable. Pure
   canvas 2D with a light perspective projection, independent X/Y spread, a
   highlighted Worcester-to-Boston route, and label-collision avoidance.
   Honors prefers-reduced-motion with a single static frame. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // west(-x) .. east(+x); north(-y) .. south(+y); z is depth.
  // ldir picks the label direction; 'auto' fans it radially outward.
  var NODES = [
    { x: -0.86, y:  0.02, z:  0.10, label: 'UMass Chan · Worcester', kind: 'hub',       ldir: 'below', key: true },
    { x:  0.74, y:  0.06, z: -0.08, label: 'Boston / Cambridge',      kind: 'hub',       ldir: 'below', key: true },
    { x:  0.92, y: -0.46, z:  0.14, label: 'Harvard Medical',         kind: 'school',    ldir: 'up',   key: true },
    { x:  0.96, y:  0.44, z: -0.18, label: 'Boston University',       kind: 'school',    ldir: 'left' },
    { x:  0.56, y: -0.58, z:  0.04, label: 'Tufts',                   kind: 'school',    ldir: 'up' },
    { x:  0.16, y: -0.80, z: -0.06, label: 'UMass Lowell',            kind: 'school',    ldir: 'up' },
    { x: -0.08, y:  0.74, z:  0.20, label: 'Nucleate',                kind: 'community', ldir: 'below', key: true },
    { x:  0.46, y:  0.76, z:  0.06, label: 'Incubators',              kind: 'community', ldir: 'below' },
    { x: -0.34, y: -0.46, z:  0.30, label: 'Founders',                kind: 'role',      ldir: 'up',    key: true },
    { x: -0.44, y:  0.54, z: -0.24, label: 'Investors',              kind: 'role',      ldir: 'left',  key: true },
    { x: -0.94, y:  0.58, z:  0.02, label: 'Student teams',           kind: 'role',      ldir: 'below' },
    { x: -0.60, y:  0.84, z: -0.14, label: 'Student projects',        kind: 'role',      ldir: 'below' },
    { x:  0.14, y: -0.30, z:  0.34, label: 'Physician-builders',      kind: 'role',      ldir: 'up' }
  ];
  var EDGES = [
    [0,1],[0,5],[0,8],[0,9],[0,10],[0,6],[0,11],[0,12],
    [1,2],[1,3],[1,4],[1,6],[1,7],[1,8],[1,9],
    [8,9],[8,11],[8,10],[6,7],[6,10],[9,7],[4,2],[10,12]
  ];
  var ROUTE = [0, 1]; // the Worcester -> Boston/Cambridge spine

  function init(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var W = 0, H = 0, cx = 0, cy = 0, sx = 1, sy = 1, small = false;
    var target = { rx: 0, ry: 0 }, cur = { rx: 0, ry: 0 }, scrollN = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; if (!W || !H) return;
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W * 0.5; cy = H * 0.47; sx = W * 0.38; sy = H * 0.40;
      small = W < 520;
    }
    if (!reduce) {
      canvas.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        target.ry = ((e.clientX - r.left) / r.width - 0.5) * 0.7;
        target.rx = ((e.clientY - r.top) / r.height - 0.5) * -0.4;
      });
      canvas.addEventListener('pointerleave', function () { target.rx = 0; target.ry = 0; });
      window.addEventListener('scroll', function () { scrollN = Math.min(1, (window.pageYOffset || 0) / 900); }, { passive: true });
    }

    function project(n, i, t, ay, ax) {
      var x0 = n.x, y0 = n.y, z0 = n.z;
      if (!reduce) { y0 += Math.sin(t * 0.0006 + i * 1.7) * 0.025; x0 += Math.cos(t * 0.0005 + i * 1.1) * 0.018; }
      var cY = Math.cos(ay), sY = Math.sin(ay);
      var x1 = x0 * cY - z0 * sY, z1 = x0 * sY + z0 * cY;
      var cX = Math.cos(ax), sX = Math.sin(ax);
      var y1 = y0 * cX - z1 * sX, z2 = y0 * sX + z1 * cX;
      var f = 3.0, s = f / (f - z2);
      return { px: cx + x1 * sx * s, py: cy + y1 * sy * s, s: s, z: z2, dx: x1, dy: y1 };
    }

    function draw(t) {
      if (!W || !H) return;
      cur.rx += (target.rx - cur.rx) * 0.06; cur.ry += (target.ry - cur.ry) * 0.06;
      var ay = (reduce ? 0.02 : Math.sin(t * 0.00016) * 0.13 + scrollN * 0.10) + cur.ry;
      var ax = -0.07 + cur.rx + (reduce ? 0 : Math.sin(t * 0.00011) * 0.05 + scrollN * 0.10);
      ctx.clearRect(0, 0, W, H);
      var P = NODES.map(function (n, i) { return project(n, i, t, ay, ax); });

      // edges, back to front
      var eo = EDGES.map(function (_, i) { return i; }).sort(function (a, b) {
        return (P[EDGES[a][0]].z + P[EDGES[a][1]].z) - (P[EDGES[b][0]].z + P[EDGES[b][1]].z);
      });
      for (var oi = 0; oi < eo.length; oi++) {
        var e = EDGES[eo[oi]], a = P[e[0]], b = P[e[1]];
        var isRoute = (e[0] === ROUTE[0] && e[1] === ROUTE[1]) || (e[0] === ROUTE[1] && e[1] === ROUTE[0]);
        var hub = e[0] === 0 || e[1] === 0 || e[0] === 1 || e[1] === 1;
        var da = Math.max(0.05, Math.min(0.34, (a.s + b.s) / 2 - 0.6));
        if (isRoute) { ctx.strokeStyle = 'rgba(46,211,255,0.55)'; ctx.lineWidth = 2.2; }
        else { ctx.strokeStyle = 'rgba(88,104,234,' + (hub ? da + 0.05 : da) + ')'; ctx.lineWidth = hub ? 1.3 : 1; }
        ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
        if (!reduce) {
          var count = isRoute ? 3 : 1;
          for (var pu = 0; pu < count; pu++) {
            var prog = ((t * (isRoute ? 0.00022 : 0.00015)) + eo[oi] * 0.17 + pu / count) % 1;
            var mx = a.px + (b.px - a.px) * prog, my = a.py + (b.py - a.py) * prog;
            var rr = isRoute ? 6 : 4.5;
            var g = ctx.createRadialGradient(mx, my, 0, mx, my, rr);
            g.addColorStop(0, 'rgba(46,211,255,0.95)'); g.addColorStop(1, 'rgba(46,211,255,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, rr, 0, 6.283); ctx.fill();
            ctx.fillStyle = 'rgba(46,211,255,0.95)'; ctx.beginPath(); ctx.arc(mx, my, isRoute ? 2 : 1.5, 0, 6.283); ctx.fill();
          }
        }
      }

      // nodes, back to front
      var no = NODES.map(function (_, i) { return i; }).sort(function (a, b) { return P[a].z - P[b].z; });
      var baseR = small ? 7 : 5.5, hubR = small ? 11 : 9;
      for (var k = 0; k < no.length; k++) {
        var i = no[k], n = NODES[i], p = P[i];
        var r = (n.kind === 'hub' ? hubR : baseR) * (0.72 + (p.s - 0.72) * 0.9);
        r = Math.max(3, r);
        var near = Math.max(0, Math.min(1, (p.s - 0.7) / 0.5));
        if (n.kind === 'hub') {
          var gg = ctx.createRadialGradient(p.px, p.py, 1, p.px, p.py, r + 14);
          gg.addColorStop(0, 'rgba(46,211,255,0.28)'); gg.addColorStop(1, 'rgba(46,211,255,0)');
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p.px, p.py, r + 14, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 0.5 + 0.5 * near;
        ctx.beginPath(); ctx.arc(p.px, p.py, r, 0, 6.283);
        ctx.fillStyle = n.kind === 'hub' ? '#052049' : (n.kind === 'school' ? '#FFFFFF' : '#5868EA'); ctx.fill();
        ctx.lineWidth = n.kind === 'school' ? 2 : 1.4;
        ctx.strokeStyle = n.kind === 'hub' ? '#2ED3FF' : (n.kind === 'school' ? '#5868EA' : 'rgba(255,255,255,0.85)');
        ctx.stroke(); ctx.globalAlpha = 1;
        p.r = r; p.near = near;
      }

      // labels by importance, with collision avoidance
      ctx.font = (small ? '600 13px' : '600 12.5px') + ' Inter, system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      var placed = [];
      var order = NODES.map(function (_, i) { return i; }).sort(function (a, b) {
        return rank(NODES[b]) - rank(NODES[a]);
      });
      for (var li = 0; li < order.length; li++) {
        var i2 = order[li], n2 = NODES[i2], p2 = P[i2];
        if (small && !n2.key) continue;
        if (p2.near < 0.1) continue;
        var lab = labelPos(n2, p2);
        var w = ctx.measureText(n2.label).width + 8, h = 16;
        var bx = lab.align === 'right' ? lab.x - w : (lab.align === 'center' ? lab.x - w / 2 : lab.x);
        var box = { x: bx, y: lab.y - h / 2, w: w, h: h };
        if (n2.kind !== 'hub' && collides(box, placed)) continue;
        placed.push(box);
        ctx.globalAlpha = Math.min(1, p2.near + 0.3);
        ctx.textAlign = lab.align;
        ctx.lineWidth = 3.2; ctx.strokeStyle = 'rgba(244,247,253,0.92)';
        ctx.strokeText(n2.label, lab.x, lab.y);
        ctx.fillStyle = n2.kind === 'hub' ? '#052049' : '#1B2B48';
        ctx.fillText(n2.label, lab.x, lab.y);
        ctx.globalAlpha = 1;
      }
    }

    function rank(n) { return n.kind === 'hub' ? 3 : (n.key ? 2 : (n.kind === 'school' ? 1 : 0)); }
    function labelPos(n, p) {
      var off = (p.r || 6) + 9;
      if (n.ldir === 'below') return { x: p.px, y: p.py + off + 4, align: 'center' };
      if (n.ldir === 'up')    return { x: p.px, y: p.py - off - 4, align: 'center' };
      if (n.ldir === 'left')  return { x: p.px - off, y: p.py, align: 'right' };
      if (n.ldir === 'right') return { x: p.px + off, y: p.py, align: 'left' };
      var right = p.dx >= 0;                         // auto: fan outward
      return { x: right ? p.px + off : p.px - off, y: p.py, align: right ? 'left' : 'right' };
    }
    function collides(a, list) {
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) return true;
      }
      return false;
    }

    var raf;
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    function start() { resize(); if (reduce) { draw(0); return; } cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduce) draw(0); }, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (reduce) draw(0); });
    start();
  }

  init(document.getElementById('net-canvas'));
  init(document.getElementById('map-canvas'));
})();
