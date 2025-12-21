// Floating Cart
const cartDrawer = document.getElementById('cartDrawer');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');

const cart = [];

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price);

    cart.push({ name, price });
    updateCart();
  });
});

function updateCart() {
  cartCount.textContent = cart.length;
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty</p>';
  } else {
    let total = 0;
    cart.forEach(item => {
      total += item.price;
      const div = document.createElement('div');
      div.textContent = `${item.name} – ₹${item.price}`;
      cartItems.appendChild(div);
    });
    cartTotal.textContent = total.toFixed(2);
  }
}

// Open/Close Cart Drawer
document.getElementById('openCart').addEventListener('click', (e) => {
  e.preventDefault();
  cartDrawer.classList.add('open');
});
document.getElementById('closeCart').addEventListener('click', () => {
  cartDrawer.classList.remove('open');
});

// Get User Location
document.getElementById('getLocationBtn').addEventListener('click', () => {
  const result = document.getElementById('locationResult');
  const mapDiv = document.getElementById('map');

  if (!navigator.geolocation) {
    result.textContent = "Geolocation not supported.";
    return;
  }

  result.textContent = "Fetching your location…";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      result.textContent = `Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}`;
      mapDiv.innerHTML = `<iframe width="100%" height="100%" style="border:0;" loading="lazy" allowfullscreen src="https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed"></iframe>`;
    },
    (error) => {
      result.textContent = "Unable to retrieve location.";
    }
  );
});
