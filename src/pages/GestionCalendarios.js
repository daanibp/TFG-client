import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import Sidebar from "../Components/Sidebar";
import "../estilos/GestionCalendarios.css";
//import { ProcesaExcelHorarios } from "../helpers/ProcesaExcelHorarios";
import { ProcesaExcelExamenes } from "../helpers/ProcesaExcelExamenes";
import { ProcesaExcelHorarios_v2 } from "../helpers/ProcesaExcelHorarios_v2";

const moment = require("moment");

function GestionCalendarios() {
    const { authState } = useContext(AuthContext);

    const [solicitudes, setSolicitudes] = useState([]);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [usuarioSolicitante, setUsuarioSolicitante] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("Todos");

    // Variable para almacenar los datos de línea procesados
    const lineasProcesadas = [];
    const lineasProcesadasExamenes = [];

    const [asignaturas, setAsignaturas] = useState([]);
    const [grupos, setGrupos] = useState([]);

    let sesionesNuevas = [];
    let sesionesExamenesNuevas = [];

    const [selectedScheduleFile, setSelectedScheduleFile] = useState(null);
    const [selectedExamFile, setSelectedExamFile] = useState(null);

    const [mostrarMensajeHorarios, setMostrarMensajeHorarios] = useState(false);
    const [mensajeHorarios, setMensajeHorarios] = useState("");

    const [mostrarMensajeTemporalHorarios, setMostrarMensajeTemporalHorarios] =
        useState(false);
    const [mostrarMensajeTemporalExamenes, setMostrarMensajeTemporalExamenes] =
        useState(false);

    const [mostrarMensajeExamenes, setMostrarMensajeExamenes] = useState(false);
    const [mensajeExamenes, setMensajeExamenes] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:5001/solicitudEventos`).then((response) => {
            console.log("Solicitudes: ", response.data);
            setSolicitudes(response.data);
        });
        axios.get(`http://localhost:5001/asignaturas`).then((response) => {
            console.log("Asignaturas: ", response.data);
            setAsignaturas(response.data);
        });
        axios.get(`http://localhost:5001/grupos`).then((response) => {
            console.log("Grupos: ", response.data);
            setGrupos(response.data);
        });
    }, []);

    // SOLICITUDES

    const showSolicitudDetails = (solicitud) => {
        axios
            .get(`http://localhost:5001/usuarios/${solicitud.UsuarioId}`)
            .then((response) => {
                setUsuarioSolicitante(response.data.uo);
            })
            .catch((error) => {
                console.error("Error al obtener el nombre de usuario:", error);
            });
        setSelectedSolicitud(solicitud);
    };

    const closeSolicitudDetails = () => {
        setSelectedSolicitud(null);
    };

    const aceptarSolicitud = (solicitud) => {
        // Actualizo solicitud en la BBDD
        axios.put(
            `http://localhost:5001/solicitudEventos/aceptar/${solicitud.id}`
        );
        window.location.reload();
        // Se crea el evento global
        const globalEventData = {
            asunto: solicitud.asunto,
            fechaDeComienzo: solicitud.fechaDeComienzo,
            comienzo: solicitud.comienzo,
            fechaDeFinalización: solicitud.fechaDeFinalización,
            finalización: solicitud.finalización,
            todoElDía: solicitud.todoElDía,
            reminder: solicitud.reminder,
            reminderDate: solicitud.reminderDate,
            reminderTime: solicitud.reminderTime,
            meetingOrganizer: solicitud.meetingOrganizer,
            description: solicitud.description,
            priority: solicitud.priority,
            private: solicitud.private,
            sensitivity: solicitud.sensitivity,
            showTimeAs: solicitud.showTimeAs,
            solicitudEventoId: solicitud.id,
        };
        axios.post(
            "http://localhost:5001/eventosglobales/addGlobalEvent",
            globalEventData
        );
    };

    const denegarSolicitud = (solicitud) => {
        // Actualizo solicitud en la BBDD
        axios.put(
            `http://localhost:5001/solicitudEventos/denegar/${solicitud.id}`
        );
        window.location.reload();
    };

    // Función para filtrar las solicitudes por estado
    const filtrarSolicitudes = (estado) => {
        setFiltroEstado(estado);
    };

    const getButtonStyle = (estado) => {
        return filtroEstado === estado ? "button-active" : "";
    };

    const solicitudesFiltradas = solicitudes.filter((solicitud) => {
        if (filtroEstado === "Todos") return true;
        return solicitud.estado === filtroEstado;
    });

    // HORARIOS

    // Función para manejar el cambio en el archivo seleccionado para el horario
    const handleScheduleFileChange = (event) => {
        const file = event.target.files[0];
        if (
            file &&
            file.name !== "Horarios-2023-2024_1C.xlsx" &&
            file.name !== "Horarios-2023-2024_2C.xlsx"
        ) {
            alert(
                "Por favor, selecciona el archivo 'Horarios-2023-2024_1C.xlsx' o 'Horarios-2023-2024_2C.xlsx'."
            );
            event.target.value = null;
            setSelectedScheduleFile(null);
        } else {
            setSelectedScheduleFile(file);
        }
    };

    // Función para manejar el cambio en el archivo seleccionado para exámenes
    const handleExamFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.name !== "Examenes_23-24.xlsx") {
            alert("Por favor, selecciona el archivo 'Examenes_23-24.xlsx'.");
            event.target.value = null;
            setSelectedExamFile(null);
        } else {
            setSelectedExamFile(file);
        }
    };

    const handleCerrarMensaje = () => {
        setMostrarMensajeHorarios(false);
    };

    // Función para determinar el cuatrimestre basado en el nombre del archivo
    function determinarCuatrimestre(nombreArchivo) {
        if (nombreArchivo.endsWith("2C.xlsx")) {
            return "C2";
        } else if (nombreArchivo.endsWith("1C.xlsx")) {
            return "C1";
        } else {
            // Si el nombre del archivo no termina en "1C" o "2C", puedes devolver un valor por defecto o lanzar un error
            throw new Error("El nombre del archivo no es válido");
        }
    }

    // Función para verificar la existencia de asignaturas en la base de datos
    const verificarGrupos = async () => {
        try {
            // Si no hay asignaturas, mostrar mensaje de alerta
            if (asignaturas.length === 0) {
                alert("No hay grupos en la base de datos. Cárgalos primero.");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al verificar los grupos:", error);
            return false;
        }
    };

    const handleScheduleFileUpload = async () => {
        // Verificar la existencia de asignaturas antes de cargar grupos
        const hayGrupos = await verificarGrupos();
        if (hayGrupos) {
            if (selectedScheduleFile) {
                setMostrarMensajeTemporalHorarios(true);
                // Verifica si se ha seleccionado un archivo
                // Obtener el nombre del archivo
                const nombreArchivo = selectedScheduleFile.name;
                try {
                    // Determinar el cuatrimestre basado en el nombre del archivo
                    const cuatri = determinarCuatrimestre(nombreArchivo);
                    console.log("Cuatri", cuatri);
                    const dataHorarios = await ProcesaExcelHorarios_v2(
                        selectedScheduleFile,
                        [
                            "1ITIN_A",
                            "1ITIN_B",
                            "2ITIN_A",
                            "2ITIN_ING",
                            "3ITIN_A",
                            "3ITIN_A&ING",
                            "4ITIN_A",
                        ],
                        cuatri
                    );
                    console.log("Data Horarios: ", dataHorarios);
                    for (const info of dataHorarios) {
                        lineasProcesadas.push(info);
                    }
                    await crearSesiones();
                    await AgregarSesiones(sesionesNuevas, cuatri);
                    setMostrarMensajeTemporalHorarios(false);
                } catch (error) {
                    console.error(
                        "Error al procesar el archivo de horarios.",
                        error
                    );
                }
            } else {
                alert(
                    "Por favor selecciona un archivo de horarios antes de subirlo."
                );
            }
        }
    };

    // Crea las sesiones a partir de los datos de la línea procesada
    const crearSesiones = async () => {
        try {
            //setSesiones([]);
            for (const lineaProcesada of lineasProcesadas) {
                try {
                    const idGrupo = obtenerIdGrupo(lineaProcesada.grupo);

                    // Utilizo los datos de la línea procesada para crear una nueva sesión
                    const nuevaSesion = {
                        asunto: lineaProcesada.nombre,
                        fechaDeComienzo: formatearFecha(lineaProcesada.fecha),
                        comienzo: lineaProcesada.horaComienzo,
                        fechaDeFinalización: formatearFecha(
                            lineaProcesada.fecha
                        ),
                        finalización: lineaProcesada.horaFinal,
                        todoElDía: false,
                        reminder: false,
                        reminderDate: null,
                        reminderTime: "10:00:00",
                        meetingOrganizer: "Uniovi",
                        description:
                            lineaProcesada.grupo + " - " + lineaProcesada.aula,
                        location: lineaProcesada.aula,
                        priority: "Normal",
                        private: false,
                        sensitivity: "Normal",
                        showTimeAs: 2,
                        examen: false,
                        creadoPorMi: false,
                        GrupoId: idGrupo,
                    };
                    //console.log("Nueva Sesión: ", nuevaSesion);
                    sesionesNuevas.push(nuevaSesion);
                } catch (error) {
                    console.error(
                        "Error al crear la sesión para el grupo:",
                        lineaProcesada.grupo,
                        error.message
                    );
                }
            }
        } catch (error) {
            console.error("Error al crear las sesiones:", error.message);
            throw new Error("Error al crear las sesiones.");
        }
    };

    function normalizarNombreGrupo(nombre) {
        // Dividir PL2 y F_INFORM por el -
        // const [grupo, abrAsignatura] = nombre.split("-");
        // Dividir por el último guion para manejar casos donde la asignatura tenga guiones
        const lastIndex = nombre.lastIndexOf("-");
        const grupo = nombre.slice(0, lastIndex);
        const abrAsignatura = nombre.slice(lastIndex + 1);

        // Pueden ser PL-ENG1 o PL-ENG2 en vez de PL2
        // const numeroGrupo = grupo.match(/\d+/); // Busca el primer número en la cadena
        // Verificar si hay un guion en el nombre del grupo
        const tieneGuion = grupo.includes("-");

        if (tieneGuion) {
            // Eliminar los números del grupo y mantener solo las letras
            const grupoSinNumeros = grupo.replace(/\d+/g, "");
            if (grupoSinNumeros.includes("ENG")) {
                return [
                    `${grupoSinNumeros}_${abrAsignatura}`,
                    `${grupoSinNumeros.replace("ENG", "ING")}_${abrAsignatura}`,
                ];
            } else if (grupoSinNumeros.includes("ING")) {
                return [
                    `${grupoSinNumeros}_${abrAsignatura}`,
                    `${grupoSinNumeros.replace("ING", "ENG")}_${abrAsignatura}`,
                ];
            } else {
                return [
                    `${grupoSinNumeros}_${abrAsignatura}`,
                    ` ${grupoSinNumeros}_${abrAsignatura}`,
                ];
            }
        } else {
            // Si no hay guion, tratamos la primera parte como el tipo y la segunda como el número de grupo
            const numeroGrupo = grupo.match(/\d+/);
            if (numeroGrupo) {
                const tipo = grupo.replace(/\d+/, ""); // Eliminar el número del grupo
                // Devolver dos opciones normalizadas
                return [
                    `${tipo}-${numeroGrupo[0]}_${abrAsignatura}`,
                    `${tipo}-0${numeroGrupo[0]}_${abrAsignatura}`,
                ];
            } else if (grupo.includes("ENG")) {
                return [
                    `${grupo}_${abrAsignatura}`,
                    `${grupo.replace("ENG", "ING")}_${abrAsignatura}`, // Espacio en blanco antes del grupo
                ];
            } else if (grupo.includes("ING")) {
                return [
                    `${grupo}_${abrAsignatura}`,
                    `${grupo.replace("ING", "ENG")}_${abrAsignatura}`, // Espacio en blanco antes del grupo
                ];
            } else {
                // Si no hay número de grupo, devolver dos opciones normalizadas
                return [
                    `${grupo}_${abrAsignatura}`,
                    ` ${grupo}_${abrAsignatura}`, // Espacio en blanco antes del grupo
                ];
            }
        }
    }

    const obtenerIdGrupo = (nombreGrupo) => {
        const opcionesNormalizadas = normalizarNombreGrupo(nombreGrupo);
        // console.log("Nombre Recibido: ", nombreGrupo);
        // console.log("Nombres Normalizados: ", opcionesNormalizadas);

        const grupoEncontrado = grupos.find((grupo) => {
            return (
                grupo.nombre.toUpperCase() ===
                    opcionesNormalizadas[0].toUpperCase() ||
                grupo.nombre.toUpperCase() ===
                    opcionesNormalizadas[1].toUpperCase()
            );
        });

        if (grupoEncontrado) {
            return grupoEncontrado.id;
        }

        throw new Error(
            `No se encontró el grupo con el nombre: ${nombreGrupo}`
        );
    };

    const AgregarSesiones = async (sesiones, cuatri) => {
        console.log("Sesiones antes de su agregación: ", sesiones);
        console.log("Nuevas sesiones antes de su agregación: ", sesionesNuevas);
        console.log("Cuatri:", cuatri);
        try {
            const tamañoLote = 100; // Tamaño del lote
            let nSesionesNuevas = 0;
            let primerLote = true;
            // Dividir las sesiones en lotes
            for (let i = 0; i < sesionesNuevas.length; i += tamañoLote) {
                const lote = sesionesNuevas.slice(i, i + tamañoLote);
                const response = await axios.post(
                    "http://localhost:5001/sesiones/addLoteSesiones",
                    {
                        cuatri: cuatri,
                        nuevasSesiones: lote,
                        primerLote: primerLote,
                    }
                );

                console.log(
                    `Lote ${
                        i / tamañoLote + 1
                    } de sesiones enviado correctamente:`,
                    response.data
                );
                nSesionesNuevas =
                    response.data.sesionesCreadas.length + nSesionesNuevas;

                primerLote = false;
            }

            if (nSesionesNuevas > 0) {
                setMensajeHorarios(
                    `Se han agregado ${nSesionesNuevas} sesiones nuevas al sistema.`
                );
            } else {
                setMensajeHorarios("No se ha agregado ninguna sesión nueva.");
            }

            setMostrarMensajeHorarios(true);
        } catch (error) {
            console.error("Error al agregar sesiones:", error.message);
            setMensajeHorarios("Error al agregar sesiones.");
            setMostrarMensajeHorarios(true);
        }
    };

    // EXAMENES

    // Función para manejar la subida del archivo de exámenes
    const handleExamFileUpload = async () => {
        try {
            // Verificar la existencia de asignaturas antes de cargar grupos
            const hayGrupos = await verificarGrupos();
            if (hayGrupos) {
                if (selectedExamFile) {
                    const cuatri = "Examenes";
                    setMostrarMensajeTemporalExamenes(true);
                    const dataExamenes = await ProcesaExcelExamenes(
                        selectedExamFile,
                        ["GIITIN01"]
                    );
                    console.log("Data Examenes: ", dataExamenes);
                    for (const info of dataExamenes) {
                        lineasProcesadasExamenes.push(info);
                    }
                    await crearSesionesExamenes();
                    await AgregarSesionesExamenes(
                        sesionesExamenesNuevas,
                        cuatri
                    );
                    setMostrarMensajeTemporalExamenes(false);
                } else {
                    alert(
                        "Por favor selecciona un archivo de exámenes antes de subirlo."
                    );
                }
            }
        } catch (error) {
            console.error("Error al procesar el archivo de exámenes.", error);
        }
    };

    // Crea las sesiones a partir de los datos de la línea procesada
    const crearSesionesExamenes = async () => {
        try {
            //setSesionesExamenes([]);
            for (const lineaProcesada of lineasProcesadasExamenes) {
                try {
                    // Obtener asignatura
                    let nombreRealAsignatura = obtenerNombreRealAsignatura(
                        lineaProcesada.asignatura
                    );
                    // Utilizo los datos de la línea procesada para crear varias sesiones
                    let gruposId = [];
                    // Si es de tipo Teoría creas una sesion para todos los grupos de Teoría de esa asignatura
                    if (lineaProcesada.tipo === "Teoría") {
                        // Busco el grupoId de lineaProcesada.asignatura y que grupos.tipo sea Teoría
                        gruposId = obtenerGrupos(
                            lineaProcesada.asignatura,
                            "Teoría"
                        );
                    } else if (lineaProcesada.tipo === "PL") {
                        gruposId = obtenerGrupos(
                            lineaProcesada.asignatura,
                            "PL"
                        );
                    } else {
                        console.error("Error: No es ni Teoría ni PL.");
                    }
                    //console.log("GruposId: ", gruposId);
                    // Crear una sesión para cada grupo
                    for (const grupoId of gruposId) {
                        const nuevaSesion = {
                            asunto: nombreRealAsignatura,
                            fechaDeComienzo: lineaProcesada.fecha,
                            comienzo: lineaProcesada.hora,
                            fechaDeFinalización: lineaProcesada.fecha,
                            finalización: añadirHoras(lineaProcesada.hora, 3),
                            todoElDía: false,
                            reminder: false,
                            reminderDate: null,
                            reminderTime: "10:00:00",
                            meetingOrganizer: "Uniovi",
                            description:
                                "Examen - " +
                                lineaProcesada.asignatura +
                                "(" +
                                lineaProcesada.tipo +
                                ") - " +
                                lineaProcesada.aulas,
                            location: lineaProcesada.aulas,
                            priority: "Normal",
                            private: false,
                            sensitivity: "Normal",
                            showTimeAs: 2,
                            examen: true,
                            creadoPorMi: false,
                            GrupoId: grupoId,
                        };
                        //console.log("Nueva Sesión: ", nuevaSesion);
                        sesionesExamenesNuevas.push(nuevaSesion);
                    }
                } catch (error) {
                    console.error(
                        "Error al crear la sesión para el examen de:",
                        lineaProcesada.asignatura,
                        error.message
                    );
                }
            }
        } catch (error) {
            console.error("Error al crear las sesiones:", error.message);
            throw new Error("Error al crear las sesiones.");
        }
    };

    const AgregarSesionesExamenes = async (sesionesExamenes, cuatri) => {
        console.log(
            "Sesiones de exámenes antes de su agregación: ",
            sesionesExamenes
        );
        console.log(
            "Nuevas sesiones de exámenes antes de su agregación: ",
            sesionesExamenesNuevas
        );
        try {
            const tamañoLote = 100; // Tamaño del lote
            let nSesionesNuevas = 0;
            // Dividir las sesiones en lotes
            for (
                let i = 0;
                i < sesionesExamenesNuevas.length;
                i += tamañoLote
            ) {
                const lote = sesionesExamenesNuevas.slice(i, i + tamañoLote);
                const response = await axios.post(
                    "http://localhost:5001/sesiones/addLoteSesiones",
                    {
                        cuatri: cuatri,
                        nuevasSesiones: lote,
                    }
                );
                console.log(
                    `Lote ${
                        i / tamañoLote + 1
                    } de sesiones enviado correctamente:`,
                    response.data
                );
                nSesionesNuevas =
                    response.data.sesionesCreadas.length + nSesionesNuevas;
            }

            if (nSesionesNuevas > 0) {
                setMensajeExamenes(
                    `Se han agregado ${nSesionesNuevas} sesiones nuevas al sistema.`
                );
            } else {
                setMensajeExamenes("No se ha agregado ninguna sesión nueva.");
            }

            setMostrarMensajeExamenes(true);
        } catch (error) {
            console.error("Error al agregar sesiones:", error.message);
            setMensajeExamenes("Error al agregar sesiones.");
            setMostrarMensajeExamenes(true);
        }
    };

    const handleCerrarMensajeExamenes = () => {
        setMostrarMensajeExamenes(false);
    };

    // FUNCIONES EXTRA

    function obtenerNombreRealAsignatura(nombreExamen) {
        // Buscamos la asignatura que coincida con el nombreExamen proporcionado
        const asignatura = asignaturas.find((asignatura) => {
            const partes = asignatura.nombreExamen.split("-");
            const nombreExamenSinPrefijo = partes.slice(2).join("-");
            return nombreExamenSinPrefijo === nombreExamen;
        });

        // Si se encuentra la asignatura, devolver el nombre real
        if (asignatura) {
            return asignatura.nombreReal;
        } else {
            return "Asignatura no encontrada";
        }
    }

    function obtenerGrupos(nombreAsignatura, tipo) {
        // Obtener el ID de la asignatura usando el nombre de la asignatura
        const asignaturaId = obtenerAsignaturaId(nombreAsignatura);
        if (!asignaturaId) {
            console.error(
                `No se encontró el ID para la asignatura: ${nombreAsignatura}`
            );
            return []; // Devolver un array vacío si no se encuentra el ID de la asignatura
        }

        // Filtrar los grupos según el ID de la asignatura y el tipo
        return grupos
            .filter(
                (grupo) =>
                    grupo.AsignaturaId === asignaturaId && grupo.tipo === tipo
            )
            .map((grupo) => grupo.id);
    }

    function obtenerAsignaturaId(nombreAsignatura) {
        // Buscar la asignatura en la lista de asignaturas
        const asignatura = asignaturas.find((asig) => {
            // Separar el nombreExamen por guiones y obtener la parte después del segundo guion
            const partesAsignatura = asig.nombreExamen.split("-");
            if (partesAsignatura.length < 3) {
                return false;
            }
            const nombreExamenAsignatura = partesAsignatura
                .slice(2)
                .join("-")
                .trim();
            return nombreExamenAsignatura === nombreAsignatura;
        });
        return asignatura ? asignatura.id : null;
    }

    // Función para añadir horas a una fecha
    function añadirHoras(hora, horasAñadir) {
        // Convertir la hora a un objeto Date
        let [horas, minutos, segundos] = hora.split(":").map(Number);
        let fecha = new Date();
        fecha.setHours(horas, minutos, segundos, 0);

        // Añadir las horas
        fecha.setHours(fecha.getHours() + horasAñadir);

        // Formatear la nueva hora a HH:MM:SS
        let horasFinal = String(fecha.getHours()).padStart(2, "0");
        let minutosFinal = String(fecha.getMinutes()).padStart(2, "0");
        let segundosFinal = String(fecha.getSeconds()).padStart(2, "0");

        return `${horasFinal}:${minutosFinal}:${segundosFinal}`;
    }

    const formatTime = (timeString) => {
        if (!timeString) return "";

        const parts = timeString.split(":");

        if (parts.length !== 3) return "";

        const hours = parseInt(parts[0], 10).toString();
        const minutes = parts[1];

        return `${hours}:${minutes}`;
    };

    // Función para formatear la fecha al formato deseado con zona horaria
    function formatearFecha(fecha) {
        // Parsear la fecha usando Moment.js y formatearla en el formato deseado con zona horaria
        return moment(fecha, "DD/MM/YYYY").format("YYYY-MM-DD");
    }

    return (
        <AuthContext.Provider value={{ authState }}>
            {!authState.status ? (
                <div className="container">
                    <h1 className="title">Mi Área Personal</h1>
                    <h3 className="subtitle">
                        Inicia sesión para acceder a tu área personal
                    </h3>
                </div>
            ) : (
                <div className="sidebar-calendar">
                    <div id="miSidebar">
                        <Sidebar id={authState.id} isAdmin={authState.admin} />
                    </div>
                    <div className="box">
                        <div className="boxTitleLabel">
                            <div className="titleLabel">
                                Gestión de Calendarios
                            </div>
                        </div>
                        <div className="containerGestion">
                            <div className="boxEventos">
                                <div className="Titulo">
                                    <h1>Eventos</h1>
                                </div>
                                <div className="CargarClases">
                                    Cargar horario de clases
                                </div>
                                <div className="CargarFichero">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleScheduleFileChange}
                                    />
                                    <button onClick={handleScheduleFileUpload}>
                                        Cargar horarios de clases
                                    </button>
                                    {mostrarMensajeTemporalHorarios && (
                                        <div className="mensaje-dialogo-asignaturas">
                                            <div className="mensaje-dialogo-contenido-asignaturas">
                                                <p>
                                                    Procesando el archivo.{" "}
                                                    <br />
                                                    Creando sesiones... <br />
                                                    Este proceso puede tardar
                                                    unos segundos. <br />
                                                    Espere.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {mostrarMensajeHorarios && (
                                        <div className="mensaje-dialogo-asignaturas">
                                            <div className="mensaje-dialogo-contenido-asignaturas">
                                                <p>{mensajeHorarios}</p>
                                                <button
                                                    onClick={
                                                        handleCerrarMensaje
                                                    }
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p>
                                    Para cargar el horario de clases debemos
                                    seleccionar el Excel
                                    "Horarios-2023-2024_1C.xlsx" y
                                    "Horarios-2023-2024_2C.xlsx".
                                </p>
                                <div className="GenerarExamenes">
                                    Cargar calendario de exámenes
                                </div>
                                <div className="CargarFichero">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleExamFileChange}
                                    />
                                    <button
                                        onClick={() => handleExamFileUpload()}
                                    >
                                        Cargar calendario de exámenes
                                    </button>

                                    {mostrarMensajeTemporalExamenes && (
                                        <div className="mensaje-dialogo-asignaturas">
                                            <div className="mensaje-dialogo-contenido-asignaturas">
                                                <p>
                                                    Procesando el archivo.{" "}
                                                    <br />
                                                    Creando sesiones... <br />
                                                    Este proceso puede tardar
                                                    unos segundos. <br />
                                                    Espere.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {mostrarMensajeExamenes && (
                                        <div className="mensaje-dialogo-asignaturas">
                                            <div className="mensaje-dialogo-contenido-asignaturas">
                                                <p>{mensajeExamenes}</p>
                                                <button
                                                    onClick={
                                                        handleCerrarMensajeExamenes
                                                    }
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p>
                                    Para cargar el horario de clases debemos
                                    seleccionar el Excel "Examenes_23-24.xlsx".
                                </p>
                            </div>

                            <div className="boxEventosGlobales">
                                <div className="Titulo">
                                    <h1>Eventos Globales</h1>
                                </div>
                                <div className="GestionarSolicitudes">
                                    Gestionar solicitudes
                                    <div>
                                        <button
                                            className={getButtonStyle("Todos")}
                                            onClick={() =>
                                                filtrarSolicitudes("Todos")
                                            }
                                        >
                                            Todas
                                        </button>
                                        <button
                                            className={getButtonStyle(
                                                "Pendiente"
                                            )}
                                            onClick={() =>
                                                filtrarSolicitudes("Pendiente")
                                            }
                                        >
                                            Pendientes
                                        </button>
                                        <button
                                            className={getButtonStyle(
                                                "Aceptada"
                                            )}
                                            onClick={() =>
                                                filtrarSolicitudes("Aceptada")
                                            }
                                        >
                                            Aceptadas
                                        </button>

                                        <button
                                            className={getButtonStyle(
                                                "Denegada"
                                            )}
                                            onClick={() =>
                                                filtrarSolicitudes("Denegada")
                                            }
                                        >
                                            Denegadas
                                        </button>
                                    </div>
                                </div>
                                <div className="boxSolicitudes">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Asunto</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {solicitudesFiltradas.map(
                                                (solicitud) => (
                                                    <tr key={solicitud.id}>
                                                        <td>{solicitud.id}</td>
                                                        <td>
                                                            {solicitud.asunto}
                                                            <button
                                                                className="botonDetalles1"
                                                                onClick={() =>
                                                                    showSolicitudDetails(
                                                                        solicitud
                                                                    )
                                                                }
                                                            >
                                                                Ver más detalles
                                                            </button>
                                                        </td>
                                                        <td>
                                                            {solicitud.estado}
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="botonAceptar"
                                                                onClick={() =>
                                                                    aceptarSolicitud(
                                                                        solicitud
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                            <button
                                                                className="botonDenegar"
                                                                onClick={() =>
                                                                    denegarSolicitud(
                                                                        solicitud
                                                                    )
                                                                }
                                                            >
                                                                -
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {selectedSolicitud && (
                                <div className="solicitudDetails1">
                                    <h2>Detalles de la solicitud</h2>
                                    <p>ID: {selectedSolicitud.id}</p>
                                    <p>Estado: {selectedSolicitud.estado}</p>
                                    <p>Asunto: {selectedSolicitud.asunto}</p>
                                    <p>
                                        Fecha de Comienzo:{" "}
                                        {new Date(
                                            selectedSolicitud.fechaDeComienzo
                                        ).toLocaleDateString()}
                                    </p>
                                    <p>
                                        Hora de Comienzo:{" "}
                                        {formatTime(selectedSolicitud.comienzo)}
                                    </p>
                                    <p>
                                        Fecha de Finalización:{" "}
                                        {new Date(
                                            selectedSolicitud.fechaDeFinalización
                                        ).toLocaleDateString()}
                                    </p>
                                    <p>
                                        Hora de Finalización:{" "}
                                        {formatTime(
                                            selectedSolicitud.finalización
                                        )}
                                    </p>
                                    <p>
                                        Descripción:{" "}
                                        {selectedSolicitud.description}
                                    </p>
                                    <p>Solicitado por: {usuarioSolicitante}</p>
                                    <button onClick={closeSolicitudDetails}>
                                        Cerrar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export default GestionCalendarios;
