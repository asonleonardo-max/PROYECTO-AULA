/* VISTA del formulario: solo lee y pinta el DOM. No valida ni guarda. */

/* Nombre del dato -> id del campo en el HTML */
const IDS_CAMPOS = {
  codigo: "codigo",
  nombre: "nombre",
  marca: "f-marca",
  categoria: "f-categoria",
  talla: "talla",
  precio: "precio",
  cantidad: "cantidad",
  estado: "f-estado"
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

    this.imagenGuardada = "";
    this.vista.addEventListener("error", () => this.quitarVista());
    this.activarArrastrar();
  }

  campo(nombre) {
    return document.getElementById(IDS_CAMPOS[nombre] || nombre);
  }

  /* ---------- Leer y llenar ---------- */
  leerDatos() {
    const valores = {};

    Object.keys(IDS_CAMPOS).forEach((nombre) => {
      valores[nombre] = this.campo(nombre).value.trim();
    });
    valores.codigo = valores.codigo.toUpperCase();
    valores.imagen = this.inputImagen.files[0] || null;
    return valores;
  }

  llenarFormulario(zapato) {
    Object.keys(IDS_CAMPOS).forEach((nombre) => {
      this.campo(nombre).value = zapato[nombre];
    });
  }

  /* ---------- Modo editar ---------- */
  cambiarTextosAEdicion(zapato) {
    document.title = "Editar zapato · JP CALZADO";
    document.getElementById("titulo").textContent = "Editar zapato";
    document.getElementById("subtitulo").textContent = "Actualiza la información de " + zapato.nombre + " · " + zapato.codigo + ".";
    this.guardarBtn.textContent = "✓ Guardar cambios";
    this.notaPie.textContent = "Los cambios no se guardan hasta confirmar.";
    this.notaOriginal = this.notaPie.textContent;
  }

  mostrarRegistroActual(zapato) {
    document.getElementById("antes-guardar").hidden = true;
    document.getElementById("registro-actual").hidden = false;
    document.getElementById("registro-texto").textContent = "Estás editando " + zapato.codigo + ". Los cambios se aplicarán a este modelo al guardar.";
    document.getElementById("registro-stock").textContent = zapato.cantidad + " disponibles";

    const etiqueta = document.getElementById("registro-estado");
    etiqueta.textContent = zapato.estado;
    etiqueta.classList.toggle("inactivo", zapato.estado === "Inactivo");
  }

  activarModoEditar(zapato) {
    this.cambiarTextosAEdicion(zapato);
    this.llenarFormulario(zapato);
    this.mostrarRegistroActual(zapato);
    this.imagenGuardada = zapato.imagen;
    this.restaurarVista();
  }

  /* ---------- Errores ---------- */
  mostrarError(nombreCampo, mensaje) {
    const campo = this.campo(nombreCampo);
    const error = campo.parentElement.querySelector(".error");
    campo.classList.add("invalido");
    error.textContent = mensaje;
    error.hidden = false;
  }

  limpiarError(campo) {
    const error = campo.parentElement.querySelector(".error");
    campo.classList.remove("invalido");

    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  }

  limpiarErrores() {
    document.querySelectorAll(".invalido").forEach((campo) => this.limpiarError(campo));
    this.aviso.hidden = true;
    this.notaPie.textContent = this.notaOriginal;
    this.notaPie.classList.remove("rojo");
  }

  mostrarAviso(titulo, detalle, textoPie) {
    const negrita = document.createElement("b");
    const texto = document.createElement("span");
    negrita.textContent = titulo;
    texto.textContent = detalle;

    this.aviso.replaceChildren(negrita, texto);
    this.aviso.hidden = false;
    this.notaPie.textContent = textoPie;
    this.notaPie.classList.add("rojo");
  }

  mostrarErrores(errores) {
    const total = errores.length;

    errores.forEach((error) => this.mostrarError(error.campo, error.mensaje));

    this.mostrarAviso(
      "No se pudo guardar: hay " + total + (total === 1 ? " error." : " errores."),
      "Revisa " + unir(errores.map(function (error) { return error.etiqueta; })) + ".",
      "No se guardó ningún dato. Corrige " + (total === 1 ? "el error." : "los " + total + " errores.")
    );
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

  /* Vuelve a mostrar la foto que ya tenía el zapato (o el recuadro vacío) */
  restaurarVista() {
    if (this.imagenGuardada) {
      this.mostrarVista(this.imagenGuardada);
      this.nombreArchivo.hidden = true;
    } else {
      this.quitarVista();
    }
  }

  mostrarArchivo(archivo) {
    this.mostrarVista(URL.createObjectURL(archivo));
    this.nombreArchivo.textContent = archivo.name + " · " + Math.round(archivo.size / 1024) + " KB";
    this.nombreArchivo.hidden = false;
  }

  rechazarImagen(mensaje) {
    this.inputImagen.value = "";
    this.restaurarVista();
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

  /* ---------- Otros ---------- */
  bloquearGuardar(bloqueado) {
    this.guardarBtn.disabled = bloqueado;
  }

  irAlInventario() {
    window.location.href = "index.html";
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
      this.limpiarError(this.inputImagen);
      handler(this.inputImagen.files[0] || null);
    });
  }
}