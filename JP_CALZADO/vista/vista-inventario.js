/* VISTA del inventario: construye la tabla con el DOM y lee los filtros.
   No tiene reglas de negocio ni toca localStorage. */

function formatearPrecio(numero) {
  return "$" + String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}

function escribirTexto(id, texto) {
  document.getElementById(id).textContent = texto;
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

  /* ---------- Piezas de cada fila ---------- */
  crearFoto(zapato) {
    if (!zapato.imagen) {
      return crearElemento("span", "foto");
    }
    const foto = crearElemento("img", "foto");
    foto.alt = "";
    foto.src = zapato.imagen;
    return foto;
  }

  crearCeldaProducto(zapato) {
    const datos = document.createElement("div");
    datos.append(
      crearElemento("b", "", zapato.nombre),
      crearElemento("small", "", zapato.codigo + " · " + zapato.marca)
    );

    const producto = crearElemento("div", "producto");
    producto.append(this.crearFoto(zapato), datos);

    const celda = document.createElement("td");
    celda.append(producto);
    return celda;
  }

  crearCeldaTexto(etiqueta, texto) {
    const celda = crearElemento("td", "", texto);
    celda.dataset.label = etiqueta;
    return celda;
  }

  crearCeldaDisponibilidad(zapato, alerta) {
    const celda = this.crearCeldaTexto("Disponibilidad", zapato.cantidad + " disponibles");

    if (alerta) {
      celda.append(" ", crearElemento("span", "alerta", alerta));
    }
    return celda;
  }

  crearCeldaEstado(zapato) {
    const clase = zapato.estado === "Inactivo" ? "etiqueta inactivo" : "etiqueta";
    const celda = crearElemento("td");
    celda.dataset.label = "Estado";
    celda.append(crearElemento("span", clase, zapato.estado));
    return celda;
  }

  crearIcono(ruta) {
    const icono = crearElemento("img");
    icono.src = ruta;
    icono.alt = "";
    icono.width = 18;
    icono.height = 18;
    return icono;
  }

  crearCeldaAcciones(zapato) {
    const editar = crearElemento("a", "icono");
    editar.href = "formulario.html?id=" + encodeURIComponent(zapato.codigo);
    editar.setAttribute("aria-label", "Editar");
    editar.append(this.crearIcono("iconos/lapiz.png"));

    const eliminar = crearElemento("button", "icono eliminar");
    eliminar.type = "button";
    eliminar.setAttribute("aria-label", "Eliminar");
    eliminar.append(this.crearIcono("iconos/eliminar.png"));

    const celda = document.createElement("td");
    celda.append(editar, eliminar);
    return celda;
  }

  crearFila(zapato, alerta) {
    const fila = document.createElement("tr");
    fila.dataset.id = zapato.codigo;
    fila.append(
      this.crearCeldaProducto(zapato),
      this.crearCeldaTexto("Categoría", zapato.categoria),
      this.crearCeldaTexto("Talla", zapato.talla),
      this.crearCeldaTexto("Precio", formatearPrecio(zapato.precio)),
      this.crearCeldaDisponibilidad(zapato, alerta),
      this.crearCeldaEstado(zapato),
      this.crearCeldaAcciones(zapato)
    );
    return fila;
  }

  /* ---------- Pintar la pantalla ---------- */
  renderLista(zapatos, total, alertaStock) {
    this.lista.replaceChildren(...zapatos.map((zapato) => this.crearFila(zapato, alertaStock(zapato))));
    this.renderContadores(zapatos.length, total);
  }

  renderContadores(visibles, total) {
    this.contador.textContent = visibles + (visibles === 1 ? " zapato" : " zapatos");
    this.mostrando.textContent = visibles === 0
      ? "Mostrando 0 de " + total
      : "Mostrando 1-" + visibles + " de " + total;

    this.vacio.hidden = visibles > 0;
    this.vacio.textContent = total === 0
      ? "Aún no hay zapatos registrados."
      : "No se encontraron zapatos con esos filtros.";
  }

  renderEstadisticas({ modelos, unidades, alertas }) {
    escribirTexto("stat-modelos", modelos);
    escribirTexto("stat-unidades", unidades);
    escribirTexto("stat-alertas", alertas);
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

  /* ---------- Ventana de eliminar ---------- */
  abrirModal(zapato) {
    escribirTexto("nombre-zapato", zapato.nombre);
    escribirTexto("r-nombre", zapato.nombre);
    escribirTexto("r-codigo", zapato.codigo + " · " + zapato.marca);
    escribirTexto("r-detalle", zapato.categoria + " · Talla " + zapato.talla);
    escribirTexto("r-precio", formatearPrecio(zapato.precio) + " COP");
    escribirTexto("r-stock", zapato.cantidad + " disponibles · " + zapato.estado);
    this.modal.hidden = false;
  }

  cerrarModal() {
    this.modal.hidden = true;
  }

  /* ---------- Eventos (el controlador dice qué hacer) ---------- */
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