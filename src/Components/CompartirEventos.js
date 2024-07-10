import React, { useState } from "react";
import "../estilos/CompartirEventos.css";
import axios from "axios";

function CompartirEventos({
    idUsuario,
    eventosClases,
    eventosExamenes,
    gruposSeleccionados,
    matriculas,
    usuariosArg,
    asignaturasSeleccionadas,
    profesor,
    onCerrarCompartirEventos,
}) {
    const [tipoEvento, setTipoEvento] = useState("Clase");
    const [tipoFiltroAsignaturas, setTipoFiltroAsignatura] = useState("Todas");
    const [filtroAsignatura, setFiltroAsignatura] = useState([]);
    const [tipoFiltroGrupos, setTipoFiltroGrupos] = useState("Todos");
    //const [filtroGrupos, setFiltroGrupos] = useState([]);

    const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
    const [eventosSeleccionados, setEventosSeleccionados] = useState([]);
    const [eventos, setEventos] = useState(
        tipoEvento === "Clase" ? eventosClases : eventosExamenes
    );
    const [usuarios, setUsuarios] = useState(usuariosArg);

    const [mensajeEventos, setMensajeEventos] = useState("");
    const [mostrarMensajeEventos, setMostrarMensajeEventos] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [searchTextUsuarioSeleccionado, setSearchTextUsuarioSeleccionado] =
        useState("");

    const { asignaturas } = asignaturasSeleccionadas;

    const { grupos } = gruposSeleccionados;

    const handleSearchTextChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleSearchTextUsuarioSeleccionadoChange = (event) => {
        setSearchTextUsuarioSeleccionado(event.target.value);
    };

    const usuariosFiltrados = usuarios.filter((usuario) => {
        if (!grupos || grupos.length === 0) {
            return false;
        }

        // Filtrar usuarios que no sean profesor ni admin
        if (usuario.profesor || usuario.admin) {
            return false;
        }

        // Filtrar usuarios por el texto de búsqueda
        if (!usuario.uo.toLowerCase().startsWith(searchText.toLowerCase())) {
            return false;
        }

        return true; // Mostrar usuario si pasa todos los filtros
    });

    const usuariosSeleccionadosFiltrados = usuariosSeleccionados
        // Filtrar usuarios que no sean profesor ni admin
        .filter((usuario) => {
            if (!grupos || grupos.length === 0) {
                return false;
            }
            return !usuario.profesor && !usuario.admin;
        })
        // Filtrar usuarios por el texto de búsqueda
        .filter((usuario) =>
            usuario.uo
                .toLowerCase()
                .startsWith(searchTextUsuarioSeleccionado.toLowerCase())
        );

    const eventosFiltrados = eventos.filter((evento) => {
        if (
            !asignaturasSeleccionadas ||
            !asignaturasSeleccionadas.asignaturas ||
            asignaturasSeleccionadas.asignaturas.length === 0
        ) {
            return false;
        }
        if (tipoFiltroAsignaturas === "Todas") {
            return (
                filtroAsignatura.length === 0 ||
                filtroAsignatura.includes(evento.asunto)
            );
        } else {
            return evento.asunto === tipoFiltroAsignaturas;
        }
    });

    const handleAsignaturaChange = (event) => {
        const selectedTipoFiltro = event.target.value;
        setTipoFiltroAsignatura(selectedTipoFiltro);
        if (selectedTipoFiltro === "Todas") {
            setFiltroAsignatura([]);
        } else {
            // Filtrar eventos según asignatura seleccionada
            const asignaturaSeleccionada =
                asignaturasSeleccionadas.asignaturas.find(
                    (asignatura) => asignatura.nombreReal === selectedTipoFiltro
                );
            if (asignaturaSeleccionada) {
                setFiltroAsignatura([asignaturaSeleccionada.nombreReal]);
            }
        }
    };

    const handleTipoEventoChange = (event) => {
        const selectedTipoEvento = event.target.value;
        setTipoEvento(selectedTipoEvento);

        if (selectedTipoEvento === "Clase") {
            setEventos(eventosClases);
        } else if (selectedTipoEvento === "Examen") {
            setEventos(eventosExamenes);
        } else if (selectedTipoEvento === "Creados por mi") {
            setEventos(
                [...eventosClases, ...eventosExamenes].filter(
                    (evento) => evento.creadoPorMi
                )
            );
        }
    };

    const handleUsuarioSeleccionado = (usuario) => {
        setUsuariosSeleccionados((prevUsuariosSeleccionados) =>
            prevUsuariosSeleccionados.some((u) => u.id === usuario.id)
                ? prevUsuariosSeleccionados.filter((u) => u.id !== usuario.id)
                : [...prevUsuariosSeleccionados, usuario]
        );
        setUsuarios((prevUsuarios) =>
            prevUsuarios.filter((u) => u !== usuario)
        );
    };

    const handleUsuarioDeseleccionado = (usuario) => {
        // Mover usuario de usuariosSeleccionados a usuarios
        setUsuarios((prevUsuarios) => [...prevUsuarios, usuario]);
        setUsuariosSeleccionados((prevUsuariosSeleccionados) =>
            prevUsuariosSeleccionados.filter((u) => u.id !== usuario.id)
        );
    };

    const handleEventoSeleccionado = (evento) => {
        // Mover evento de eventos a eventosSeleccionados
        setEventosSeleccionados((prevEventosSeleccionados) => [
            ...prevEventosSeleccionados,
            evento,
        ]);
        setEventos((prevEventos) => prevEventos.filter((e) => e !== evento));
    };

    const handleEventoDeseleccionado = (evento) => {
        // Mover evento de eventosSeleccionados a eventos
        setEventos((prevEventos) => [...prevEventos, evento]);
        setEventosSeleccionados((prevEventosSeleccionados) =>
            prevEventosSeleccionados.filter((e) => e !== evento)
        );
    };

    const handleGrupoChange = (event) => {
        const selectedTipoFiltro = event.target.value;
        setTipoFiltroGrupos(selectedTipoFiltro);

        if (selectedTipoFiltro === "Todos") {
            // Mostrar todos los usuarios no seleccionados
            const usuariosNoSeleccionados = usuariosArg.filter(
                (usuario) =>
                    !usuariosSeleccionados.some((u) => u.id === usuario.id)
            );
            setUsuarios(usuariosNoSeleccionados);
            //setFiltroGrupos([]); // Limpiar filtro de grupos
        } else {
            // Filtrar usuarios según el grupo seleccionado
            const grupoSeleccionado = gruposSeleccionados.grupos.find(
                (grupo) => grupo.nombre === selectedTipoFiltro
            );

            if (grupoSeleccionado) {
                // Filtrar usuarios por grupo seleccionado y matrículas
                const usuariosFiltrados = usuariosArg.filter((usuario) =>
                    matriculas.some(
                        (matricula) =>
                            matricula.GrupoId === grupoSeleccionado.id &&
                            matricula.UsuarioId === usuario.id
                    )
                );

                // Mostrar solo usuarios no seleccionados dentro del filtro
                const usuariosNoSeleccionados = usuariosFiltrados.filter(
                    (usuario) =>
                        !usuariosSeleccionados.some((u) => u.id === usuario.id)
                );

                setUsuarios(usuariosNoSeleccionados);
                //setFiltroGrupos([selectedTipoFiltro]); // Establecer filtro de grupo seleccionado
            } else {
                // Limpiar usuarios si no se encuentra el grupo seleccionado
                setUsuarios([]);
                //setFiltroGrupos([]);
            }
        }
    };

    function parseFecha(fechaStr) {
        const [datePart] = fechaStr.split("T");
        const [year, month, day] = datePart.split("-").map(Number);

        return `${day}/${month}/${year}`;
    }

    const crearEventos = async () => {
        try {
            let eventosC = 0;
            // Dividir las matrículas en lotes
            const tamañoLote = 100;
            const respuestas = []; // Array para almacenar todas las respuestas

            // Crear una copia de los eventos sin el id
            const eventosCompartidos = eventosSeleccionados.flatMap((evento) =>
                usuariosSeleccionados.map((usuario) => {
                    const { id, ...eventoSinId } = evento;
                    return {
                        ...eventoSinId,
                        UsuarioId: usuario.id,
                    };
                })
            );

            console.log("Eventos compartidos: ", eventosCompartidos);

            for (let i = 0; i < eventosCompartidos.length; i += tamañoLote) {
                const lote = eventosCompartidos.slice(i, i + tamañoLote);
                const response = await axios.post(
                    "http://localhost:5001/eventos/addLoteEventos",
                    lote
                );
                console.log(
                    `Lote ${
                        i / tamañoLote + 1
                    } de eventos enviado correctamente:`,
                    response.data
                );
                eventosC += response.data.nEventosAgregados;
                respuestas.push(response.data);
            }

            if (eventosC === 0) {
                setMensajeEventos(
                    "Todos los eventos ya habían sido compartidos previamente."
                );
                setMostrarMensajeEventos(true);
            } else {
                setMensajeEventos(
                    `Se han compartido ${eventosC} eventos. ${
                        eventosCompartidos.length - eventosC
                    } eventos ya habían sido compartidos previamente.`
                );
                setMostrarMensajeEventos(true);
            }
        } catch (error) {
            console.error(
                "Error al crear los eventos para los alumnos:",
                error
            );
            setMensajeEventos("Error al crear los eventos para los alumnos.");
            setMostrarMensajeEventos(true);
        }
    };

    const compartirEventos = async () => {
        console.log("Eventos Seleccionados: ", eventosSeleccionados);
        console.log("Usuarios Seleccionados: ", usuariosSeleccionados);
        if (eventosSeleccionados.length === 0) {
            setMensajeEventos(
                "No hay ningún evento seleccionado para compartir."
            );
            setMostrarMensajeEventos(true);
        } else if (usuariosSeleccionados.length === 0) {
            setMensajeEventos(
                "No hay ningún usuario seleccionado al que compartir."
            );
            setMostrarMensajeEventos(true);
        } else {
            try {
                // Si es un profesor creamos los eventos directamente
                if (profesor) {
                    await crearEventos();
                } else {
                    let eventosC = 0;
                    // Dividir las matrículas en lotes
                    const tamañoLote = 100;
                    const respuestas = []; // Array para almacenar todas las respuestas
                    const eventosCompartidos = eventosSeleccionados.flatMap(
                        (evento) =>
                            usuariosSeleccionados.map((usuario) => ({
                                estado: "Pendiente",
                                UsuarioId: usuario.id,
                                EventoId: evento.id,
                                UsuarioCreadorId: idUsuario,
                            }))
                    );
                    console.log("Eventos compartidos: ", eventosCompartidos);
                    for (
                        let i = 0;
                        i < eventosCompartidos.length;
                        i += tamañoLote
                    ) {
                        const lote = eventosCompartidos.slice(
                            i,
                            i + tamañoLote
                        );
                        const response = await axios.post(
                            "http://localhost:5001/eventoscompartidos/addEventosCompartidos",
                            lote
                        );
                        console.log(
                            `Lote ${
                                i / tamañoLote + 1
                            } de matrículas enviado correctamente:`,
                            response.data
                        );
                        eventosC =
                            eventosC + response.data.eventosCreados.length;
                        respuestas.push(response.data);
                    }
                    if (eventosC === 0) {
                        setMensajeEventos(
                            "Todos los eventos ya habían sido compartidos previamente."
                        );
                        setMostrarMensajeEventos(true);
                    } else {
                        setMensajeEventos(
                            `Se han compartido ${eventosC} eventos. ${
                                eventosCompartidos.length - eventosC
                            } eventos ya habían sido compartidos previamente.`
                        );
                        setMostrarMensajeEventos(true);
                    }
                }
            } catch (error) {
                console.error("Error al compartir eventos:", error);
                setMensajeEventos("Error al compartir eventos.");
                setMostrarMensajeEventos(true);
            }
        }
    };

    const handleCerrarMensajeEventos = () => {
        if (
            mensajeEventos ===
                "No hay ningún evento seleccionado para compartir." ||
            mensajeEventos ===
                "No hay ningún usuario seleccionado al que compartir."
        ) {
        } else {
            if (typeof onCerrarCompartirEventos === "function") {
                onCerrarCompartirEventos();
            }
        }
        setMostrarMensajeEventos(false);
    };

    const seleccionarAllUsers = () => {
        setUsuariosSeleccionados((prevUsuariosSeleccionados) => [
            ...prevUsuariosSeleccionados,
            ...usuarios.filter(
                (usuario) =>
                    !prevUsuariosSeleccionados.some(
                        (u) => u.id === usuario.id
                    ) &&
                    !usuario.admin &&
                    !usuario.profesor
            ),
        ]);
        setUsuarios([]);
    };

    return (
        <div className="containerCompartirEventos">
            <div className="EventosC">
                <h1>Eventos</h1>
                <label htmlFor="tipoEvento">Filtrar por Tipo de Evento:</label>
                <select id="tipoEvento" onChange={handleTipoEventoChange}>
                    <option value="Clase">Clase</option>
                    <option value="Examen">Examen</option>
                    <option value="Creados por mi">Creados por mi</option>
                </select>
                <label htmlFor="filtroAsignatura">
                    Filtrar por Asignatura:
                </label>
                <select
                    id="filtroAsignatura"
                    onChange={handleAsignaturaChange}
                    value={tipoFiltroAsignaturas}
                >
                    {asignaturasSeleccionadas &&
                    asignaturas &&
                    asignaturas.length > 0 ? (
                        <>
                            <option value="Todas">Todas</option>
                            {asignaturas.map((asignatura) => (
                                <option
                                    key={asignatura.id}
                                    value={asignatura.nombreReal}
                                >
                                    {asignatura.nombreReal}
                                </option>
                            ))}
                        </>
                    ) : (
                        <option value="" disabled>
                            No hay asignaturas disponibles
                        </option>
                    )}
                </select>
                {!eventosFiltrados || eventosFiltrados.length === 0 ? (
                    <p>No hay ningún evento para mostrar</p>
                ) : (
                    <ul>
                        {eventosFiltrados.map((evento) => (
                            <li
                                key={evento.id}
                                onClick={() => handleEventoSeleccionado(evento)}
                            >
                                {evento.description} <br />
                                {`(${parseFecha(evento.fechaDeComienzo)} - ${
                                    evento.comienzo
                                })`}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="EventosS">
                <h1>Eventos Seleccionados</h1>
                {eventosSeleccionados && eventosSeleccionados.length !== 0 ? (
                    <ul>
                        {eventosSeleccionados.map((evento) => (
                            <li
                                key={evento.id}
                                onClick={() =>
                                    handleEventoDeseleccionado(evento)
                                }
                            >
                                {evento.description} <br />
                                {`(${parseFecha(evento.fechaDeComienzo)} - ${
                                    evento.comienzo
                                })`}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay eventos seleccionados.</p>
                )}
            </div>
            <div className="UsuariosC">
                <h1>Usuarios</h1>
                <label htmlFor="filtroGrupos">Filtrar por Grupo:</label>
                <select
                    id="filtroGrupos"
                    onChange={handleGrupoChange}
                    value={tipoFiltroGrupos}
                >
                    {gruposSeleccionados && grupos && grupos.length > 0 ? (
                        <>
                            <option value="Todos">Todos</option>
                            {gruposSeleccionados.grupos.map((grupo) => (
                                <option key={grupo.id} value={grupo.nombre}>
                                    {grupo.nombre}
                                </option>
                            ))}
                        </>
                    ) : (
                        <option value="" disabled>
                            No hay grupos disponibles
                        </option>
                    )}
                </select>
                <label htmlFor="searchText">Buscar Usuarios:</label>
                <input
                    type="text"
                    id="searchText"
                    value={searchText}
                    onChange={handleSearchTextChange}
                    placeholder="UO..."
                />

                {!gruposSeleccionados.grupos ||
                gruposSeleccionados.grupos.length === 0 ||
                (usuariosFiltrados.length === 0 && !searchText) ? (
                    <p>No hay ningún usuario para seleccionar</p>
                ) : (
                    <div>
                        {usuariosFiltrados.length === 0 && searchText ? (
                            <p>
                                No se encontraron usuarios que coincidan con la
                                búsqueda
                            </p>
                        ) : (
                            <ul>
                                {usuariosFiltrados.map((usuario) => (
                                    <li
                                        key={usuario.id}
                                        onClick={() =>
                                            handleUsuarioSeleccionado(usuario)
                                        }
                                    >
                                        {usuario.uo}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {usuariosFiltrados.length !== 0 && (
                            <button onClick={seleccionarAllUsers}>
                                Seleccionar Todos
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="UsuariosSele">
                <div className="UsuariosS">
                    <h1>Usuarios Seleccionados</h1>
                    <label htmlFor="searchUsuario">Buscar Usuario:</label>
                    <input
                        type="text"
                        id="searchUsuario"
                        value={searchTextUsuarioSeleccionado}
                        onChange={handleSearchTextUsuarioSeleccionadoChange}
                        placeholder="UO..."
                    />
                    {usuariosSeleccionados.length === 0 ? (
                        <p>No hay usuarios seleccionados</p>
                    ) : (
                        <div>
                            {usuariosSeleccionadosFiltrados.length === 0 ? (
                                <p>
                                    No se encontraron usuarios seleccionados que
                                    coincidan con la búsqueda
                                </p>
                            ) : (
                                <ul>
                                    {usuariosSeleccionadosFiltrados.map(
                                        (usuario) => (
                                            <li
                                                key={usuario.id}
                                                onClick={() =>
                                                    handleUsuarioDeseleccionado(
                                                        usuario
                                                    )
                                                }
                                            >
                                                {usuario.uo}
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
                <div className="btnCompartir">
                    <button onClick={compartirEventos}>Compartir</button>
                </div>
                {mostrarMensajeEventos && (
                    <div className="mensaje-dialogo-grupos">
                        <div className="mensaje-dialogo-contenido-grupos">
                            <p>{mensajeEventos}</p>
                            <button onClick={handleCerrarMensajeEventos}>
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompartirEventos;
