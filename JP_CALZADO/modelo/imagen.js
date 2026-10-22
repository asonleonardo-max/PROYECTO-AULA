/* localStorage guarda máximo ~5 MB en total. Por eso la foto se reduce (máx. 600 px)
   y se comprime a JPG antes de guardarla (~30-60 KB). */

const LADO_MAXIMO_IMAGEN = 600;
const CALIDAD_IMAGEN = 0.8;

function cargarImagen(archivo) {
  return new Promise(function (resolver, rechazar) {
    const imagen = new Image();
    imagen.onload = function () { resolver(imagen); };
    imagen.onerror = rechazar;
    imagen.src = URL.createObjectURL(archivo);
  });
}

function calcularEscala(imagen) {
  return Math.min(1, LADO_MAXIMO_IMAGEN / Math.max(imagen.width, imagen.height));
}

/* Devuelve el texto (data URL) de la imagen reducida, listo para guardar en localStorage */
async function comprimirImagen(archivo) {
  const imagen = await cargarImagen(archivo);
  const escala = calcularEscala(imagen);
  const ancho = Math.round(imagen.width * escala);
  const alto = Math.round(imagen.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;

  const contexto = lienzo.getContext("2d");
  contexto.fillStyle = "white"; /* los PNG transparentes se verían negros en JPG */
  contexto.fillRect(0, 0, ancho, alto);
  contexto.drawImage(imagen, 0, 0, ancho, alto);

  return lienzo.toDataURL("image/jpeg", CALIDAD_IMAGEN);
}