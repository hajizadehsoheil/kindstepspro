// grab elements
const navbar = document.getElementById("navbar");
const mobileToggle = document.getElementById("mobileMenuToggle");
const mobileDrawer = document.getElementById("mobileDrawer");
const overlayBlur = document.getElementById("overlayBlur");
const mobileCloseBtn = document.getElementById("mobileCloseBtn");
const mobileLinks = document.querySelectorAll("[data-mobile-link]");
const scrollIndicator = document.getElementById("scrollIndicator");
const aboutSection = document.getElementById("about");
const progressBar = document.getElementById("scrollProgress");
const heroParallaxOrbs = document.querySelectorAll("[data-orb]");
const serviceTabs = document.querySelectorAll("[data-segment]");
const serviceCards = document.querySelectorAll(".service-card");
const contactForm = document.getElementById("contactForm");
const formToast = document.getElementById("formToast");
const toastClose = document.getElementById("toastClose");

// ==========================
// MOBILE MENU OPEN/CLOSE
// ==========================
function openMobileMenu() {
  if (!mobileDrawer || !mobileToggle || !overlayBlur) return;

  mobileToggle.classList.add("active");
  mobileDrawer.classList.add("active");
  overlayBlur.classList.add("active");
  document.body.style.overflow = "hidden";

  mobileDrawer.setAttribute("aria-hidden", "false");
  mobileToggle.setAttribute("aria-expanded", "true");

  if (mobileCloseBtn) mobileCloseBtn.focus();
}

function closeMobileMenu() {
  if (!mobileDrawer || !mobileToggle || !overlayBlur) return;

  mobileToggle.classList.remove("active");
  mobileDrawer.classList.remove("active");
  overlayBlur.classList.remove("active");
  document.body.style.overflow = "";

  mobileDrawer.setAttribute("aria-hidden", "true");
  mobileToggle.setAttribute("aria-expanded", "false");
}

// toggle burger
if (mobileToggle) {
  mobileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (mobileDrawer.classList.contains("active")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

// close with X
if (mobileCloseBtn) {
  mobileCloseBtn.addEventListener("click", closeMobileMenu);
}

// close when tap overlay
if (overlayBlur) {
  overlayBlur.addEventListener("click", closeMobileMenu);
}

// close when tap any link inside drawer
mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

// click outside drawer closes drawer
document.addEventListener("click", (e) => {
  if (!mobileDrawer || !mobileToggle) return;
  if (!mobileDrawer.classList.contains("active")) return;

  const clickInsideDrawer = mobileDrawer.contains(e.target);
  const clickToggle = mobileToggle.contains(e.target);

  if (!clickInsideDrawer && !clickToggle) {
    closeMobileMenu();
  }
});

// ESC key closes drawer
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    mobileDrawer &&
    mobileDrawer.classList.contains("active")
  ) {
    closeMobileMenu();
  }
});

// ==========================
// NAVBAR SCROLL STATE + PROGRESS
// ==========================
function updateNavbarState() {
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

function updateScrollProgress() {
  if (!progressBar) return;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  let progress = 0;
  if (docHeight > 0) {
    progress = (scrollTop / docHeight) * 100;
  }

  // progress bar in HTML is a full-width div, so we animate width
  progressBar.style.width = progress + "%";
}

window.addEventListener("scroll", () => {
  updateNavbarState();
  updateScrollProgress();
});

updateNavbarState();
updateScrollProgress();

// ==========================
// SMOOTH SCROLL FOR INTERNAL # LINKS
// ==========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    // offset so section title doesn't hide under navbar
    const navOffset = navbar ? navbar.offsetHeight + 24 : 24;
    const elementPos = targetEl.getBoundingClientRect().top + window.scrollY;
    const scrollTo = elementPos - navOffset;

    window.scrollTo({
      top: scrollTo,
      behavior: "smooth",
    });
  });
});

// hero scroll indicator → scroll to About
if (scrollIndicator && aboutSection) {
  scrollIndicator.addEventListener("click", () => {
    const navOffset = navbar ? navbar.offsetHeight + 24 : 24;
    const elementPos =
      aboutSection.getBoundingClientRect().top + window.scrollY;
    const scrollTo = elementPos - navOffset;

    window.scrollTo({
      top: scrollTo,
      behavior: "smooth",
    });
  });
}

// ==========================
// HERO PARALLAX ORBS
// ==========================
window.addEventListener("pointermove", (e) => {
  if (!heroParallaxOrbs || heroParallaxOrbs.length === 0) return;

  // -1 to 1
  const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
  const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;

  heroParallaxOrbs.forEach((orb, index) => {
    const strength = 10 + index * 5; // px
    const translateX = xRatio * strength;
    const translateY = yRatio * strength;

    orb.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });
});

// ==========================
// REVEAL ANIMATIONS ON SCROLL
// ==========================
const animateObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -80px 0px",
  }
);

// fade / slide elements
document
  .querySelectorAll(".fade-in, .slide-in-left, .slide-in-right")
  .forEach((el) => animateObserver.observe(el));

// stagger service cards
const servicesGrid = document.querySelector(".services-grid");
if (servicesGrid) {
  const cards = servicesGrid.querySelectorAll(".service-card");

  const staggerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add("animate");
          }, index * 120);
        });
      });
    },
    { threshold: 0.1 }
  );

  staggerObserver.observe(servicesGrid);
}

// ==========================
// SERVICE SEGMENT FILTER (Early / School / Teens)
// ==========================
function clearActiveServiceTabs() {
  serviceTabs.forEach((btn) => btn.classList.remove("active"));
}

function filterServicesBySegment(segmentKey) {
  // segmentKey matches values like "early", "school", "teens"
  serviceCards.forEach((card) => {
    const groups = card
      .getAttribute("data-groups")
      .split(" ")
      .map((g) => g.trim());

    const shouldShow = groups.includes(segmentKey);

    if (shouldShow) {
      card.style.display = "";
      requestAnimationFrame(() => {
        card.classList.add("animate");
      });
    } else {
      card.style.display = "none";
    }
  });
}

// hook up filter buttons
serviceTabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    const seg = btn.getAttribute("data-segment");

    clearActiveServiceTabs();
    btn.classList.add("active");

    if (seg) {
      filterServicesBySegment(seg);
    }
  });
});

// init default filter based on .active
(function initServiceFilterOnLoad() {
  if (serviceTabs.length === 0 || serviceCards.length === 0) return;

  let defaultBtn = document.querySelector("[data-segment].active");
  if (!defaultBtn) {
    // no active tab? show all cards
    serviceCards.forEach((card) => {
      card.style.display = "";
    });
    serviceTabs.forEach((btn) => btn.classList.remove("active"));
    return;
  }

  const seg = defaultBtn.getAttribute("data-segment");
  if (seg) {
    filterServicesBySegment(seg);
  }
})();

// ==========================
// CONTACT FORM / TOAST
// ==========================
function openFormToast() {
  if (!formToast) return;
  formToast.classList.add("show");
}

if (toastClose && formToast) {
  toastClose.addEventListener("click", () => {
    formToast.classList.remove("show");
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector(".submit-btn");
    if (!submitBtn) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      submitBtn.textContent = "Message Sent! ✓";
      submitBtn.classList.add("is-success");
      openFormToast?.();

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-success");
        contactForm.reset();
      }, 2500);
    } catch (err) {
      console.error(err);
      submitBtn.textContent = "Try again";
      submitBtn.disabled = false;
      // می‌تونی پیام خطای UI اضافه کنی (اختیاری)
    }
  });
}
