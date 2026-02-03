window.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll("#hero .hero-slide"));
  const prev = document.getElementById("heroPrev");
  const next = document.getElementById("heroNext");

  if (slides.length === 0) return;

  let index = 0;

  function show(i){
    slides.forEach(s => s.classList.remove("is-active"));
    slides[i].classList.add("is-active");
  }

  function go(delta){
    index = (index + delta + slides.length) % slides.length;
    show(index);
  }

  prev?.addEventListener("click", () => go(-1));
  next?.addEventListener("click", () => go(1));

  // 自動スライド（不要ならこの3行を消す）
  setInterval(() => go(1), 4000);
});
