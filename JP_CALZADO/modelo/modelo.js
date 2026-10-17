/* MODELO: guarda los datos y las reglas del negocio. No toca el DOM. */

const DATOS_INICIALES = [
  { codigo: "JP-001", nombre: "Nike Air Max", marca: "Nike", categoria: "Deportivos", talla: 40, precio: 350000, cantidad: 8, estado: "Activo" },
  { codigo: "JP-002", nombre: "Adidas Grand Court", marca: "Adidas", categoria: "Deportivos", talla: 39, precio: 280000, cantidad: 12, estado: "Activo" },
  { codigo: "JP-003", nombre: "Puma Smash", marca: "Puma", categoria: "Deportivos", talla: 41, precio: 220000, cantidad: 3, estado: "Activo" },
  { codigo: "JP-004", nombre: "Converse Chuck Taylor", marca: "Converse", categoria: "Casuales", talla: 38, precio: 260000, cantidad: 0, estado: "Activo" },
  { codigo: "JP-005", nombre: "New Balance 574", marca: "New Balance", categoria: "Deportivos", talla: 42, precio: 390000, cantidad: 6, estado: "Activo" },
  { codigo: "JP-006", nombre: "Vans Old Skool", marca: "Vans", categoria: "Casuales", talla: 40, precio: 290000, cantidad: 9, estado: "Inactivo" }
];

const STOCK_BAJO = 3;
const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGEN = 5 * 1024 * 1024;

class ZapatoModelo {
  constructor() {
    this.zapatos = DATOS_INICIALES.map(function (z) { return { ...z }; });
  }

  /* ---------- Consultas ---------- */
  total() {
    return this.zapatos.length;
  }

  obtenerPorId(id) {
    return this.zapatos.find(function (z) { return z.codigo === id; }) || null;
  }

  existeCodigo(codigo) {
    return this.zapatos.some(function (z) { return z.codigo === codigo; });
  }

  filtrar({ texto = "", categoria = "", marca = "", estado = "" }) {
    const busqueda = texto.toLowerCase();

    return this.zapatos
      .filter(function (z) {
        const coincideTexto = [z.nombre, z.codigo, z.marca].join(" ").toLowerCase().includes(busqueda);
        const coincideCategoria = categoria === "" || z.categoria === categoria;
        const coincideMarca = marca === "" || z.marca === marca;
        const coincideEstado = estado === "" || z.estado === estado;
        return coincideTexto && coincideCategoria && coincideMarca && coincideEstado;
      })
      .sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
  }

  estadisticas() {
    return {
      modelos: this.zapatos.length,
      unidades: this.zapatos.reduce(function (suma, z) { return suma + z.cantidad; }, 0),
      alertas: this.zapatos.filter(function (z) { return z.cantidad <= STOCK_BAJO; }).length
    };
  }

  /* Devuelve "", "Sin existencias" o "Stock bajo" */
  alertaStock(zapato) {
    if (zapato.cantidad === 0) return "Sin existencias";
    if (zapato.cantidad <= STOCK_BAJO) return "Stock bajo";
    return "";
  }

  /* ---------- Cambios ---------- */
  eliminar(id) {
    this.zapatos = this.zapatos.filter(function (z) { return z.codigo !== id; });
  }

  /* ---------- Validaciones ---------- */
  /* Devuelve una lista de { campo, etiqueta, mensaje }. Lista vacía = todo bien. */
  validar(datos, { idActual = null, hayImagen = false } = {}) {
    const errores = [];
    const codigo = datos.codigo.trim().toUpperCase();

    if (!/^JP-\d{3}$/.test(codigo)) {
      errores.push({ campo: "codigo", etiqueta: "Código", mensaje: "Usa el formato JP-001." });
    } else if (this.existeCodigo(codigo) && codigo !== idActual) {
      errores.push({ campo: "codigo", etiqueta: "Código", mensaje: "Este código ya existe. Usa uno diferente." });
    }

    if (datos.nombre.trim().length < 3) {
      errores.push({ campo: "nombre", etiqueta: "Nombre", mensaje: "Escribe un nombre de mínimo 3 caracteres." });
    }

    if (datos.marca === "") {
      errores.push({ campo: "marca", etiqueta: "Marca", mensaje: "Selecciona una marca." });
    }

    if (datos.categoria === "") {
      errores.push({ campo: "categoria", etiqueta: "Categoría", mensaje: "Selecciona una categoría." });
    }

    if (datos.talla === "" || Number(datos.talla) < 35 || Number(datos.talla) > 42) {
      errores.push({ campo: "talla", etiqueta: "Talla", mensaje: "Ingresa una talla entre 35 y 42." });
    }

    if (datos.precio === "" || Number(datos.precio) <= 0) {
      errores.push({ campo: "precio", etiqueta: "Precio", mensaje: "El precio debe ser mayor que $0." });
    }

    if (datos.cantidad === "" || Number(datos.cantidad) < 0 || !Number.isInteger(Number(datos.cantidad))) {
      errores.push({ campo: "cantidad", etiqueta: "Cantidad disponible", mensaje: "Ingresa un número entero igual o mayor a 0." });
    }

    if (!hayImagen && !idActual) {
      errores.push({ campo: "imagen", etiqueta: "Imagen", mensaje: "Sube una imagen JPG, PNG o WEBP." });
    }

    return errores;
  }

  /* Devuelve un mensaje de error o null si la imagen es válida */
  validarImagen(archivo) {
    if (!TIPOS_IMAGEN.includes(archivo.type)) return "Sube una imagen JPG, PNG o WEBP.";
    if (archivo.size > MAX_IMAGEN) return "La imagen debe pesar máximo 5 MB.";
    return null;
  }
}