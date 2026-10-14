// FORMULARIO: registro y edición de un zapato.

const NOMBRES_CAMPOS = [
  "nombre", "marca", "categoria", "talla",
  "precio", "disponibles", "estado", "imagen",
];
const CAMPOS_NUMERICOS = ["talla", "precio", "disponibles"];

const formulario = document.getElementById("formulario-zapato");
const idEnEdicion = new URLSearchParams(window.location.search).get("id");

/* ---------- Leer y escribir campos ---------- */

function leerDatosDelFormulario() {
  const datos = {};
  NOMBRES_CAMPOS.forEach((nombre) => {
    const valor = formulario.elements[nombre].value.trim();
    datos[nombre] = CAMPOS_NUMERICOS.includes(nombre) && valor !== "" ? Number(valor) : valor;
  });
  return datos;
}

function cargarDatosEnFormulario(zapato) {
  NOMBRES_CAMPOS.forEach((nombre) => {
    formulario.elements[nombre].value = zapato[nombre] ?? "";
  });
}

/* ---------- Validación (devuelve errores, no toca la pantalla) ---------- */

function esEnteroEnRango(valor, minimo, maximo) {
  return Number.isInteger(valor) && valor >= minimo && valor <= maximo;
}

function validarZapato(datos) {
  const errores = {};
  if (datos.nombre.length < 3) errores.nombre = "Escribe un nombre de al menos 3 letras.";
  if (!datos.marca) errores.marca = "Selecciona una marca.";
  if (!datos.categoria) errores.categoria = "Selecciona una categoría.";
  if (!datos.estado) errores.estado = "Selecciona un estado.";
  if (!esEnteroEnRango(datos.talla, 30, 50)) errores.talla = "La talla debe estar entre 30 y 50.";
  if (!(datos.precio > 0)) errores.precio = "El precio debe ser mayor que 0.";
  if (!esEnteroEnRango(datos.disponibles, 0, 100000)) {
    errores.disponibles = "Las unidades deben ser un número entero desde 0.";
  }
  if (datos.imagen && !/^https?:\/\//i.test(datos.imagen)) {
    errores.imagen = "La imagen debe ser un enlace que empiece por http:// o https://.";
  }
  return errores;
}

/* ---------- Guardar ---------- */

function guardarSegunModo(datos) {
  if (idEnEdicion) {
    actualizarZapato(idEnEdicion, datos);
  } else {
    crearZapato(datos);
  }
}

function manejarEnvio(evento) {
  evento.preventDefault();
  const datos = leerDatosDelFormulario();
  const errores = validarZapato(datos);
  mostrarErrores(errores);

  if (Object.keys(errores).length > 0) return;

  guardarSegunModo(datos);
  window.location.href = "index.html";
}

/* ---------- Inicio: ¿registro o edición? ---------- */

function prepararModoEdicion() {
  const zapato = obtenerZapato(idEnEdicion);
  if (!zapato) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("titulo-formulario").textContent = "Editar zapato";
  document.title = "Editar zapato · JP CALZADO";
  cargarDatosEnFormulario(zapato);
}

if (idEnEdicion) prepararModoEdicion();
formulario.addEventListener("submit", manejarEnvio);