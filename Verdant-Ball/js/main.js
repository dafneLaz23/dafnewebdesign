(function () {
  "use strict";
  var d = document, root = d.documentElement, $$ = function (s) { return d.querySelectorAll(s); };
  root.classList.remove("no-js");
  root.classList.add("js");

  /* Mobile nav: button, Esc, outside click */
  var tog = d.querySelector("[data-nav-toggle]");
  if (tog) {
    var setNav = function (open) {
      d.body.classList.toggle("nav-open", open);
      tog.setAttribute("aria-expanded", open);
    };
    tog.addEventListener("click", function () { setNav(!d.body.classList.contains("nav-open")); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
    d.addEventListener("click", function (e) {
      var nav = d.querySelector(".primary-nav");
      if (d.body.classList.contains("nav-open") && !nav.contains(e.target) && !tog.contains(e.target)) setNav(false);
    });
  }

  /* Header shadow once the page scrolls */
  var onScroll = function () { d.body.classList.toggle("is-scrolled", window.scrollY > 10); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Past Work filter */
  var gallery = d.querySelector("[data-gallery]");
  if (gallery) {
    $$(".js-only").forEach(function (el) { el.classList.remove("js-only"); });
    $$("[data-filter-input]").forEach(function (input) {
      input.addEventListener("change", function () { gallery.setAttribute("data-filter", input.value); });
    });
  }

  /* Before/after slider */
  $$("[data-before-after]").forEach(function (w) {
    var r = w.querySelector('input[type="range"]');
    var set = function () { w.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  });

  /* Count-up stats */
  var countUp = function (el) {
    var end = +el.getAttribute("data-count"), t0 = null;
    var step = function (t) {
      t0 = t0 || t;
      var p = Math.min((t - t0) / 1600, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* Scroll reveal + counters */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = $$(".reveal, [data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("is-in");
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.2 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Appointment date: no past days, no Sundays */
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var now = new Date();
  $$("[data-date]").forEach(function (inp) {
    inp.min = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
    inp.addEventListener("change", function () {
      var sun = inp.value && new Date(inp.value + "T12:00").getDay() === 0;
      inp.setCustomValidity(sun ? "We're closed Sundays. Please pick Mon-Sat." : "");
      if (sun) inp.reportValidity();
    });
  });

  /* Estimate forms: ?service= pre-fill, validation, mailto handoff */
  var service = new URLSearchParams(location.search).get("service");
  $$("[data-estimate-form]").forEach(function (form) {
    var sel = form.querySelector('select[name="service"]');
    if (service && sel && sel.querySelector('option[value="' + service + '"]')) sel.value = service;

    form.addEventListener("input", function (e) { e.target.classList.remove("is-invalid"); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = form.querySelectorAll(":invalid");
      if (bad.length) {
        bad.forEach(function (el) { el.classList.add("is-invalid"); });
        bad[0].focus();
        bad[0].reportValidity();
        return;
      }
      var lines = [], subj = ["Estimate request"];
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        if (!el.name || !el.value) return;
        var lab = form.querySelector('label[for="' + el.id + '"]');
        var val = el.tagName === "SELECT" ? el.options[el.selectedIndex].text : el.value;
        lines.push((lab ? lab.textContent.replace(/\(optional\)|\*/g, "").trim() : el.name) + ": " + val);
        if (/service|address|date/.test(el.name)) subj.push(val);
      });
      location.href = "mailto:hello@verdantvalley-example.com?subject=" +
        encodeURIComponent(subj.join(" - ")) + "&body=" + encodeURIComponent(lines.join("\n"));
      setTimeout(function () { location.href = "thank-you.html"; }, 400);
    });
  });
})();
