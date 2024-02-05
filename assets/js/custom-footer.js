const scroll_top = document.getElementById("scroll_top");

scroll_top.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
