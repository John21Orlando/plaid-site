(function () {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  // 先放 24 个占位（你后面改成 20~40 都行）
  const N = 24;

  let html = "";
  for (let i = 1; i <= N; i++) {
    const num = String(i).padStart(2, "0");
    html += `
      <div class="card">
        <div class="shirt-ph" aria-label="placeholder"></div>
        <div class="sku">S1-NO.${num}</div>
      </div>
    `;
  }
  grid.innerHTML = html;
})();
