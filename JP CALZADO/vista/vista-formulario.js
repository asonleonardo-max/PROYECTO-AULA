/* VISTA del formulario: solo lee y pinta el DOM. */

/* Nombre lógico del campo -> id del elemento en el HTML */
const IDS = {
  codigo: "codigo",
  nombre: "nombre",
  marca: "f-marca",
  categoria: "f-categoria",
  talla: "talla",
  precio: "precio",
  cantidad: "cantidad",
  estado: "f-estado",
  imagen: "imagen"
};

function unir(lista) {
  if (lista.length === 1) return lista[0];
  const ultima = lista[lista.length - 1];
  const union = /^h?i/i.test(ultima) ? " e " : " y ";
  return lista.slice(0, -1).join(", ") + union + ultima;
}

class FormularioVista {
  constructor() {
    this.form = document.getElementById("form");
    this.aviso = document.getElementById("aviso");
    this.guardarBtn = document.getElementById("guardar");
    this.notaPie = document.getElementById("nota-pie");
    this.notaOriginal = this.notaPie.textContent;

    this.inputImagen = document.getElementById("imagen");
    this.zona = document.getElementById("zona");
    this.vista = document.getElementById("vista");
    this.zonaTexto = document.getElementById("zona-texto");
    this.nombreArchivo = document.getElementById("nombre-archivo");
    this.cambiar = document.getElementById("cambiar");

    /* Si el zapato aún no tiene foto, se queda el recuadro vacío */
    this.vista.addEventListener("error", () => this.quitarVista());
    this.form.addEventListener("reset", () => this.quitarVista());
    this.activarArrastrar();
  }

  campo(nombre) {
    return document.getElementById(IDS[nombre]);
  }

  /* ---------- Leer ---------- */
  leerDatos() {
    return {
      codigo: this.campo("codigo").value,
      nombre: this.campo("nombre").value,
      marca: this.campo("marca").value,
      categoria: this.campo("categoria").value,
      talla: this.campo("talla").value,
      precio: this.campo("precio").value,
      cantidad: this.campo("cantidad").value,
      estado: this.campo("estado").value,
      imagen: this.inputImagen.files[0] || null
    };
  }

  /* ---------- Modo editar ---------- */
  activarModoEditar(zapato) {
    document.getElementById("titulo").textContent = "Editar zapato";
    document.getElementById("subtitulo").textContent = "Actualiza la información de " + zapato.nombre + " · " + zapato.codigo + ".";
    this.guardarBtn.textContent = "✓ Guardar cambios";
    this.notaPie.textContent = "Los cambios no se guardan hasta confirmar.";
    this.notaOriginal = this.notaPie.textContent;
    document.title = "Editar zapato · JP CALZADO";

    this.campo("codigo").value = zapato.codigo;
    this.campo("nombre").value = zapato.nombre;
    this.campo("marca").value = zapato.marca;
    this.campo("categoria").value = zapato.categoria;
    this.campo("talla").value = zapato.talla;
    this.campo("precio").value = zapato.precio;
    this.campo("cantidad").value = zapato.cantidad;
    this.campo("estado").value = zapato.estado;

    document.getElementById("antes-guardar").hidden = true;
    document.getElementById("registro-actual").hidden = false;
    document.getElementById("registro-texto").textContent = "Estás editando " + zapato.codigo + ". Los cambios se aplicarán a este modelo al guardar.";
    document.getElementById("registro-stock").textContent = zapato.cantidad + " disponibles";

    const etiqueta = document.getElementById("registro-estado");
    etiqueta.textContent = zapato.estado;
    etiqueta.classList.toggle("inactivo", zapato.estado === "Inactivo");
  }

  /* ---------- Errores ---------- */
  mostrarError(nombreCampo, mensaje) {
    const campo = this.campo(nombreCampo);
    const error = campo.parentElement.querySelector(".error");
    campo.classList.add("invalido");
    error.textContent = mensaje;
    error.hidden = false;
  }

  limpiarErrores() {
    Object.keys(IDS).forEach((nombre) => {
      const campo = this.campo(nombre);
      const error = campo.parentElement.querySelector(".error");
      campo.classList.remove("invalido");
      if (error) {
        error.textContent = "";
        error.hidden = true;
      }
    });
  }

  mostrarErrores(errores) {
    const total = errores.length;

    errores.forEach((e) => this.mostrarError(e.campo, e.mensaje));

    this.aviso.innerHTML =
      "<b>No se pudo guardar: hay " + total + (total === 1 ? " error." : " errores.") + "</b>" +
      "<span>Revisa " + unir(errores.map(function (e) { return e.etiqueta; })) + ".</span>";
    this.aviso.hidden = false;

    this.notaPie.textContent = "No se guardó ningún dato. Corrige " + (total === 1 ? "el error." : "los " + total + " errores.");
    this.notaPie.classList.add("rojo");
  }

  mostrarExito(reiniciar) {
    this.aviso.hidden = true;
    this.aviso.textContent = "";
    this.notaPie.textContent = this.notaOriginal;
    this.notaPie.classList.remove("rojo");

    if (reiniciar) {
      this.form.reset();
    }
  }

  /* ---------- Imagen ---------- */
  mostrarVista(src) {
    this.vista.src = src;
    this.vista.hidden = false;
    this.zonaTexto.hidden = true;
    this.cambiar.hidden = false;
  }

  quitarVista() {
    this.vista.removeAttribute("src");
    this.vista.hidden = true;
    this.zonaTexto.hidden = false;
    this.nombreArchivo.hidden = true;
    this.cambiar.hidden = true;
  }

  mostrarArchivo(archivo) {
    this.mostrarVista(URL.createObjectURL(archivo));
    this.nombreArchivo.textContent = archivo.name + " · " + Math.round(archivo.size / 1024) + " KB";
    this.nombreArchivo.hidden = false;
  }

  rechazarImagen(mensaje) {
    this.inputImagen.value = "";
    this.quitarVista();
    this.mostrarError("imagen", mensaje);
  }

  activarArrastrar() {
    this.zona.addEventListener("dragover", (evento) => {
      evento.preventDefault();
      this.zona.classList.add("arrastrando");
    });

    this.zona.addEventListener("dragleave", () => {
      this.zona.classList.remove("arrastrando");
    });

    this.zona.addEventListener("drop", (evento) => {
      evento.preventDefault();
      this.zona.classList.remove("arrastrando");
      this.inputImagen.files = evento.dataTransfer.files;
      this.inputImagen.dispatchEvent(new Event("change"));
    });
  }

  /* ---------- Eventos ---------- */
  alEnviar(handler) {
    this.form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      handler();
    });
  }

  alElegirImagen(handler) {
    this.inputImagen.addEventListener("change", () => {
      const campo = this.inputImagen.parentElement.querySelector(".error");
      this.inputImagen.classList.remove("invalido");
      if (campo) {
        campo.textContent = "";
        campo.hidden = true;
      }
      handler(this.inputImagen.files[0] || null);
    });
  }
}