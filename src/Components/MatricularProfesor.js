import React, { useState } from "react";
import "../estilos/MatricularProfesor.css";
import axios from "axios";

function MatricularProfesor({
    asignaturas,
    grupos,
    gruposSeleccionadosProp,
    idUsuario,
    onCerrarMatricularProfesor,
}) {
    const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
    const [gruposSeleccionados, setGruposSeleccionados] = useState(
        gruposSeleccionadosProp
    );

    const [mensajeMatriculas, setMensajeMatriculas] = useState("");
    const [mostrarMensajeGrupos, setMostrarMensajeGrupos] = useState(false);

    const mostrarGrupos = (asignatura) => {
        // Actualizar el estado de la asignatura seleccionada
        if (asignatura === asignaturaSeleccionada) {
            setAsignaturaSeleccionada(null); // Si ya está seleccionada, deseleccionarla
        } else {
            setAsignaturaSeleccionada(asignatura); // Si no está seleccionada, seleccionarla
        }
    };

    const seleccionarGrupo = (grupo) => {
        // Verificar si el grupo ya está seleccionado
        if (!gruposSeleccionados.some((g) => g.nombre === grupo.nombre)) {
            setGruposSeleccionados([...gruposSeleccionados, grupo]);
        }
    };

    const gruposAsignaturaSeleccionada = asignaturaSeleccionada
        ? grupos.filter(
              (grupo) => grupo.AsignaturaId === asignaturaSeleccionada.id
          )
        : [];

    const eliminarGrupoSeleccionado = (grupo) => {
        const nuevosGrupos = gruposSeleccionados.filter(
            (g) => g.id !== grupo.id
        );
        setGruposSeleccionados(nuevosGrupos);
    };

    const BorrarMatriculas = async () => {
        try {
            const response = await axios.delete(
                `http://localhost:5001/matriculas/eliminarMatriculasUsuario/${idUsuario}`
            );
            console.log("Matrículas eliminadas correctamente:", response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error("Error: No hay eventos para borrar");
            } else {
                console.error("Error al eliminar matrículas:", error);
            }
        }
    };

    const añadirMatrículas = async () => {
        // Primero borramos las matrículas existentes del usuario
        await BorrarMatriculas();
        const matriculas = gruposSeleccionados.map((grupo) => ({
            estado: "Pendiente",
            ver: true,
            UsuarioId: idUsuario,
            AsignaturaId: grupo.AsignaturaId,
            GrupoId: grupo.id,
        }));
        await AgregarMatriculas(matriculas);
    };

    const AgregarMatriculas = async (Matriculas) => {
        console.log("Nuevas matrículas antes de su agregación: ", Matriculas);
        try {
            let matriculasC = 0;
            // Dividir las matrículas en lotes
            const tamañoLote = 100;
            const respuestas = []; // Array para almacenar todas las respuestas
            for (let i = 0; i < Matriculas.length; i += tamañoLote) {
                const lote = Matriculas.slice(i, i + tamañoLote);
                const response = await axios.post(
                    "http://localhost:5001/matriculas/addLoteMatriculas",
                    lote
                );
                console.log(
                    `Lote ${
                        i / tamañoLote + 1
                    } de matrículas enviado correctamente:`,
                    response.data
                );
                matriculasC =
                    matriculasC + response.data.numeroMatriculasCreadas;
                respuestas.push(response.data);
            }
            if (matriculasC === 0) {
                setMensajeMatriculas("Ahora no tienes grupos asociados.");
                // Manejamos desde el frontend el borrado de los eventos asociados previamente
                try {
                    await axios.delete(
                        `http://localhost:5001/eventos/deleteByUsuario/${idUsuario}`
                    );
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        console.error("Error: No hay eventos para borrar");
                        setMensajeMatriculas(
                            "Ahora tienes " + matriculasC + " grupos asociados."
                        );
                        setMostrarMensajeGrupos(true);
                    } else {
                        console.error("Error al agregar matrículas:", error);
                        setMensajeMatriculas("Error al agregar matrículas.");
                        setMostrarMensajeGrupos(true);
                    }
                }
            } else {
                setMensajeMatriculas(
                    "Ahora tienes " + matriculasC + " grupos asociados."
                );
            }
            setMostrarMensajeGrupos(true);
            // Actualizar los grupos seleccionados en el padre
        } catch (error) {
            console.error("Error al agregar matrículas:", error);
            setMensajeMatriculas("Error al agregar matrículas.");
            setMostrarMensajeGrupos(true);
        }
    };

    const handleCerrarMensajeGrupos = () => {
        // Ejecutar la función para cerrar MatricularProfesor
        if (typeof onCerrarMatricularProfesor === "function") {
            onCerrarMatricularProfesor();
        }
        setMostrarMensajeGrupos(false);
    };

    return (
        <div className="containerMatricularProfesor">
            <div className="AsignaturasP">
                <h1>Asignaturas</h1>
                <ul>
                    {asignaturas.map((asignatura, index) => (
                        <li
                            key={index}
                            className={`asignatura ${
                                asignatura === asignaturaSeleccionada
                                    ? "seleccionada"
                                    : ""
                            }`}
                            onClick={() => mostrarGrupos(asignatura)}
                        >
                            {asignatura.nombreReal}{" "}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="GruposDP">
                <h1>Grupos</h1>
                <ul>
                    {gruposAsignaturaSeleccionada.map((grupo, index) => (
                        <li key={index} onClick={() => seleccionarGrupo(grupo)}>
                            {grupo.nombre}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="GruposSele">
                <div className="GruposSP">
                    <h1>Grupos Seleccionados</h1>
                    <ul>
                        {gruposSeleccionados.map((grupo, index) => (
                            <li
                                key={index}
                                onClick={() => eliminarGrupoSeleccionado(grupo)}
                            >
                                {grupo.nombre}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="BotonGuardar">
                    <button onClick={añadirMatrículas}>Guardar</button>
                </div>
                {mostrarMensajeGrupos && (
                    <div className="mensaje-dialogo-grupos">
                        <div className="mensaje-dialogo-contenido-grupos">
                            <p>{mensajeMatriculas}</p>
                            <button onClick={handleCerrarMensajeGrupos}>
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MatricularProfesor;
