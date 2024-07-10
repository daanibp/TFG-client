import * as XLSX from "xlsx";

export function ProcesaExcelExamenes(file, hojasAProcesar) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryString = event.target.result;
            const workbook = XLSX.read(binaryString, { type: "binary" });

            let examenes = [];

            try {
                // Iterar sobre las hojas especificadas
                hojasAProcesar.forEach((hoja) => {
                    const sheet = workbook.Sheets[hoja];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    let fechas = [];
                    let año = "";
                    let hora = "";

                    // Procesar cada fila de datos
                    data.forEach((fila) => {
                        if (fila.length === 1) {
                            año = fila[0].match(/\d{4}(?=\/\d{2}|$)/)[0];
                        } else {
                            if (fila[0] === "Hora") {
                                fechas = [];
                                fechas.push(
                                    convertirFecha(fila[1], año),
                                    convertirFecha(fila[3], año),
                                    convertirFecha(fila[5], año),
                                    convertirFecha(fila[7], año),
                                    convertirFecha(fila[9], año)
                                );
                            } else {
                                if (fila[0] !== null && fila[0] !== "")
                                    hora = devuelveHora(fila[0]);

                                for (let i = 1; i < fila.length; i += 2) {
                                    if (
                                        fila[i] !== "" &&
                                        fila[i] !== undefined
                                    ) {
                                        const asignatura = devuelveAsignatura(
                                            fila[i]
                                        );
                                        const aulas = devuelveAulas(
                                            fila[i + 1]
                                        );
                                        const tipo = devuelveTipo(fila[i]);
                                        const fecha = devuelveFecha(fechas, i);
                                        examenes.push({
                                            asignatura: asignatura,
                                            hora: hora,
                                            tipo: tipo,
                                            aulas: aulas,
                                            fecha: fecha,
                                        });
                                    }
                                }
                            }
                        }
                    });
                });

                //console.log("Exámenes:", examenes);
                resolve(examenes);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsBinaryString(file);
    });
}

function convertirFecha(fechaString, año) {
    // Verificar si fechaString está definida
    if (!fechaString) {
        return null;
    }

    // Objeto que mapea los nombres de los meses en español a números
    const meses = {
        enero: "01",
        febrero: "02",
        marzo: "03",
        abril: "04",
        mayo: "05",
        junio: "06",
        julio: "07",
        agosto: "08",
        septiembre: "09",
        octubre: "10",
        noviembre: "11",
        diciembre: "12",
    };

    // Separar la cadena de fecha en partes: día, mes y año
    const partes = fechaString.split(" ");

    // Obtener el número de mes usando el objeto de meses
    const numeroMes = meses[partes[3].toLowerCase()];

    // Ajustar el año dependiendo del mes
    const añoAjustado =
        partes[3].toLowerCase() === "enero" ? String(Number(año) + 1) : año;

    // Componer la fecha en el formato YYYY-MM-DD
    const fechaFormateada = `${añoAjustado}-${numeroMes}-${partes[1].padStart(
        2,
        "0"
    )}`;

    return fechaFormateada;
}

function devuelveFecha(fechas, i) {
    // Calcular el índice de la fecha en base al índice de la fila
    const indiceFecha = Math.floor((i - 1) / 2);
    // Devolver la fecha correspondiente
    return fechas[indiceFecha];
}

function devuelveHora(valor) {
    if (valor === 9 / 24) {
        return "09:00:00";
    } else if (valor === 15 / 24) {
        return "15:00:00";
    } else return "";
}

function devuelveTipo(valor) {
    // Convertir a minúsculas y quitar espacios alrededor
    const lowercaseValor = valor.toLowerCase().trim();
    // console.log(`Valor original: "${valor}"`);
    // console.log(`Valor en minúsculas y sin espacios: "${lowercaseValor}"`);

    // Extraer lo que está entre paréntesis
    const tipoSesion = lowercaseValor.match(/\(([^)]+)\)$/);
    if (tipoSesion) {
        const tipo = tipoSesion[1].trim();
        // console.log(`Texto entre paréntesis: "${tipo}"`);

        // Verificar si el texto extraído termina con "prácticas" o "prac."
        if (tipo === "prácticas" || tipo === "prac.") {
            // console.log(`Coincidencia encontrada: "PL"`);
            return "PL";
        }
    }

    //console.log(`No coincide, devuelve: "Teoría"`);
    return "Teoría";
}

function devuelveAsignatura(valor) {
    // Buscar el índice del segundo guion
    const primerGuion = valor.indexOf("-");
    const segundoGuion = valor.indexOf("-", primerGuion + 1);

    // Verificar si se encontró el segundo guion
    if (segundoGuion !== -1) {
        // Obtener la subcadena después del segundo guion y eliminar espacios al principio y al final
        let asignaturaAcortada = valor.substring(segundoGuion + 1).trim();

        // Buscar el índice del paréntesis de apertura
        const indiceParentesisApertura = asignaturaAcortada.indexOf("(");
        // Buscar el índice del salto de línea
        const indiceSaltoLinea = asignaturaAcortada.indexOf("\n");

        // Verificar si se encontró el paréntesis de apertura o el salto de línea
        let indiceFinal;
        if (indiceParentesisApertura !== -1 && indiceSaltoLinea !== -1) {
            // Tomar el índice menor entre el paréntesis de apertura y el salto de línea
            indiceFinal = Math.min(indiceParentesisApertura, indiceSaltoLinea);
        } else if (indiceParentesisApertura !== -1) {
            indiceFinal = indiceParentesisApertura;
        } else if (indiceSaltoLinea !== -1) {
            indiceFinal = indiceSaltoLinea;
        }

        if (indiceFinal !== undefined) {
            // Tomar la subcadena antes del paréntesis de apertura o el salto de línea
            asignaturaAcortada = asignaturaAcortada
                .substring(0, indiceFinal)
                .trim();
        }

        // Eliminar las palabras "práctica" y "teoría" si están presentes
        asignaturaAcortada = asignaturaAcortada
            .replace(/\bpráctica\b/gi, "")
            .replace(/\bteoría\b/gi, "")
            .trim();

        return asignaturaAcortada;
    } else {
        // Si no se encuentra ningún segundo guion, devolver el valor original
        return valor;
    }
}

function devuelveAulas(valor) {
    // Reemplazar 'y' por comas
    valor = valor.replace(/y/g, ",");

    // Dividir la cadena por comas y saltos de línea
    const partes = valor.split(/[,;\r\n]+/);

    // Limpiar cada parte y eliminar espacios en blanco adicionales
    const aulasLimpias = partes.map((aula) => aula.trim());

    // Filtrar las partes vacías
    const aulasFiltradas = aulasLimpias.filter((aula) => aula !== "");

    // Unir las partes con comas
    const aulasUnidas = aulasFiltradas.join(", ");

    return aulasUnidas;
}
