(function(){
  const el = {
    colorsBox: document.getElementById('colors'),
    addColor: document.getElementById('addColor'),
    xMirror: document.getElementById('xMirror'),
    yMirror: document.getElementById('yMirror'),
    weftSame: document.getElementById('weftSame'),
    warpStripes: document.getElementById('warpStripes'),
    weftStripes: document.getElementById('weftStripes'),
    twill: document.getElementById('twill'),
    cv: document.getElementById('cv'),
    saveLink: document.getElementById('saveLink'),
    reset: document.getElementById('reset'),
    status: document.getElementById('status')
  };

  let S = structuredClone(window.PlaidCore.DEFAULT);

  function stripesToText(arr){ return arr.map(s => `${s.c},${s.w}`).join('\n'); }
  function textToStripes(txt){
    return txt.split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line=>{
        const [c,w] = line.split(',').map(x=>x.trim());
        return { c: parseInt(c,10), w: parseInt(w,10) };
      })
      .filter(s => Number.isFinite(s.c) && Number.isFinite(s.w) && s.w>0);
  }

  function renderColorInputs(){
    el.colorsBox.innerHTML = '';

    S.colors.forEach((hex, i)=>{
      const row = document.createElement('div');
      row.className = 'colorItem';

      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = (hex || '#FFFFFF').toUpperCase();
      inp.maxLength = 7;

      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.background = (hex || '#FFFFFF');

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.addEventListener('click', (e)=>{
        e.stopPropagation();
        if(S.colors.length <= 2) return;
        S.colors.splice(i,1);
        S.warp.forEach(s => s.c = Math.min(s.c, S.colors.length-1));
        S.weft.forEach(s => s.c = Math.min(s.c, S.colors.length-1));
        syncTextareas();
        renderColorInputs();
        schedule();
      });

      row.append(inp, sw, document.createTextNode(' index '+i+' '), del);
      el.colorsBox.appendChild(row);

      // picker binding
      window.ColorPickerUI.attachIroPicker({
        rowEl: row,
        swatchEl: sw,
        textEl: inp,
        getHex: ()=> window.PlaidCore.normalizeHex(inp.value) || '#FFFFFF',
        setHex: (newHex)=>{
          inp.value = newHex;
          sw.style.background = newHex;
          S.colors[i] = newHex;
          schedule();
        }
      });

      // manual typing already handled in color-picker.js
    });
  }

  function syncUI(){
    el.xMirror.checked = S.x_mirror;
    el.yMirror.checked = S.y_mirror;
    el.weftSame.checked = S.weft_same;
    el.twill.value = S.twill;
    el.weftStripes.disabled = S.weft_same;

    el.warpStripes.value = stripesToText(S.warp);
    if(S.weft_same){
      el.weftStripes.value = '(Same as warp)';
    } else {
      el.weftStripes.value = stripesToText(S.weft.length ? S.weft : S.warp);
    }
    renderColorInputs();
  }

  function syncTextareas(){
    el.warpStripes.value = stripesToText(S.warp);
    if(!S.weft_same) el.weftStripes.value = stripesToText(S.weft);
  }

  // Debounced render
  let t = null;
  function schedule(force=false){
    if(force){ render(); return; }
    clearTimeout(t);
    t = setTimeout(render, 60);
  }

  function render(){
    window.PlaidCore.renderPlaidToCanvas(S, el.cv);
    const newHash = window.PlaidCore.serializeToHash(S);
    if(location.hash !== newHash) history.replaceState(null,'', newHash);
  }

  // Events
  el.addColor.addEventListener('click', ()=>{
    S.colors.push('#CCCCCC');
    renderColorInputs();
    schedule();
  });

  el.xMirror.addEventListener('change', ()=>{ S.x_mirror = el.xMirror.checked; schedule(); });
  el.yMirror.addEventListener('change', ()=>{ S.y_mirror = el.yMirror.checked; schedule(); });
  el.weftSame.addEventListener('change', ()=>{
    S.weft_same = el.weftSame.checked;
    el.weftStripes.disabled = S.weft_same;
    if(S.weft_same) S.weft = [];
    else S.weft = textToStripes(el.weftStripes.value) || structuredClone(S.warp);
    syncUI();
    schedule();
  });

  el.twill.addEventListener('change', ()=>{ S.twill = el.twill.value; schedule(); });

  el.warpStripes.addEventListener('input', ()=>{
    const arr = textToStripes(el.warpStripes.value);
    if(arr.length){
      S.warp = arr.map(s=>({c: Math.min(Math.max(s.c,0), S.colors.length-1), w:s.w}));
      if(S.weft_same) syncUI();
      schedule();
    }
  });

  el.weftStripes.addEventListener('input', ()=>{
    if(S.weft_same) return;
    const arr = textToStripes(el.weftStripes.value);
    if(arr.length){
      S.weft = arr.map(s=>({c: Math.min(Math.max(s.c,0), S.colors.length-1), w:s.w}));
      schedule();
    }
  });

  el.saveLink.addEventListener('click', async ()=>{
    const hash = window.PlaidCore.serializeToHash(S);
    const url = location.origin + location.pathname + hash;
    try{
      await navigator.clipboard.writeText(url);
      el.status.textContent = 'Copied link to clipboard.';
    } catch {
      el.status.textContent = 'Could not auto-copy. Here is the link: ' + url;
    }
  });

  el.reset.addEventListener('click', ()=>{
    S = structuredClone(window.PlaidCore.DEFAULT);
    location.hash = '';
    syncUI();
    schedule(true);
  });

  // Init (hash)
  const parsed = window.PlaidCore.parseHashInto(S);
  if(!parsed) S = structuredClone(window.PlaidCore.DEFAULT);
  syncUI();
  schedule(true);
})();
