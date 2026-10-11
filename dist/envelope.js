// The original CSS paper layers are retained; this controller supports skip and replay.
(() => {
  const scene = document.getElementById("invitation-scene"),
    button = document.getElementById("open-invitation"),
    skip = document.getElementById("skip-intro");
  const background = [
    ...document.querySelectorAll("body > :not(.invitation-scene):not(script)"),
  ];
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let state = "closed",
    floating,
    timeline,
    timeout,
    previousFocus;
  const setState = (s) => {
    state = s;
    scene.dataset.state = s;
  };
  function finish() {
    if (state === "closed") return;
    clearTimeout(timeout);
    timeline?.kill();
    floating?.kill();
    setState("closed");
    scene.hidden = true;
    background.forEach((node) => (node.inert = false));
    document.documentElement.classList.remove("invitation-locked");
    try {
      sessionStorage.setItem("wedding-opened", "true");
    } catch {}
    const target = previousFocus
      ? previousFocus.offsetParent
        ? previousFocus
        : document.getElementById("menu-toggle")
      : document.querySelector(".hero h1");
    if (target.tagName === 'H1') target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    document.dispatchEvent(new Event("wedding:opened"));
    window.ScrollTrigger?.refresh();
  }
  function show(replay = false) {
    if (state !== "closed") return;
    previousFocus = replay ? document.activeElement : null;
    scene
      .querySelectorAll("[style]")
      .forEach((node) => node.removeAttribute("style"));
    scene.style.opacity = "";
    scene.hidden = false;
    background.forEach((node) => (node.inert = true));
    document.documentElement.classList.add("invitation-locked");
    setState("waiting");
    button.disabled = false;
    if (window.gsap && !reduced())
      floating = gsap.to(".envelope-float", {
        y: -9,
        rotation: 0.7,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    button.focus({ preventScroll: true });
  }
  function open() {
    if (state !== "waiting") return;
    setState("opening");
    button.disabled = true;
    scene.focus({ preventScroll: true });
    floating?.kill();
    if (!window.gsap || reduced()) {
      finish();
      return;
    }
    const card = scene.querySelector(".invitation-card");
    timeline = gsap.timeline({ onComplete: finish });
    timeline
      .to(".envelope-float", { y: 0, rotation: 0, duration: 0.3 }, 0)
      .to(".envelope-hint,.scene-intro", { opacity: 0, duration: 0.25 }, 0)
      .to(".intro-keepsake", {x:-45,y:-30,rotation:-18,opacity:0,duration:.75,ease:"power2.in"},.15)
      .to(
        ".wax-seal",
        { y: 30, rotation: 15, autoAlpha: 0, duration: 0.4 },
        0.15,
      )
      .to(
        ".envelope-flap",
        { rotationX: -178, duration: 0.85, ease: "power2.inOut" },
        0.4,
      )
      .set(".envelope-flap", { zIndex: 1 }, 0.9)
      .set(card, { autoAlpha: 1 }, 0.9)
      .to(card, { yPercent: -72, duration: 1, ease: "power3.out" }, 1)
      .to(".card-copy>span", { opacity: 1, duration: 0.5, stagger: 0.1 }, 1.3)
      .set(card, { zIndex: 10 }, 2)
      .to(
        card,
        {
          yPercent: 0,
          scale: Math.max(innerWidth / 250, innerHeight / 160),
          duration: 1.1,
          ease: "power3.inOut",
        },
        2.1,
      )
      .to(
        ".card-copy,.card-monogram,.card-botanical,.card-border",
        { opacity: 0, duration: 0.4 },
        2.3,
      )
      .to(scene, { opacity: 0, duration: 0.45 }, 3.05);
    timeout = setTimeout(finish, 5500); // Recover even if an animation is interrupted.
  }
  button.addEventListener("click", open);
  skip.addEventListener("click", finish);
  document.querySelector(".envelope-hint").addEventListener("click", open);
  document
    .getElementById("replay-invitation")
    .addEventListener("click", () => show(true));
  scene.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      finish();
    }
    if (event.key !== "Tab") return;
    const controls = [button, skip].filter((el) => !el.disabled);
    const index = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[
      (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length
    ].focus();
  });
  window.WeddingEnvelope = {
    show,
    open,
    get state() {
      return state;
    },
  };
  let visited = false;
  try {
    visited = sessionStorage.getItem("wedding-opened") === "true";
  } catch {}
  if (!visited) show();
  else document.dispatchEvent(new Event("wedding:opened"));
})();
