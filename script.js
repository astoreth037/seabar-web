// script.js

// Scroll to contact form when "Haz tu pedido" or "Pedir ahora" buttons clicked
document.addEventListener("DOMContentLoaded", function () {
  const orderHeroBtn = document.getElementById("order-hero-btn");
  const orderProductBtn = document.getElementById("order-product-btn");
  const contactSection = document.getElementById("contact");

  function scrollToContact() {
    contactSection.scrollIntoView({ behavior: "smooth" });
  }

  orderHeroBtn.addEventListener("click", scrollToContact);
  orderProductBtn.addEventListener("click", scrollToContact);

  // Simple form validation before submit (for demonstration)
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", function (e) {
    if (!form.checkValidity()) {
      e.preventDefault();
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }
    // Normally here one would submit or handle form data
    e.preventDefault();
    alert("¡Mensaje enviado! Gracias por contactarnos.");
    form.reset();
  });
});
