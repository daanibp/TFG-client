import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Calendario from "../Components/Calendario";
import Sidebar from "../Components/Sidebar";
import { AuthContext } from "../helpers/AuthContext";
import Papa from "papaparse";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import SolicitarEventoGlobal from "../Components/SolicitarEventoGlobal";

function CalendarioGlobal() {
    const { authState } = useContext(AuthContext);

    const [eventosGlobales, setEventosGlobales] = useState([]);
    const [mostrarMensajeG, setMostrarMensajeG] = useState(false);
    const [mostrarMensajeA, setMostrarMensajeA] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarMensajeAñadido, setMostrarMensajeAñadido] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:5001/eventosglobales`).then((response) => {
            console.log("Eventos Globales: ", response.data);
            setEventosGlobales(response.data);
        });
    }, []);

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

    const mostrarOcultarMensaje = useCallback(
        (tipoMensaje) => {
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
                case "Solicitar":
                    setMostrarFormulario(
                        (prevMostrarFormulario) => !prevMostrarFormulario
                    );
                    break;
                default:
                    break;
            }
        },
        [setMostrarMensajeG, setMostrarMensajeA]
    );

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

    //console.log("Eventos globales antes de formatear: ", eventosGlobales);

    eventosGlobales.forEach((evento) => {
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
        });
    });

    //console.log("Eventos", eventosGlobales);
    console.log("EventosFormateados", eventosFormateados); // aquí se consiguen bien bien

    // crear .csv
    let data = [];
    eventosGlobales.forEach((evento) => {
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
        const nombreArchivo = "CalendarioGlobal.csv";

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

    // Función para solicitar un evento global
    const solicitarEvento = (nuevoEvento) => {
        /*setEventosGlobales((prevEventosGlobales) => [
            ...prevEventosGlobales,
            nuevoEvento,
        ]);*/
        setMostrarFormulario(false);
        // Mostrar el mensaje temporal
        setMostrarMensajeAñadido(true);
        // Ocultar el mensaje después de 1 segundo
        setTimeout(() => {
            setMostrarMensajeAñadido(false);
        }, 1000);
    };

    return (
        <div>
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
                            <Sidebar
                                id={authState.id}
                                isAdmin={authState.admin}
                            />
                        </div>
                        <div className="box">
                            <div className="boxTitleLabel">
                                <div className="titleLabel">
                                    Calendario Global
                                </div>
                            </div>
                            <div className="opcionesBotones">
                                <div
                                    className="EspacioAñadirEvento"
                                    id="extraGlobal"
                                >
                                    <button
                                        id="AddEvent"
                                        onClick={() =>
                                            mostrarOcultarMensaje("Solicitar")
                                        }
                                    >
                                        <div className="addEvent">
                                            <IoIosAddCircle />
                                        </div>
                                    </button>
                                </div>
                                {mostrarFormulario && (
                                    <SolicitarEventoGlobal
                                        onSolicitarEvento={solicitarEvento}
                                        userId={authState.id}
                                    />
                                )}
                                {mostrarMensajeAñadido && (
                                    <div className="mensaje-temporal-añadido">
                                        Solicitud enviada correctamente
                                    </div>
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
                                        onCancel={() =>
                                            setMostrarMensajeG(false)
                                        }
                                    />
                                )}

                                {mostrarMensajeA && (
                                    <MessageBoxApple
                                        message="Para importar el horario a iOS Calendar debes importarlo a Google Calendar primero y sincronizar tus cuentas."
                                        onCancel={() =>
                                            setMostrarMensajeA(false)
                                        }
                                    />
                                )}
                            </div>
                            <Calendario
                                e={eventosFormateados}
                                startHour={dayjs(
                                    "2024-02-17T08:00:00"
                                ).toDate()}
                                endHour={dayjs("2024-02-17T20:00:00").toDate()}
                            />
                        </div>
                    </div>
                )}
            </AuthContext.Provider>
        </div>
    );
}

export default CalendarioGlobal;
