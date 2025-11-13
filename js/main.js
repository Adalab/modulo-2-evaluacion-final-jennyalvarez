
const API_URL_1 = "https://fakestoreapi.com/products";
const API_URL_2 = "https://raw.githubusercontent.com/Adalab/resources/master/apis/products.json";
const PLACEHOLDER_IMG = "https://placehold.co/600x400?text=No+Image";

/* API_URL_1: es la primera fuente de datos.

API_URL_2: es la API de respaldo si la primera falla */

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");

/* getElementById método DOM que se usa para seleccionar un elemento HTML por su ID. */

/* searchInput → campo de texto donde escribimos la búsqueda.

searchButton → botón de “Buscar”.

productList → contenedor donde mostraremos las tarjetas de productos.

cartItems → <ul> dentro del carrito, donde listamos los productos añadidos. */


// BOTONES "ELIMINAR" DENTRO DEL CARRITO
cartItems.addEventListener('click', (e) => {
  const btn = e.target.closest('.cart__remove');
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);
  removeFromCart(id);
});

let products = [];
let cart = [];


/* products:  lista completa de productos descargados desde la API.

cart: lista de productos añadidos al carrito. */


// LOCAL STORAGE

function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    displayCart();
  }
}


/* Busca en localStorage el valor "cart".

Si existe, lo convierte de texto a array usando JSON.parse().

Carga ese carrito en la variable cart.

Muestra su contenido en pantalla llamando a displayCart(). */



// GUARDAR CARRITO EN LOCALSTORAGE
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* Convierte el array cart en texto JSON (JSON.stringify(cart)).

Lo guarda en localStorage como "cart". */



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

/* Usa fetch() para pedir los productos a la API.

    Si funciona:

Convierte la respuesta a JSON.

Guarda los datos en products.

Muestra los productos llamando a displayProducts(products).

Si falla la API 1:

Muestra un aviso en consola.

Intenta de nuevo con la API 2,

Si también falla la API 2, muestra un error. */

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

  // ESCUCHAR CLIC EN BOTON

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

Crea una tarjeta con:

Imagen, nombre, precio.

Botón “Añadir al carrito” o “Eliminar” 

Añade la tarjeta al productList.

Asigna un evento de clic a cada botón para ejecutar toggleCart(). */



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

Busca ese producto en products.

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
    li.classList.add('cart__item');

    const imageSrc = item.image || item.imageUrl || PLACEHOLDER_IMG;
    const price = item.price ? item.price.toFixed(2) : "0.00";

    li.innerHTML = `
      <img src="${imageSrc}" alt="${(item.title || item.name) || ''}" class="cart__img" />
      <div class="cart__info">
        <span class="cart__name">${item.title || item.name}</span>
        <span class="cart__price">${price} €</span>
      </div>
      <button class="cart__remove" data-id="${item.id}">Eliminar</button>
    `;

    cartItems.appendChild(li);
  });
}

/* 

Limpia el contenedor cartItems (lo deja vacío).

Si el carrito está vacío (cart.length === 0):
   Muestra mensaje "El carrito está vacío".
   Sale de la función con return.

Si hay productos en el carrito:
   Recorre cada producto (cart.forEach).
   Crea un elemento <li> con clase cart__item.
   Prepara la imagen (usa item.image, item.imageUrl o imagen placeholder).
   Formatea el precio a 2 decimales.
   Construye el HTML con: imagen, nombre, precio y botón "Eliminar".
   Añade el <li> al DOM (cartItems.appendChild).

 El carrito lateral se actualiza mostrando todos los productos añadidos. */


// ELIMINAR ELEMENTO DEL CARRITO (usado por delegación en cartItems)
function removeFromCart(id) {
  const index = cart.findIndex(item => item.id === id);
  if (index === -1) return;
  cart.splice(index, 1);
  saveCartToLocalStorage();
  // actualizar UI
  displayProducts(products);
  displayCart();
}



/* Limpia la lista del carrito (cartItems.innerHTML = "").

Si el carrito está vacío, muestra el texto “El carrito está vacío”.

Si hay productos, crea un <li> por cada uno, con su nombre y precio.

Los añade al <ul> del carrito.*/



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

loadCartFromLocalStorage(); 
fetchProducts(); 

/* Primero carga el carrito que pudiera haber quedado guardado en el navegador.

Luego descarga los productos desde la API y los muestra en pantalla. */