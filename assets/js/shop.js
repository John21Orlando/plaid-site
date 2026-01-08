(function () {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const TOTAL = 25; // 👈 你有多少张图
  let html = "";

  for (let i = 1; i <= TOTAL; i++) {
    const code = `S1-NO.${String(i).padStart(2, "0")}`;
    const img = `assets/img/products/P${i}.jpg`;

    html += `
      <div class="card">
        <img class="shirt-img" src="${img}" alt="${code}">
        <div class="sku">${code}</div>
      </div>
    `;
  }

  grid.innerHTML = html;
})();

