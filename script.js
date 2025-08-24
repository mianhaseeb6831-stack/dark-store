// Log a welcome message in the console
console.log("Welcome to Dark Store website! 🚀");

// Contact form handler
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent page reload

      // Get form values
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      if (name && email && message) {
        alert(`✅ Thank you, ${name}! Your message has been sent.`);
        form.reset(); // Clear form after submission
      } else {
        alert("⚠️ Please fill in all fields before submitting.");
      }
    });
  }
});

// Highlight active navigation link
const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll("nav ul li a");

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.style.color = "#ff9800"; // Highlight current page in orange
  }
});
