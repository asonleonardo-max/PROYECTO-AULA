/* CONTROLADOR del inventario: conecta el modelo con la vista. */

class InventarioControlador {
  constructor(modelo, vista) {
    this.modelo = modelo;
    this.vista = vista;
    this.idAEliminar = null;

    vista.alCambiarFiltros(() => this.actualizar());
    vista.alPedirEliminar((id) => this.pedirEliminar(id));
    vista.alConfirmarEliminar(() => this.confirmarEliminar());
    vista.alCerrarModal(() => this.cancelarEliminar());

    this.actualizar();
  }

  actualizar() {
    const zapatos = this.modelo.filtrar(this.vista.leerFiltros());

    this.vista.renderLista(zapatos, this.modelo.total(), (z) => this.modelo.alertaStock(z));
    this.vista.renderEstadisticas(this.modelo.estadisticas());
  }

  pedirEliminar(id) {
    const zapato = this.modelo.obtenerPorId(id);
    if (!zapato) return;

    this.idAEliminar = id;
    this.vista.abrirModal(zapato);
  }

  confirmarEliminar() {
    if (this.idAEliminar) {
      this.modelo.eliminar(this.idAEliminar);
    }
    this.cancelarEliminar();
    this.actualizar();
  }

  cancelarEliminar() {
    this.idAEliminar = null;
    this.vista.cerrarModal();
  }
}

new InventarioControlador(new ZapatoModelo(), new InventarioVista());