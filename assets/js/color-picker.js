// color-picker.js (DOM helper)
(function(){
  // close on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.picker-pop').forEach(p => p.style.display = 'none');
  });

  function attachIroPicker({ rowEl, swatchEl, textEl, getHex, setHex }) {
    const pop = document.createElement('div');
    pop.className = 'picker-pop';
    rowEl.appendChild(pop);

    let picker = null;

    function openPicker(e){
      e.stopPropagation();
      document.querySelectorAll('.picker-pop').forEach(p => { if(p !== pop) p.style.display = 'none'; });
      pop.style.display = 'block';

      const startHex = getHex() || '#FFFFFF';

      if(!picker){
        picker = new iro.ColorPicker(pop, {
          width: 220,
          color: startHex,
          layout: [
            { component: iro.ui.Box },
            { component: iro.ui.Slider, options: { sliderType: 'hue' } }
          ]
        });

        picker.on('color:change', (c) => {
          const hex = c.hexString.toUpperCase();
          setHex(hex);
        });
      } else {
        picker.color.set(startHex);
      }
    }

    swatchEl.addEventListener('click', openPicker);
    textEl.addEventListener('focus', openPicker);
    pop.addEventListener('click', (e) => e.stopPropagation());

    textEl.addEventListener('input', () => {
      const hex = window.PlaidCore.normalizeHex(textEl.value);
      if(hex){
        setHex(hex);
        if(picker) picker.color.set(hex);
      }
    });
  }

  window.ColorPickerUI = { attachIroPicker };
})();
