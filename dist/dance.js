// A floating, draggable couple. Scrolling smoothly controls their dance.
function setupSizing(element) {
  const sizes = ["small", "medium", "large"];
  const smaller = element.querySelector("#couple-smaller");
  const larger = element.querySelector("#couple-larger");
  let size = 1;
  try {
    const saved = sizes.indexOf(localStorage.getItem("wedding-float-size"));
    if (saved !== -1) size = saved;
  } catch {
    /* Size controls also work when storage is unavailable. */
  }
  const apply = () => {
    element.dataset.size = sizes[size];
    smaller.disabled = size === 0;
    larger.disabled = size === sizes.length - 1;
    try {
      localStorage.setItem("wedding-float-size", sizes[size]);
    } catch {}
  };
  smaller.addEventListener("click", () => {
    size = Math.max(0, size - 1);
    apply();
  });
  larger.addEventListener("click", () => {
    size = Math.min(sizes.length - 1, size + 1);
    apply();
  });
  apply();
}
function setupDragging(element, reduced) {
  let point = null;
  let drag = null;
  const position = { x: 0, y: 0 };
  const clamp = (x, y) => ({
    x: Math.max(8, Math.min(x, window.innerWidth - element.offsetWidth - 8)),
    y: Math.max(88, Math.min(y, window.innerHeight - element.offsetHeight - 8)),
  });
  const render = () => {
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
  };
  let moveX, moveY;
  const anchor = () => {
    if (point) return;
    const rect = element.getBoundingClientRect();
    element.classList.add("user-positioned");
    point = clamp(rect.left, rect.top);
    Object.assign(position, point);
    element.style.right = "auto";
    element.style.bottom = "auto";
    render();
    if (window.gsap && !reduced) {
      moveX = gsap.quickTo(position, "x", {
        duration: 0.16,
        ease: "power2.out",
        onUpdate: render,
      });
      moveY = gsap.quickTo(position, "y", {
        duration: 0.16,
        ease: "power2.out",
        onUpdate: render,
      });
    }
  };
  const move = (x, y, immediate = false) => {
    point = clamp(x, y);
    if (moveX && !immediate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      moveX(point.x);
      moveY(point.y);
    } else {
      if (moveX) {
        moveX.tween.pause();
        moveY.tween.pause();
      }
      Object.assign(position, point);
      render();
    }
  };
  element.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag || event.target.closest("button,a,input,select,textarea"))
      return;
    event.preventDefault();
    anchor();
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: position.x,
      startY: position.y,
    };
    element.setPointerCapture(event.pointerId);
    element.classList.add("is-dragging");
    element.focus({ preventScroll: true });
  });
  element.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    move(
      drag.startX + event.clientX - drag.x,
      drag.startY + event.clientY - drag.y,
      true,
    );
  });
  const finish = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    element.classList.remove("is-dragging");
    if (element.hasPointerCapture(event.pointerId))
      element.releasePointerCapture(event.pointerId);
  };
  element.addEventListener("pointerup", finish);
  element.addEventListener("pointercancel", finish);
  element.addEventListener("lostpointercapture", finish);
  element.addEventListener("keydown", (event) => {
    if (event.target.closest("button")) return;
    const directions = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (!directions[event.key]) return;
    event.preventDefault();
    anchor();
    const step = event.shiftKey ? 32 : 12;
    move(
      point.x + directions[event.key][0] * step,
      point.y + directions[event.key][1] * step,
    );
  });
  window.addEventListener("resize", () => {
    if (point) move(point.x, point.y, true);
  });
  new ResizeObserver(() => {
    if (point) move(point.x, point.y, true);
  }).observe(element);
}
(() => {
  const section = document.querySelector(".floating-couple");
  if (!section) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  setupSizing(section);
  setupDragging(section, reduced);
  const toggle = section.querySelector("#companion-toggle");
  // Every visit starts with the full couple and live countdown visible.
  let minimized = false, closed = false;
  const apply = () => {
    section.classList.toggle("is-minimized", minimized);
    section.hidden = closed;
    toggle.textContent = minimized ? "+" : "−";
    toggle.setAttribute("aria-expanded", String(!minimized));
    toggle.setAttribute(
      "aria-label",
      minimized ? "Expand countdown companion" : "Minimize countdown companion",
    );
    try {
      localStorage.setItem(
        "wedding-companion",
        JSON.stringify({ minimized, closed }),
      );
    } catch {}
  };
  toggle.addEventListener("click", () => {
    minimized = !minimized;
    apply();
  });
  section.querySelector("#companion-close").addEventListener("click", () => {
    closed = true;
    apply();
    document.getElementById("show-companion").focus({ preventScroll: true });
  });
  document.getElementById("show-companion").addEventListener("click", () => {
    closed = false;
    minimized = false;
    apply();
  });
  apply();
  // Keep it visible in every chapter; dock above the form while responding.
  const response=document.getElementById('rsvp');
  new IntersectionObserver(entries=>section.classList.toggle('is-response-docked',entries[0].isIntersecting),{threshold:0}).observe(response);
  response.addEventListener('focusin',event=>{
    if(event.target.matches('input,select,textarea')&&innerWidth<701)
      requestAnimationFrame(()=>event.target.scrollIntoView({block:'center',behavior:'smooth'}));
  });
  if (reduced || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // Animate numeric poses and render native SVG transforms in each limb's local
  // coordinate space. Pivots remain stable at every responsive SVG size.
  const parts = {};
  const origin = (selector, value) => {
    const [pivotX, pivotY] = value.split(" ").map(Number);
    parts[selector] = {
      node: section.querySelector(selector),
      pivotX,
      pivotY,
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      skewX: 0,
    };
  };
  origin("#bride-left-arm", "-20 -100");
  origin("#bride-right-arm", "22 -101");
  origin("#groom-left-arm", "-29 -101");
  origin("#groom-right-arm", "26 -103");
  origin("#bride-skirt", "0 -45");
  origin("#bride-veil", "4 -157");
  origin("#groom-left-leg", "-15 28");
  origin("#groom-right-leg", "16 28");
  origin("#bride-body", "0 130");
  origin("#groom-body", "0 140");
  origin("#bride-turn", "0 0");
  origin("#bride-position", "0 0");
  origin("#groom-position", "0 0");
  const render = () => {
    if (section.hidden || section.classList.contains("is-suspended")) return;
    Object.values(parts).forEach(
      ({ node, pivotX, pivotY, x, y, rotation, scaleX, skewX }) => {
        node.setAttribute(
          "transform",
          `translate(${x} ${y}) translate(${pivotX} ${pivotY}) rotate(${rotation}) skewX(${skewX}) scale(${scaleX} 1) translate(${-pivotX} ${-pivotY})`,
        );
      },
    );
  };
  render();
  const dance = gsap.timeline({
    paused: true,
    repeat: -1,
    onUpdate: render,
    defaults: { ease: "sine.inOut" },
  });
  // Step together, lift their hands, then let the bride turn under his arm.
  dance
    .to(parts["#bride-position"], { x: 16, y: -5, duration: 0.5 }, 0)
    .to(parts["#groom-position"], { x: 16, y: -5, duration: 0.5 }, 0)
    .to(parts["#bride-body"], { rotation: -3, duration: 0.5 }, 0)
    .to(parts["#groom-body"], { rotation: -3, duration: 0.5 }, 0)
    .to(parts["#bride-skirt"], { rotation: 6, duration: 0.5 }, 0)
    .to(parts["#groom-left-leg"], { rotation: 8, duration: 0.5 }, 0)
    .to(parts["#groom-right-leg"], { rotation: -6, duration: 0.5 }, 0)
    .to(parts["#bride-position"], { x: 45, y: 0, duration: 0.5 }, 0.5)
    .to(parts["#groom-position"], { x: 6, y: 0, duration: 0.5 }, 0.5)
    .to(parts["#groom-right-arm"], { rotation: -64, duration: 0.5 }, 0.5)
    .to(parts["#bride-left-arm"], { rotation: 78, duration: 0.5 }, 0.5)
    .to(parts["#bride-right-arm"], { rotation: -30, duration: 0.5 }, 0.5)
    .to(parts["#bride-turn"], { scaleX: 0.14, rotation: 5, duration: 0.4 }, 1)
    .to(parts["#bride-veil"], { rotation: -18, duration: 0.4 }, 1)
    .to(parts["#bride-skirt"], { rotation: -12, skewX: 8, duration: 0.4 }, 1)
    .to(parts["#bride-turn"], { scaleX: 1, rotation: 0, duration: 0.45 }, 1.4)
    .to(parts["#bride-skirt"], { rotation: 10, skewX: 0, duration: 0.45 }, 1.4)
    .to(parts["#bride-veil"], { rotation: 12, duration: 0.45 }, 1.4)
    .to(parts["#bride-position"], { x: 0, duration: 0.6 }, 1.85)
    .to(parts["#groom-position"], { x: 0, duration: 0.6 }, 1.85)
    .to(parts["#groom-right-arm"], { rotation: 0, duration: 0.6 }, 1.85)
    .to(parts["#bride-left-arm"], { rotation: 0, duration: 0.6 }, 1.85)
    .to(parts["#bride-right-arm"], { rotation: 0, duration: 0.6 }, 1.85)
    .to(parts["#bride-body"], { rotation: 4, duration: 0.55 }, 1.85)
    .to(parts["#groom-body"], { rotation: 4, duration: 0.55 }, 1.85)
    .to(parts["#bride-skirt"], { rotation: -8, duration: 0.55 }, 1.85)
    .to(parts["#groom-left-leg"], { rotation: -6, duration: 0.55 }, 1.85)
    .to(parts["#groom-right-leg"], { rotation: 8, duration: 0.55 }, 1.85)
    .to(parts["#bride-position"], { x: -15, y: -5, duration: 0.55 }, 2.4)
    .to(parts["#groom-position"], { x: -15, y: -5, duration: 0.55 }, 2.4)
    .to(parts["#bride-body"], { rotation: -4, duration: 0.55 }, 2.4)
    .to(parts["#groom-body"], { rotation: -4, duration: 0.55 }, 2.4)
    .to(parts["#bride-skirt"], { rotation: 6, duration: 0.55 }, 2.4)
    .to(parts["#groom-left-leg"], { rotation: 6, duration: 0.55 }, 2.4)
    .to(parts["#groom-right-leg"], { rotation: -6, duration: 0.55 }, 2.4)
    .to(parts["#bride-position"], { x: -25, y: 0, duration: 0.65 }, 2.95)
    .to(parts["#groom-position"], { x: 4, y: 0, duration: 0.65 }, 2.95)
    .to(parts["#bride-body"], { rotation: 13, duration: 0.65 }, 2.95)
    .to(parts["#groom-body"], { rotation: 7, duration: 0.65 }, 2.95)
    .to(parts["#bride-skirt"], { rotation: -10, duration: 0.65 }, 2.95)
    .to(parts["#bride-veil"], { rotation: -6, duration: 0.65 }, 2.95)
    .to(parts["#bride-left-arm"], { rotation: -12, duration: 0.65 }, 2.95)
    .to(parts["#groom-right-arm"], { rotation: 12, duration: 0.65 }, 2.95);
  // Return to the first pose so each dance cycle blends into the next.
  Object.values(parts).forEach((part) =>
    dance.to(
      part,
      { x: 0, y: 0, rotation: 0, scaleX: 1, skewX: 0, duration: 0.65 },
      3.6,
    ),
  );
  const motion = gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(dance, {
      totalTime: dance.duration() * 5,
      ease: "none",
      scrollTrigger: {
        id: "wedding-dance",
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
  });
  window.addEventListener("pagehide", () => motion.revert());
  document.addEventListener(
    "wedding:reveal",
    () => gsap.from(section, { opacity: 0, duration: 0.7 }),
    { once: true },
  );
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });
  if (document.fonts) document.fonts.ready.then(refresh);
})();
