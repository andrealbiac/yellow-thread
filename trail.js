/**
 * Mouse trail effect with spring physics
 * Creates an SVG path that follows the cursor with smooth, spring-like motion
 */

(function () {
  const numPoints = 24;
  const lerpFactor = 0.32; // each point moves this fraction toward its target (no overshoot)

  const points = [];
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let isMouseOver = false;

  // Create SVG overlay
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "mouse-trail");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  document.body.appendChild(svg);

  // Variable-width trail: one path segment per pair of points (thin at tips, thick in middle)
  const minStroke = 2;
  const maxStroke = 14;
  const segments = [];
  for (let i = 0; i < numPoints - 1; i++) {
    const seg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    seg.setAttribute("fill", "none");
    seg.setAttribute("stroke", "#095599");
    seg.setAttribute("stroke-linecap", "round");
    seg.setAttribute("stroke-linejoin", "round");
    svg.appendChild(seg);
    segments.push(seg);
  }

  function widthAt(i) {
    return minStroke + (maxStroke - minStroke) * Math.sin((Math.PI * i) / (numPoints - 1));
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);

    // Initialize or reset points to current positions
    for (let i = 0; i < numPoints; i++) {
      if (!points[i]) {
        points[i] = { x: mouseX, y: mouseY };
      } else {
        points[i].x = mouseX;
        points[i].y = mouseY;
      }
    }
  }

  function initPoints() {
    for (let i = 0; i < numPoints; i++) {
      points[i] = { x: mouseX, y: mouseY };
    }
  }

  function buildVariableWidthPaths() {
    const p = points;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const w = (widthAt(i) + widthAt(i + 1)) / 2;
      seg.setAttribute("stroke-width", String(w));
      seg.setAttribute("d", `M ${p[i].x} ${p[i].y} L ${p[i + 1].x} ${p[i + 1].y}`);
    }
  }

  function animate() {
    const targetX = mouseX;
    const targetY = mouseY;

    for (let i = 0; i < numPoints; i++) {
      const p = points[i];
      const target = i === 0 ? { x: targetX, y: targetY } : points[i - 1];

      // Lerp: smooth follow with no overshoot (no spirals)
      p.x += (target.x - p.x) * lerpFactor;
      p.y += (target.y - p.y) * lerpFactor;
    }

    buildVariableWidthPaths();
    requestAnimationFrame(animate);
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMouseOver) {
      isMouseOver = true;
      initPoints();
    }
  });

  document.addEventListener("mouseenter", () => {
    isMouseOver = true;
  });

  document.addEventListener("mouseleave", () => {
    isMouseOver = false;
  });

  window.addEventListener("resize", resize);

  resize();
  initPoints();
  animate();
})();
