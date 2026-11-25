/* ==========================================================================
   Portfolio Interactive Engine v2.1 (EN/FR, Vertical List, Centered Modal, QR)
   ========================================================================== */

let currentLang = localStorage.getItem("nb_portfolio_lang") || "en";
let currentDomain = "all";
let currentStack = "all";
let activeProjectId = null;
let carouselIndex = 0;
let roleCycleIndex = 0;

function t(key) {
  return (window.I18N[currentLang] && window.I18N[currentLang][key]) || window.I18N.en[key] || key;
}

function val(field) {
  if (field && typeof field === "object" && ("en" in field || "fr" in field)) {
    return field[currentLang] || field.en;
  }
  return field;
}

document.addEventListener("DOMContentLoaded", () => {
  initRevealObserver();
  startRoleCycler();

  const params = new URLSearchParams(window.location.search);
  const urlLang = (params.get("lang") || "").toLowerCase();
  if (urlLang === "fr" || urlLang === "en") {
    currentLang = urlLang;
    localStorage.setItem("nb_portfolio_lang", urlLang);
  }

  applyLanguage(currentLang);
  setupKeyboardShortcuts();

  const urlProject = params.get("project");
  if (urlProject) {
    openDossier(urlProject);
  } else if (params.get("qr") === "1") {
    toggleQrModal();
  }
});

/* --------------------------------------------------------------------------
   Language Switcher (EN / FR)
   -------------------------------------------------------------------------- */
function setLanguage(lang) {
  if (lang !== "en" && lang !== "fr") return;
  currentLang = lang;
  localStorage.setItem("nb_portfolio_lang", lang);
  applyLanguage(lang);
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;

  const btnEn = document.getElementById("lang-btn-en");
  const btnFr = document.getElementById("lang-btn-fr");
  if (btnEn && btnFr) {
    btnEn.className = lang === "en"
      ? "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-800 text-white shadow-sm"
      : "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-900 hover:text-purple-700";
    btnFr.className = lang === "fr"
      ? "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-800 text-white shadow-sm"
      : "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-900 hover:text-purple-700";
  }

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (window.I18N[lang][key]) {
      el.textContent = window.I18N[lang][key];
    }
  });

  const navCv = document.getElementById("nav-cv-link");
  if (navCv) {
    navCv.href = lang === "fr" ? "assets/docs/CV-FR.pdf" : "assets/docs/CV-EN.pdf";
  }

  renderProjectsGrid();
  renderTimelineSections();
  renderSkillsMatrix();
  updateRoleCyclerText();

  if (activeProjectId) {
    openDossier(activeProjectId, carouselIndex);
  }
}

/* --------------------------------------------------------------------------
   Kinetic Role Cycler
   -------------------------------------------------------------------------- */
function startRoleCycler() {
  updateRoleCyclerText();
  setInterval(() => {
    const list = window.CYCLING_ROLES[currentLang];
    roleCycleIndex = (roleCycleIndex + 1) % list.length;
    updateRoleCyclerText();
  }, 3000);
}

function updateRoleCyclerText() {
  const el = document.getElementById("kinetic-role-badge");
  if (!el) return;
  const list = window.CYCLING_ROLES[currentLang];
  el.style.opacity = "0";
  setTimeout(() => {
    el.textContent = list[roleCycleIndex % list.length];
    el.style.opacity = "1";
  }, 160);
}

/* --------------------------------------------------------------------------
   Scroll Reveal
   -------------------------------------------------------------------------- */
function initRevealObserver() {
  const els = document.querySelectorAll(".reveal-up");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01 });
  els.forEach((el) => obs.observe(el));
  // Ensure tall sections reveal promptly even on narrow viewports
  setTimeout(() => {
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 120) el.classList.add("is-visible");
    });
  }, 150);
}

/* --------------------------------------------------------------------------
   Recruiter Tech-Stack Matcher & Vertical Project List (Always All 18)
   -------------------------------------------------------------------------- */
function setDomainFilter(domain) {
  currentDomain = domain;
  document.querySelectorAll(".domain-tab").forEach((btn) => {
    const active = btn.dataset.domain === domain;
    btn.className = active
      ? "domain-tab px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-sm transition-all"
      : "domain-tab px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/90 text-purple-900 border border-purple-200 hover:border-purple-400 transition-all";
  });
  renderProjectsGrid();
}

function setStackFilter(stack) {
  currentStack = stack;
  document.querySelectorAll(".stack-pill").forEach((btn) => {
    const active = btn.dataset.stack === stack;
    btn.className = active
      ? "stack-pill px-3 py-1.5 rounded-lg text-xs font-bold font-mono-code bg-purple-700 text-white shadow-sm transition-all"
      : "stack-pill px-3 py-1.5 rounded-lg text-xs font-medium font-mono-code bg-white/90 text-purple-900 border border-purple-200 hover:border-purple-400 transition-all";
  });
  renderProjectsGrid();
}

function getDomainTheme(color) {
  const map = {
    violet: { pill: "bg-violet-50 text-violet-800 border-violet-200", dot: "bg-violet-600" },
    rose: { pill: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200", dot: "bg-fuchsia-600" },
    indigo: { pill: "bg-purple-50 text-purple-800 border-purple-200", dot: "bg-purple-600" },
    emerald: { pill: "bg-purple-100/80 text-purple-900 border-purple-300", dot: "bg-purple-700" },
    amber: { pill: "bg-violet-100/80 text-violet-900 border-violet-300", dot: "bg-violet-700" }
  };
  return map[color] || map.indigo;
}

function renderProjectsGrid() {
  const grid = document.getElementById("projects-grid");
  const counterEl = document.getElementById("projects-counter");
  if (!grid) return;

  const filtered = window.PROJECTS.filter((p) => {
    const matchDomain = currentDomain === "all" || p.domains.includes(currentDomain);
    const matchStack = currentStack === "all" || p.filterStacks.includes(currentStack);
    return matchDomain && matchStack;
  });

  if (counterEl) {
    counterEl.textContent = t("showing_count")
      .replace("{n}", filtered.length)
      .replace("{total}", window.PROJECTS.length);
  }

  grid.innerHTML = filtered.map((p) => {
    const isNda = p.access === "nda";
    const accessBadge = isNda
      ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4C1D95] text-white">&#128274; ${t("badge_nda")}</span>`
      : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200"><span class="w-1.5 h-1.5 rounded-full bg-purple-600"></span> ${t("badge_repo")}</span>`;

    const flagshipBadge = p.tier === 1
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">&#9733; ${t("badge_tier1")}</span>`
      : "";

    const collabBadge = p.collaboration
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-900 border border-violet-200">${val(p.collaboration)}</span>`
      : "";

    // Doubled Visual Showcase Container (NO metricHighlight badge clutter on dashboard cards)
    const visualBoxHtml = p.images && p.images.length > 0
      ? `<div class="w-full lg:w-[480px] h-[245px] sm:h-[265px] shrink-0 rounded-2xl overflow-hidden border border-purple-200 bg-gradient-to-br from-purple-50 to-white relative flex items-center justify-center">
           <img src="${p.images[0].src}" alt="${escapeHtml(val(p.title))}" loading="lazy" class="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500" />
           <div class="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-[#2E1065]/85 text-white text-xs font-mono-code backdrop-blur-sm">
             ${p.images.length} visual${p.images.length > 1 ? "s" : ""}
           </div>
         </div>`
      : `<div class="w-full lg:w-[480px] min-h-[245px] sm:min-h-[265px] shrink-0 rounded-2xl border border-purple-200/90 bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#FAF5FF] p-5 flex flex-col justify-between overflow-hidden">
           <div class="flex items-center justify-between gap-2">
             <span class="text-xs font-mono-code font-bold uppercase tracking-wider text-purple-700">System Architecture Flow</span>
             <span class="text-xs font-mono-code text-purple-500 shrink-0">${(p.archSteps || []).length} stages</span>
           </div>
           <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 my-auto py-3">
             ${(p.archSteps || []).slice(0, 3).map((s, idx) => `
               <div class="flex-1 bg-white/95 border border-purple-200 rounded-xl p-3 text-center shadow-xs min-w-0">
                 <div class="text-xs sm:text-sm font-bold text-[#2E1065] truncate">${val(s.title)}</div>
                 <div class="text-[11px] text-purple-700/80 truncate mt-0.5">${val(s.sub)}</div>
               </div>
               ${idx < Math.min(2, p.archSteps.length - 1) ? '<span class="hidden sm:inline text-purple-500 font-bold text-base">&rarr;</span><span class="sm:hidden text-center text-purple-500 font-bold text-xs">&darr;</span>' : ''}
             `).join("")}
           </div>
           <div class="text-xs text-purple-800/75 font-medium">Open details to view animated flow &amp; verified outcomes</div>
         </div>`;

    return `
      <article onclick="openDossier('${p.id}')" class="project-list-row min-w-0 rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row items-stretch gap-6 cursor-pointer group">
        ${visualBoxHtml}

        <div class="flex-1 min-w-0 flex flex-col justify-between gap-4 py-1">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              ${accessBadge}
              ${flagshipBadge}
              ${collabBadge}
            </div>

            <h3 class="text-xl sm:text-2xl font-extrabold text-[#2E1065] group-hover:text-purple-700 transition-colors leading-snug">
              ${val(p.title)}
            </h3>

            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
              ${val(p.tagline)}
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-purple-100">
            <div class="flex flex-wrap gap-1.5">
              ${p.stack.slice(0, 5).map((tech) => `<span class="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 font-mono-code text-xs font-medium border border-purple-200/80">${tech}</span>`).join("")}
              ${p.stack.length > 5 ? `<span class="px-2.5 py-1 rounded-lg bg-white text-purple-600 font-mono-code text-xs border border-purple-200">+${p.stack.length - 5}</span>` : ""}
            </div>

            <span class="inline-flex items-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#9333EA] shadow-sm group-hover:shadow-md group-hover:shadow-purple-400/30 transition-all whitespace-nowrap">
              ${t("card_inspect")}
            </span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* --------------------------------------------------------------------------
   Centered Large Floating Case Study Modal (~95vw x 92vh)
   Technical Metric Badges & Deep Details Live Here
   -------------------------------------------------------------------------- */
function openDossier(projectId, startImgIdx = 0) {
  const project = window.PROJECTS.find((p) => p.id === projectId);
  if (!project) return;
  activeProjectId = projectId;
  carouselIndex = startImgIdx;

  const modal = document.getElementById("dossier-drawer");
  const content = document.getElementById("dossier-content");
  if (!modal || !content) return;

  const isNda = project.access === "nda";
  const badgeHtml = isNda
    ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4C1D95] text-white">&#128274; ${t("badge_nda")}</span>`
    : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">&#9679; ${t("badge_repo")}</span>`;

  const ndaAlertHtml = isNda
    ? `<div class="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 leading-relaxed">
         <strong>&#128274; NDA / Proprietary Notice:</strong> ${t("drawer_nda_note")}
       </div>`
    : "";

  const galleryHtml = project.images && project.images.length > 0
    ? `<div class="rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50/80 to-white overflow-hidden">
         <div class="px-4 py-2.5 border-b border-purple-100 flex items-center justify-between">
           <h4 class="text-xs font-extrabold uppercase tracking-wider text-purple-900">${t("drawer_gallery")}</h4>
           <span id="carousel-counter" class="text-xs font-mono-code font-bold text-purple-700">${carouselIndex + 1} / ${project.images.length}</span>
         </div>
         <div class="relative bg-slate-50 flex items-center justify-center min-h-[280px] sm:min-h-[360px] max-h-[440px]">
           <img id="carousel-img" src="${project.images[carouselIndex].src}" alt="Project visual" class="max-h-[420px] w-auto object-contain mx-auto p-3" />
           ${project.images.length > 1 ? `
             <button onclick="stepCarousel(-1)" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-purple-700 hover:text-white text-purple-900 shadow-md border border-purple-200 flex items-center justify-center font-bold text-base transition-colors">&#8592;</button>
             <button onclick="stepCarousel(1)" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-purple-700 hover:text-white text-purple-900 shadow-md border border-purple-200 flex items-center justify-center font-bold text-base transition-colors">&#8594;</button>
           ` : ""}
         </div>
         <div class="px-4 py-3 bg-white border-t border-purple-100">
           <span id="carousel-caption" class="text-xs font-semibold text-purple-950">${val(project.images[carouselIndex].caption)}</span>
         </div>
       </div>`
    : "";

  const actionsHtml = `
    <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-purple-100">
      ${project.links.github ? `
        <a href="${project.links.github}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4C1D95] to-[#7C3AED] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-sm transition-all">
          ${t("btn_github_repo")} &#8599;
        </a>` : ""}
      ${project.links.report ? `
        <a href="${project.links.report}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors">
          ${t("btn_read_paper")} &#8599;
        </a>` : ""}
      ${project.links.slides ? `
        <a href="${project.links.slides}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs sm:text-sm font-bold shadow-2xs transition-colors">
          ${t("btn_view_slides")} &#8599;
        </a>` : ""}
      <button onclick="closeDossier()" class="ml-auto px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold">
        Close
      </button>
    </div>
  `;

  content.innerHTML = `
    <!-- Modal Header -->
    <div class="px-6 sm:px-8 py-5 bg-gradient-to-r from-[#F5F3FF] via-white to-[#FAF5FF] border-b border-purple-100 flex items-start justify-between gap-4 sticky top-0 z-20">
      <div class="space-y-1.5 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          ${badgeHtml}
          <span class="font-mono-code text-xs px-3 py-1 rounded-full bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200 font-bold">${project.metricHighlight}</span>
          ${project.collaboration ? `<span class="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-900 border border-violet-200 font-bold">${val(project.collaboration)}</span>` : ""}
        </div>
        <h3 class="text-xl sm:text-3xl font-extrabold text-[#2E1065] leading-tight">${val(project.title)}</h3>
        <p class="text-xs sm:text-sm text-slate-600">${val(project.tagline)}</p>
      </div>
      <button onclick="closeDossier()" class="w-10 h-10 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 font-bold text-lg shrink-0" aria-label="Close modal">&times;</button>
    </div>

    <!-- Spacious 2-Column Body -->
    <div class="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-7">
      <!-- Left 7 Cols: Visual Gallery + Animated Architecture -->
      <div class="lg:col-span-7 space-y-5">
        ${galleryHtml}
        <div class="bg-purple-50/70 rounded-2xl p-4 sm:p-5 border border-purple-200">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-purple-900 mb-3">${t("drawer_arch")}</h4>
          ${window.renderAnimatedFlowSvg(project.archSteps, currentLang)}
        </div>
        ${ndaAlertHtml}
      </div>

      <!-- Right 5 Cols: Engineering Challenge, Solution, Outcomes & Stack -->
      <div class="lg:col-span-5 flex flex-col justify-between space-y-5">
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-purple-50/75 border border-purple-200">
            <div class="text-xs font-extrabold uppercase tracking-wider text-purple-900 mb-1.5">${t("drawer_problem")}</div>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${val(project.problem)}</p>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-purple-200">
            <div class="text-xs font-extrabold uppercase tracking-wider text-fuchsia-800 mb-1.5">${t("drawer_solution")}</div>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${val(project.solution)}</p>
          </div>

          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-purple-900 mb-2">${t("drawer_highlights")}</h4>
            <ul class="space-y-2">
              ${val(project.highlights).map((item) => `
                <li class="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span class="text-purple-700 font-bold mt-0.5">&#10003;</span>
                  <span>${item}</span>
                </li>
              `).join("")}
            </ul>
          </div>

          <div>
            <div class="flex flex-wrap gap-1.5">
              ${project.stack.map((tech) => `<span class="px-2.5 py-1 rounded-lg bg-purple-100/80 text-purple-950 font-mono-code text-xs font-semibold border border-purple-200">${tech}</span>`).join("")}
            </div>
          </div>
        </div>

        ${actionsHtml}
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function stepCarousel(delta) {
  const project = window.PROJECTS.find((p) => p.id === activeProjectId);
  if (!project || !project.images || !project.images.length) return;
  carouselIndex = (carouselIndex + delta + project.images.length) % project.images.length;
  const imgEl = document.getElementById("carousel-img");
  const capEl = document.getElementById("carousel-caption");
  const cntEl = document.getElementById("carousel-counter");
  if (imgEl) imgEl.src = project.images[carouselIndex].src;
  if (capEl) capEl.textContent = val(project.images[carouselIndex].caption);
  if (cntEl) cntEl.textContent = `${carouselIndex + 1} / ${project.images.length}`;
}

function closeDossier() {
  const modal = document.getElementById("dossier-drawer");
  if (modal) modal.classList.add("hidden");
  activeProjectId = null;
  document.body.style.overflow = "";
}

/* --------------------------------------------------------------------------
   Experience, Education & Skills Rendering
   -------------------------------------------------------------------------- */
function renderTimelineSections() {
  const expEl = document.getElementById("experience-timeline");
  const eduEl = document.getElementById("education-timeline");
  if (expEl) {
    expEl.innerHTML = window.EXPERIENCE.map((item) => `
      <div class="glass-bento rounded-2xl p-5 border border-purple-200/80">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <span class="font-bold text-sm text-[#2E1065]">${val(item.role)}</span>
          <span class="font-mono-code text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">${item.period}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="text-xs font-semibold text-purple-800">${val(item.org)}</span>
          <span class="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/70">${val(item.badge)}</span>
        </div>
        <ul class="space-y-1.5">
          ${val(item.bullets).map((b) => `<li class="text-xs text-slate-600 flex items-start gap-2"><span class="text-purple-600 mt-0.5">&bull;</span><span>${b}</span></li>`).join("")}
        </ul>
      </div>
    `).join("");
  }

  if (eduEl) {
    eduEl.innerHTML = window.EDUCATION.map((edu) => `
      <div class="glass-bento rounded-2xl p-4 border border-purple-200/80">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-bold text-sm text-[#2E1065]">${val(edu.degree)}</span>
          <span class="font-mono-code text-xs text-purple-700 font-semibold shrink-0">${edu.period}</span>
        </div>
        <div class="text-xs text-slate-600">${val(edu.school)}</div>
      </div>
    `).join("");
  }
}

function renderSkillsMatrix() {
  const el = document.getElementById("skills-matrix");
  if (!el) return;
  el.innerHTML = window.SKILLS_GROUPS.map((g) => {
    const theme = getDomainTheme(g.color);
    return `
      <div class="glass-bento rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-2.5 h-2.5 rounded-full ${theme.dot}"></span>
          <h4 class="font-bold text-sm text-[#2E1065]">${val(g.title)}</h4>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${g.items.map((sk) => `<span class="px-2.5 py-1 rounded-lg bg-purple-50/80 border border-purple-200/80 text-xs font-medium text-purple-950 shadow-2xs">${sk}</span>`).join("")}
        </div>
      </div>
    `;
  }).join("");
}

/* --------------------------------------------------------------------------
   4-QR Auto-Download Modal & Copy Toast & Esc Key
   -------------------------------------------------------------------------- */
function toggleQrModal() {
  const m = document.getElementById("qr-modal");
  if (m) m.classList.toggle("hidden");
}

function copyText(str) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str);
  }
  const toast = document.getElementById("copy-toast");
  if (toast) {
    toast.textContent = `${t("hero_copied")} (${str})`;
    toast.classList.remove("opacity-0", "translate-y-2");
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
    }, 2200);
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const qr = document.getElementById("qr-modal");
      if (activeProjectId) closeDossier();
      else if (qr && !qr.classList.contains("hidden")) toggleQrModal();
    }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.setLanguage = setLanguage;
window.setDomainFilter = setDomainFilter;
window.setStackFilter = setStackFilter;
window.openDossier = openDossier;
window.stepCarousel = stepCarousel;
window.closeDossier = closeDossier;
window.toggleQrModal = toggleQrModal;
window.copyText = copyText;
