document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
});

const canvas = document.querySelector("canvas");
const cxt = canvas.getContext("2d");

let mouseMoved = false;

const pointer = {
  x: 0.5 * window.innerWidth,
  y: 0.5 * window.innerHeight,
};

const params = {
  pointsNumber: 5,
  widthFactor: 20,
  mousethreshold: 15,
  spring: 0.2,
  friction: 0.5,
};

const trail = new Array(params.pointsNumber);
for (let i = 0; i < params.pointsNumber; i++) {
  trail[i] = {
    x: pointer.x,
    y: pointer.y,
    dx: 0,
    dy: 0,
  };
}
window.addEventListener("click", (e) => {
  updateMousePosition(e.pageX, e.pageY);
});
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

setupCanvas();
update(0);
window.addEventListener("resize", setupCanvas);

function update(t) {
  if (!mouseMoved) {
    pointer.x =
      (0.5 + 0.3 * Math.cos(0.002 * t)) *
      Math.sin(0.005 * t) *
      window.innerWidth;
    pointer.y =
      (0.5 + 0.2 * Math.sin(0.005 * t)) *
      Math.cos(0.01 * t) *
      window.innerHeight;
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
    const xc = 0.5 * (trail[i].x + trail[i + 1].x);
    const yc = 0.5 * (trail[i].y + trail[i + 1].y);
    cxt.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
    cxt.lineWidth = params.widthFactor * (params.pointsNumber - i);
    cxt.stroke();
  }
  cxt.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
  cxt.stroke();

  window.requestAnimationFrame(update);
}

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const navbar = document.querySelector(".nav-links");
const burger = document.querySelector(".burger");
const navLinks = document.querySelectorAll(".nav-links a");

// Toggle mobile menu
burger.addEventListener("click", () => {
  navbar.classList.toggle("active");
  burger.classList.toggle("toggle");
});

// Close menu when clicking a nav link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
    burger.classList.remove("toggle");
  });
});
// Change nav color on scroll
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  const navLinks = document.querySelectorAll(".nav-links a");
  const logo = document.querySelector(".logo h1");
  const burger = document.querySelector(".burger");
  const resumeButton = document.querySelectorAll(".header-button buttons");

  if (window.scrollY > 50) {
    navLinks.forEach((link) => link.classList.add("scrollled"));
    logo.classList.add("scrollled");
    nav.classList.add("scrolled");
    burger.classList.add("scrollled");
    resumeButton.forEach((button) => button.classList.add("scrollled"));
  } else {
    navLinks.forEach((link) => link.classList.remove("scrollled"));
    logo.classList.remove("scrollled");
    nav.classList.remove("scrolled");
    burger.classList.remove("scrollled");
    resumeButton.forEach((button) => button.classList.remove("scrollled"));
  }
});

// page transition
if (navigation.addEventListener) {
  navigation.addEventListener("navigate", (event) => {
    if (!event.destination.url.includes(document.location.origin)) {
      return;
    }

    event.intercept({
      handler: async () => {
        const response = await fetch(event.destination.url);
        const text = await response.text();

        const transition = document.startViewTransition(() => {
          const body = text.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
          document.body.innerHTML = body;

          const title = text.match(/<title[^>]*>(.*?)<\/title>/i)[1];
          document.title = title;
        });

        transition.ready.then(() => {
          window.scrollTo(0, 0);
          initializeLenis();
        });
      },
      scroll: "manual",
    });
  });
}



