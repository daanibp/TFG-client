import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import Sidebar from "../Components/Sidebar";
import "../estilos/GestionCalendarios.css";
import shuffle from "lodash/shuffle";

function RealizarMatricula() {
    const { authState } = useContext(AuthContext);

    const [asignaturas, setAsignaturas] = useState([]);
    const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState(
        []
    );
    const [matriculadas, setMatriculadas] = useState([]);
    const [grupos, setGrupos] = useState([]);

    const [mensajeError, setMensajeError] = useState(false);
    const [confirmacion, setConfirmacion] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:5001/asignaturas`).then((response) => {
            console.log("Asignaturas: ", response.data);
            setAsignaturas(response.data);
            // Verificar si cada asignatura seleccionada está matriculada
            Promise.all(
                response.data.map((asignatura) =>
                    axios
                        .get(
                            `http://localhost:5001/matriculas/checkMatriculada`,
                            {
                                params: {
                                    UsuarioId: authState.id,
                                    AsignaturaId: asignatura.id,
                                },
                            }
                        )
                        .then((response) => {
                            if (response.data.matriculada) {
                                setMatriculadas((prevMatriculadas) => [
                                    ...prevMatriculadas,
                                    asignatura,
                                ]);
                            }
                        })
                        .catch((error) => {
                            console.error(
                                `Error al verificar matriculación de la asignatura ${asignatura.id}:`,
                                error
                            );
                        })
                )
            );
        });
        axios.get(`http://localhost:5001/grupos`).then((response) => {
            console.log("Grupos: ", response.data);
            setGrupos(response.data);
        });
    }, [authState.id]);

    const seleccionarAsignatura = (asignatura) => {
        setAsignaturas(asignaturas.filter((item) => item.id !== asignatura.id));
        setAsignaturasSeleccionadas([...asignaturasSeleccionadas, asignatura]);
        //window.location.reload();
    };

    const deseleccionarAsignatura = (asignatura) => {
        setAsignaturasSeleccionadas(
            asignaturasSeleccionadas.filter((item) => item.id !== asignatura.id)
        );
        setAsignaturas([...asignaturas, asignatura]);
        //window.location.reload();
    };

    const mostrarMensajeError = () => {
        setMensajeError(true);
    };

    const ocultarMensajeError = () => {
        setMensajeError(false);
    };

    const mostrarConfirmacion = () => {
        setConfirmacion(true);
    };

    const ocultarConfirmacion = () => {
        setConfirmacion(false);
    };

    // Llamada al backend para realizar la matrícula
    const realizarMatricula = () => {
        if (asignaturasSeleccionadas.length === 0) {
            window.alert("Seleccione alguna asignatura para su matriculación");
        } else {
            const combinaciones = [];
            asignaturasSeleccionadas.forEach((asignatura) => {
                const gruposAsignatura = grupos.filter(
                    (grupo) => grupo.AsignaturaId === asignatura.id
                );
                if (gruposAsignatura.length > 0) {
                    // FiltraR los grupos por tipo
                    const gruposPorTipo = {};
                    gruposAsignatura.forEach((grupo) => {
                        if (!gruposPorTipo[grupo.tipo]) {
                            gruposPorTipo[grupo.tipo] = [];
                        }
                        gruposPorTipo[grupo.tipo].push(grupo);
                    });
                    // SeleccionaR aleatoriamente un grupo de cada tipo
                    const gruposSeleccionados = Object.values(
                        gruposPorTipo
                    ).map((gruposTipo) => shuffle(gruposTipo)[0]);
                    gruposSeleccionados.forEach((grupo) => {
                        combinaciones.push({
                            asignaturaId: asignatura.id,
                            grupoId: grupo.id,
                        });
                    });
                } else {
                    console.error(
                        `No se encontró un grupo válido para la asignatura ${asignatura.id}`
                    );
                }
            });

            axios
                .post("http://localhost:5001/matriculas/addLoteMatriculas", {
                    estado: "Pendiente",
                    UsuarioId: authState.id,
                    matriculas: combinaciones,
                })
                .then((response) => {
                    // Actualizamos matriculadas []
                    setMatriculadas((prevMatriculadas) => [
                        ...prevMatriculadas,
                        ...asignaturasSeleccionadas,
                    ]);
                    // Devolvemos las asignaturas seleccionadas a la lista de asignaturas
                    setAsignaturas((prevAsignaturas) => [
                        ...prevAsignaturas,
                        ...asignaturasSeleccionadas,
                    ]);
                    // Limpiamos la lista de asignaturas seleccionadas
                    setAsignaturasSeleccionadas([]);

                    console.log(
                        "Matrículas creadas correctamente:",
                        response.data
                    );
                    mostrarConfirmacion();
                })
                .catch((error) => {
                    if (error.response && error.response.status === 400) {
                        mostrarMensajeError();
                    } else {
                        console.error("Error al crear las matrículas:", error);
                    }
                });
        }
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
            ) : (
                <div className="sidebar-calendar">
                    <div id="miSidebar">
                        <Sidebar id={authState.id} isAdmin={authState.admin} />
                    </div>
                    <div className="box">
                        <div className="boxTitleLabel">
                            <div className="titleLabel">Matrícula</div>
                        </div>
                        <div className="containerGestion">
                            <div className="boxAsignaturas">
                                <div className="TituloAsignaturas">
                                    <h1>Asignaturas disponibles</h1>
                                </div>
                                <div className="boxSolicitudesMatriculas">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Asignatura</th>
                                                <th>Acciones</th>
                                                <th>Matriculada</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {asignaturas.map((asignatura) => (
                                                <tr key={asignatura.id}>
                                                    <td>
                                                        {asignatura.nombreReal}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="botonAceptar"
                                                            onClick={() =>
                                                                seleccionarAsignatura(
                                                                    asignatura
                                                                )
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </td>
                                                    <td>
                                                        {matriculadas.some(
                                                            (matriculada) =>
                                                                matriculada.id ===
                                                                asignatura.id
                                                        ) ? (
                                                            <span>Sí</span>
                                                        ) : (
                                                            <span>No</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="realizarMatricula">
                                <button onClick={() => realizarMatricula()}>
                                    Realizar Matrícula
                                </button>
                            </div>
                            {confirmacion && (
                                <div className="confirmacion">
                                    <p>
                                        La matrícula se ha realizado
                                        correctamente.
                                    </p>
                                    <button onClick={ocultarConfirmacion}>
                                        Cerrar
                                    </button>
                                </div>
                            )}
                            {mensajeError && (
                                <div className="mensaje-error">
                                    <p>
                                        Alguna asignatura ya está matriculada.
                                    </p>
                                    <button onClick={ocultarMensajeError}>
                                        Cerrar
                                    </button>
                                </div>
                            )}

                            <div className="boxAsignaturasSeleccionadas">
                                <div className="TituloMatricular">
                                    <h1>Asignaturas seleccionadas</h1>
                                </div>
                                <div className="boxSolicitudesMatriculas">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Asignatura</th>
                                                <th>Acciones</th>
                                                <th>Matriculada</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {asignaturasSeleccionadas.map(
                                                (asignatura) => (
                                                    <tr key={asignatura.id}>
                                                        <td>
                                                            {
                                                                asignatura.nombreReal
                                                            }
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="botonDenegar"
                                                                onClick={() =>
                                                                    deseleccionarAsignatura(
                                                                        asignatura
                                                                    )
                                                                }
                                                            >
                                                                -
                                                            </button>
                                                        </td>

                                                        <td>
                                                            {matriculadas.some(
                                                                (matriculada) =>
                                                                    matriculada.id ===
                                                                    asignatura.id
                                                            ) ? (
                                                                <span>Sí</span>
                                                            ) : (
                                                                <span>No</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export default RealizarMatricula;
