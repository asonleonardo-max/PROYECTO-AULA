/* VISTA del inventario: solo pinta y lee el DOM. No tiene reglas de negocio. */

function formatearPrecio(numero) {
  return "$" + String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

class InventarioVista {
  constructor() {
    this.buscar = document.getElementById("buscar");
    this.categoria = document.getElementById("categoria");
    this.marca = document.getElementById("marca");
    this.estado = document.getElementById("estado");
    this.lista = document.getElementById("lista");
    this.vacio = document.getElementById("vacio");
    this.contador = document.getElementById("contador");
    this.mostrando = document.getElementById("mostrando");
    this.modal = document.getElementById("modal");
  }

  /* ---------- Pintar ---------- */
  renderEstadisticas({ modelos, unidades, alertas }) {
    document.getElementById("stat-modelos").textContent = modelos;
    document.getElementById("stat-unidades").textContent = unidades;
    document.getElementById("stat-alertas").textContent = alertas;
  }

  renderLista(zapatos, total, alertaStock) {
    this.lista.innerHTML = zapatos.map(function (z) {
      const alerta = alertaStock(z);
      const claseEstado = z.estado === "Inactivo" ? "etiqueta inactivo" : "etiqueta";

      return `
        <tr data-id="${escapar(z.codigo)}">
          <td><div class="producto"><span class="foto"></span>
            <div><b>${escapar(z.nombre)}</b><small>${escapar(z.codigo)} · ${escapar(z.marca)}</small></div></div></td>
          <td data-label="Categoría">${escapar(z.categoria)}</td>
          <td data-label="Talla">${z.talla}</td>
          <td data-label="Precio">${formatearPrecio(z.precio)}</td>
          <td data-label="Disponibilidad">${z.cantidad} disponibles${alerta ? ` <span class="alerta">${alerta}</span>` : ""}</td>
          <td data-label="Estado"><span class="${claseEstado}">${escapar(z.estado)}</span></td>
          <td>
            <a class="icono" href="formulario.html?id=${encodeURIComponent(z.codigo)}" aria-label="Editar">
              <img src="iconos/lapiz.png" alt="" width="18" height="18">
            </a>
            <button class="icono eliminar" type="button" aria-label="Eliminar">
              <img src="iconos/eliminar.png" alt="" width="18" height="18">
            </button>
          </td>
        </tr>`;
    }).join("");

    const visibles = zapatos.length;
    this.vacio.hidden = visibles > 0;
    this.contador.textContent = visibles + (visibles === 1 ? " zapato" : " zapatos");
    this.mostrando.textContent = visibles === 0
      ? "Mostrando 0 de " + total
      : "Mostrando 1-" + visibles + " de " + total;
  }

  /* ---------- Leer ---------- */
  leerFiltros() {
    return {
      texto: this.buscar.value,
      categoria: this.categoria.value,
      marca: this.marca.value,
      estado: this.estado.value
    };
  }

  /* ---------- Modal ---------- */
  abrirModal(zapato) {
    document.getElementById("nombre-zapato").textContent = zapato.nombre;
    document.getElementById("r-nombre").textContent = zapato.nombre;
    document.getElementById("r-codigo").textContent = zapato.codigo + " · " + zapato.marca;
    document.getElementById("r-detalle").textContent = zapato.categoria + " · Talla " + zapato.talla;
    document.getElementById("r-precio").textContent = formatearPrecio(zapato.precio) + " COP";
    document.getElementById("r-stock").textContent = zapato.cantidad + " disponibles · " + zapato.estado;
    this.modal.hidden = false;
  }

  cerrarModal() {
    this.modal.hidden = true;
  }

  /* ---------- Eventos (el controlador pasa qué hacer) ---------- */
  alCambiarFiltros(handler) {
    this.buscar.addEventListener("input", handler);
    this.categoria.addEventListener("change", handler);
    this.marca.addEventListener("change", handler);
    this.estado.addEventListener("change", handler);
  }

  alPedirEliminar(handler) {
    this.lista.addEventListener("click", function (evento) {
      const boton = evento.target.closest(".eliminar");
      if (boton) {
        handler(boton.closest("tr").dataset.id);
      }
    });
  }

  alConfirmarEliminar(handler) {
    document.getElementById("confirmar").addEventListener("click", handler);
  }

  alCerrarModal(handler) {
    const modal = this.modal;
    document.getElementById("cancelar").addEventListener("click", handler);
    document.getElementById("cerrar").addEventListener("click", handler);

    modal.addEventListener("click", function (evento) {
      if (evento.target === modal) handler();
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && !modal.hidden) handler();
    });
  }
}