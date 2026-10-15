const zapatos = {
  "JP-001": { nombre: "Nike Air Max", marca: "Nike", categoria: "Deportivos", talla: 40, precio: 350000, cantidad: 8, estado: "Activo" },
  "JP-002": { nombre: "Adidas Grand Court", marca: "Adidas", categoria: "Deportivos", talla: 39, precio: 280000, cantidad: 12, estado: "Activo" },
  "JP-003": { nombre: "Puma Smash", marca: "Puma", categoria: "Deportivos", talla: 41, precio: 220000, cantidad: 3, estado: "Activo" },
  "JP-004": { nombre: "Converse Chuck Taylor", marca: "Converse", categoria: "Casuales", talla: 38, precio: 260000, cantidad: 0, estado: "Activo" },
  "JP-005": { nombre: "New Balance 574", marca: "New Balance", categoria: "Deportivos", talla: 42, precio: 390000, cantidad: 6, estado: "Activo" },
  "JP-006": { nombre: "Vans Old Skool", marca: "Vans", categoria: "Casuales", talla: 40, precio: 290000, cantidad: 9, estado: "Inactivo" }
};

const idEditar = new URLSearchParams(window.location.search).get("id");
const zapato = zapatos[idEditar];

if (zapato) {
  document.getElementById("titulo").textContent = "Editar zapato";
  document.getElementById("subtitulo").textContent = "Actualiza la información de " + zapato.nombre + " · " + idEditar + ".";
  document.getElementById("guardar").textContent = "Guardar cambios";
  document.title = "Editar zapato · JP CALZADO";

  document.getElementById("codigo").value = idEditar;
  document.getElementById("nombre").value = zapato.nombre;
  document.getElementById("f-marca").value = zapato.marca;
  document.getElementById("f-categoria").value = zapato.categoria;
  document.getElementById("talla").value = zapato.talla;
  document.getElementById("precio").value = zapato.precio;
  document.getElementById("cantidad").value = zapato.cantidad;
  document.getElementById("f-estado").value = zapato.estado;
}

const form = document.getElementById("form");
const aviso = document.getElementById("aviso");

function mostrarError(campo, mensaje) {
  const error = campo.parentElement.querySelector(".error");
  campo.classList.add("invalido");
  error.textContent = mensaje;
  error.hidden = false;
}

function limpiarError(campo) {
  const error = campo.parentElement.querySelector(".error");
  campo.classList.remove("invalido");
  if (error) {
    error.textContent = "";
    error.hidden = true;
  }
}

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const codigo = document.getElementById("codigo");
  const nombre = document.getElementById("nombre");
  const marca = document.getElementById("f-marca");
  const categoria = document.getElementById("f-categoria");
  const talla = document.getElementById("talla");
  const precio = document.getElementById("precio");
  const cantidad = document.getElementById("cantidad");
  const imagen = document.getElementById("imagen");

  [codigo, nombre, marca, categoria, talla, precio, cantidad, imagen].forEach(limpiarError);

  let errores = 0;

  if (!/^JP-\d{3}$/.test(codigo.value.trim())) {
    mostrarError(codigo, "Usa el formato JP-001.");
    errores++;
  }

  if (nombre.value.trim().length < 3) {
    mostrarError(nombre, "Escribe un nombre de mínimo 3 caracteres.");
    errores++;
  }

  if (marca.value === "") {
    mostrarError(marca, "Selecciona una marca.");
    errores++;
  }

  if (categoria.value === "") {
    mostrarError(categoria, "Selecciona una categoría.");
    errores++;
  }

  if (talla.value < 35 || talla.value > 42 || talla.value === "") {
    mostrarError(talla, "Ingresa una talla entre 35 y 42.");
    errores++;
  }

  if (precio.value === "" || Number(precio.value) <= 0) {
    mostrarError(precio, "El precio debe ser mayor que $0.");
    errores++;
  }

  if (cantidad.value === "" || Number(cantidad.value) < 0 || !Number.isInteger(Number(cantidad.value))) {
    mostrarError(cantidad, "Ingresa un número entero igual o mayor a 0.");
    errores++;
  }

  if (imagen.files.length === 0 && !zapato) {
    mostrarError(imagen, "Sube una imagen JPG, PNG o WEBP.");
    errores++;
  }

  if (errores > 0) {
    aviso.textContent = "No se pudo guardar: hay " + errores + (errores === 1 ? " error." : " errores.");
    aviso.hidden = false;
  } else {
    aviso.hidden = true;
    form.reset();
    aviso.textContent = "";
  }
});

const inputImagen = document.getElementById("imagen");
const zona = document.getElementById("zona");
const vista = document.getElementById("vista");
const zonaTexto = document.getElementById("zona-texto");
const nombreArchivo = document.getElementById("nombre-archivo");

function mostrarVista(src) {
  vista.src = src;
  vista.hidden = false;
  zonaTexto.hidden = true;
}

function quitarVista() {
  vista.removeAttribute("src");
  vista.hidden = true;
  zonaTexto.hidden = false;
  nombreArchivo.hidden = true;
}

inputImagen.addEventListener("change", function () {
  const archivo = inputImagen.files[0];
  limpiarError(inputImagen);

  if (!archivo) {
    quitarVista();
    return;
  }

  const tiposValidos = ["image/jpeg", "image/png", "image/webp"];

  if (!tiposValidos.includes(archivo.type)) {
    inputImagen.value = "";
    quitarVista();
    mostrarError(inputImagen, "Sube una imagen JPG, PNG o WEBP.");
    return;
  }

  if (archivo.size > 5 * 1024 * 1024) {
    inputImagen.value = "";
    quitarVista();
    mostrarError(inputImagen, "La imagen debe pesar máximo 5 MB.");
    return;
  }

  mostrarVista(URL.createObjectURL(archivo));
  nombreArchivo.textContent = archivo.name + " · " + Math.round(archivo.size / 1024) + " KB";
  nombreArchivo.hidden = false;
});

zona.addEventListener("dragover", function (evento) {
  evento.preventDefault();
  zona.classList.add("arrastrando");
});

zona.addEventListener("dragleave", function () {
  zona.classList.remove("arrastrando");
});

zona.addEventListener("drop", function (evento) {
  evento.preventDefault();
  zona.classList.remove("arrastrando");
  inputImagen.files = evento.dataTransfer.files;
  inputImagen.dispatchEvent(new Event("change"));
});

form.addEventListener("reset", quitarVista);

if (zapato) {
  mostrarVista("img/" + idEditar.toLowerCase() + ".jpg");
}