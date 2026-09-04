/* Nupur Parmar — Portfolio | vanilla JS + GSAP ScrollTrigger + Lenis */
(function () {
    "use strict";

    gsap.registerPlugin(ScrollTrigger);
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Lenis smooth scroll ---------- */
    var lenis = null;
    if (!reduceMotion && typeof Lenis !== "undefined") {
        lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    }

    function scrollToTarget(target) {
        var el = document.querySelector(target);
        if (!el) return;
        if (lenis) { lenis.scrollTo(el, { offset: -20 }); }
        else { el.scrollIntoView({ behavior: "smooth" }); }
    }

    /* ---------- Anchor links ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            var href = link.getAttribute("href");
            if (href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                closeMenu();
                scrollToTarget(href);
            }
        });
    });

    /* ---------- Preloader + hero reveal ---------- */
    var body = document.body;
    var preloader = document.getElementById("preloader");
    var count = document.getElementById("preloader-count");
    var bar = document.getElementById("preloader-bar");

    function heroIntro() {
        if (reduceMotion) {
            gsap.set(".hero__line-inner", { y: 0 });
            gsap.set("[data-hero-fade]", { opacity: 1, y: 0 });
            return;
        }
        var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(".hero__line-inner", { y: 0, duration: 1.25, stagger: 0.13 }, 0.1)
          .to("[data-hero-fade]", { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.55);
    }

    if (reduceMotion) {
        preloader.style.display = "none";
        body.removeAttribute("data-loading");
        heroIntro();
    } else {
        var progress = { value: 0 };
        gsap.to(progress, {
            value: 100,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: function () {
                var v = Math.round(progress.value);
                count.textContent = (v < 10 ? "0" : "") + v;
                bar.style.width = v + "%";
            },
            onComplete: function () {
                gsap.to(preloader, {
                    yPercent: -100,
                    duration: 0.9,
                    ease: "power4.inOut",
                    onComplete: function () { preloader.style.display = "none"; }
                });
                body.removeAttribute("data-loading");
                heroIntro();
            }
        });
    }

    /* ---------- Hero parallax ---------- */
    if (!reduceMotion) {
        gsap.to("#hero-bg-word", {
            xPercent: -14,
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 }
        });
        gsap.to("#hero-visual", {
            y: -60,
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 }
        });

        var hero = document.querySelector(".hero");
        var frame = document.querySelector("[data-tilt]");
        var badge = document.querySelector("[data-tilt-badge]");
        hero.addEventListener("mousemove", function (e) {
            var x = (e.clientX / window.innerWidth - 0.5);
            var y = (e.clientY / window.innerHeight - 0.5);
            gsap.to(frame, { rotate: 2.5 + x * 3, x: x * 18, y: y * 14, duration: 0.8, ease: "power2.out" });
            gsap.to(badge, { x: x * -24, y: y * -18, duration: 1, ease: "power2.out" });
        });
    }

    /* ---------- Scroll reveals ---------- */
    if (!reduceMotion) {
        document.querySelectorAll("[data-reveal]").forEach(function (el) {
            gsap.to(el, {
                opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 86%" }
            });
        });
        document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
            gsap.to(group.children, {
                opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09,
                scrollTrigger: { trigger: group, start: "top 84%" }
            });
        });
        gsap.utils.toArray(".contact__title-line > span").forEach(function (span, i) {
            gsap.from(span, {
                yPercent: 110, duration: 1.1, ease: "power4.out", delay: i * 0.1,
                scrollTrigger: { trigger: ".contact__title", start: "top 82%" }
            });
        });
        gsap.utils.toArray(".step").forEach(function (step) {
            ScrollTrigger.create({
                trigger: step, start: "top 80%",
                onEnter: function () { step.classList.add("is-inview"); }
            });
        });
    } else {
        document.querySelectorAll(".step").forEach(function (s) { s.classList.add("is-inview"); });
    }

    /* ---------- Stat counters ---------- */
    document.querySelectorAll(".stat__count").forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count"), 10);
        if (reduceMotion) { el.textContent = target; return; }
        ScrollTrigger.create({
            trigger: el, start: "top 88%", once: true,
            onEnter: function () {
                var obj = { v: 0 };
                gsap.to(obj, {
                    v: target, duration: 1.6, ease: "power2.out",
                    onUpdate: function () { el.textContent = Math.round(obj.v); }
                });
            }
        });
    });

    /* ---------- Header behaviour ---------- */
    var header = document.getElementById("site-header");
    var lastY = 0;
    function onScroll(y) {
        header.classList.toggle("is-solid", y > 60);
        if (y > lastY && y > 220 && !menuOpen) { header.classList.add("is-hidden"); }
        else { header.classList.remove("is-hidden"); }
        lastY = y;
    }
    if (lenis) { lenis.on("scroll", function (e) { onScroll(e.scroll); }); }
    else { window.addEventListener("scroll", function () { onScroll(window.scrollY); }, { passive: true }); }

    /* ---------- Active nav link ---------- */
    var navLinks = document.querySelectorAll(".site-nav__link");
    var sectionMap = {};
    navLinks.forEach(function (l) { sectionMap[l.getAttribute("href").slice(1)] = l; });
    ["home", "about", "services", "work", "process", "contact"].forEach(function (id) {
        var section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
            trigger: section, start: "top 45%", end: "bottom 45%",
            onToggle: function (self) {
                if (self.isActive) {
                    navLinks.forEach(function (l) { l.classList.remove("is-active"); });
                    if (sectionMap[id]) sectionMap[id].classList.add("is-active");
                }
            }
        });
    });

    /* ---------- Mobile menu ---------- */
    var menuOpen = false;
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu");

    function closeMenu() {
        if (!menuOpen) return;
        menuOpen = false;
        toggle.classList.remove("is-open");
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        if (lenis) lenis.start();
    }
    toggle.addEventListener("click", function () {
        menuOpen = !menuOpen;
        toggle.classList.toggle("is-open", menuOpen);
        menu.classList.toggle("is-open", menuOpen);
        toggle.setAttribute("aria-expanded", String(menuOpen));
        menu.setAttribute("aria-hidden", String(!menuOpen));
        if (lenis) { menuOpen ? lenis.stop() : lenis.start(); }
        if (menuOpen) {
            menu.querySelectorAll(".mobile-menu__link").forEach(function (link, i) {
                link.style.transitionDelay = 0.15 + i * 0.06 + "s";
            });
        }
    });

    /* ---------- Custom cursor ---------- */
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine && !reduceMotion) {
        var cursor = document.getElementById("cursor");
        var dot = document.getElementById("cursor-dot");
        var label = document.getElementById("cursor-label");
        var cx = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3.out" });
        var cy = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3.out" });
        var dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
        var dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
        window.addEventListener("mousemove", function (e) {
            cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY);
        });
        document.querySelectorAll("[data-cursor]").forEach(function (el) {
            var mode = el.getAttribute("data-cursor");
            el.addEventListener("mouseenter", function () {
                cursor.classList.add("is-hover");
                if (mode === "view") { cursor.classList.add("is-view"); label.textContent = "View"; }
            });
            el.addEventListener("mouseleave", function () {
                cursor.classList.remove("is-hover", "is-view");
            });
        });
    }

    /* ---------- Magnetic buttons ---------- */
    if (fine && !reduceMotion) {
        document.querySelectorAll("[data-magnetic]").forEach(function (el) {
            el.addEventListener("mousemove", function (e) {
                var r = el.getBoundingClientRect();
                var x = e.clientX - r.left - r.width / 2;
                var y = e.clientY - r.top - r.height / 2;
                gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: "power2.out" });
            });
            el.addEventListener("mouseleave", function () {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
            });
        });
    }

    /* ---------- Back to top + footer year ---------- */
    document.getElementById("back-to-top").addEventListener("click", function () {
        if (lenis) { lenis.scrollTo(0); } else { window.scrollTo({ top: 0, behavior: "smooth" }); }
    });
    document.getElementById("footer-year").textContent = new Date().getFullYear();
})();