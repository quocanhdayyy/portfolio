const themeButton = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀️";
}

themeButton.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    const darkModeIsActive =
        document.body.classList.contains("dark-mode");

    if (darkModeIsActive) {

        themeButton.textContent = "☀️";

        localStorage.setItem(
            "theme",
            "dark"
        );

    } else {

        themeButton.textContent = "🌙";

        localStorage.setItem(
            "theme",
            "light"
        );

    }

});
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const backToTopButton = document.getElementById("back-to-top");
const navbar = document.querySelector(".navbar");
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = Array.from(navLinks, link =>
    document.querySelector(link.getAttribute("href"))
);

// Keep anchor destinations below the sticky navbar, including on mobile.
function updateNavbarOffset() {
    document.documentElement.style.setProperty(
        "--section-scroll-offset", `${navbar.offsetHeight + 20}px`
    );
    updateScrollControls();
}

// Highlight the section at the reading line below the navbar.
function updateScrollControls() {
    backToTopButton.hidden = window.scrollY < 300;
    const readingLine = navbar.offsetHeight + 24;
    let activeSection = null;

    sections.forEach(section => {
        if (section.getBoundingClientRect().top <= readingLine) {
            activeSection = section;
        }
    });

    // A short final section may never reach the reading line.
    const atBottom = window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
    if (atBottom && window.scrollY > 0) {
        activeSection = sections[sections.length - 1];
    }

    navLinks.forEach((link, index) => {
        const isActive = sections[index] === activeSection;
        link.classList.toggle("active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

// Limit scroll work to one update per animation frame.
let scrollUpdatePending = false;
window.addEventListener("scroll", () => {
    if (!scrollUpdatePending) {
        scrollUpdatePending = true;
        window.requestAnimationFrame(() => {
            updateScrollControls();
            scrollUpdatePending = false;
        });
    }
}, { passive: true });
window.addEventListener("resize", updateNavbarOffset);
window.addEventListener("load", updateNavbarOffset);
if ("ResizeObserver" in window) {
    new ResizeObserver(updateNavbarOffset).observe(navbar);
}
updateNavbarOffset();

// Return focus before hiding the button and honor reduced motion.
backToTopButton.addEventListener("click", () => {
    navLinks[0].focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
});

// Placeholder repositories should not unexpectedly jump to the top.
document.querySelectorAll('.repository-btn[href="#"]').forEach(link => {
    link.addEventListener("click", event => event.preventDefault());
});

// Reveal sections and cards once; unsupported browsers keep content visible.
if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealElements = document.querySelectorAll("main section, .project-card");
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove("reveal-pending");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0, rootMargin: "0px 0px -20px 0px" });

    revealElements.forEach(element => {
        element.classList.add("reveal-ready", "reveal-pending");
        revealObserver.observe(element);
    });

    // Honor motion preferences changed while the page is open.
    reducedMotion.addEventListener("change", event => {
        if (event.matches) {
            revealObserver.disconnect();
            revealElements.forEach(element => element.classList.remove("reveal-pending"));
        }
    });
}