(function () {
  "use strict";
  var d = document, $$ = function (s, r) { return (r || d).querySelectorAll(s); };
  d.documentElement.classList.replace("no-js", "js");

  /* Mobile nav: hamburger, Esc, outside click */
  var tog = d.querySelector("[data-nav-toggle]"), nav = d.querySelector(".primary-nav");
  var closeSubs = function (except) {
    $$(".has-menu.open").forEach(function (li) {
      if (li === except) return;
      li.classList.remove("open");
      li.querySelector(".sub-toggle").setAttribute("aria-expanded", "false");
    });
  };
  var setNav = function (open) {
    d.body.classList.toggle("nav-open", open);
    if (tog) tog.setAttribute("aria-expanded", open);
    if (!open) closeSubs();
  };
  if (tog) tog.addEventListener("click", function () { setNav(!d.body.classList.contains("nav-open")); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
  d.addEventListener("click", function (e) {
    if (nav && !nav.contains(e.target) && (!tog || !tog.contains(e.target))) setNav(false);
  });

  /* Dropdown / mega menu toggles */
  $$(".sub-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.parentNode, open = !li.classList.contains("open");
      closeSubs(li);
      li.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
    });
  });

  var params = new URLSearchParams(location.search);

  /* Gallery filter (all tiles visible without JS) */
  var gallery = d.querySelector("[data-gallery]");
  if (gallery) {
    var apply = function (val) {
      $$("[data-category]", gallery).forEach(function (t) {
        t.hidden = val !== "all" && t.getAttribute("data-category") !== val;
      });
    };
    $$("[data-filter-input]").forEach(function (input) {
      input.addEventListener("change", function () { apply(input.value); });
    });
    var start = params.get("filter"), pre = start && d.getElementById("filter-" + start);
    if (pre) { pre.checked = true; apply(start); }
  }

  /* Before/after slider */
  $$("[data-before-after]").forEach(function (w) {
    var r = w.querySelector('input[type="range"]');
    var set = function () { w.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  });

  /* Estimate forms: ?service= pre-fill, validation, mailto handoff */
  var service = params.get("service");
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
      $$("input, select, textarea", form).forEach(function (el) {
        if (!el.name || !el.value) return;
        var lab = form.querySelector('label[for="' + el.id + '"]');
        var val = el.tagName === "SELECT" ? el.options[el.selectedIndex].text : el.value;
        lines.push((lab ? lab.textContent.replace(/\(optional\)/, "").trim() : el.name) + ": " + val);
        if (/service|address/.test(el.name)) subj.push(val);
      });
      location.href = "mailto:hello@northpointbuilders.example?subject=" +
        encodeURIComponent(subj.join(" - ")) + "&body=" + encodeURIComponent(lines.join("\n"));
      setTimeout(function () { location.href = "thank-you.html"; }, 400);
    });
  });
})();
