// APP (listado): conecta eventos con datos e interfaz.

const campoBuscar = document.getElementById("buscar");
const campoCategoria = document.getElementById("categoria");
const campoMarca = document.getElementById("marca");
const campoEstado = document.getElementById("estado");

let idPendienteDeEliminar = null;

function leerFiltros() {
  return {
    texto: campoBuscar.value.trim(),
    categoria: campoCategoria.value,
    marca: campoMarca.value,
    estado: campoEstado.value,
  };
}

function refrescarListado() {
  const todos = leerZapatos();
  pintarEstadisticas(calcularEstadisticas(todos));
  pintarListado(filtrarZapatos(todos, leerFiltros()), todos.length);
}

function pedirConfirmacion(id) {
  idPendienteDeEliminar = id;
  abrirModalEliminar(obtenerZapato(id));
}

function confirmarEliminacion() {
  eliminarZapato(idPendienteDeEliminar);
  idPendienteDeEliminar = null;
  cerrarModalEliminar();
  refrescarListado();
}

function manejarClicEnLista(evento) {
  const botonEliminar = evento.target.closest(".eliminar");
  if (botonEliminar) pedirConfirmacion(botonEliminar.dataset.id);
}

[campoBuscar, campoCategoria, campoMarca, campoEstado].forEach((campo) =>
  campo.addEventListener("input", refrescarListado)
);
document.getElementById("lista").addEventListener("click", manejarClicEnLista);
document.getElementById("confirmar-eliminar").addEventListener("click", confirmarEliminacion);
document.getElementById("cancelar-eliminar").addEventListener("click", cerrarModalEliminar);

refrescarListado();