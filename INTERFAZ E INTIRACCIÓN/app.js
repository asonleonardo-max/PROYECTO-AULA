const buscar = document.getElementById("buscar");
const categoria = document.getElementById("categoria");
const marca = document.getElementById("marca");
const estado = document.getElementById("estado");
const filas = document.querySelectorAll("#lista tr");
const vacio = document.getElementById("vacio");

function filtrar() {
  const texto = buscar.value.toLowerCase();
  let visibles = 0;

  filas.forEach(function (fila) {
    const coincideTexto = fila.textContent.toLowerCase().includes(texto);
    const coincideCategoria = categoria.value === "" || fila.dataset.categoria === categoria.value;
    const coincideMarca = marca.value === "" || fila.dataset.marca === marca.value;
    const coincideEstado = estado.value === "" || fila.dataset.estado === estado.value;

    if (coincideTexto && coincideCategoria && coincideMarca && coincideEstado) {
      fila.hidden = false;
      visibles++;
    } else {
      fila.hidden = true;
    }
  });

  vacio.hidden = visibles > 0;
}

buscar.addEventListener("input", filtrar);
categoria.addEventListener("change", filtrar);
marca.addEventListener("change", filtrar);
estado.addEventListener("change", filtrar);

const modal = document.getElementById("modal");
const nombreZapato = document.getElementById("nombre-zapato");
const cancelar = document.getElementById("cancelar");
const confirmar = document.getElementById("confirmar");
let filaAEliminar = null;

document.querySelectorAll(".eliminar").forEach(function (boton) {
  boton.addEventListener("click", function () {
    filaAEliminar = boton.closest("tr");
    nombreZapato.textContent = filaAEliminar.querySelector("b").textContent;
    modal.hidden = false;
  });
});

cancelar.addEventListener("click", function () {
  modal.hidden = true;
  filaAEliminar = null;
});

confirmar.addEventListener("click", function () {
  filaAEliminar.remove();
  modal.hidden = true;
  filaAEliminar = null;
});

modal.addEventListener("click", function (evento) {
  if (evento.target === modal) {
    modal.hidden = true;
  }
});