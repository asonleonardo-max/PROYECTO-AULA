/* MODELO (almacenamiento): SOLO habla con localStorage. No sabe qué es un zapato. */

class Almacenamiento {
  /* Devuelve lo guardado, o null si no hay nada (o si falló la lectura) */
  leer(clave) {
    try {
      const texto = localStorage.getItem(clave);
      return texto === null ? null : JSON.parse(texto);
    } catch (error) {
      console.error("No se pudo leer localStorage:", error);
      return null;
    }
  }

  /* Devuelve true si se guardó, false si falló (por ejemplo, almacenamiento lleno) */
  guardar(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      console.error("No se pudo guardar en localStorage:", error);
      return false;
    }
  }
}