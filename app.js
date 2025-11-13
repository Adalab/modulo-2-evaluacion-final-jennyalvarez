
const API_URL_1 = "https://fakestoreapi.com/products";
const API_URL_2 = "https://raw.githubusercontent.com/Adalab/resources/master/apis/products.json";
const PLACEHOLDER_IMG = "https://placehold.co/600x400?text=No+Image";

/* API_URL_1: es la primera fuente de datos.

API_URL_2: es la API de respaldo si la primera falla */

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");

/* getElementById es un método DOM que se usa para seleccionar un elemento HTML por su ID. */

/* searchInput → el campo de texto donde el escribimos la búsqueda.

searchButton → el botón de “Buscar”.

productList → el contenedor donde mostraremos las tarjetas de productos.

cartItems → el <ul> dentro del carrito, donde listamos los productos añadidos. */

// DELEGACIÓN DE BOTONES "ELIMINAR" DENTRO DEL CARRITO
cartItems.addEventListener('click', (e) => {
  const btn = e.target.closest('.cart__remove');
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);
  removeFromCart(id);
});


let products = [];
let cart = [];


/* products: almacenará la lista completa de productos descargados desde la API.

cart:  donde guardamos los productos que el usuario añade al carrito. */





// RECUPERAR CARRITO 

function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    displayCart();
  }
}


/* Busca en localStorage un valor guardado con la clave "cart".

Si existe, lo convierte de texto a array usando JSON.parse().

Carga ese carrito en la variable cart.

Muestra su contenido en pantalla llamando a displayCart(). */



// GUARDAR CARRITO EN LOCALSTORAGE
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* Convierte el array cart en texto JSON (JSON.stringify(cart)).

Lo guarda en localStorage con la clave "cart". */



// OBTENER PRODUCTOS DESDE LA API
async function fetchProducts() {
  try {
    const response = await fetch(API_URL_1);
    if (!response.ok) throw new Error("Error con la API 1");
    const data = await response.json();
    products = data;
    displayProducts(products);
  } catch (error) {
    console.warn("Error con la API 1. Intentando con la API 2...");
    try {
      const response2 = await fetch(API_URL_2);
      const data2 = await response2.json();
      products = data2.products || data2;
      displayProducts(products);
    } catch (err) {
      console.error("No se pudieron cargar los productos.", err);
    }
  }
}

/* Usa fetch() para pedir los productos a la API 1.

    Si todo va bien:

Convierte la respuesta a JSON.

Guarda los datos en products.

Muestra los productos llamando a displayProducts(products).

Si falla (por ejemplo, la API no responde):

Muestra un aviso en consola.

Intenta de nuevo con la API 2 (la copia local en GitHub).

Si también falla la API 2, muestra un error.

Es una función async porque usa await (operaciones asíncronas).*/ 





// MOSTRAR PRODUCTOS EN PANTALLA

function displayProducts(list) {
  productList.innerHTML = "";
  list.forEach(product => {
    const imageSrc = product.image || product.imageUrl || PLACEHOLDER_IMG;
    const price = product.price ? product.price.toFixed(2) : "0.00";
    const title = product.title || product.name;
    const isInCart = cart.some(item => item.id === product.id);

    const card = document.createElement("div");
    card.classList.add("product");
    card.innerHTML = `
      <img src="${imageSrc}" alt="${title}" class="product__img" />
      <h3 class="product__name">${title}</h3>
      <p class="product__price">${price} €</p>
      <button 
        class="product__button ${isInCart ? "in-cart" : ""}" 
        data-id="${product.id}"
      >
        ${isInCart ? "Eliminar" : "Añadir al carrito"}
      </button>
    `;
    productList.appendChild(card);
  });

  // ESCUCHAR CLIC EN BOTONES

  document.querySelectorAll(".product__button").forEach(btn => {
    btn.addEventListener("click", toggleCart);
  });
}

/* Limpia el contenedor de productos (productList.innerHTML = "").

Recorre cada producto recibido desde la API (list.forEach(...)).

Para cada producto:

Define la imagen (product.image o PLACEHOLDER_IMG).

Calcula el precio con dos decimales.

Usa el título del producto.

Comprueba si ya está en el carrito (cart.some(...)).

Crea dinámicamente una tarjeta HTML con:

Imagen, nombre, precio.

Botón que dice “Añadir al carrito” o “Eliminar” según el estado.

Añade la tarjeta al productList.

Finalmente, asigna un evento de clic a cada botón para ejecutar toggleCart().

Es la función responsable de “pintar” todo en pantalla. */



// AÑADIR O ELIMINAR PRODUCTOS DEL CARRITO

function toggleCart(event) {
  const button = event.target;
  const id = parseInt(button.dataset.id);
  const product = products.find(p => p.id === id);

  const indexInCart = cart.findIndex(item => item.id === id);
  if (indexInCart === -1) {
    // Añadir
    cart.push(product);
  } else {
    // Eliminar
    cart.splice(indexInCart, 1);
  }

  // Guardar y actualizar
  saveCartToLocalStorage();
  displayProducts(products);
  displayCart();
}


/* Detecta qué botón fue presionado (event.target).

Lee el data-id del botón (el id del producto).

Busca ese producto en el array products.

Comprueba si ya está en el carrito:

Si no está, lo añade (cart.push(product)).

Si ya está, lo elimina (cart.splice()).

Guarda el carrito actualizado en localStorage.

Llama a:

displayProducts() → para actualizar el estado de los botones.

displayCart() → para actualizar la lista lateral del carrito. */





// MOSTRAR EL CARRITO LATERAL
function displayCart() {
  cartItems.innerHTML = "";
  if (cart.length === 0) {
    cartItems.innerHTML = "<li>El carrito está vacío</li>";
    return;
  }

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.title || item.name} - ${item.price.toFixed(2)} €`;
    cartItems.appendChild(li);
  });
}



/* Limpia la lista del carrito (cartItems.innerHTML = "").

Si el carrito está vacío, muestra el texto “El carrito está vacío”.

Si hay productos, los recorre y crea un <li> por cada uno, con su nombre y precio.

Los añade al <ul> del carrito.

Así, el usuario ve su carrito actualizado en todo momento. */

//  BUSCAR PRODUCTOS

function searchProducts() {
  const text = searchInput.value.toLowerCase();
  const filtered = products.filter(product =>
    (product.title || product.name).toLowerCase().includes(text)
  );
  displayProducts(filtered);
}

/* Toma el texto que escribió el usuario en el input.

Convierte todo a minúsculas para hacer una búsqueda no sensible a mayúsculas.

Usa filter() para quedarse solo con los productos cuyo nombre incluya ese texto.

Muestra esos productos en pantalla con displayProducts(filtered). */

// ASIGNAR EVENTO AL BOTÓN DE BÚSQUEDA
searchButton.addEventListener("click", searchProducts);

/* Asigna un evento de clic al botón “Buscar”.
Cuando se pulsa, ejecuta searchProducts(). */



// INICIAR LA APLICACIÓN

loadCartFromLocalStorage(); // ← Recuperar carrito guardado
fetchProducts(); // ← Cargar los productos desde la API

/* Primero carga el carrito que pudiera haber quedado guardado en el navegador.

Luego descarga los productos desde la API y los muestra en pantalla.

Estas dos funciones se ejecutan automáticamente al abrir la página. */