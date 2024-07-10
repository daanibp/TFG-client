import React, { useState } from "react";
import "../estilos/VerSolicitudes.css";
import axios from "axios";

function VerSolicitudes({
    idUsuario,
    // eventosClases,
    // eventosExamenes,
    eventosArg,
    eventosCompartidos,
    usuariosArg,
    onCerrarVerSolicitudes,
}) {
    const [filtroEstado, setFiltroEstado] = useState("Todos");

    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [usuarioCompartido, setUsuarioCompartido] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [mostrarMensaje, setMostrarMensaje] = useState(false);

    const [eventosCompartidosActualizados, setEventosCompartidosActualizados] =
        useState(eventosCompartidos);

    // Función para filtrar las solicitudes por estado
    const filtrarSolicitudes = (estado) => {
        setFiltroEstado(estado);
    };

    const getButtonStyle = (estado) => {
        return filtroEstado === estado ? "button-active" : "";
    };

    const showEventDetails = async (eventoId) => {
        const response = await axios.get(
            `http://localhost:5001/eventos/evento/${eventoId}`
        );
        setSelectedSolicitud(response.data);

        const response2 = await axios.get(
            `http://localhost:5001/usuarios/${response.data.UsuarioId}`
        );
        setUsuarioCompartido(response2.data.uo);
    };

    const closeEventDetails = () => {
        setSelectedSolicitud(null);
    };

    const eventosMap = eventosArg.reduce((acc, evento) => {
        acc[evento.id] = evento;
        return acc;
    }, {});

    const usuariosMap = usuariosArg.reduce((acc, usuario) => {
        acc[usuario.id] = usuario;
        return acc;
    }, {});

    const solicitudesFiltradas =
        filtroEstado === "Todos"
            ? eventosCompartidosActualizados
            : eventosCompartidosActualizados.filter(
                  (evento) => evento.estado === filtroEstado
              );

    const aceptarSolicitud = async (eventoCompartidoId, eventoId) => {
        try {
            const response = await axios.post(
                `http://localhost:5001/eventosCompartidos/aceptarEventoCompartido/${eventoCompartidoId}/${idUsuario}`,
                {
                    eventoId: eventoId,
                }
            );
            //window.location.reload();
            console.log(response.data);
            //alert("Solicitud aceptada exitosamente");
            setMensaje(
                "Evento compartido aceptado. Ya puedes ver este evento en tu calendario escolar."
            );
            setMostrarMensaje(true);
            // Actualizar eventos compartidos
            fetchEventosCompartidos();
        } catch (error) {
            console.error("Error al aceptar la solicitud:", error);

            let mensajeError =
                "Ha surgido un error al aceptar la solicitud. Inténtelo de nuevo más tarde.";

            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 404:
                        mensajeError = "Evento compartido no encontrado.";
                        break;
                    case 400:
                        mensajeError =
                            "El evento compartido ya ha sido aceptado.";
                        break;
                    default:
                        mensajeError =
                            "Ha surgido un error al aceptar la solicitud. Inténtelo de nuevo más tarde.";
                        break;
                }
            }

            setMensaje(mensajeError);
            setMostrarMensaje(true);
        }
    };

    const denegarSolicitud = async (eventoId) => {
        try {
            // Realizar la solicitud PUT al backend para denegar la solicitud
            const response = await axios.put(
                `http://localhost:5001/eventosCompartidos/denegarSolicitud/${eventoId}`
            );
            //window.location.reload();
            // Si la solicitud se completa exitosamente, verificar si se eliminó el evento
            if (response.status === 200) {
                const mensajeExito = response.data.eventoEliminado
                    ? "Evento compartido denegado y evento eliminado exitosamente."
                    : "Evento compartido denegado exitosamente.";
                // Mostrar mensaje de éxito
                setMensaje(mensajeExito);
                setMostrarMensaje(true);
                // Actualizar eventos compartidos
                fetchEventosCompartidos();
            }

            // Imprimir la respuesta del servidor en la consola
            console.log(response.data);
        } catch (error) {
            console.error("Error al denegar la solicitud:", error);

            let mensajeError =
                "Ha surgido un error al denegar la solicitud. Inténtelo de nuevo más tarde.";

            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 404:
                        mensajeError = "Evento compartido no encontrado.";
                        break;
                    case 400:
                        mensajeError =
                            "El evento compartido ya ha sido denegado.";
                        break;
                    default:
                        mensajeError =
                            "Ha surgido un error al denegar la solicitud. Inténtelo de nuevo más tarde.";
                        break;
                }
            }

            setMensaje(mensajeError);
            setMostrarMensaje(true);
        }
    };

    const fetchEventosCompartidos = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5001/eventoscompartidos/getEventosCompartidos/toUsuario/${idUsuario}`
            );
            setEventosCompartidosActualizados(response.data);
        } catch (error) {
            console.error("Error al obtener eventos compartidos:", error);
            setMensaje(
                "Ha ocurrido un error al obtener los eventos compartidos. Inténtelo de nuevo más tarde."
            );
            setMostrarMensaje(true);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";

        const parts = timeString.split(":");

        if (parts.length !== 3) return "";

        const hours = parseInt(parts[0], 10).toString();
        const minutes = parts[1];

        return `${hours}:${minutes}`;
    };

    const handleCerrarMensaje = () => {
        if (typeof onCerrarVerSolicitudes === "function") {
            onCerrarVerSolicitudes();
        }
        setMostrarMensaje(false);
    };

    return (
        <div className="containerVerSolicitudes">
            <h1>Eventos Compartidos Para Ti</h1>
            <div className="GestionarSolicitudes">
                Gestionar solicitudes
                <div>
                    <button
                        className={getButtonStyle("Todos")}
                        onClick={() => filtrarSolicitudes("Todos")}
                    >
                        Todas
                    </button>
                    <button
                        className={getButtonStyle("Pendiente")}
                        onClick={() => filtrarSolicitudes("Pendiente")}
                    >
                        Pendientes
                    </button>
                    <button
                        className={getButtonStyle("Aceptada")}
                        onClick={() => filtrarSolicitudes("Aceptada")}
                    >
                        Aceptadas
                    </button>

                    <button
                        className={getButtonStyle("Denegada")}
                        onClick={() => filtrarSolicitudes("Denegada")}
                    >
                        Denegadas
                    </button>
                </div>
            </div>
            <div className="boxSolicitudesEventos">
                <table>
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Tipo</th>
                            <th>Usuario</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="5">No hay eventos para mostrar</td>
                            </tr>
                        ) : (
                            solicitudesFiltradas.map((eventoCompartido) => {
                                const evento =
                                    eventosMap[eventoCompartido.EventoId];

                                const usuario =
                                    usuariosMap[
                                        eventoCompartido.UsuarioCreadorId
                                    ];

                                return (
                                    <tr key={eventoCompartido.id}>
                                        <td>
                                            {evento?.description?.length > 20
                                                ? `${evento.description.substring(
                                                      0,
                                                      20
                                                  )}...`
                                                : evento?.description}
                                            <button
                                                className="botonDetalles"
                                                onClick={() =>
                                                    showEventDetails(
                                                        eventoCompartido.EventoId
                                                    )
                                                }
                                            >
                                                Ver más detalles
                                            </button>
                                        </td>
                                        <td>
                                            {evento?.examen
                                                ? "Examen"
                                                : "Clase"}
                                        </td>
                                        <td>{usuario?.uo}</td>
                                        <td>{eventoCompartido.estado}</td>
                                        <td>
                                            <button
                                                className="botonAceptar"
                                                onClick={() =>
                                                    aceptarSolicitud(
                                                        eventoCompartido.id,
                                                        eventoCompartido.EventoId
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                            <button
                                                className="botonDenegar"
                                                onClick={() =>
                                                    denegarSolicitud(
                                                        eventoCompartido.id
                                                    )
                                                }
                                            >
                                                -
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {mostrarMensaje && (
                <div className="mensaje-dialogo-grupos">
                    <div className="mensaje-dialogo-contenido-grupos">
                        <p>{mensaje}</p>
                        <button onClick={handleCerrarMensaje}>OK</button>
                    </div>
                </div>
            )}
            {selectedSolicitud && (
                <div className="solicitudDetails">
                    <h2>Detalles del evento</h2>
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
                        {formatTime(selectedSolicitud.finalización)}
                    </p>
                    <p>Descripción: {selectedSolicitud.description}</p>
                    <p>Compartido por: {usuarioCompartido}</p>
                    <button onClick={closeEventDetails}>Cerrar</button>
                </div>
            )}
        </div>
    );
}

export default VerSolicitudes;
