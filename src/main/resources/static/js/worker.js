document.addEventListener('DOMContentLoaded', function () {

  // Auto-dismiss flash alerts
  setTimeout(function () {
    document.querySelectorAll('.af').forEach(function (a) {
      try { bootstrap.Alert.getOrCreateInstance(a).close(); } catch (e) {}
    });
  }, 4000);

  // Toggle sidebar
  document.getElementById('mt').addEventListener('click', function () {
    document.getElementById('wr').classList.toggle('tog');
  });

  // Aplicar color de acento al nav link activo (leído desde data-color del <body>)
  var accentColor = document.body.dataset.accent || '#4f46e5';
  document.querySelectorAll('.nl.active').forEach(function (el) {
    el.style.background = accentColor;
    el.style.borderColor = accentColor;
  });

  // Navegación SPA
  document.querySelectorAll('.nl').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelectorAll('.nl').forEach(function (x) {
        x.classList.remove('active');
        x.style.background = '';
        x.style.borderColor = '';
      });
      link.classList.add('active');
      link.style.background  = accentColor;
      link.style.borderColor = accentColor;

      document.querySelectorAll('.view-section').forEach(function (s) { s.classList.add('dn'); });
      var sec = document.getElementById(link.dataset.t);
      if (sec) sec.classList.remove('dn');
      var titulo = document.getElementById('vt');
      if (titulo && link.dataset.ti) titulo.textContent = link.dataset.ti;
    });
  });
});
