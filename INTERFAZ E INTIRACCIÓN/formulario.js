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

const form = document.getElementById("form");
const aviso = document.getElementById("aviso");
const guardar = document.getElementById("guardar");
const notaPie = document.getElementById("nota-pie");

/* ---------- Modo editar ---------- */
if (zapato) {
  document.getElementById("titulo").textContent = "Editar zapato";
  document.getElementById("subtitulo").textContent = "Actualiza la información de " + zapato.nombre + " · " + idEditar + ".";
  guardar.textContent = "✓ Guardar cambios";
  notaPie.textContent = "Los cambios no se guardan hasta confirmar.";
  document.title = "Editar zapato · JP CALZADO";

  document.getElementById("codigo").value = idEditar;
  document.getElementById("nombre").value = zapato.nombre;
  document.getElementById("f-marca").value = zapato.marca;
  document.getElementById("f-categoria").value = zapato.categoria;
  document.getElementById("talla").value = zapato.talla;
  document.getElementById("precio").value = zapato.precio;
  document.getElementById("cantidad").value = zapato.cantidad;
  document.getElementById("f-estado").value = zapato.estado;

  document.getElementById("antes-guardar").hidden = true;
  document.getElementById("registro-actual").hidden = false;
  document.getElementById("registro-texto").textContent = "Estás editando " + idEditar + ". Los cambios se aplicarán a este modelo al guardar.";
  document.getElementById("registro-stock").textContent = zapato.cantidad + " disponibles";

  const etiquetaEstado = document.getElementById("registro-estado");
  etiquetaEstado.textContent = zapato.estado;
  etiquetaEstado.classList.toggle("inactivo", zapato.estado === "Inactivo");
}

const notaOriginal = notaPie.textContent;

/* ---------- Errores ---------- */
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

function unir(lista) {
  if (lista.length === 1) {
    return lista[0];
  }
  const ultima = lista[lista.length - 1];
  const union = /^h?i/i.test(ultima) ? " e " : " y ";
  return lista.slice(0, -1).join(", ") + union + ultima;
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

  const fallos = [];
  const codigoTexto = codigo.value.trim().toUpperCase();

  if (!/^JP-\d{3}$/.test(codigoTexto)) {
    mostrarError(codigo, "Usa el formato JP-001.");
    fallos.push("Código");
  } else if (zapatos[codigoTexto] && codigoTexto !== idEditar) {
    mostrarError(codigo, "Este código ya existe. Usa uno diferente.");
    fallos.push("Código");
  }

  if (nombre.value.trim().length < 3) {
    mostrarError(nombre, "Escribe un nombre de mínimo 3 caracteres.");
    fallos.push("Nombre");
  }

  if (marca.value === "") {
    mostrarError(marca, "Selecciona una marca.");
    fallos.push("Marca");
  }

  if (categoria.value === "") {
    mostrarError(categoria, "Selecciona una categoría.");
    fallos.push("Categoría");
  }

  if (talla.value === "" || Number(talla.value) < 35 || Number(talla.value) > 42) {
    mostrarError(talla, "Ingresa una talla entre 35 y 42.");
    fallos.push("Talla");
  }

  if (precio.value === "" || Number(precio.value) <= 0) {
    mostrarError(precio, "El precio debe ser mayor que $0.");
    fallos.push("Precio");
  }

  if (cantidad.value === "" || Number(cantidad.value) < 0 || !Number.isInteger(Number(cantidad.value))) {
    mostrarError(cantidad, "Ingresa un número entero igual o mayor a 0.");
    fallos.push("Cantidad disponible");
  }

  if (imagen.files.length === 0 && !idEditar) {
    mostrarError(imagen, "Sube una imagen JPG, PNG o WEBP.");
    fallos.push("Imagen");
  }

  const total = fallos.length;

  if (total > 0) {
    aviso.innerHTML =
      "<b>No se pudo guardar: hay " + total + (total === 1 ? " error." : " errores.") + "</b>" +
      "<span>Revisa " + unir(fallos) + ".</span>";
    aviso.hidden = false;

    notaPie.textContent = "No se guardó ningún dato. Corrige " + (total === 1 ? "el error." : "los " + total + " errores.");
    notaPie.classList.add("rojo");
  } else {
    aviso.hidden = true;
    aviso.textContent = "";
    notaPie.textContent = notaOriginal;
    notaPie.classList.remove("rojo");

    if (!zapato) {
      form.reset();
    }
  }
});

/* ---------- Imagen ---------- */
const inputImagen = document.getElementById("imagen");
const zona = document.getElementById("zona");
const vista = document.getElementById("vista");
const zonaTexto = document.getElementById("zona-texto");
const nombreArchivo = document.getElementById("nombre-archivo");
const cambiar = document.getElementById("cambiar");

function mostrarVista(src) {
  vista.src = src;
  vista.hidden = false;
  zonaTexto.hidden = true;
  cambiar.hidden = false;
}

function quitarVista() {
  vista.removeAttribute("src");
  vista.hidden = true;
  zonaTexto.hidden = false;
  nombreArchivo.hidden = true;
  cambiar.hidden = true;
}

/* Si el zapato aún no tiene foto, se queda el recuadro vacío */
vista.addEventListener("error", quitarVista);

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