/* =========================================================
   Sankara Gomathi — Portfolio
   js/animation.js — all GSAP motion
   Requires: gsap + ScrollTrigger loaded before this file.
   ========================================================= */

(function () {
  "use strict";

  if (typeof gsap === "undefined") {
    console.warn("GSAP not loaded. Site works without motion.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const dur = (t) => (reduceMotion ? 0 : t); // collapses durations when reduced motion is on

  /* ---------- Helpers ---------- */

  // Split an element's text into characters for a per-letter reveal.
  // Keeps the original text available to screen readers via aria-label.
  // Each word is wrapped in .split-word (nowrap), so words never break mid-word.
  // Each letter is wrapped in .split-char for the animation.
  // Child elements such as <em> are kept, so their styling survives.
  function splitText(el) {
    if (el.dataset.split === "done") return el.querySelectorAll(".split-char");

    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const sourceNodes = [...el.childNodes];
    el.textContent = "";

    const build = (node, target) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            target.appendChild(document.createTextNode(" "));
            return;
          }
          const word = document.createElement("span");
          word.className = "split-word";
          word.setAttribute("aria-hidden", "true");
          [...part].forEach((ch) => {
            const letter = document.createElement("span");
            letter.className = "split-char";
            letter.textContent = ch;
            word.appendChild(letter);
          });
          target.appendChild(word);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        target.appendChild(clone);
        [...node.childNodes].forEach((child) => build(child, clone));
      }
    };

    sourceNodes.forEach((node) => build(node, el));
    el.dataset.split = "done";
    return el.querySelectorAll(".split-char");
  }

  /* ---------- 1. Preloader → hero intro ---------- */

  const preloader = document.getElementById("preloader");
  const barFill = document.getElementById("barFill");
  const pctLabel = document.getElementById("pct");

  function introHero() {
    const heroTitle = document.getElementById("heroTitle");
    const chars = heroTitle ? splitText(heroTitle) : [];
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (preloader) {
      tl.to(preloader, {
        yPercent: -100,
        duration: dur(1),
        ease: "power4.inOut",
        onComplete: () => preloader.remove(),
      });
    }

    tl.from("#profile", { clipPath: "inset(0 0 100% 0 round 18px)", duration: dur(1.2), ease: "power4.inOut" }, "-=0.6")
      .from(chars, { yPercent: 110, opacity: 0, duration: dur(0.9), stagger: 0.02 }, "-=0.9")
      .to("#heroSub", { opacity: 1, y: 0, duration: dur(0.8) }, "-=0.5")
      .from(".cta .btn", { y: 20, opacity: 0, stagger: 0.1, duration: dur(0.7) }, "-=0.5")
      .from("#nav", { yPercent: -100, duration: dur(0.6) }, "-=0.8");
  }

  if (preloader && !reduceMotion) {
    const clipRect = document.getElementById("preClipRect");
    const swash = document.getElementById("preSwash");

    // The SG writes on from left to right, then the white swash draws under it
    const writeTl = gsap.timeline();
    if (clipRect) writeTl.to(clipRect, { attr: { width: 200 }, duration: 1.2, ease: "power2.inOut" });
    if (swash) {
      writeTl.fromTo(swash, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, "-=0.2");
    }

    // The loading percentage runs alongside the writing
    const load = { p: 0 };
    gsap.to(load, {
      p: 100,
      duration: 1.8,
      ease: "power1.inOut",
      onUpdate: () => {
        if (barFill) barFill.style.width = load.p + "%";
        if (pctLabel) pctLabel.textContent = Math.round(load.p) + "%";
      },
      onComplete: () => {
        writeTl.progress(1);
        introHero();
      },
    });
  } else {
    if (preloader) preloader.remove();
    introHero();
  }

  /* ---------- 2. Hero: floating shapes, parallax, mouse-follow ---------- */

  if (!reduceMotion) {
    gsap.from(".hero-visual .tag, .hero-visual .spin-badge", {
      scale: 0.8,
      opacity: 0,
      stagger: 0.15,
      duration: 0.9,
      delay: 1.3,
      ease: "power3.out",
    });
    gsap.to(".tag.t1", { y: -12, repeat: -1, yoyo: true, duration: 3.2, ease: "sine.inOut", delay: 2 });
    gsap.to(".tag.t2", { y: 10, repeat: -1, yoyo: true, duration: 3.8, ease: "sine.inOut", delay: 2 });
    gsap.to(".spin-badge", { y: -8, repeat: -1, yoyo: true, duration: 4, ease: "sine.inOut", delay: 2 });

    gsap.to("#profile", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: true },
    });
  }

  if (finePointer && !reduceMotion) {
    const home = document.getElementById("home");
    const profile = document.getElementById("profile");
    if (home && profile) {
      home.addEventListener("mousemove", (e) => {
        const r = profile.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        gsap.to(profile, {
          rotateY: x * 8,
          rotateX: -y * 8,
          transformPerspective: 900,
          duration: 0.6,
          ease: "power2.out",
        });
      });
    }
  }

  /* ---------- 3. Navbar background, progress bar, active section ---------- */

  const nav = document.getElementById("nav");
  if (nav) {
    ScrollTrigger.create({
      start: 40,
      onToggle: (self) => nav.classList.toggle("scrolled", self.isActive),
    });
  }

  gsap.to("#progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  document.querySelectorAll("section[id]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (!self.isActive) return;
        document.querySelectorAll(".links a").forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === "#" + section.id);
        });
      },
    });
  });

  /* ---------- 4. Scroll reveals ---------- */

  if (!reduceMotion) {
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    gsap.utils.toArray(".stagger").forEach((el, i) => {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        delay: (i % 4) * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    gsap.utils.toArray(".shot").forEach((el) => {
      gsap.from(el, {
        clipPath: "inset(0 0 100% 0 round 18px)",
        duration: 1.2,
        ease: "power4.inOut",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    // Per-letter reveal on section headings
    gsap.utils.toArray(".head h2, #about h2, #contact .contact-title, .case-hero h3").forEach((h) => {
      const chars = splitText(h);
      gsap.from(chars, {
        yPercent: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.015,
        ease: "power3.out",
        scrollTrigger: { trigger: h, start: "top 85%" },
      });
    });
  }

  /* ---------- 5. Process timeline: route draws, a light runs along it, steps light up ---------- */

  const steps = document.getElementById("steps");
  if (steps) {
    const stepEls = gsap.utils.toArray(".step");
    const labels = stepEls.map((s) => s.querySelector(".label"));
    const route = document.getElementById("routePath");
    const runner = document.getElementById("runner");
    const lineScroll = { trigger: steps, start: "top 75%", end: "bottom 45%", scrub: true };

    if (route && runner) {
      const routeLength = route.getTotalLength();
      const progress = { p: 0 };

      // Place the runner on the route at progress p (route is drawn in a 1000 x 540 box)
      const placeRunner = () => {
        const pt = route.getPointAtLength(progress.p * routeLength);
        runner.style.left = pt.x / 10 + "%";
        runner.style.top = pt.y / 5.4 + "%";
      };
      placeRunner();

      if (reduceMotion) {
        route.style.strokeDashoffset = 0;
        runner.style.display = "none";
      } else {
        // The line draws and the runner travels along its tip, in step with the scroll
        gsap.fromTo(route, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: lineScroll });
        gsap.to(progress, { p: 1, ease: "none", onUpdate: placeRunner, scrollTrigger: lineScroll });
      }
    }

    if (!reduceMotion) {
      // Labels rise in as the section comes into view
      gsap.from(labels, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: { trigger: steps, start: "top 70%" },
      });
    }

    // Each step lights up as the runner reaches it
    stepEls.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 60%",
        end: "bottom 40%",
        toggleClass: { targets: step, className: "is-active" },
      });
    });
  }

  /* ---------- 6. Case study timelines ---------- */

  if (!reduceMotion) {
    document.querySelectorAll(".timeline").forEach((tl) => {
      const line = tl.querySelector("[data-line]");
      if (!line) return;
      gsap.to(line, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: tl, start: "top 70%", end: "bottom 60%", scrub: true },
      });
    });
  }

  /* ---------- 7. Count-up stats ---------- */

  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const counter = { value: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          value: target,
          duration: dur(1.6),
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.value) + "+";
          },
        });
      },
    });
  });

  /* ---------- 8. Project cards: 3D tilt, cursor label ---------- */

  const label = document.getElementById("cursorLabel");

  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".project").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        if (label) gsap.to(label, { opacity: 1, duration: 0.2 });
      });

      card.addEventListener("mouseleave", () => {
        if (label) gsap.to(label, { opacity: 0, duration: 0.2 });
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
      });

      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateY: x * 8,
          rotateX: -y * 8,
          transformPerspective: 1000,
          duration: 0.4,
          ease: "power2.out",
        });
        if (label) gsap.to(label, { left: e.clientX, top: e.clientY, duration: 0.3, ease: "power3.out" });
      });
    });
  }

  /* ---------- 9. Magnetic buttons (desktop) ---------- */

  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - r.left - r.width / 2) * 0.25,
          y: (e.clientY - r.top - r.height / 2) * 0.25,
          duration: 0.4,
          ease: "power2.out",
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- 10. Contact status message transition ---------- */

  const status = document.getElementById("status");
  if (status) {
    const observer = new MutationObserver(() => {
      if (status.classList.contains("show") && !reduceMotion) {
        gsap.fromTo(status, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
      }
    });
    observer.observe(status, { attributes: true, attributeFilter: ["class"] });
  }
  /* ---------- 11. Certifications marquee: auto-scrolls, slows on hover ---------- */

  const certTrack = document.getElementById("certTrack");
  const certMarquee = document.getElementById("certMarquee");
  if (certTrack && certMarquee) {
    const originals = [...certTrack.children];
    let certLoop = null;

    function buildCertLoop() {
      if (certLoop) certLoop.kill();
      certTrack.querySelectorAll("[data-clone]").forEach((n) => n.remove());
      gsap.set(certTrack, { x: 0 });

      // Reduced motion: keep it as a normal scrollable row
      if (reduceMotion) return;

      // Clone the cards once so the loop is seamless
      originals.forEach((card) => {
        const copy = card.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        copy.dataset.clone = "";
        certTrack.appendChild(copy);
      });

      const half = certTrack.scrollWidth / 2;
      certLoop = gsap.to(certTrack, {
        x: -half,
        duration: half / 60, // about 60px per second
        ease: "none",
        repeat: -1,
      });
    }

    buildCertLoop();

    if (!reduceMotion) {
      gsap.from(originals, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: certMarquee, start: "top 85%" },
      });

      certMarquee.addEventListener("mouseenter", () => {
        if (certLoop) gsap.to(certLoop, { timeScale: 0.15, duration: 0.6 });
      });
      certMarquee.addEventListener("mouseleave", () => {
        if (certLoop) gsap.to(certLoop, { timeScale: 1, duration: 0.6 });
      });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildCertLoop, 200);
    });
  }
  /* ---------- Case study steps: animate when a case study opens ---------- */

  // A thin accent rule under each step label
  document.querySelectorAll(".cstep-label").forEach((label) => {
    const rule = document.createElement("span");
    rule.className = "cstep-rule";
    label.appendChild(rule);
  });

  const animatedCases = new Set();
  document.addEventListener("case:open", (event) => {
    const id = event.detail.id;
    const root = document.getElementById(id);
    if (!root || animatedCases.has(id)) return;
    animatedCases.add(id);

    if (reduceMotion) return;

    root.querySelectorAll(".cstep").forEach((step) => {
      const label = step.querySelector(".cstep-label");
      const rule = step.querySelector(".cstep-rule");
      const heading = step.querySelector("h4");
      const rest = step.querySelectorAll(":scope > p, :scope > .shot, :scope > .gallery, :scope > .learn-grid");

      const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: "top 85%" } });
      tl.from(label, { x: -24, opacity: 0, duration: 0.7, ease: "power3.out" })
        .from(rule, { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "power3.out" }, "-=0.4")
        .from(heading, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.6")
        .from(rest, { y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, "-=0.6");
    });

    ScrollTrigger.refresh();
  });

})();