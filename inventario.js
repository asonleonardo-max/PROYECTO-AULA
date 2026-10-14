// INVENTARIO: la lógica de los datos (CRUD, filtros, estadísticas).
// No toca el DOM. Usa almacenamiento.js para guardar.

const UMBRAL_STOCK_BAJO = 3;

/* ---------- CRUD ---------- */

function generarCodigo(zapatos) {
  const numeros = zapatos.map((zapato) => Number(zapato.id.replace("JP-", "")));
  const siguiente = Math.max(0, ...numeros) + 1;
  return `JP-${String(siguiente).padStart(3, "0")}`;
}

function crearZapato(datos) {
  const zapatos = leerZapatos();
  const nuevoZapato = { ...datos, id: generarCodigo(zapatos) };
  guardarZapatos([...zapatos, nuevoZapato]);
  return nuevoZapato;
}

function obtenerZapato(id) {
  return leerZapatos().find((zapato) => zapato.id === id);
}

function actualizarZapato(id, datos) {
  const zapatos = leerZapatos().map((zapato) =>
    zapato.id === id ? { ...zapato, ...datos } : zapato
  );
  guardarZapatos(zapatos);
}

function eliminarZapato(id) {
  const zapatos = leerZapatos().filter((zapato) => zapato.id !== id);
  guardarZapatos(zapatos);
}

/* ---------- Búsqueda y filtros ---------- */

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function coincideConBusqueda(zapato, textoBuscado) {
  const contenido = normalizarTexto(`${zapato.nombre} ${zapato.id} ${zapato.marca}`);
  return contenido.includes(normalizarTexto(textoBuscado));
}

function coincideConFiltro(valorZapato, valorFiltro) {
  return valorFiltro === "" || valorZapato === valorFiltro;
}

function filtrarZapatos(zapatos, filtros) {
  return zapatos.filter(
    (zapato) =>
      coincideConBusqueda(zapato, filtros.texto) &&
      coincideConFiltro(zapato.categoria, filtros.categoria) &&
      coincideConFiltro(zapato.marca, filtros.marca) &&
      coincideConFiltro(zapato.estado, filtros.estado)
  );
}

/* ---------- Existencias y estadísticas ---------- */

function obtenerAlertaStock(zapato) {
  if (zapato.disponibles === 0) return "Sin existencias";
  if (zapato.disponibles <= UMBRAL_STOCK_BAJO) return "Stock bajo";
  return "";
}

function calcularEstadisticas(zapatos) {
  return {
    modelos: zapatos.length,
    unidades: zapatos.reduce((total, zapato) => total + zapato.disponibles, 0),
    alertas: zapatos.filter((zapato) => obtenerAlertaStock(zapato) !== "").length,
  };
}