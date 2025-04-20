document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".imp_click");

    links.forEach(link => {
      if (link.href && !link.href.startsWith("#") && !link.target) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          document.querySelector("#loading").classList.remove("d-none");
          document.querySelector("main").classList.add("d-none");
          setTimeout(() => {
            window.location.href = this.href;
          }, 200); // match with CSS transition time
        });
      }
    });
  });