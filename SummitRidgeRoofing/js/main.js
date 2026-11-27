(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  /* 8.1 Mobile nav toggle */
  var navToggle = document.querySelector("[data-nav-toggle]");
  if (navToggle) {
    var closeNav = function () {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    };
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    document.addEventListener("click", function (e) {
      if (!document.body.classList.contains("nav-open")) return;
      var nav = document.querySelector(".primary-nav");
      if (nav && !nav.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  /* 8.2 Past Work filter */
  var gallery = document.querySelector("[data-gallery]");
  var filterInputs = document.querySelectorAll("[data-filter-input]");
  if (gallery && filterInputs.length) {
    document.querySelectorAll(".js-only").forEach(function (el) {
      el.classList.remove("js-only");
    });
    filterInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        gallery.setAttribute("data-filter", input.value);
      });
    });
  }

  /* 8.3 Before/after slider */
  document.querySelectorAll("[data-before-after]").forEach(function (widget) {
    var range = widget.querySelector('input[type="range"]');
    if (!range) return;
    var setPos = function () {
      widget.style.setProperty("--pos", range.value + "%");
    };
    range.addEventListener("input", setPos);
    setPos();
  });

  /* 8.4 Service pre-fill + mailto handoff (one or more estimate forms per page) */
  var params = new URLSearchParams(window.location.search);
  var service = params.get("service");

  document.querySelectorAll("[data-estimate-form]").forEach(function (form) {
    var select = form.querySelector('select[name="service"]');
    if (service && select) {
      var match = select.querySelector('option[value="' + service + '"]');
      if (match) select.value = service;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = data.get("name") || "";
      var phone = data.get("phone") || "";
      var email = data.get("email") || "";
      var svc = select ? select.options[select.selectedIndex].text : "";
      var address = data.get("address") || "";
      var details = data.get("details") || "";

      var subjectParts = ["Estimate request", svc];
      if (address) subjectParts.push(address);

      var bodyLines = ["Name: " + name, "Phone: " + phone, "Email: " + email, "Service: " + svc];
      if (address) bodyLines.push("Address/Town: " + address);
      if (details) bodyLines.push("Project details: " + details);

      var mailto = "mailto:hello@summitridgeroofing.example" +
        "?subject=" + encodeURIComponent(subjectParts.join(" - ")) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;
      window.setTimeout(function () {
        window.location.href = "thank-you.html";
      }, 400);
    });
  });
})();
