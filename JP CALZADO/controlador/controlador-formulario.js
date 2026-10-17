/* CONTROLADOR del formulario: conecta el modelo con la vista. */

class FormularioControlador {
  constructor(modelo, vista) {
    this.modelo = modelo;
    this.vista = vista;

    this.idEditar = new URLSearchParams(window.location.search).get("id");
    this.zapato = modelo.obtenerPorId(this.idEditar);

    if (this.zapato) {
      vista.activarModoEditar(this.zapato);
    }

    vista.alEnviar(() => this.guardar());
    vista.alElegirImagen((archivo) => this.elegirImagen(archivo));

    if (this.zapato) {
      vista.mostrarVista("img/" + this.idEditar.toLowerCase() + ".jpg");
    }
  }

  guardar() {
    const datos = this.vista.leerDatos();

    this.vista.limpiarErrores();

    const errores = this.modelo.validar(datos, {
      idActual: this.zapato ? this.idEditar : null,
      hayImagen: datos.imagen !== null
    });

    if (errores.length > 0) {
      this.vista.mostrarErrores(errores);
    } else {
      this.vista.mostrarExito(!this.zapato);
    }
  }

  elegirImagen(archivo) {
    if (!archivo) {
      this.vista.quitarVista();
      return;
    }

    const mensaje = this.modelo.validarImagen(archivo);

    if (mensaje) {
      this.vista.rechazarImagen(mensaje);
    } else {
      this.vista.mostrarArchivo(archivo);
    }
  }
}

new FormularioControlador(new ZapatoModelo(), new FormularioVista());