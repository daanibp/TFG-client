import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Calendario from "../Components/Calendario";
import Sidebar from "../Components/Sidebar";
import AñadirEvento from "../Components/AñadirEvento";
import EliminarEvento from "../Components/EliminarEvento";
import { AuthContext } from "../helpers/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import { TiDelete } from "react-icons/ti";
import Papa from "papaparse";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { GiTeacher } from "react-icons/gi";
import MatricularProfesor from "../Components/MatricularProfesor";
import { MdOutlineIosShare } from "react-icons/md";
import CompartirEventos from "../Components/CompartirEventos";
import { FaEye } from "react-icons/fa";
import VerSolicitudes from "../Components/VerSolicitudes";
import { BsClipboard2PlusFill } from "react-icons/bs";
//import LoadingIndicator from "../Components/LoadingIndicator";
//import { AiOutlineLoading3Quarters } from "react-icons/ai";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Europe/Madrid");

function CalendarioEscolar() {
    const { authState } = useContext(AuthContext);
    let { id } = useParams();

    const [eventos, setEventos] = useState([]);
    const [eventosExamenes, setEventosExamenes] = useState([]);
    const [mostrarTipoEventos, setMostrarTipoEventos] = useState("Clases");
    const [mostrarMensajeG, setMostrarMensajeG] = useState(false);
    const [mostrarMensajeA, setMostrarMensajeA] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarMensajeAñadido, setMostrarMensajeAñadido] = useState(false);
    const [borrarEvento, setBorrarEvento] = useState(false);
    const [mostrarProfesor, setMostrarProfesor] = useState(false);
    const [mostrarCompartir, setMostrarCompartir] = useState(false);
    const [mostrarSolicitudes, setMostrarSolicitudes] = useState(false);
    const [mostrarCompartirProfesor, setMostrarCompartirProfesor] =
        useState(false);

    const [asignaturas, setAsignaturas] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [gruposSeleccionados, setGruposSeleccionados] = useState({});
    const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState(
        []
    );
    const [usuarios, setUsuarios] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
    //const [eventosCompartidos, setEventosCompartidos] = useState([]);
    const [eventosCompartidosParaTi, setEventosCompartidosParaTi] = useState(
        []
    );
    const [eventosArg, setEventosArg] = useState([]);

    let navigate = useNavigate();

    // useEffect(async () => {
    //     console.log("AuthState: ", authState);
    //     axios
    //         .get(`http://localhost:5001/eventos/${id}`)
    //         .then((response) => {
    //             console.log("Clases: ", response.data);
    //             setEventos(response.data);
    //         });
    //     axios
    //         .get(`http://localhost:5001/eventos/ex/${id}`)
    //         .then((response) => {
    //             console.log("Examenes: ", response.data);
    //             setEventosExamenes(response.data);
    //         });
    //     axios
    //         .get(`http://localhost:5001/asignaturas`)
    //         .then((response) => {
    //             console.log("Asignaturas: ", response.data);
    //             setAsignaturas(response.data);
    //         });
    //     axios.get(`http://localhost:5001/grupos`).then((response) => {
    //         console.log("Grupos: ", response.data);
    //         setGrupos(response.data);
    //     });
    //     axios
    //         .get(`http://localhost:5001/grupos/usuario/${id}/grupos`)
    //         .then((response) => {
    //             console.log("Grupos Seleccionados: ", response.data);
    //             setGruposSeleccionados(response.data);
    //         });
    //     axios
    //         .get(`http://localhost:5001/usuarios/allUsers/all`)
    //         .then((response) => {
    //             console.log("Usuarios: ", response.data);
    //             setUsuarios(response.data);
    //         });
    //     axios
    //         .get(`http://localhost:5001/asignaturas/usuario/${id}/asignaturas`)
    //         .then((response) => {
    //             console.log("Asignaturas Seleccionadas: ", response.data);
    //             setAsignaturasSeleccionadas(response.data);
    //         });
    //     axios.get(`http://localhost:5001/matriculas`).then((response) => {
    //         console.log("Matrículas: ", response.data);
    //         setMatriculas(response.data);
    //     });
    //     axios
    //         .get(
    //             `http://localhost:5001/eventoscompartidos/getEventosCompartidos/toUsuario/${id}`
    //         )
    //         .then((response) => {
    //             console.log("Eventos Compartidos Para Ti: ", response.data);
    //             setEventosCompartidosParaTi(response.data);
    //         });
    //     axios
    //         .get(`http://localhost:5001/eventos/eventosRelacionados/${id}`)
    //         .then((response) => {
    //             console.log(
    //                 "EventosArg que se quieren compartir para ti: ",
    //                 response.data
    //             );
    //             setEventosArg(response.data);
    //         });
    // }, [id, authState]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("AuthState: ", authState);

                const [
                    eventosResponse,
                    eventosExamenesResponse,
                    asignaturasResponse,
                    gruposResponse,
                    gruposSeleccionadosResponse,
                    usuariosResponse,
                    asignaturasSeleccionadasResponse,
                    matriculasResponse,
                    eventosCompartidosParaTiResponse,
                    eventosArgResponse,
                ] = await Promise.all([
                    axios.get(`http://localhost:5001/eventos/${id}`),
                    axios.get(`http://localhost:5001/eventos/ex/${id}`),
                    axios.get(`http://localhost:5001/asignaturas`),
                    axios.get(`http://localhost:5001/grupos`),
                    axios.get(
                        `http://localhost:5001/grupos/usuario/${id}/grupos`
                    ),
                    axios.get(`http://localhost:5001/usuarios/allUsers/all`),
                    axios.get(
                        `http://localhost:5001/asignaturas/usuario/${id}/asignaturas`
                    ),
                    axios.get(`http://localhost:5001/matriculas`),
                    axios.get(
                        `http://localhost:5001/eventoscompartidos/getEventosCompartidos/toUsuario/${id}`
                    ),
                    axios.get(
                        `http://localhost:5001/eventos/eventosRelacionados/${id}`
                    ),
                ]);

                setEventos(eventosResponse.data);
                setEventosExamenes(eventosExamenesResponse.data);
                setAsignaturas(asignaturasResponse.data);
                setGrupos(gruposResponse.data);
                setGruposSeleccionados(gruposSeleccionadosResponse.data);
                setUsuarios(usuariosResponse.data);
                setAsignaturasSeleccionadas(
                    asignaturasSeleccionadasResponse.data
                );
                setMatriculas(matriculasResponse.data);
                setEventosCompartidosParaTi(
                    eventosCompartidosParaTiResponse.data
                );
                setEventosArg(eventosArgResponse.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, [id, authState]);

    // Función para manejar el clic en los botones
    const handleTipoEventosClick = (tipo) => {
        setMostrarTipoEventos(tipo);
    };

    const MessageBoxGoogle = ({ message, onConfirm, onCancel }) => {
        return (
            <div className="message-box">
                <p>{message}</p>
                <button onClick={onConfirm}>Sí</button>
                <button onClick={onCancel}>No</button>
            </div>
        );
    };

    const MessageBoxApple = ({ message, onCancel }) => {
        return (
            <div className="message-box">
                <p>{message}</p>
                <button onClick={onCancel}>Vale</button>
            </div>
        );
    };

    // Obtener los eventos según el tipo seleccionado
    const eventosMostrados =
        mostrarTipoEventos === "Clases" ? eventos : eventosExamenes;

    function formatearFecha(fechaOriginal, horas, minutos) {
        // Parsear la fecha original con dayjs
        const fechaParseada = dayjs(fechaOriginal);

        // Establecer las nuevas horas y minutos
        const nuevaFecha = fechaParseada
            .set("hour", horas)
            .set("minute", minutos);

        // Formatear la nueva fecha según el formato deseado
        const fechaFormateada = nuevaFecha.format("YYYY-MM-DDTHH:mm:ss");

        return fechaFormateada;
    }

    function obtenerHoraDesdeCadena(cadenaHora) {
        return dayjs.tz(`1970-01-01T${cadenaHora}`, "Europe/Madrid").hour();
    }

    function obtenerMinutosDesdeCadena(cadenaHora) {
        return dayjs.tz(`1970-01-01T${cadenaHora}`, "Europe/Madrid").minute();
    }

    const eventosFormateados = [];

    eventosMostrados.forEach((evento) => {
        eventosFormateados.push({
            id: evento.id,
            start: dayjs
                .tz(
                    formatearFecha(
                        evento.fechaDeComienzo,
                        obtenerHoraDesdeCadena(evento.comienzo),
                        obtenerMinutosDesdeCadena(evento.comienzo)
                    ),
                    "Europe/Madrid"
                )
                .toDate(),
            end: dayjs
                .tz(
                    formatearFecha(
                        evento.fechaDeFinalización,
                        obtenerHoraDesdeCadena(evento.finalización),
                        obtenerMinutosDesdeCadena(evento.finalización)
                    ),
                    "Europe/Madrid"
                )
                .toDate(),
            title: evento.asunto,
            descripcion: evento.description,
            creadoPorMi: evento.creadoPorMi,
        });
    });

    //console.log("Eventos", eventos);
    //console.log("EventosFormateados", eventosFormateados); // aquí se consiguen bien bien

    const mostrarOcultarMensaje = useCallback(
        async (tipoMensaje) => {
            // // Tiempo predeterminado para ocultar el mensaje de carga
            // const tiempoEspera = 100; // Tiempo en milisegundos

            // // Mostrar mensaje de carga
            // setCargando(true);
            switch (tipoMensaje) {
                case "Google":
                    setMostrarMensajeG(
                        (prevMostrarMensajeG) => !prevMostrarMensajeG
                    );
                    setMostrarMensajeA(false);

                    break;
                case "Apple":
                    setMostrarMensajeA(
                        (prevMostrarMensajeA) => !prevMostrarMensajeA
                    );
                    setMostrarMensajeG(false);

                    break;
                case "Añadir":
                    setMostrarFormulario(
                        (prevMostrarFormulario) => !prevMostrarFormulario
                    );
                    setBorrarEvento(false);

                    break;
                case "Borrar":
                    setBorrarEvento((prevBorrarEvento) => !prevBorrarEvento);
                    setMostrarFormulario(false);

                    break;
                case "Profesor":
                    setMostrarProfesor(
                        (prevMostrarProfesor) => !prevMostrarProfesor
                    );
                    setMostrarCompartirProfesor(false);

                    break;
                case "CompartirProfesor":
                    setMostrarCompartirProfesor(
                        (prevMostrarCompartirProfesor) =>
                            !prevMostrarCompartirProfesor
                    );
                    setMostrarProfesor(false);

                    break;
                case "Alumno":
                    setMostrarCompartir(
                        (prevMostrarCompartir) => !prevMostrarCompartir
                    );
                    setMostrarSolicitudes(false);
                    break;
                case "Solicitudes":
                    setMostrarSolicitudes(
                        (prevMostrarSolicitudes) => !prevMostrarSolicitudes
                    );
                    setMostrarCompartir(false);
                    break;
                default:
                    break;
            }
            // Desactivar el estado de carga después de un tiempo de espera
            // setTimeout(() => {
            //     setCargando(false);
            // }, tiempoEspera);
        },
        [setMostrarMensajeG, setMostrarMensajeA]
    );

    // crear .csv
    let data = [];
    eventosMostrados.forEach((evento) => {
        let temp = {
            Asunto: evento.asunto,
            Fechadecomienzo: evento.fechaDeComienzo,
            Comienzo: evento.comienzo,
            Fechadefinalización: evento.fechaDeFinalización,
            Finalización: evento.finalización,
            Todoeldia: evento.todoElDía,
            Reminder: evento.reminder,
            ReminderDate: evento.reminderDate,
            ReminderTime: evento.reminderDate,
            MeetingOrganizer: evento.meetingOrganizer,
            RequiredAttendees: evento.requiredAttendees,
            OptionalAttendees: evento.optionalAttendees,
            Recursosdelareunion: evento.recursosDeLaReunión,
            BillingInformation: evento.BillingInformation,
            Categories: evento.categories,
            Description: evento.description,
            Location: evento.location,
            Mileage: evento.mileage,
            Priority: evento.priority,
            Private: evento.private,
            Sensitivity: evento.sensitivity,
            Showtimeas: evento.showTimeAs,
            Examen: evento.examen,
        };
        data.push(temp);
    });
    //console.log("Eventos para el CSV: ", data);

    // Función para dejar el formato correcto para la creación del csv
    const formatearDatos = (data) => {
        const eventosFormateadosCSV = data.map((evento) => {
            const fechaInicio = new Date(evento.Fechadecomienzo);
            const fechaFinalizacion = new Date(evento.Fechadefinalización);
            const fechaReminder = new Date(evento.ReminderDate);

            return {
                Asunto: evento.Asunto,
                "Fecha de comienzo": fechaInicio.toLocaleDateString(),
                Comienzo: evento.Comienzo,
                "Fecha de finalización": fechaFinalizacion.toLocaleDateString(),
                Finalización: evento.Finalización,
                "Todo el día": evento.Todoeldia ? "VERDADERO" : "FALSO",
                "Reminder on/off": evento.Reminder ? "VERDADERO" : "FALSO",
                "Reminder Date": fechaReminder.toLocaleDateString(),
                "Reminder Time": evento.ReminderTime,
                "Meeting Organizer": evento.MeetingOrganizer,
                "Required Attendees": evento.RequiredAttendees,
                "Optional Attendees": evento.OptionalAttendees,
                "Recursos de la reuniÃƒÂ³n": evento.Recursosdelareunion,
                "Billing Information": evento.BillingInformation,
                Categories: evento.Categories,
                Description: evento.Description,
                Location: evento.Location,
                Mileage: evento.Mileage,
                Priority: evento.Priority,
                Private: evento.Private ? "VERDADERO" : "FALSO",
                Sensitivity: evento.Sensitivity,
                "Show time as": evento.Showtimeas,
            };
        });

        return eventosFormateadosCSV;
    };

    // Llama a la función para formatear los datos antes de convertir y descargar el archivo CSV
    const eventosCSV = formatearDatos(data);

    // Función para convertir y descargar el archivo CSV
    const convertirYDescargarCSV = () => {
        const nombreArchivo =
            mostrarTipoEventos === "Examenes"
                ? "CalendarioExamenes.csv"
                : "Horario.csv";

        const csv = Papa.unparse(eventosCSV);
        const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
            type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);

        // Crea un enlace de descarga
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();

        // Limpia el enlace y la URL
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Abre una nueva pestaña de Google Calendar
        //window.open("https://calendar.google.com/", "_blank");
        window.open(
            "https://calendar.google.com/calendar/u/0/r/settings/export",
            "_blank"
        );
    };

    // Función para agregar un evento al estado
    const agregarEvento = (nuevoEvento) => {
        if (!nuevoEvento.examen) {
            setEventos((prevEventos) => [...prevEventos, nuevoEvento]);
        } else if (nuevoEvento.examen) {
            setEventosExamenes((prevEventosExamenes) => [
                ...prevEventosExamenes,
                nuevoEvento,
            ]);
        } else {
            return;
        }
        setMostrarFormulario(false);
        // Mostrar el mensaje temporal
        setMostrarMensajeAñadido(true);
        // Ocultar el mensaje después de 1 segundo
        setTimeout(() => {
            setMostrarMensajeAñadido(false);
        }, 1000);
    };

    // Función para eliminar un evento del estado
    const eliminarEvento = (eventoId, tipo) => {
        if (tipo === "Clases") {
            setEventos((prevEventos) =>
                prevEventos.filter((evento) => evento.id !== eventoId)
            );
        } else if (tipo === "Examenes") {
            setEventosExamenes((prevEventosExamenes) =>
                prevEventosExamenes.filter((evento) => evento.id !== eventoId)
            );
        }
    };

    // Función para recuperar un evento del estado
    const recuperarEvento = async (eventoId, tipo) => {
        await axios
            .get(`http://localhost:5001/eventos/${id}`)
            .then((response) => {
                console.log("Clases: ", response.data);
                setEventos(response.data);
            });
        await axios
            .get(`http://localhost:5001/eventos/ex/${id}`)
            .then((response) => {
                console.log("Examenes: ", response.data);
                setEventosExamenes(response.data);
            });
    };

    // Función que se ejecutará al cerrar MatricularProfesor
    const handleCerrarMatricularProfesor = async () => {
        console.log("Se ejecutó la función al cerrar MatricularProfesor");
        await axios
            .get(`http://localhost:5001/grupos/usuario/${id}/grupos`)
            .then((response) => {
                console.log("Grupos Seleccionados: ", response.data);
                setGruposSeleccionados(response.data);
            });
        await axios
            .get(`http://localhost:5001/eventos/${id}`)
            .then((response) => {
                console.log("Clases: ", response.data);
                setEventos(response.data);
            });
        await axios
            .get(`http://localhost:5001/eventos/ex/${id}`)
            .then((response) => {
                console.log("Examenes: ", response.data);
                setEventosExamenes(response.data);
            });
        setMostrarProfesor(false);
    };

    // Función que se ejecutará al cerrar VerSolicitudes
    const handleCerrarVerSolicitudes = async () => {
        console.log("Se ejecutó la función al cerrar Ver Solicitudes");
        await axios
            .get(
                `http://localhost:5001/eventoscompartidos/getEventosCompartidos/toUsuario/${id}`
            )
            .then((response) => {
                console.log("Eventos Compartidos Para Ti: ", response.data);
                setEventosCompartidosParaTi(response.data);
            });
        await axios
            .get(`http://localhost:5001/eventos/eventosRelacionados/${id}`)
            .then((response) => {
                console.log(
                    "EventosArg que se quieren compartir para ti: ",
                    response.data
                );
                setEventosArg(response.data);
            });
        setMostrarSolicitudes(false);
    };

    // Función que se ejecutará al cerrar VerSolicitudes
    const handleCerrarCompartirEventos = async () => {
        console.log("Se ejecutó la función al cerrar Compartir Eventos");
        await axios
            .get(`http://localhost:5001/eventos/${id}`)
            .then((response) => {
                console.log("Clases: ", response.data);
                setEventos(response.data);
            });
        await axios
            .get(`http://localhost:5001/eventos/ex/${id}`)
            .then((response) => {
                console.log("Examenes: ", response.data);
                setEventosExamenes(response.data);
            });
        setMostrarCompartir(false);
        setMostrarCompartirProfesor(false);
    };

    return (
        <AuthContext.Provider value={{ authState }}>
            {!authState.status ? (
                <div className="container">
                    <h1 className="title">Mi Área Personal</h1>
                    <h3 className="subtitle">
                        Inicia sesión para acceder a tu área personal
                    </h3>
                </div>
            ) : authState.id !== parseInt(id, 10) ? (
                navigate("/PageNotFound")
            ) : (
                <div className="sidebar-calendar">
                    <div id="miSidebar">
                        <Sidebar id={authState.id} isAdmin={authState.admin} />
                    </div>
                    <div className="box">
                        <div className="boxTitleLabel">
                            <div className="titleLabel">
                                Mi Calendario Escolar
                            </div>
                        </div>
                        <div className="opcionesBotones">
                            <div className="HorarioYCalendario">
                                <button
                                    id="HorarioDeClases"
                                    onClick={() =>
                                        handleTipoEventosClick("Clases")
                                    }
                                    className={
                                        mostrarTipoEventos === "Clases"
                                            ? "boton-activo"
                                            : ""
                                    }
                                >
                                    <div className="txtHorCl">
                                        Horario de Clases
                                    </div>
                                </button>
                                <button
                                    id="HorarioDeExamenes"
                                    onClick={() =>
                                        handleTipoEventosClick("Examenes")
                                    }
                                    className={
                                        mostrarTipoEventos === "Examenes"
                                            ? "boton-activo"
                                            : ""
                                    }
                                >
                                    <div className="txtHorEx">
                                        Calendario de Exámenes
                                    </div>
                                </button>
                            </div>
                            <div className="EspacioAñadirEvento">
                                <button
                                    id="AddEvent"
                                    onClick={() =>
                                        mostrarOcultarMensaje("Añadir")
                                    }
                                >
                                    <div className="addEvent">
                                        <IoIosAddCircle />
                                    </div>
                                </button>
                                <button
                                    id="DeleteEvent"
                                    onClick={() => {
                                        mostrarOcultarMensaje("Borrar");
                                    }}
                                >
                                    <div className="deleteEvent">
                                        <TiDelete />
                                    </div>
                                </button>
                            </div>
                            {mostrarFormulario && (
                                <AñadirEvento
                                    id={id}
                                    onAgregarEvento={agregarEvento}
                                    tipo={mostrarTipoEventos}
                                    isGlobal={false}
                                />
                            )}
                            {mostrarMensajeAñadido && (
                                <div className="mensaje-temporal-añadido">
                                    Evento añadido correctamente
                                </div>
                            )}
                            {borrarEvento && (
                                <EliminarEvento
                                    tipo={mostrarTipoEventos}
                                    eventosFormateados={eventosFormateados}
                                    gruposSeleccionados={gruposSeleccionados}
                                    onEliminarEvento={eliminarEvento}
                                    onRecuperarEvento={recuperarEvento}
                                    idUsuario={id}
                                />
                            )}
                            <div className="EspacioGoogleApple">
                                <button
                                    onClick={() =>
                                        mostrarOcultarMensaje("Google")
                                    }
                                    id="Google"
                                >
                                    <div className="logoGoogle">
                                        <FcGoogle />
                                    </div>
                                </button>

                                <button
                                    onClick={() =>
                                        mostrarOcultarMensaje("Apple")
                                    }
                                    id="Apple"
                                >
                                    <div className="logoApple">
                                        <FaApple />
                                    </div>
                                </button>
                            </div>

                            {mostrarMensajeG && (
                                <MessageBoxGoogle
                                    message="¿Quieres descargar el archivo .csv para importarlo en Google Calendar?"
                                    onConfirm={() => {
                                        convertirYDescargarCSV();
                                        setMostrarMensajeG(false);
                                    }}
                                    onCancel={() => setMostrarMensajeG(false)}
                                />
                            )}

                            {mostrarMensajeA && (
                                <MessageBoxApple
                                    message="Para importar el horario a iOS Calendar debes importarlo a Google Calendar primero y sincronizar tus cuentas."
                                    onCancel={() => setMostrarMensajeA(false)}
                                />
                            )}

                            {authState.profesor && (
                                <div className="EspacioEscogerGruposProfesor">
                                    <button
                                        onClick={() =>
                                            mostrarOcultarMensaje("Profesor")
                                        }
                                        id="Profesor"
                                    >
                                        <div className="logoProfesor">
                                            <BsClipboard2PlusFill />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() =>
                                            mostrarOcultarMensaje(
                                                "CompartirProfesor"
                                            )
                                        }
                                        id="CompartirProfesor"
                                    >
                                        <div className="logoCompartirProfesor">
                                            <GiTeacher />
                                        </div>
                                    </button>
                                </div>
                            )}
                            {mostrarProfesor && (
                                <MatricularProfesor
                                    asignaturas={asignaturas}
                                    grupos={grupos}
                                    gruposSeleccionadosProp={
                                        gruposSeleccionados.grupos
                                    }
                                    idUsuario={id}
                                    onCerrarMatricularProfesor={
                                        handleCerrarMatricularProfesor
                                    }
                                />
                            )}
                            {mostrarCompartirProfesor && (
                                <CompartirEventos
                                    idUsuario={id}
                                    eventosClases={eventos}
                                    eventosExamenes={eventosExamenes}
                                    gruposSeleccionados={gruposSeleccionados}
                                    matriculas={matriculas}
                                    usuariosArg={usuarios}
                                    asignaturasSeleccionadas={
                                        asignaturasSeleccionadas
                                    }
                                    profesor={authState.profesor}
                                    onCerrarCompartirEventos={
                                        handleCerrarCompartirEventos
                                    }
                                />
                            )}

                            {!authState.profesor && (
                                <div className="EspacioCompartirEventosAlumnos">
                                    <button
                                        onClick={() =>
                                            mostrarOcultarMensaje("Alumno")
                                        }
                                        id="Alumno"
                                    >
                                        <div className="logoCompartir">
                                            <MdOutlineIosShare />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() =>
                                            mostrarOcultarMensaje("Solicitudes")
                                        }
                                        id="Solicitudes"
                                    >
                                        <div className="logoVerSolicitudes">
                                            <FaEye />
                                        </div>
                                    </button>
                                </div>
                            )}
                            {mostrarCompartir && (
                                <CompartirEventos
                                    idUsuario={id}
                                    eventosClases={eventos}
                                    eventosExamenes={eventosExamenes}
                                    gruposSeleccionados={gruposSeleccionados}
                                    matriculas={matriculas}
                                    usuariosArg={usuarios}
                                    asignaturasSeleccionadas={
                                        asignaturasSeleccionadas
                                    }
                                    profesor={authState.profesor}
                                    onCerrarCompartirEventos={
                                        handleCerrarCompartirEventos
                                    }
                                />
                            )}
                            {mostrarSolicitudes && (
                                <VerSolicitudes
                                    idUsuario={id}
                                    // eventosClases={eventos}
                                    // eventosExamenes={eventosExamenes}
                                    eventosArg={eventosArg}
                                    eventosCompartidos={
                                        eventosCompartidosParaTi
                                    }
                                    usuariosArg={usuarios}
                                    onCerrarVerSolicitudes={
                                        handleCerrarVerSolicitudes
                                    }
                                />
                            )}
                        </div>
                        <Calendario
                            e={eventosFormateados}
                            startHour={dayjs("2024-02-17T08:00:00").toDate()}
                            endHour={dayjs("2024-02-17T20:00:00").toDate()}
                        />
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export default CalendarioEscolar;
