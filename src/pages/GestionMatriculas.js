import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import Sidebar from "../Components/Sidebar";
import "../estilos/GestionCalendarios.css";

function GestionMatriculas() {
    const { authState } = useContext(AuthContext);

    const [solicitudes, setSolicitudes] = useState([]);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [usuarioSolicitante, setUsuarioSolicitante] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("Todos");

    useEffect(() => {
        axios.get(`http://localhost:5001/matriculas`).then(async (response) => {
            console.log("Solicitudes de matrícula: ", response.data);
            // Mapea sobre las matrículas y para cada una realiza una nueva solicitud para obtener los datos de usuario y asignatura
            const solicitudesConDetalles = await Promise.all(
                response.data.map(async (matricula) => {
                    // Realiza una solicitud para obtener los datos del usuario
                    const usuarioResponse = await axios.get(
                        `http://localhost:5001/usuarios/${matricula.UsuarioId}`
                    );
                    const usuario = usuarioResponse.data;

                    // Realiza una solicitud para obtener los datos de la asignatura
                    const asignaturaResponse = await axios.get(
                        `http://localhost:5001/asignaturas/IdNumerico/${matricula.AsignaturaId}`
                    );
                    const asignatura = asignaturaResponse.data;

                    // Retorna un nuevo objeto que contiene la matrícula junto con los datos del usuario y la asignatura
                    return {
                        ...matricula,
                        usuario: usuario,
                        asignatura: asignatura,
                    };
                })
            );

            setSolicitudes(solicitudesConDetalles);
        });
    }, []);

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

    const aceptarSolicitud = (solicitud) => {
        // Estado => Aceptada
        axios.put(`http://localhost:5001/matriculas/aceptar/${solicitud.id}`);
        window.location.reload();
    };

    const denegarSolicitud = (solicitud) => {
        // Estado => Denegada
        axios.put(`http://localhost:5001/matriculas/denegar/${solicitud.id}`);
        window.location.reload();
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
                            <div className="titleLabel">
                                Gestión de Matrículas
                            </div>
                        </div>
                        <div className="boxMatriculas">
                            <div className="TituloMatriculas">
                                <h1>Matrículas</h1>
                            </div>
                            <div className="GestionarSolicitudesMatriculas">
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
                                        className={getButtonStyle("Pendiente")}
                                        onClick={() =>
                                            filtrarSolicitudes("Pendiente")
                                        }
                                    >
                                        Pendientes
                                    </button>
                                    <button
                                        className={getButtonStyle("Aceptada")}
                                        onClick={() =>
                                            filtrarSolicitudes("Aceptada")
                                        }
                                    >
                                        Aceptadas
                                    </button>

                                    <button
                                        className={getButtonStyle("Denegada")}
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
                                            <th>Usuario</th>
                                            <th>Asignatura</th>
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
                                                        {solicitud.UsuarioId}
                                                    </td>
                                                    <td>
                                                        {solicitud.AsignaturaId}
                                                    </td>
                                                    <td>{solicitud.estado}</td>
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
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export default GestionMatriculas;
