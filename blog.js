document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".blog-nav a");
  const blogPosts = document.querySelectorAll(".blog-post");

  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove("active-tag"));

      // Add active class to clicked link
      this.classList.add("active-tag");

      const filter = this.getAttribute("data-filter");

      blogPosts.forEach(post => {
        const tags = post.getAttribute("data-tags").split(",");
        const matches = tags.includes(filter);

        if (filter === "All" || matches) {
          post.style.display = "block";
        } else {
          post.style.display = "none";
        }
      });
    });
  });
});
