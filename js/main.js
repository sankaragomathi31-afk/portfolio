/* =========================================================
   Sankara Gomathi — Portfolio
   js/main.js — core site logic (no animation here)
   ========================================================= */

/* ---------- CONFIG ----------
   Paste your Google Apps Script Web App URL here.
   See README.md > "Google Sheets contact form" for steps. */
const CONFIG = {
  APPS_SCRIPT_URL: "PASTE_YOUR_APPS_SCRIPT_URL_HERE",
};

(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const links = document.getElementById("links");

  if (burger && links) {
    burger.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.textContent = isOpen ? "✕" : "☰";
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.textContent = "☰";
      });
    });
  }

  /* ---------- Back to top ---------- */
  const topBtn = document.getElementById("top");
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- Contact form → Google Sheets ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("status");
  const sendBtn = document.getElementById("sendBtn");

  if (!form) return;

  // Floating-label state: mark inputs that have a value
  form.querySelectorAll("input, textarea").forEach((field) => {
    const sync = () => field.classList.toggle("filled", field.value.length > 0);
    field.addEventListener("input", sync);
    field.addEventListener("blur", sync);
  });

  const isConfigured = CONFIG.APPS_SCRIPT_URL.startsWith("http");

  function showStatus(message, type) {
    status.textContent = message;
    status.dataset.type = type;
    status.classList.add("show");
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    if (!data.name || !data.email || !data.message) {
      return showStatus("Please fill in all fields.", "error");
    }
    if (!isValidEmail(data.email)) {
      return showStatus("Please enter a valid email address.", "error");
    }

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";

    try {
      if (isConfigured) {
        // Apps Script web apps don't return CORS headers for normal POSTs,
        // so we use no-cors with a text/plain body. The request still reaches the sheet.
        await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        });
        showStatus("Thanks! Your message has been received.", "success");
        form.reset();
        form.querySelectorAll(".filled").forEach((f) => f.classList.remove("filled"));
      } else {
        showStatus(
          "Contact form is not connected yet. Please email sankaragomathi31@gmail.com directly.",
          "error"
        );
      }
    } catch (err) {
      console.error("Contact form error:", err);
      showStatus("Something went wrong. Please email me directly.", "error");
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send message →";
    }
  });
  /* ---------- Project case studies: show only the one that was clicked ---------- */
  const caseEls = [...document.querySelectorAll(".case")];
  const projectLinks = [...document.querySelectorAll('.project[href^="#case-"]')];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function openCase(id, scroll = true) {
    const target = document.getElementById(id);
    if (!target || !target.classList.contains("case")) return;

    caseEls.forEach((el) => {
      const show = el === target;
      el.hidden = !show;
      el.classList.toggle("is-open", show);
    });
    projectLinks.forEach((link) => {
      link.classList.toggle("is-current", link.getAttribute("href") === "#" + id);
    });

    document.dispatchEvent(new CustomEvent("case:open", { detail: { id } }));
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();

    if (scroll) {
      const y = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }

  function closeCases(scroll = true) {
    caseEls.forEach((el) => {
      el.hidden = true;
      el.classList.remove("is-open");
    });
    projectLinks.forEach((link) => link.classList.remove("is-current"));

    if (scroll) {
      const projects = document.getElementById("projects");
      if (projects) projects.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  }

  // Keep the URL and the visible case study in sync (back/forward buttons, direct links)
  function syncFromHash() {
    const hash = location.hash.slice(1);
    if (hash.startsWith("case-")) openCase(hash, false);
    else if (hash === "projects") closeCases(false);
  }

  projectLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").slice(1);
      history.pushState(null, "", "#" + id);
      openCase(id);
    });
  });

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      history.pushState(null, "", "#projects");
      closeCases();
    });
  });

  window.addEventListener("popstate", syncFromHash);
  window.addEventListener("hashchange", syncFromHash);
  syncFromHash();

  /* ---------- Cura Care steps: highlight the step you are reading ---------- */
  const stepLinks = [...document.querySelectorAll(".case-steps a")];
  const stepSections = stepLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && stepSections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          stepLinks.forEach((link) =>
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id)
          );
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    stepSections.forEach((section) => spy.observe(section));
  }

})();