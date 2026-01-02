// plaid-core.js (no DOM)
(function(){
  function clamp01(x){ return Math.max(0, Math.min(1, x)); }
  function hexToRgb(hex){
    const h = hex.replace('#','').trim();
    if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    const n = parseInt(h,16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  }
  function mix(a,b,t){
    return {
      r: Math.round(a.r*(1-t)+b.r*t),
      g: Math.round(a.g*(1-t)+b.g*t),
      b: Math.round(a.b*(1-t)+b.b*t),
    };
  }
  function darken(rgb, amount){ return mix(rgb, {r:0,g:0,b:0}, clamp01(amount)); }
  function lighten(rgb, amount){ return mix(rgb, {r:255,g:255,b:255}, clamp01(amount)); }

  function normalizeHex(v){
    const t = (v || '').trim();
    if(!t) return null;
    const withHash = t.startsWith('#') ? t : ('#' + t);
    return hexToRgb(withHash) ? withHash.toUpperCase() : null;
  }

  const DEFAULT = {
    colors: ['#19CFCF', '#FF0000', '#FFFFFF'],
    x_mirror: true,
    y_mirror: true,
    weft_same: true,
    twill: '1x1',
    warp: [{c:0,w:12},{c:1,w:12},{c:2,w:12}],
    weft: []
  };

  function serializeToHash(S){
    const colors = S.colors.map(h=>h.replace('#','')).join(',');
    const x_str = S.warp.map(s => `${s.c}x${s.w}`).join(',');
    const y_str = (S.weft_same ? '' : S.weft.map(s => `${s.c}x${s.w}`).join(','));
    const params = new URLSearchParams();
    params.set('colors', colors);
    params.set('twill', S.twill);
    params.set('x_mirror', S.x_mirror ? '1' : '0');
    params.set('y_mirror', S.y_mirror ? '1' : '0');
    params.set('y_same', S.weft_same ? '1' : '0');
    params.set('x_str', x_str);
    if(!S.weft_same) params.set('y_str', y_str);
    return '#' + params.toString();
  }

  function parseHashInto(S){
    const h = location.hash.startsWith('#') ? location.hash.slice(1) : '';
    if(!h) return false;
    const p = new URLSearchParams(h);

    const colorsRaw = p.get('colors');
    if(colorsRaw){
      const arr = colorsRaw.split(',').map(x => '#'+x.trim());
      if(arr.every(x => hexToRgb(x))) S.colors = arr.map(x=>x.toUpperCase());
    }
    const tw = p.get('twill'); if(tw) S.twill = tw;
    S.x_mirror = p.get('x_mirror') === '1';
    S.y_mirror = p.get('y_mirror') === '1';
    S.weft_same = p.get('y_same') !== '0';

    const xStr = p.get('x_str');
    if(xStr){
      const warp = xStr.split(',').map(tok=>{
        const [c,w] = tok.split('x');
        return { c: parseInt(c,10), w: parseInt(w,10) };
      }).filter(s => Number.isFinite(s.c) && Number.isFinite(s.w) && s.w>0);
      if(warp.length) S.warp = warp;
    }

    const yStr = p.get('y_str');
    if(!S.weft_same && yStr){
      const weft = yStr.split(',').map(tok=>{
        const [c,w] = tok.split('x');
        return { c: parseInt(c,10), w: parseInt(w,10) };
      }).filter(s => Number.isFinite(s.c) && Number.isFinite(s.w) && s.w>0);
      S.weft = weft;
    }
    return true;
  }

  function mirrorStripes(stripes){
    const rev = stripes.slice().reverse();
    return stripes.concat(rev);
  }

  function expandToColorPerPixel(stripes, colors, mirrorFlag){
    let seq = stripes.slice();
    if(mirrorFlag) seq = mirrorStripes(seq);

    const total = seq.reduce((sum,s)=>sum+s.w,0);
    const out = new Array(total);
    let k = 0;
    for(const s of seq){
      const c = colors[Math.min(Math.max(s.c,0), colors.length-1)];
      const rgb = hexToRgb(c) || {r:200,g:200,b:200};
      for(let i=0;i<s.w;i++) out[k++] = rgb;
    }
    return out;
  }

  function renderPlaidToCanvas(S, canvas){
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const W = canvas.width, H = canvas.height;

    const warpRGB = expandToColorPerPixel(S.warp, S.colors, S.x_mirror);
    const weftSource = S.weft_same ? S.warp : (S.weft.length ? S.weft : S.warp);
    const weftRGB = expandToColorPerPixel(weftSource, S.colors, S.y_mirror);

    const img = ctx.createImageData(W,H);
    const data = img.data;

    const baseMix = 0.55;
    const shadeAmt = 0.10;
    const twillOn = (S.twill === '1x1');

    for(let y=0; y<H; y++){
      const cy = weftRGB[y % weftRGB.length];
      for(let x=0; x<W; x++){
        const cx = warpRGB[x % warpRGB.length];

        let c = mix(cx, cy, baseMix);

        if(twillOn){
          const overWeft = ((x + y) & 1) === 0;
          c = overWeft ? mix(cx, cy, 0.70) : mix(cx, cy, 0.40);
        }

        const rib = ((x % 6) === 0) || ((y % 6) === 0);
        c = rib ? darken(c, shadeAmt) : lighten(c, shadeAmt * 0.5);

        const idx = (y*W + x)*4;
        data[idx+0] = c.r;
        data[idx+1] = c.g;
        data[idx+2] = c.b;
        data[idx+3] = 255;
      }
    }
    ctx.putImageData(img,0,0);
  }

  // expose
  window.PlaidCore = {
    DEFAULT,
    normalizeHex,
    serializeToHash,
    parseHashInto,
    renderPlaidToCanvas
  };
})();
