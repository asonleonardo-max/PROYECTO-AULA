// ALMACENAMIENTO: lo único que habla con localStorage.
// No sabe nada de zapatos ni de pantalla, solo lee y guarda.

const CLAVE_INVENTARIO = "jp-calzado-inventario";

function leerZapatos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_INVENTARIO)) || [];
  } catch (error) {
    return [];
  }
}

function guardarZapatos(zapatos) {
  localStorage.setItem(CLAVE_INVENTARIO, JSON.stringify(zapatos));
}