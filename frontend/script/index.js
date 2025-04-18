document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".imp_click");

    links.forEach(link => {
      if (link.href && !link.href.startsWith("#") && !link.target) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          document.body.classList.add("fade-out");
          setTimeout(() => {
            window.location.href = this.href;
          }, 200); // match with CSS transition time
        });
      }
    });
  });