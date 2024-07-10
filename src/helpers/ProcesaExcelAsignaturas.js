import * as XLSX from "xlsx";

export function ProcesaExcelAsignaturas(file, hojasAProcesar) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const binaryString = event.target.result;
                const workbook = XLSX.read(binaryString, { type: "binary" });

                let asignaturas = [];

                // Iterar sobre las hojas especificadas
                hojasAProcesar.forEach((hoja) => {
                    const sheet = workbook.Sheets[hoja];
                    const data = XLSX.utils.sheet_to_json(sheet, {
                        header: 1,
                        range: 1,
                    });

                    // Procesar cada fila de datos
                    data.slice(1).forEach((fila, index) => {
                        if (fila.length > 0) {
                            const [
                                ID,
                                Curso,
                                Asignatura,
                                NombreHorarios,
                                NombreExámenes,
                                NombreAsignación,
                            ] = fila;

                            // Crear objeto de asignatura
                            const asignatura = {
                                id: index + 1,
                                idAsignatura: ID || "",
                                curso: Curso || "",
                                nombreReal: Asignatura || "",
                                nombreHorario: NombreHorarios || "",
                                nombreExamen: NombreExámenes || "",
                                nombreAsignación: NombreAsignación || "",
                            };

                            // Agregar el objeto de asignatura al array
                            asignaturas.push(asignatura);
                        }
                    });
                });

                // Mostrar todas las asignaturas
                console.log("Asignaturas:", asignaturas);

                // Resolver la promesa con las asignaturas procesadas
                resolve(asignaturas);
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
