"use client";
import { useEffect } from "react";

// Scroll-reveal, nav shadow, animated counters, mobile menu,
// plus the "wow" layer: 3D card tilt, magnetic buttons, parallax.
export default function SiteEffects() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // ---- reveal on scroll ----
    const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((e) => io.observe(e));
    cleanups.push(() => io.disconnect());

    // ---- nav shadow ----
    const nav = document.querySelector("nav");
    const onScrollNav = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();
    cleanups.push(() => window.removeEventListener("scroll", onScrollNav));

    // ---- mobile menu ----
    const t = document.getElementById("navtoggle");
    const m = document.getElementById("mobilemenu");
    const toggle = () => {
      if (!m || !t) return;
      const open = m.classList.toggle("open");
      t.setAttribute("aria-expanded", String(open));
    };
    const close = () => {
      if (m && t) {
        m.classList.remove("open");
        t.setAttribute("aria-expanded", "false");
      }
    };
    t?.addEventListener("click", toggle);
    const menuItems = m ? Array.from(m.querySelectorAll("a,button")) : [];
    menuItems.forEach((el) => el.addEventListener("click", close));
    cleanups.push(() => {
      t?.removeEventListener("click", toggle);
      menuItems.forEach((el) => el.removeEventListener("click", close));
    });

    // ---- count-up (pure integers only) ----
    const fmt = (n: number) => n.toLocaleString("fr-FR");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          obs.unobserve(e.target);
          const el = e.target as HTMLElement;
          const raw = (el.textContent || "").trim();
          if (!/^\d[\d\s]*$/.test(raw)) return;
          const target = parseInt(raw.replace(/\s/g, ""), 10);
          const dur = 1000;
          const t0 = performance.now();
          el.textContent = "0";
          const step = (tm: number) => {
            const p = Math.min(1, (tm - t0) / dur);
            el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }),
      { threshold: 0.5 }
    );
    document.querySelectorAll(".stats .n").forEach((el) => obs.observe(el));
    cleanups.push(() => obs.disconnect());

    // ---- "wow" effects: only on hover-capable devices, off if reduced motion ----
    const canHover = window.matchMedia("(hover: hover)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (canHover && !reduced) {
      // 3D card tilt
      const cards = document.querySelectorAll<HTMLElement>(".pcard, .aud, .ncard");
      cards.forEach((card) => {
        const move = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`;
        };
        const leave = () => { card.style.transform = ""; };
        card.addEventListener("mousemove", move);
        card.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", move);
          card.removeEventListener("mouseleave", leave);
        });
      });

      // magnetic buttons
      const btns = document.querySelectorAll<HTMLElement>(".btn");
      btns.forEach((btn) => {
        const move = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const mx = e.clientX - (r.left + r.width / 2);
          const my = e.clientY - (r.top + r.height / 2);
          btn.style.transform = `translate(${(mx * 0.28).toFixed(1)}px, ${(my * 0.4).toFixed(1)}px)`;
        };
        const leave = () => { btn.style.transform = ""; };
        btn.addEventListener("mousemove", move);
        btn.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          btn.removeEventListener("mousemove", move);
          btn.removeEventListener("mouseleave", leave);
        });
      });
    }

    // ---- parallax on the hero atom watermark ----
    if (!reduced) {
      const mark = document.querySelector<HTMLElement>(".hero-mark");
      let ticking = false;
      const onScrollP = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          if (mark) mark.style.setProperty("--hy", `${(-window.scrollY * 0.12).toFixed(1)}px`);
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScrollP, { passive: true });
      onScrollP();
      cleanups.push(() => window.removeEventListener("scroll", onScrollP));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
  return null;
}
