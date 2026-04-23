
document.addEventListener("DOMContentLoaded", () => {
  const greetBtn = document.getElementById("greetBtn");
  if (greetBtn) {
    greetBtn.addEventListener("click", () => {
      alert("Thank you for visiting my portfolio!");
    });
  }

  const contactLinks = document.querySelectorAll('a[href="#contact"]');
  const contactSection = document.getElementById("contact");

  if (contactSection && contactLinks.length > 0) {
    contactLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        contactSection.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // Contact form submission confirmation (front-end only)
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  if (contactForm && formMessage) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Stop actual form submission

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");

      if (
        !nameInput.value.trim() ||
        !emailInput.value.trim() ||
        !messageInput.value.trim()
      ) {
        formMessage.textContent = "Please fill in all fields before submitting.";
        formMessage.classList.remove("success");
        formMessage.classList.add("error");
        return;
      }

      formMessage.textContent = `Thank you, ${nameInput.value}, your message has been received!`;
      formMessage.classList.remove("error");
      formMessage.classList.add("success");
      contactForm.reset();
    });
  }
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

