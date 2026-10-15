"use strict";

/**
 * ZGIS — bản trình diễn UI, không kết nối ví hoặc mạng lưới Zcash.
 * KHÔNG chứa mã xử lý khóa riêng, ký giao dịch, RPC, địa chỉ nhận thật.
 */
(() => {
  const VALID_VIEWS = new Set(["tong-quan", "gui-zec", "nhan-zec", "lich-su", "so-dia-chi", "cai-dat"]);
  const labels = {
    "tong-quan": "Tổng quan",
    "gui-zec": "Gửi ZEC",
    "nhan-zec": "Nhận ZEC",
    "lich-su": "Lịch sử giao dịch",
    "so-dia-chi": "Sổ địa chỉ",
    "cai-dat": "Cài đặt & bảo mật"
  };
  // Đây là các giao dịch GIẢ LẬP, không phải txid hay dữ liệu khớp mạng thật.
  const transactions = [
    { id: "MAU-001", name: "Nhận ZEC mẫu", type: "in", pool: "Được bảo vệ", date: "14/10/2026", amount: 1.2500 },
    { id: "MAU-002", name: "Gửi ZEC mẫu", type: "out", pool: "Được bảo vệ", date: "12/10/2026", amount: 0.3200 },
    { id: "MAU-003", name: "Nhận ZEC mẫu", type: "in", pool: "Công khai", date: "09/10/2026", amount: 0.1500 },
    { id: "MAU-004", name: "Nhận ZEC mẫu", type: "in", pool: "Được bảo vệ", date: "07/10/2026", amount: 2.0000 },
    { id: "MAU-005", name: "Gửi ZEC mẫu", type: "out", pool: "Công khai", date: "05/10/2026", amount: 0.0500 },
    { id: "MAU-006", name: "Nhận ZEC mẫu", type: "in", pool: "Được bảo vệ", date: "01/10/2026", amount: 0.8100 }
  ];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const number = new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  let filter = "all";
  let balancesVisible = true;
  let currentView = "tong-quan";
  let toastTimeout;

  function safeStore(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (_) { /* không lưu nếu trình duyệt chặn */ }
  }
  function safeRead(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function icon(id) {
    return '<svg aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  }
  function cellHtml(item) {
    const incoming = item.type === "in";
    const direction = incoming ? "in" : "out";
    const sign = incoming ? "+" : "−";
    return '<tr>' +
      '<td><div class="tx-name"><span class="tx-direction ' + direction + '">' + icon(incoming ? "i-receive" : "i-send") + '</span><span><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(item.id) + ' · Dữ liệu mẫu</small></span></div></td>' +
      '<td class="tx-muted">' + escapeHtml(item.pool) + '</td>' +
      '<td class="tx-muted">' + escapeHtml(item.date) + '</td>' +
      '<td class="right"><span class="tx-amount ' + direction + '">' + sign + number.format(item.amount) + ' ZEC</span></td>' +
      '<td><span class="tx-badge">Đã mô phỏng</span></td>' +
      '</tr>';
  }

  function renderTransactions() {
    const q = ($("#tx-search")?.value || "").trim().toLocaleLowerCase("vi-VN");
    const filtered = transactions.filter((tx) =>
      (filter === "all" || tx.type === filter) &&
      [tx.name, tx.id, tx.pool, tx.date].some((field) => field.toLocaleLowerCase("vi-VN").includes(q))
    );
    $("#recent-rows").innerHTML = transactions.slice(0, 4).map(cellHtml).join("");
    $("#history-rows").innerHTML = filtered.map(cellHtml).join("");
    $("#empty-history").hidden = filtered.length !== 0;
    $("#transaction-count").textContent = filtered.length + " / " + transactions.length + " giao dịch minh họa";
  }

  function closeSidebar() {
    const side = $("#thanh-dieu-huong");
    side.classList.remove("open");
    $("#sidebar-overlay").hidden = true;
    $("#menu-button").setAttribute("aria-expanded", "false");
  }
  function navigate(view) {
    if (!VALID_VIEWS.has(view)) view = "tong-quan";
    currentView = view;
    $$(".view").forEach((el) => {
      const active = el.id === "view-" + view;
      el.classList.toggle("active", active);
      el.setAttribute("aria-hidden", String(!active));
    });
    $$(".nav-item").forEach((item) => {
      const active = item.dataset.view === view;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    $("#breadcrumb-current").textContent = labels[view];
    document.title = labels[view] + " | ZGIS — Ví Zcash tiếng Việt";
    closeSidebar();
    if (window.scrollY > 100) window.scrollTo({ top: 0, behavior: "instant" });
  }
  function viewFromHash() {
    return decodeURIComponent(window.location.hash.replace(/^#/, "")) || "tong-quan";
  }
  function openView(view) {
    if (!VALID_VIEWS.has(view)) return;
    if (window.location.hash === "#" + view) navigate(view);
    else window.location.hash = view;
  }
  function notify(message) {
    const node = $("#toast");
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { node.hidden = true; }, 3200);
  }

  function setTheme(isDark) {
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    $("#dark-toggle").classList.toggle("on", isDark);
    $("#dark-toggle").setAttribute("aria-checked", String(isDark));
    $("#theme-button use").setAttribute("href", isDark ? "#i-moon" : "#i-sun");
    safeStore("zgis-theme", isDark ? "dark" : "light");
  }
  function setBalancesVisible(visible) {
    balancesVisible = visible;
    $$(".sensitive").forEach((el) => {
      el.textContent = visible ? el.dataset.value : "••••";
      el.setAttribute("aria-label", visible ? el.dataset.value + " ZEC, số liệu minh họa" : "Số dư đang được ẩn");
    });
    $("#balance-toggle").classList.toggle("on", visible);
    $("#balance-toggle").setAttribute("aria-checked", String(visible));
    $("#visibility-button use").setAttribute("href", visible ? "#i-eye" : "#i-eye-off");
    $("#visibility-button").setAttribute("aria-label", visible ? "Ẩn số dư" : "Hiện số dư");
    // Không lưu trạng thái số dư vào mạng; chỉ là cài đặt trình duyệt.
    safeStore("zgis-show-balances", visible ? "true" : "false");
  }
  function setReducedMotion(enabled) {
    document.documentElement.classList.toggle("reduce-motion", enabled);
    $("#motion-toggle").classList.toggle("on", enabled);
    $("#motion-toggle").setAttribute("aria-checked", String(enabled));
    safeStore("zgis-reduce-motion", enabled ? "true" : "false");
  }

  function updateAddressType(type) {
    const shielded = type !== "public";
    $$("[data-address-type]").forEach((button) => {
      const on = button.dataset.addressType === (shielded ? "shielded" : "public");
      button.classList.toggle("active", on);
      button.setAttribute("aria-pressed", String(on));
    });
    $("#address-sample").textContent = shielded
      ? "Địa chỉ được bảo vệ: chưa kết nối"
      : "Địa chỉ công khai: chưa kết nối";
    $("#address-help-title").textContent = shielded
      ? "Địa chỉ được bảo vệ" : "Địa chỉ công khai";
    $("#address-help-text").textContent = shielded
      ? "Địa chỉ được bảo vệ giúp hạn chế công khai thông tin giao dịch trên chuỗi. Phạm vi bảo vệ còn tùy cấu hình và loại địa chỉ."
      : "Địa chỉ công khai có thể làm lộ thông tin giao dịch trên chuỗi, bao gồm số tiền và mối liên hệ giữa các địa chỉ.";
  }

  function handleSendPreview(event) {
    event.preventDefault();
    const address = $("#send-address").value.trim();
    const rawAmount = $("#send-amount").value.trim();
    const error = $("#send-error");
    const validDecimal = /^\d+(?:[.,]\d{1,8})?$/.test(rawAmount);
    const amount = validDecimal ? Number(rawAmount.replace(",", ".")) : NaN;
    let message = "";
    if (!address) message = "Vui lòng nhập địa chỉ người nhận để thử bước xem trước.";
    else if (address.length < 16 || address.length > 512) message = "Địa chỉ chưa đủ độ dài hoặc quá dài cho bước xem trước.";
    else if (!validDecimal || !Number.isFinite(amount) || amount <= 0 || amount > 21000000)
      message = "Nhập số lượng ZEC hợp lệ, lớn hơn 0 và tối đa 8 chữ số thập phân.";
    if (message) {
      error.textContent = message;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    // Dùng textContent để không chèn HTML từ dữ liệu người dùng.
    $("#preview-address").textContent = address;
    $("#preview-amount").textContent = rawAmount.replace(".", ",") + " ZEC (mẫu)";
    $("#preview-note").textContent = $("#send-note").value.trim() || "Không có ghi chú";
    const dialog = $("#preview-dialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else notify("Trình duyệt không hỗ trợ cửa sổ xem trước. Không có giao dịch nào được gửi.");
  }

  function csvCell(v) {
    return '"' + String(v).replace(/"/g, '""') + '"';
  }
  function exportSampleCsv() {
    const headings = ["Mã mẫu", "Mô tả", "Hướng", "Nhóm địa chỉ", "Ngày mẫu", "Số lượng ZEC", "Trạng thái"];
    const rows = transactions.map((t) =>
      [t.id, t.name, t.type === "in" ? "Nhận" : "Gửi", t.pool, t.date, (t.type === "in" ? "+" : "-") + t.amount.toFixed(4), "Dữ liệu minh họa"]);
    const data = "\ufeff" + [headings, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zgis-giao-dich-minh-hoa.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Đã xuất CSV mẫu. Không chứa giao dịch thực tế.");
  }

  function init() {
    const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());
    $("#hom-nay").textContent = date;
    renderTransactions();
    setTheme(safeRead("zgis-theme") === "dark");
    setBalancesVisible(safeRead("zgis-show-balances") !== "false");
    setReducedMotion(safeRead("zgis-reduce-motion") === "true");
    navigate(viewFromHash());

    $$("[data-view]").forEach((node) => node.addEventListener("click", (event) => {
      event.preventDefault();
      openView(node.dataset.view);
    }));
    window.addEventListener("hashchange", () => navigate(viewFromHash()));
    $("#menu-button").addEventListener("click", () => {
      const side = $("#thanh-dieu-huong");
      const opened = side.classList.toggle("open");
      $("#sidebar-overlay").hidden = !opened;
      $("#menu-button").setAttribute("aria-expanded", String(opened));
    });
    $("#sidebar-overlay").addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSidebar();
    });
    $("#theme-button").addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme !== "dark");
    });
    $("#dark-toggle").addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme !== "dark");
    });
    $("#visibility-button").addEventListener("click", () => setBalancesVisible(!balancesVisible));
    $("#balance-toggle").addEventListener("click", () => setBalancesVisible(!balancesVisible));
    $("#motion-toggle").addEventListener("click", () => {
      setReducedMotion(!document.documentElement.classList.contains("reduce-motion"));
    });
    $$("[data-address-type]").forEach((node) =>
      node.addEventListener("click", () => updateAddressType(node.dataset.addressType)));
    $("#send-form").addEventListener("submit", handleSendPreview);
    $("#close-dialog").addEventListener("click", () => $("#preview-dialog").close());
    $("#done-dialog").addEventListener("click", () => $("#preview-dialog").close());
    $("#preview-dialog").addEventListener("click", (event) => {
      if (event.target === $("#preview-dialog")) $("#preview-dialog").close();
    });
    $("#tx-search").addEventListener("input", renderTransactions);
    $$("[data-filter]").forEach((button) => button.addEventListener("click", () => {
      filter = button.dataset.filter;
      $$("[data-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderTransactions();
    }));
    $("#export-button").addEventListener("click", exportSampleCsv);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();