const scriptURL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
const submittedKey = "beijingInfoFormSubmitted";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navAnchors = document.querySelectorAll(
  ".nav-links a, .footer-links a, .hero-actions a, .brand"
);
const sections = document.querySelectorAll("main section[id]");
const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("msg");
const revealTexts = document.querySelectorAll(".reveal-text");
const submitBtn = document.getElementById("submitBtn");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

navAnchors.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

function activateNav() {
  let current = "home";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 140;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.15 }
);

revealTexts.forEach((item, index) => {
  item.style.transitionDelay = `${(index % 6) * 0.08}s`;
  observer.observe(item);
});

function lockForm(messageText) {
  if (!form) return;

  const fields = form.querySelectorAll("input, textarea, button");
  fields.forEach((field) => {
    field.disabled = true;
  });

  if (msg) {
    msg.textContent = messageText;
    msg.className = "form-note warning";
  }
}

function markSuccess(messageText) {
  if (!msg) return;
  msg.textContent = messageText;
  msg.className = "form-note success";
}

function markError(messageText) {
  if (!msg) return;
  msg.textContent = messageText;
  msg.className = "form-note error";
}

if (localStorage.getItem(submittedKey) === "true") {
  lockForm("您已提交过表单，我们已收到您的信息，请勿重复提交。");
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (localStorage.getItem(submittedKey) === "true") {
      lockForm("您已提交过表单，我们已收到您的信息，请勿重复提交。");
      return;
    }

    if (!scriptURL || scriptURL === "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      markError("请先在 script.js 中填写 Google Apps Script 链接。");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "提交中...";
    }

    fetch(scriptURL, {
      method: "POST",
      body: new FormData(form),
    })
      .then(() => {
        localStorage.setItem(submittedKey, "true");
        form.reset();
        lockForm("提交成功，我们会尽快与您联系。您已提交过表单，请勿重复提交。");
      })
      .catch((error) => {
        console.error("Error!", error.message);
        markError("提交失败，请稍后重试。");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "提交咨询";
        }
      });
  });
}

window.addEventListener("scroll", activateNav);
window.addEventListener("load", activateNav);