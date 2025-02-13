const canvas = document.querySelector("canvas");
const cxt = canvas.getContext("2d");

let mouseMoved = false;

const params = {
  pointsNumber: 20,
  widthFactor: 10,
  mousethreshold: 0.3,
  spring: 0.25,
  friction: 0.5,
};

// Ensure canvas is set up before using dimensions
setupCanvas();

const pointer = {
  x: 0.5 * canvas.width,
  y: 0.5 * canvas.height,
};

const trail = new Array(params.pointsNumber).fill().map(() => ({
  x: pointer.x,
  y: pointer.y,
  dx: 0,
  dy: 0,
}));

window.addEventListener("click", (e) => updateMousePosition(e.pageX, e.pageY));
window.addEventListener("mousemove", (e) => {
  mouseMoved = true;
  updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", (e) => {
  mouseMoved = true;
  updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

function updateMousePosition(ex, ey) {
  pointer.x = ex;
  pointer.y = ey;
}

window.addEventListener("resize", setupCanvas);
update(0);

function update(t) {
  if (!mouseMoved) {
    pointer.x =
      0.5 * canvas.width + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t) * canvas.width;
    pointer.y =
      0.5 * canvas.height + 0.3 * Math.cos(0.005 * t) * Math.sin(0.01 * t) * canvas.height;
  }

  cxt.clearRect(0, 0, canvas.width, canvas.height);
  
  trail.forEach((p, pIdx) => {
    const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
    const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
    
    p.dx += (prev.x - p.x) * spring;
    p.dy += (prev.y - p.y) * spring;
    p.dx *= params.friction;
    p.dy *= params.friction;
    p.x += p.dx;
    p.y += p.dy;
  });

  // Dynamic gradient
  const gradient = cxt.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgb(243, 5, 152)");
  gradient.addColorStop(1, "rgb(70, 0, 248)");

  cxt.strokeStyle = gradient;
  cxt.lineCap = "round";
  cxt.beginPath();
  cxt.moveTo(trail[0].x, trail[0].y);

  for (let i = 1; i < trail.length - 1; i++) {
    const xc = 0.5 * (trail[i].x + trail[i - 1].x);
    const yc = 0.5 * (trail[i].y + trail[i - 1].y);
    cxt.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
    cxt.lineWidth = params.widthFactor * (params.pointsNumber - i);
  }

  cxt.stroke();
  window.requestAnimationFrame(update);
}

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
