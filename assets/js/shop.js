(function () {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const products = [
    { code: "S1-NO.01", img: "assets/img/products/P1.jpg" },
    { code: "S1-NO.02", img: "assets/img/products/P2.jpg" },
  ];

  let html = "";
  products.forEach(p => {
    html += `
      <div class="card">
        <img class="shirt-img" src="${p.img}" alt="${p.code}">
        <div class="sku">${p.code}</div>
      </div>
    `;
  });

  grid.innerHTML = html;
})();
