
/**
 * Dynamic News loader for noticias.html
 * Requires: a few containers/templates added to noticias.html (see Step 1 in chat).
 * API shape is documented below (Step 2).
 */

(function () {
  const API_BASE = window.NEWS_API_BASE || "/api";

  // Helpers
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const MONTHS_PT = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

  function fmtDateParts(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return {day:"", month:""};
    return {
      day: String(d.getDate()).padStart(2,"0"),
      month: MONTHS_PT[d.getMonth()]
    };
  }

  function createFromTemplate(tplId) {
    const tpl = document.getElementById(tplId);
    if (!tpl) return null;
    return tpl.content.firstElementChild.cloneNode(true);
  }

  function renderNewsCard(item) {
    const el = createFromTemplate("tpl-news-card");
    if (!el) return document.createTextNode("");

    const { day, month } = fmtDateParts(item.date || item.publishedAt);
    const link = `noticia-detalhe.html?slug=${encodeURIComponent(item.slug || item.id)}`;

    // Thumb + date
    const img = el.querySelector("[data-bind='cover']");
    if (img) img.src = item.cover || "images/noticias/placeholder.webp";
    const dayEl = el.querySelector("[data-bind='day']");  if (dayEl) dayEl.textContent = day;
    const monthEl = el.querySelector("[data-bind='month']"); if (monthEl) monthEl.textContent = month;

    // Meta
    const cat = el.querySelector("[data-bind='categories']");
    if (cat) { cat.textContent = (item.categories && item.categories[0]) || "Atualizações"; }
    const author = el.querySelector("[data-bind='author']");
    if (author) { author.textContent = item.author || "H&S Angola"; }

    // Title/Excerpt/Link
    const title = el.querySelector("[data-bind='title']");
    if (title) { title.textContent = item.title || "Sem título"; }
    // Commented out to make non-clickable
    // $$("a[data-bind='link'], h3 a", el).forEach(a => a.href = link);

    const desc = el.querySelector("[data-bind='excerpt']");
    if (desc) { desc.textContent = item.excerpt || ""; }

    return el;
  }

  function renderRecentItem(item) {
    const el = createFromTemplate("tpl-recent-item");
    if (!el) return document.createTextNode("");

    const link = `noticia-detalhe.html?slug=${encodeURIComponent(item.slug || item.id)}`;
    const { day, month } = fmtDateParts(item.date || item.publishedAt);
    const dateStr = `${String(day).padStart(2,"0")} ${month} ${new Date(item.date).getFullYear()}`;

    const img = el.querySelector("[data-bind='cover']"); if (img) img.src = item.cover || "images/noticias/placeholder.webp";
    const title = el.querySelector("[data-bind='title']"); if (title) title.textContent = item.title || "";
    // Commented out to make non-clickable
    // const linkEls = el.querySelectorAll("a[data-bind='link']"); linkEls.forEach(a => a.href = link);
    const dateEl = el.querySelector("[data-bind='date']"); if (dateEl) dateEl.textContent = dateStr;

    return el;
  }

  function renderCategory(catObj) {
    const el = createFromTemplate("tpl-category-item");
    if (!el) return document.createTextNode("");

    const a = el.querySelector("a");
    if (a) {
      a.textContent = `${catObj.name} `;
      const span = document.createElement("span");
      span.className = "number";
      span.textContent = `(${catObj.count})`;
      a.appendChild(span);
      a.href = `?categoria=${encodeURIComponent(catObj.name)}`;
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        state.filters.category = catObj.name;
        state.page = 1;
        loadAndRender();
      });
    }
    return el;
  }

  function renderTag(tagObj) {
    const a = document.createElement("a");
    a.textContent = tagObj.name;
    a.href = `?tag=${encodeURIComponent(tagObj.name)}`;
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      state.filters.tag = tagObj.name;
      state.page = 1;
      loadAndRender();
    });
    return a;
  }

  function renderPagination(pagination) {
    const root = $("#pagination");
    if (!root) return;
    root.innerHTML = "";
    const ul = document.createElement("ul");

    function addPage(label, targetPage, isCurrent=false, isNextPrev=false) {
      const li = document.createElement("li");
      const el = document.createElement(isCurrent ? "span" : "a");
      el.className = isCurrent ? "page-numbers current" : "page-numbers";
      el.textContent = label;
      if (!isCurrent) {
        el.href = "#";
        el.addEventListener("click", (e) => {
          e.preventDefault();
          state.page = targetPage;
          loadAndRender();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
      if (isNextPrev) el.innerHTML = '<i class="tji-arrow-right-long"></i>';
      li.appendChild(el);
      ul.appendChild(li);
    }

    for (let p = 1; p <= pagination.totalPages; p++) {
      addPage(String(p), p, p === pagination.page);
    }
    if (pagination.page < pagination.totalPages) {
      addPage("", pagination.page + 1, false, true);
    }

    root.appendChild(ul);
  }

  // State
  const state = {
    page: 1,
    limit: 6,
    filters: {
      category: null,
      tag: null,
      q: null
    }
  };

  async function api(path) {
    const url = new URL(API_BASE + path, window.location.origin);
    return fetch(url, { headers: { "Accept": "application/json" } })
      .then(r => {
        if (!r.ok) throw new Error("Erro ao carregar dados");
        return r.json();
      });
  }

  async function loadNews() {
    const params = new URLSearchParams({ page: state.page, limit: state.limit });
    if (state.filters.category) params.set("category", state.filters.category);
    if (state.filters.tag) params.set("tag", state.filters.tag);
    if (state.filters.q) params.set("q", state.filters.q);
    return api(`/news?${params.toString()}`);
  }

  async function loadRecent() { return api("/recent?limit=3"); }
  async function loadCategories() { return api("/categories"); }
  async function loadTags() { return api("/tags"); }

  function clear(el) { if (el) el.innerHTML = ""; }

  async function loadAndRender() {
    // main list
    try {
      const { data, pagination } = await loadNews();
      const listRoot = document.getElementById("news-list");
      if (listRoot) {
        clear(listRoot);
        data.forEach(item => listRoot.appendChild(renderNewsCard(item)));
      }
      if (pagination) renderPagination(pagination);
    } catch (e) {
      console.error(e);
    }

    // recent
    try {
      const recentRoot = document.getElementById("recent-posts");
      if (recentRoot) {
        clear(recentRoot);
        const recent = await loadRecent();
        (recent.data || recent).forEach(item => recentRoot.appendChild(renderRecentItem(item)));
      }
    } catch(e) { console.error(e); }

    // categories
    try {
      const catRoot = document.getElementById("categories-list");
      if (catRoot) {
        clear(catRoot);
        const cats = await loadCategories();
        (cats.data || cats).forEach(c => catRoot.appendChild(renderCategory(c)));
      }
    } catch(e) { console.error(e); }

    // tags
    try {
      const tagRoot = document.getElementById("tags-cloud");
      if (tagRoot) {
        clear(tagRoot);
        const tags = await loadTags();
        (tags.data || tags).forEach(t => tagRoot.appendChild(renderTag(t)));
      }
    } catch(e) { console.error(e); }
  }

  document.addEventListener("DOMContentLoaded", loadAndRender);
})();
