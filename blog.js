]document.addEventListener("DOMContentLoaded", () => {
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
          window.scrollTo({ top: 0, behavior: "smooth" }); // optional scroll
        } else {
          post.style.display = "none";
        }
      });
    });
  });

  // Optional: Resize iframe support
  const observer = new ResizeObserver(() => {
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(iframe => {
      iframe.style.width = "100%";
    });
  });

  blogPosts.forEach(post => {
    observer.observe(post);
  });
});
