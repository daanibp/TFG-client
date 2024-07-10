import React, { useState } from "react";
import axios from "axios";
import "../estilos/EliminarEvento.css";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { MdDelete } from "react-icons/md";
import { TiTickOutline } from "react-icons/ti";

function EliminarEvento({
    tipo,
    eventosFormateados,
    gruposSeleccionados,
    onEliminarEvento,
    onRecuperarEvento,
    idUsuario,
}) {
    const [creadosPorMi, setCreadosPorMi] = useState(false);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState("Todos");

    const { grupos } = gruposSeleccionados;

    const [eventosEliminados, setEventosEliminados] = useState([]);

    const [mostrarEliminados, setMostraEliminados] = useState(false);

    console.log("Eventos Formateados: ", eventosFormateados);
    console.log("Eventos Eliminados: ", eventosEliminados);

    const handleEliminarEvento = async (eventoId) => {
        try {
            await axios.delete(
                `http://localhost:5001/eventos/delete/${eventoId}`
            );
            onEliminarEvento(eventoId, tipo);
            await handleRecuperarEventosEliminados();
        } catch (error) {
            console.error("Error al eliminar el evento:", error.message);
        }
    };

    const handleEliminarTodos = async () => {
        try {
            // Obtener los IDs de todos los eventos filtrados
            const idsEventosEliminar = filteredEventos.map(
                (evento) => evento.id
            );

            // Llamar a la API para eliminar todos los eventos
            await axios.delete(
                "http://localhost:5001/eventos/deleteMultipleByUser",
                {
                    data: { ids: idsEventosEliminar },
                }
            );

            // Llamar a eliminarEvento con cada evento eliminado
            idsEventosEliminar.forEach((eventoId) => {
                onEliminarEvento(eventoId, tipo);
            });

            // Actualizar el estado o realizar alguna acción después de eliminar los eventos
            console.log("Eventos eliminados correctamente");

            await handleRecuperarEventosEliminados();
        } catch (error) {
            console.error(
                "Error al eliminar todos los eventos:",
                error.message
            );
        }
    };

    const handleRecuperarEventosEliminados = async () => {
        try {
            // Obtener los IDs de todos los eventos filtrados
            const idsEventosRecuperar = eventosEliminados.map(
                (evento) => evento.id
            );

            const response = await axios.get(
                `http://localhost:5001/eventos/eliminadosPorUsuario/${idUsuario}`
            );

            // Actualizar el estado con los eventos recuperados
            setEventosEliminados(response.data.eventos);

            // Llamar a eliminarEvento con cada evento eliminado
            idsEventosRecuperar.forEach((eventoId) => {
                onRecuperarEvento(eventoId, tipo);
            });
        } catch (error) {
            console.error(
                "Error al recuperar los eventos eliminados:",
                error.message
            );
        }
    };

    const recuperarEventoEliminado = async (eventoId) => {
        try {
            // Llamar a la ruta PUT para marcar el evento como no eliminado
            await axios.put(
                `http://localhost:5001/eventos/recuperar/${eventoId}`
            );

            // Filtrar los eventos eliminados actualizados en el estado
            setEventosEliminados((prevEventosEliminados) =>
                prevEventosEliminados.filter((evento) => evento.id !== eventoId)
            );

            // Encontrar el evento recuperado de eventosEliminados
            const eventoRecuperado = eventosEliminados.find(
                (evento) => evento.id === eventoId
            );

            // Formatear el evento recuperado para añadirlo a eventosFormateados
            const eventoFormateado = {
                id: eventoRecuperado.id,
                title: eventoRecuperado.asunto,
                descripcion: eventoRecuperado.description,
                start: new Date(eventoRecuperado.fechaDeComienzo),
                end: new Date(eventoRecuperado.fechaDeFinalización),
                creadoPorMi: eventoRecuperado.creadoPorMi,
            };

            // Actualizar eventosFormateados con el evento recuperado
            eventosFormateados.push(eventoFormateado);

            console.log("Evento recuperado correctamente");

            onRecuperarEvento(eventoId);
        } catch (error) {
            console.error(
                "Error al recuperar el evento eliminado:",
                error.message
            );
        }
    };

    const formatDate = (date) => {
        return dayjs(date).format("dddd, D [de] MMMM [de] YYYY [a las] HH:mm");
    };

    const handleCheckboxChange = () => {
        setCreadosPorMi(!creadosPorMi);
        if (!creadosPorMi) {
            setGrupoSeleccionado("Todos");
        }
    };

    const handleGrupoChange = (event) => {
        setGrupoSeleccionado(event.target.value);
    };

    const handleCheckboxEliminados = async () => {
        await handleRecuperarEventosEliminados();
        setMostraEliminados(!mostrarEliminados);
    };

    const normalizeString = (str) => {
        // Remover ceros iniciales de los números
        str = str.replace(/\b0+/g, "");

        // Reemplazar guiones bajos con guiones
        str = str.replace(/_/g, "-");

        // Remover todos los caracteres que no sean letras o números
        str = str.replace(/[^a-zA-Z0-9]/g, "");

        return str.toLowerCase();
    };

    const filteredEventos = creadosPorMi
        ? eventosFormateados.filter((evento) => evento.creadoPorMi)
        : eventosFormateados.filter((evento) => {
              const normalizedGrupo = normalizeString(grupoSeleccionado);
              const normalizedDescripcion = normalizeString(evento.descripcion);
              const startsWithGrupo =
                  grupoSeleccionado === "Todos" ||
                  normalizedDescripcion.startsWith(normalizedGrupo);
              console.log(
                  "Comparacion: ",
                  normalizedGrupo,
                  normalizedDescripcion
              );
              console.log(
                  `Evento Descripción: ${evento.descripcion}, Grupo Seleccionado: ${grupoSeleccionado}, StartsWith: ${startsWithGrupo}`
              );
              return startsWithGrupo;
          });

    return (
        <div className="containerEliminarEvento">
            <div className="TituloEliminarEvento">
                <h1>Eliminar Eventos</h1>
            </div>
            <div className="FiltroEventos">
                <label>
                    Mostrar solo eventos creados por mí
                    <input
                        type="checkbox"
                        checked={creadosPorMi}
                        onChange={handleCheckboxChange}
                    />
                </label>
            </div>
            {tipo === "Examenes" || creadosPorMi ? null : (
                <div className="FiltroGrupos">
                    <label>
                        Filtrar por grupo:
                        <select
                            value={grupoSeleccionado}
                            onChange={handleGrupoChange}
                        >
                            <option value="Todos">Todos</option>
                            {grupos.map((grupo) => (
                                <option key={grupo.id} value={grupo.nombre}>
                                    {grupo.nombre}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            )}
            {tipo === "Examenes" || tipo === "Clases" ? (
                <div className="ContainerEventos">
                    <h2>{tipo === "Examenes" ? "Exámenes:" : "Clases:"}</h2>
                    {filteredEventos.length !== 0 ? (
                        <div className="btnBorrarTodos">
                            <button onClick={handleEliminarTodos}>
                                Eliminar Todos
                            </button>
                        </div>
                    ) : null}
                    <br />
                    <div className="SitioEventos">
                        {filteredEventos.length > 0 ? (
                            filteredEventos.map((evento) => (
                                <div key={evento.id}>
                                    <label>{evento.title}</label>
                                    <p>{evento.descripcion}</p>
                                    <p>
                                        Fecha de inicio:{" "}
                                        {formatDate(evento.start)}
                                    </p>
                                    <p>
                                        Fecha de fin: {formatDate(evento.end)}
                                    </p>

                                    <button
                                        onClick={() =>
                                            handleEliminarEvento(evento.id)
                                        }
                                    >
                                        <MdDelete />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No hay eventos de este tipo</p>
                        )}
                    </div>
                </div>
            ) : null}
            <div className="btnRecuperarEventosEliminados">
                <h2>Recuperar Eventos Eliminados</h2>
                <label>
                    Mostrar eventos eliminados
                    <input
                        type="checkbox"
                        checked={mostrarEliminados}
                        onChange={handleCheckboxEliminados}
                    />
                </label>
            </div>

            {mostrarEliminados && (
                <div className="SitioEventos">
                    <h3>Eventos Eliminados</h3>
                    {eventosEliminados.map((evento) => (
                        <div key={evento.id}>
                            <label>{evento.asunto}</label>
                            <p>{evento.description}</p>
                            <p>Fecha de inicio: {formatDate(evento.start)}</p>
                            <p>Fecha de fin: {formatDate(evento.end)}</p>

                            <button
                                onClick={() =>
                                    recuperarEventoEliminado(evento.id)
                                }
                            >
                                <TiTickOutline />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EliminarEvento;
