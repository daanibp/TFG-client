import * as XLSX from "xlsx";

export function ProcesaExcelHorarios_v2(file, hojasAProcesar, cuatri) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            const binaryString = event.target.result;
            const workbook = XLSX.read(binaryString, { type: "binary" });

            // Obtener los datos de la hoja "Asignaturas"
            const sheetAsignaturas = workbook.Sheets["Asignaturas"];
            const dataAsignaturas = XLSX.utils.sheet_to_json(sheetAsignaturas, {
                header: 1,
            });

            // Obtener los datos de la hoja especificada por cuatri
            const sheetC = workbook.Sheets[cuatri];
            const dataC = XLSX.utils.sheet_to_json(sheetC, {
                header: 1,
            });

            // Función para obtener la fecha correspondiente a una semana y día de la semana específicos
            function obtenerFecha(numeroSemana, diaSemana) {
                return new Promise((resolve, reject) => {
                    const diaColumna = {
                        Lunes: 1,
                        Martes: 2,
                        Miércoles: 3,
                        Jueves: 4,
                        Viernes: 5,
                    };

                    // Verificar si el día de la semana es válido
                    if (!diaColumna.hasOwnProperty(diaSemana)) {
                        reject("Día de la semana inválido");
                        return;
                    }

                    // Buscar la fecha correspondiente en la tabla
                    for (let i = 1; i < dataC.length; i++) {
                        const row = dataC[i];
                        if (parseInt(row[0]) === numeroSemana) {
                            // Obtener la columna correspondiente al día de la semana
                            const columna = diaColumna[diaSemana];
                            // Verificar si hay una fecha en esa columna
                            if (row[columna]) {
                                const fechaNumeroSerie = row[columna];
                                const fechaJavaScript =
                                    XLSX.SSF.parse_date_code(fechaNumeroSerie);
                                resolve(fechaJavaScript);
                                return;
                            } else {
                                reject(
                                    `FESTIVO: No hay fecha para el ${diaSemana} de la semana especificado en la semana número ${numeroSemana}`
                                );
                                return;
                            }
                        }
                    }
                    // Si no se encuentra la semana, rechaza la promesa
                    reject(`No se encontró la semana número ${numeroSemana}`);
                });
            }

            // Función para buscar el nombre de la asignatura por código
            function obtenerNombreAsignatura(codigoAsignatura) {
                for (let i = 0; i < dataAsignaturas.length; i++) {
                    const row = dataAsignaturas[i];
                    if (row[0].endsWith(codigoAsignatura)) {
                        return {
                            idNumerico: i - 1,
                            id: row[0],
                            nombre: row[2],
                        };
                    }
                }
                return "Asignatura no encontrada"; // Devolver un valor predeterminado si no se encuentra la asignatura
            }

            function devuelveDiaSemana(columna) {
                const diasSemana = [
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                ];
                const indice = Math.floor((columna - 1) / 4);
                return diasSemana[indice];
            }

            function obtenerFechaLegible(fechaObjeto) {
                // Verificar si el objeto tiene los campos necesarios
                if (
                    !fechaObjeto ||
                    typeof fechaObjeto !== "object" ||
                    isNaN(fechaObjeto.d) ||
                    isNaN(fechaObjeto.m) ||
                    isNaN(fechaObjeto.y)
                ) {
                    return "Fecha inválida";
                }

                // Obtener el día, mes y año del objeto
                const dia = fechaObjeto.d;
                const mes = fechaObjeto.m;
                const año = fechaObjeto.y;

                // Formatear la fecha en un formato legible "d/m/y"
                const fechaLegible = `${dia}/${mes}/${año}`;

                return fechaLegible;
            }

            // Iterar sobre las hojas especificadas
            const allPromises = hojasAProcesar.map((hoja) => {
                const sheet = workbook.Sheets[hoja];
                const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const filaPromises = data.slice(3).map(async (row) => {
                    if (!row[0]) {
                        return [];
                    }

                    const columnaPromises = [];

                    for (let columnIndex = 0; columnIndex < 5; columnIndex++) {
                        const columnaInicio = 1 + columnIndex * 4;
                        const asignatura = obtenerNombreAsignatura(
                            row[columnaInicio]
                        );
                        const idNumerico = asignatura.idNumerico;
                        const id = asignatura.id;
                        const nombre = asignatura.nombre;
                        const abr = row[columnaInicio];
                        const aula = row[columnaInicio + 2];
                        const grupo = row[columnaInicio + 1] + "-" + abr;
                        const horaInicioFin = row[0];
                        const horaComienzo = horaInicioFin.slice(0, 5) + ":00";
                        const horaFinal = horaInicioFin.slice(6) + ":00";

                        let semanas = row[columnaInicio + 3];

                        if (typeof semanas !== "undefined") {
                            if (
                                row[columnaInicio + 3] === "TODAS" &&
                                cuatri === "C1"
                            ) {
                                semanas = [
                                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                                    14,
                                ];
                            } else if (
                                row[columnaInicio + 3] === "TODAS" &&
                                cuatri === "C2"
                            ) {
                                semanas = [
                                    20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                                    31, 32, 33, 34, 35,
                                ];
                            } else if (semanas.length === 0) {
                                semanas = [];
                            } else if (semanas.length > 2) {
                                semanas = semanas.split(",").map(Number);
                            } else {
                                semanas = [Number(semanas)];
                            }
                        } else {
                            semanas = [];
                        }

                        const semanaPromises = semanas.map((semana) =>
                            obtenerFecha(
                                semana,
                                devuelveDiaSemana(columnaInicio)
                            )
                                .then((fecha) => {
                                    const fechaLegible =
                                        obtenerFechaLegible(fecha);
                                    return {
                                        idNumerico,
                                        id,
                                        nombre,
                                        abr,
                                        aula,
                                        grupo,
                                        horaComienzo,
                                        horaFinal,
                                        fecha: fechaLegible,
                                    };
                                })
                                .catch((error) => {
                                    console.error(
                                        "Error obteniendo fecha:",
                                        error
                                    );
                                    console.log(
                                        "Datos: (" + nombre,
                                        aula,
                                        grupo + ")"
                                    );
                                    return null;
                                })
                        );

                        columnaPromises.push(Promise.all(semanaPromises));
                    }

                    return Promise.all(columnaPromises).then((results) =>
                        results.flat()
                    );
                });

                return Promise.all(filaPromises).then((results) =>
                    results.flat()
                );
            });

            Promise.all(allPromises)
                .then((resultados) => {
                    const datosFinales = resultados
                        .flat()
                        .filter((resultado) => resultado !== null);
                    resolve(datosFinales);
                })
                .catch((error) => {
                    reject(error);
                });
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsBinaryString(file);
    });
}
