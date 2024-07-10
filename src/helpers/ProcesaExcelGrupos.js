import * as XLSX from "xlsx";

export function ProcesaExcelGrupos(file, hojasAProcesar) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const binaryString = event.target.result;
                const workbook = XLSX.read(binaryString, { type: "binary" });

                let grupos = [];

                // Iterar sobre las hojas especificadas
                hojasAProcesar.forEach((hoja) => {
                    const sheet = workbook.Sheets[hoja];
                    const data = XLSX.utils.sheet_to_json(sheet, {
                        header: 1,
                        range: 1, // Saltar la primera línea (encabezados)
                    });

                    // Procesar cada fila de datos
                    data.forEach((fila, index) => {
                        if (fila.length > 0) {
                            const [CodAsig, NombreAsig, UO, CEX, PAS, PL, TUG] =
                                fila;

                            const grupo = {
                                id: index + 1,
                                codAsig: CodAsig || "",
                                nombre: NombreAsig || "",
                                uo: UO || "",
                                cex: CEX || "",
                                pas: PAS || "",
                                pl: PL || "",
                                tug: TUG || "",
                            };

                            // Agregar el objeto de grupo al array
                            grupos.push(grupo);
                        }
                    });
                });

                // Mostrar toda la información
                console.log("Información del Excel:", grupos);

                // Resolver la promesa con los grupos procesados
                resolve(grupos);
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
