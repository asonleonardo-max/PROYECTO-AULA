/* CONTROLADOR del formulario: conecta el modelo con la vista. */

class FormularioControlador {
  constructor(modelo, vista) {
    this.modelo = modelo;
    this.vista = vista;

    this.codigoEditar = new URLSearchParams(window.location.search).get("id");
    this.zapato = this.codigoEditar ? modelo.obtenerPorId(this.codigoEditar) : null;

    if (this.codigoEditar && !this.zapato) {
      vista.irAlInventario(); /* el código de la dirección no existe */
      return;
    }
    if (this.zapato) {
      vista.activarModoEditar(this.zapato);
    }

    vista.alEnviar(() => this.guardar());
    vista.alElegirImagen((archivo) => this.elegirImagen(archivo));
  }

  /* Hay imagen si eligió una nueva, o si el zapato que edita ya tenía una */
  tieneImagen(valores) {
    return valores.imagen !== null || Boolean(this.zapato && this.zapato.imagen);
  }

  async guardar() {
    const valores = this.vista.leerDatos();
    this.vista.limpiarErrores();

    const errores = this.modelo.validar(valores, {
      codigoActual: this.codigoEditar,
      hayImagen: this.tieneImagen(valores)
    });

    if (errores.length > 0) {
      this.vista.mostrarErrores(errores);
      return;
    }
    await this.guardarZapato(valores);
  }

  /* Foto nueva: se comprime. Sin foto nueva: se conserva la anterior */
  async obtenerImagenFinal(archivo) {
    return archivo ? comprimirImagen(archivo) : this.zapato.imagen;
  }

  guardarEnModelo(zapato) {
    return this.zapato
      ? this.modelo.actualizar(this.codigoEditar, zapato)
      : this.modelo.crear(zapato);
  }

  async guardarZapato(valores) {
    this.vista.bloquearGuardar(true);

    try {
      const imagen = await this.obtenerImagenFinal(valores.imagen);
      const guardado = this.guardarEnModelo(this.modelo.construir(valores, imagen));

      if (guardado) {
        this.vista.irAlInventario();
        return;
      }
      this.vista.mostrarAviso("No se pudo guardar.", "El almacenamiento del navegador está lleno. Elimina zapatos o usa una imagen más liviana.", "No se guardó ningún dato.");
    } catch (error) {
      console.error(error);
      this.vista.mostrarAviso("No se pudo procesar la imagen.", "Prueba con otra foto.", "No se guardó ningún dato.");
    }
    this.vista.bloquearGuardar(false);
  }

  elegirImagen(archivo) {
    if (!archivo) {
      this.vista.restaurarVista();
      return;
    }

    const mensaje = this.modelo.validarArchivoImagen(archivo);

    if (mensaje) {
      this.vista.rechazarImagen(mensaje);
    } else {
      this.vista.mostrarArchivo(archivo);
    }
  }
}

new FormularioControlador(new ZapatoModelo(new Almacenamiento()), new FormularioVista());