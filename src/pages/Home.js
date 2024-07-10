import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import "../estilos/Home.css";
import Sidebar from "../Components/Sidebar";
//import Sidebarv2 from "../Components/Sidebar_v2";

function Home() {
    const { authState } = useContext(AuthContext);

    const [notificaciones, setNotificaciones] = useState([]);
    const [notificacionesGlobales, setNotificacionesGlobales] = useState([]);

    useEffect(() => {
        if (!authState.admin) {
            axios
                .get(`http://localhost:5001/notificaciones/${authState.id}`)
                .then((response) => {
                    const groupedNotificaciones = groupNotificaciones(
                        response.data
                    );
                    setNotificaciones(groupedNotificaciones);
                    console.log("Notificaciones: ", response.data);
                });
        }
        if (authState.admin) {
            axios
                .get(`http://localhost:5001/notificacionesglobales`)
                .then((response) => {
                    setNotificacionesGlobales(response.data);
                    console.log("Notificaciones Globales: ", response.data);
                });
        }
    }, [authState.id, authState.admin]);

    const groupNotificaciones = (notificaciones) => {
        if (!notificaciones.length) return [];

        const grouped = [];
        let currentGroup = [];
        let previousDate = new Date(notificaciones[0].createdAt);

        notificaciones.forEach((notificacion) => {
            const currentDate = new Date(notificacion.createdAt);
            console.log("Current Date: ", currentDate);
            const diff = (currentDate - previousDate) / (1000 * 60);
            console.log("Diff", diff);

            if (diff < -1 && currentGroup.length) {
                grouped.push({
                    ...currentGroup[0],
                    count: currentGroup.length,
                    createdAt: currentGroup[0].createdAt,
                });
                currentGroup = [];
            }

            currentGroup.push(notificacion);
            previousDate = currentDate;
        });

        if (currentGroup.length) {
            grouped.push({
                ...currentGroup[0],
                count: currentGroup.length,
                createdAt: currentGroup[0].createdAt,
            });
        }

        return grouped;
    };

    const formatFechaHora = (fecha) => {
        const date = new Date(fecha);
        date.setHours(date.getHours());
        return date.toLocaleString();
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
                <div className="boxHome">
                    <Sidebar id={authState.id} isAdmin={authState.admin} />
                    <div className="boxNotificaciones">
                        <div>
                            <h1>Notificaciones</h1>
                        </div>
                        <div className="Notificaciones">
                            {!authState.admin && notificaciones.length > 0 ? (
                                notificaciones.map((notificacion) => (
                                    <div
                                        key={notificacion.id}
                                        className="notificacion-item"
                                    >
                                        <p>
                                            {
                                                notificacion.eventoCompartido
                                                    .usuarioCreador.uo
                                            }{" "}
                                            quiere compartir{" "}
                                            {notificacion.count} evento
                                            {notificacion.count > 1
                                                ? "s"
                                                : ""}{" "}
                                            contigo.
                                        </p>
                                        <span className="notificacion-date">
                                            {formatFechaHora(
                                                notificacion.createdAt
                                            )}
                                        </span>
                                    </div>
                                ))
                            ) : !authState.admin ? (
                                <div className="notificacion-item">
                                    <p>No hay notificaciones.</p>
                                </div>
                            ) : null}
                            {authState.admin &&
                            notificacionesGlobales.length > 0
                                ? notificacionesGlobales.map((notificacion) => (
                                      <div
                                          key={notificacion.id}
                                          className="notificacion-item"
                                      >
                                          <p>
                                              {
                                                  notificacion.solicitudEvento
                                                      .usuarioCreador.uo
                                              }{" "}
                                              ha solicitado un evento global.
                                          </p>
                                          <span className="notificacion-date">
                                              {formatFechaHora(
                                                  notificacion.createdAt
                                              )}
                                          </span>
                                      </div>
                                  ))
                                : authState.admin && (
                                      <div className="notificacion-item">
                                          <p>No hay notificaciones.</p>
                                      </div>
                                  )}
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export default Home;
