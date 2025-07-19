const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

let allProducts = [];
let selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];

/* Load products */
async function loadProducts() {
  const res = await fetch("products.json");
  const data = await res.json();
  allProducts = data.products;
  filterAndDisplay();
}

/* Display product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products.map(product => `
    <div class="product-card ${selectedProducts.some(p => p.id === product.id) ? 'selected' : ''}" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
        <button class="details-btn">Details</button>
        <p class="product-description hidden">${product.description}</p>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".product-card").forEach(card => {
    const id = parseInt(card.dataset.id);
    const product = allProducts.find(p => p.id === id);

    card.addEventListener("click", () => {
      const isSelected = selectedProducts.some(p => p.id === id);
      if (isSelected) {
        selectedProducts = selectedProducts.filter(p => p.id !== id);
      } else {
        selectedProducts.push(product);
      }
      localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
      updateSelectedProductsUI();
      filterAndDisplay();
    });

    card.querySelector(".details-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      card.classList.toggle("show-description");
    });
  });
}

/* Filter by category and search input */
function filterAndDisplay() {
  const category = categoryFilter.value;
  const query = searchInput.value.toLowerCase();
  const filtered = allProducts.filter(p =>
    (!category || p.category === category) &&
    (!query || p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
  );
  displayProducts(filtered);
}

/* Selected product tags UI */
function updateSelectedProductsUI() {
  selectedProductsList.innerHTML = selectedProducts.map((p, i) => `
    <div class="selected-item">
      <span>${p.name}</span>
      <button onclick="removeProduct(${i})">Remove</button>
    </div>
  `).join("");
}
window.removeProduct = function (index) {
  selectedProducts.splice(index, 1);
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  updateSelectedProductsUI();
  filterAndDisplay();
}

/* Generate Routine */
document.getElementById("generateRoutine").addEventListener("click", async () => {
  if (selectedProducts.length === 0) return;

  chatWindow.innerHTML += `<div class="user-message">Generate a routine for selected products.</div>`;

  const prompt = `You're a L'Oréal skincare advisor. Based only on these products, build a routine:\n\n${selectedProducts.map(p => `${p.name}: ${p.description}`).join("\n\n")}`;

  const res = await fetch("https://project-9.jkaur5.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "You are a helpful L’Oréal skincare advisor who only uses selected products." },
        { role: "user", content: prompt }
      ]
    }),
  });

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Sorry, something went wrong.";
  chatWindow.innerHTML += `<div class="ai-message">${reply}</div>`;
});

/* Chat form */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("userInput");
  const message = input.value;
  chatWindow.innerHTML += `<div class="user-message">${message}</div>`;
  input.value = "";

  const res = await fetch("https://project-9.jkaur5.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "You are a helpful L’Oréal product advisor." },
        { role: "user", content: message }
      ]
    }),
  });

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Sorry, something went wrong.";
  chatWindow.innerHTML += `<div class="ai-message">${reply}</div>`;
});

/* Filter triggers */
categoryFilter.addEventListener("change", filterAndDisplay);
searchInput.addEventListener("input", filterAndDisplay);

/* RTL toggle */
function toggleRTL() {
  document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl";
}

window.addEventListener("load", () => {
  updateSelectedProductsUI();
  loadProducts();
});
