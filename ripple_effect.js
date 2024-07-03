document.querySelectorAll(".bubble-effect-button").forEach((button) => {
  function doBubble(button, e) {
    if (button.classList.contains('clicked')) {
      button.classList.remove('clicked')
      clearTimeout(window.bubble_button_timeout)
    }
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty("--x", x + "px");
    button.style.setProperty("--y", y + "px");
    button.classList.add('clicked')
    window.bubble_button_timeout = setTimeout(() => button.classList.remove('clicked'), 800)
  }
  let onMobile = false
  button.addEventListener("touchstart", function (e) {
    doBubble(button, e.changedTouches[0])
    onMobile = true
  })
  button.addEventListener("mousedown", function (e) {
    if (onMobile) {
      return
    }
    doBubble(button, e)
  });
});