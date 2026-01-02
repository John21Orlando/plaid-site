(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html': 'home',
    'shop.html': 'shop',
    'archive.html': 'archive',
    'diy.html': 'diy',
    'search.html': 'search'
  };
  const key = map[path];
  if(!key) return;
  document.querySelectorAll('[data-nav]').forEach(a=>{
    if(a.getAttribute('data-nav') === key) a.classList.add('active');
  });
})();
