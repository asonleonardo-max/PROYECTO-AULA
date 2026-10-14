// INTERFAZ: todo lo que dibuja o cambia cosas en la pantalla.
// No guarda datos ni decide reglas de negocio.

/* ---------- Utilidades para crear elementos (DRY) ---------- */

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function crearCeldaConEtiqueta(nombreColumna, contenido) {
  const celda = crearElemento("td");
  celda.dataset.label = nombreColumna;
  celda.append(contenido);
  return celda;
}

function formatearPrecio(valor) {
  return `$${Number(valor).toLocaleString("es-CO")}`;
}

/* ---------- Piezas de la fila ---------- */

function crearFoto(zapato) {
  if (!zapato.imagen) return crearElemento("span", "foto");
  const foto = crearElemento("img", "foto");
  foto.src = zapato.imagen;
  foto.alt = zapato.nombre;
  return foto;
}

function crearCeldaProducto(zapato) {
  const textos = crearElemento("div");
  textos.append(
    crearElemento("b", "", zapato.nombre),
    crearElemento("small", "", `${zapato.id} · ${zapato.marca}`)
  );

  const producto = crearElemento("div", "producto");
  producto.append(crearFoto(zapato), textos);

  const celda = crearElemento("td");
  celda.append(producto);
  return celda;
}

function crearCeldaDisponibilidad(zapato) {
  const contenido = document.createDocumentFragment();
  contenido.append(`${zapato.disponibles} disponibles`);

  const alerta = obtenerAlertaStock(zapato);
  if (alerta) contenido.append(crearElemento("span", "alerta", alerta));

  return crearCeldaConEtiqueta("Disponibilidad", contenido);
}

function crearCeldaEstado(zapato) {
  const clase = zapato.estado === "Inactivo" ? "etiqueta inactivo" : "etiqueta";
  return crearCeldaConEtiqueta("Estado", crearElemento("span", clase, zapato.estado));
}

function crearCeldaAcciones(zapato) {
  const editar = crearElemento("a", "icono", "Editar");
  editar.href = `formulario.html?id=${zapato.id}`;

  const eliminar = crearElemento("button", "icono eliminar", "Eliminar");
  eliminar.type = "button";
  eliminar.dataset.id = zapato.id;

  const celda = crearElemento("td");
  celda.append(editar, " ", eliminar);
  return celda;
}

function crearFila(zapato) {
  const fila = crearElemento("tr");
  fila.dataset.id = zapato.id;
  fila.append(
    crearCeldaProducto(zapato),
    crearCeldaConEtiqueta("Categoría", zapato.categoria),
    crearCeldaConEtiqueta("Talla", zapato.talla),
    crearCeldaConEtiqueta("Precio", formatearPrecio(zapato.precio)),
    crearCeldaDisponibilidad(zapato),
    crearCeldaEstado(zapato),
    crearCeldaAcciones(zapato)
  );
  return fila;
}

/* ---------- Listado, estadísticas y mensajes ---------- */

function pintarListado(zapatos, totalRegistrados) {
  const lista = document.getElementById("lista");
  const mensajeVacio = document.getElementById("vacio");

  lista.replaceChildren(...zapatos.map(crearFila));

  mensajeVacio.hidden = zapatos.length > 0;
  mensajeVacio.textContent =
    totalRegistrados === 0
      ? "Aún no hay zapatos registrados. Usa el botón «Registrar zapato» para agregar el primero."
      : "No se encontraron zapatos con esos filtros.";
}

function pintarEstadisticas(estadisticas) {
  document.getElementById("stat-modelos").textContent = estadisticas.modelos;
  document.getElementById("stat-unidades").textContent = estadisticas.unidades;
  document.getElementById("stat-alertas").textContent = estadisticas.alertas;
}

/* ---------- Modal de eliminación ---------- */

function abrirModalEliminar(zapato) {
  document.getElementById("modal-texto").textContent =
    `Vas a eliminar «${zapato.nombre}» (${zapato.id}). Esta acción no se puede deshacer.`;
  document.getElementById("modal-eliminar").showModal();
}

function cerrarModalEliminar() {
  document.getElementById("modal-eliminar").close();
}

/* ---------- Errores del formulario ---------- */

function mostrarErrores(errores) {
  document.querySelectorAll("[data-error-de]").forEach((mensaje) => {
    mensaje.textContent = errores[mensaje.dataset.errorDe] || "";
  });
}