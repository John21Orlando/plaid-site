(function(){
  // generate 32 placeholder products (scrollable)
  const grid = document.getElementById('productGrid');
  if(!grid) return;

  const count = 32; // you said 20-40
  for(let i=1;i<=count;i++){
    const card = document.createElement('div');
    card.className = 'card';

    const ph = document.createElement('div');
    ph.className = 'shirt-ph';

    const sku = document.createElement('div');
    sku.className = 'sku';
    sku.textContent = `S1-NO.${String(i).padStart(2,'0')}`;

    card.append(ph, sku);
    grid.appendChild(card);
  }
})();
