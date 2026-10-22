/* MODELO: los datos y las reglas del negocio (CRUD, filtros, estadísticas, validaciones).
   No toca el DOM. Para guardar usa Almacenamiento (almacenamiento.js). */

const CLAVE_ZAPATOS = "jpcalzado.zapatos.v2";
const STOCK_BAJO = 3;
const FORMATO_CODIGO = /^JP-\d{3}$/;
const TALLA_MINIMA = 35;
const TALLA_MAXIMA = 42;
const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGEN = 5 * 1024 * 1024;

/* La aplicación empieza sin zapatos: todo lo que se registre se guarda en localStorage */
const ZAPATOS_INICIALES = [];

/* Pasa a minúsculas y quita tildes, para que "balance" encuentre "Balance" */
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

class ZapatoModelo {
  constructor(almacenamiento) {
    this.almacenamiento = almacenamiento;

    const guardados = almacenamiento.leer(CLAVE_ZAPATOS);
    this.zapatos = guardados === null
      ? ZAPATOS_INICIALES.map(function (zapato) { return { ...zapato }; })
      : guardados;

    if (guardados === null) {
      this.guardar();
    }
  }

  /* ---------- Guardado ---------- */
  guardar() {
    return this.almacenamiento.guardar(CLAVE_ZAPATOS, this.zapatos);
  }

  /* Cambia la lista y la guarda. Si no se pudo guardar, deja todo como estaba. */
  aplicarCambio(nuevaLista) {
    const anterior = this.zapatos;
    this.zapatos = nuevaLista;

    if (this.guardar()) {
      return true;
    }
    this.zapatos = anterior;
    return false;
  }

  /* ---------- Consultas ---------- */
  total() {
    return this.zapatos.length;
  }

  obtenerPorId(codigo) {
    return this.zapatos.find(function (zapato) { return zapato.codigo === codigo; }) || null;
  }

  existeCodigo(codigo) {
    return this.obtenerPorId(codigo) !== null;
  }

  /* ---------- CRUD ---------- */
  crear(zapato) {
    return this.aplicarCambio([...this.zapatos, zapato]);
  }

  actualizar(codigoOriginal, zapatoNuevo) {
    return this.aplicarCambio(this.zapatos.map(function (zapato) {
      return zapato.codigo === codigoOriginal ? zapatoNuevo : zapato;
    }));
  }

  eliminar(codigo) {
    return this.aplicarCambio(this.zapatos.filter(function (zapato) {
      return zapato.codigo !== codigo;
    }));
  }

  /* Convierte lo escrito en el formulario (texto) en un zapato con números reales */
  construir(valores, imagen) {
    return {
      codigo: valores.codigo,
      nombre: valores.nombre,
      marca: valores.marca,
      categoria: valores.categoria,
      talla: Number(valores.talla),
      precio: Number(valores.precio),
      cantidad: Number(valores.cantidad),
      estado: valores.estado,
      imagen: imagen
    };
  }

  /* ---------- Búsqueda y filtros ---------- */
  coincideConTexto(zapato, texto) {
    const contenido = normalizar(zapato.nombre + " " + zapato.codigo + " " + zapato.marca);
    return contenido.includes(normalizar(texto.trim()));
  }

  coincideConFiltro(valorDelZapato, valorElegido) {
    return valorElegido === "" || valorDelZapato === valorElegido;
  }

  filtrar(filtros) {
    return this.zapatos
      .filter((zapato) => {
        return this.coincideConTexto(zapato, filtros.texto)
          && this.coincideConFiltro(zapato.categoria, filtros.categoria)
          && this.coincideConFiltro(zapato.marca, filtros.marca)
          && this.coincideConFiltro(zapato.estado, filtros.estado);
      })
      .sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
  }

  /* ---------- Cálculos ---------- */
  /* Devuelve "", "Sin existencias" o "Stock bajo" */
  alertaStock(zapato) {
    if (zapato.cantidad === 0) return "Sin existencias";
    if (zapato.cantidad <= STOCK_BAJO) return "Stock bajo";
    return "";
  }

  estadisticas() {
    return {
      modelos: this.zapatos.length,
      unidades: this.zapatos.reduce(function (suma, zapato) { return suma + zapato.cantidad; }, 0),
      alertas: this.zapatos.filter((zapato) => this.alertaStock(zapato) !== "").length
    };
  }

  /* ---------- Validaciones (cada una devuelve "" si está bien, o el mensaje) ---------- */
  validarCodigo(codigo, codigoActual) {
    if (!FORMATO_CODIGO.test(codigo)) {
      return "Usa el formato JP-001.";
    }
    if (codigo !== codigoActual && this.existeCodigo(codigo)) {
      return "Este código ya existe. Usa uno diferente.";
    }
    return "";
  }

  validarNombre(nombre) {
    return nombre.length < 3 ? "Escribe un nombre de mínimo 3 caracteres." : "";
  }

  validarSeleccion(valor, mensaje) {
    return valor === "" ? mensaje : "";
  }

  validarTalla(talla) {
    const fueraDeRango = Number(talla) < TALLA_MINIMA || Number(talla) > TALLA_MAXIMA;
    return talla === "" || fueraDeRango ? "Ingresa una talla entre 35 y 42." : "";
  }

  validarPrecio(precio) {
    return precio === "" || Number(precio) <= 0 ? "El precio debe ser mayor que $0." : "";
  }

  validarCantidad(cantidad) {
    const esInvalida = cantidad === "" || Number(cantidad) < 0 || !Number.isInteger(Number(cantidad));
    return esInvalida ? "Ingresa un número entero igual o mayor a 0." : "";
  }

  validarImagenObligatoria(hayImagen) {
    return hayImagen ? "" : "Sube una imagen JPG, PNG o WEBP.";
  }

  /* Revisa todo el formulario y devuelve solo los campos con error: [{ campo, etiqueta, mensaje }] */
  validar(valores, { codigoActual = null, hayImagen = false } = {}) {
    const revisiones = [
      { campo: "codigo", etiqueta: "Código", mensaje: this.validarCodigo(valores.codigo, codigoActual) },
      { campo: "nombre", etiqueta: "Nombre", mensaje: this.validarNombre(valores.nombre) },
      { campo: "marca", etiqueta: "Marca", mensaje: this.validarSeleccion(valores.marca, "Selecciona una marca.") },
      { campo: "categoria", etiqueta: "Categoría", mensaje: this.validarSeleccion(valores.categoria, "Selecciona una categoría.") },
      { campo: "talla", etiqueta: "Talla", mensaje: this.validarTalla(valores.talla) },
      { campo: "precio", etiqueta: "Precio", mensaje: this.validarPrecio(valores.precio) },
      { campo: "cantidad", etiqueta: "Cantidad disponible", mensaje: this.validarCantidad(valores.cantidad) },
      { campo: "imagen", etiqueta: "Imagen", mensaje: this.validarImagenObligatoria(hayImagen) }
    ];

    return revisiones.filter(function (revision) { return revision.mensaje !== ""; });
  }

  /* Devuelve un mensaje de error o "" si el archivo de imagen es válido */
  validarArchivoImagen(archivo) {
    if (!TIPOS_IMAGEN.includes(archivo.type)) return "Sube una imagen JPG, PNG o WEBP.";
    if (archivo.size > MAX_IMAGEN) return "La imagen debe pesar máximo 5 MB.";
    return "";
  }
}