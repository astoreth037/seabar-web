// script.js
const form = document.getElementById('orderForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Basic validation
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();

  if (!name || !phone) {
    alert('Por favor llena nombre y teléfono.');
    return;
  }

  // Compose message
  const message = encodeURIComponent(
    `Hola, mi nombre es ${name}. Me gustaría hacer un pedido o consulta: ${form.message.value.trim()}`
  );
  const phoneNumber = '994928993'; // Change if necessary

  const url = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(url, '_blank');
});
