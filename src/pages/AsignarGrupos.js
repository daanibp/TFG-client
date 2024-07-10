import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import Sidebar from "../Components/Sidebar";
import "../estilos/AsignarGrupos.css";
import { ProcesaExcelAsignaturas } from "../helpers/ProcesaExcelAsignaturas";
import { ProcesaExcelGrupos } from "../helpers/ProcesaExcelGrupos";

function AsignarGrupos() {
    const { authState } = useContext(AuthContext);

    const [asignaturas, setAsignaturas] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    //const [matriculas, setMatriculas] = useState([]);

    const [selectedGruposFile, setSelectedGruposFile] = useState(null);
    const [selectedAsignaturasFile, setSelectedAsignaturasFile] =
        useState(null);

    const [gruposNuevos, setGruposNuevos] = useState([]);
    const [usuariosNuevos, setUsuariosNuevos] = useState([]);
    const [matriculasNuevas, setMatriculasNuevas] = useState([]);

    const [mostrarMensajeAsignaturas, setMostrarMensajeAsignaturas] =
        useState(false);
    const [mensajeAsignaturas, setMensajeAsignaturas] = useState("");

    const [mostrarMensajeGrupos, setMostrarMensajeGrupos] = useState(false);
    const [mensajeGrupos, setMensajeGrupos] = useState("");
    const [mensajeUsuarios, setMensajeUsuarios] = useState("");
    const [mensajeMatriculas, setMensajeMatriculas] = useState("");

    let gruposTemp = [];
    let usuariosTemp = [];

    const [
        mostrarMensajeTemporalAsignaturas,
        setMostrarMensajeTemporalAsignaturas,
    ] = useState(false);
    const [mostrarMensajeTemporalGrupos, setMostrarMensajeTemporalGrupos] =
        useState(false);

    useEffect(() => {
        axios.get(`http://localhost:5001/asignaturas`).then((response) => {
            console.log("Asignaturas: ", response.data);
            setAsignaturas(response.data);
        });
        axios.get(`http://localhost:5001/grupos`).then((response) => {
            console.log("Grupos: ", response.data);
            setGrupos(response.data);
            setGruposNuevos([]);
        });
        // axios
        //     .get(`http://localhost:5001/matriculas/matriculasConGrupo`)
        //     .then((response) => {
        //         console.log("Matriculas: ", response.data);
        //         setMatriculas(response.data);

        //     });
        axios
            .get(`http://localhost:5001/usuarios/allUsers/all`)
            .then((response) => {
                console.log("Usuarios: ", response.data);
                setUsuarios(response.data);
                setMatriculasNuevas([]);
                setUsuariosNuevos([]);
            });
    }, []);

    // Función para manejar el cambio en el archivo seleccionado
    const handleGruposFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.name !== "AsignacionGruposITIN.xlsx") {
            alert(
                "Por favor, selecciona el archivo 'AsignacionGruposITIN.xlsx'."
            );
            event.target.value = null;
            setSelectedGruposFile(null);
        } else {
            setSelectedGruposFile(file);
        }
    };

    // Función para manejar el cambio en el archivo seleccionado
    const handleAsignaturasFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.name !== "Asignaturas.xlsx") {
            alert("Por favor, selecciona el archivo 'Asignaturas.xlsx'.");
            event.target.value = null;
            setSelectedAsignaturasFile(null);
        } else {
            setSelectedAsignaturasFile(file);
        }
    };

    // Función para procesar el archivo de asignaturas
    const handleCargarAsignaturas = async () => {
        if (selectedAsignaturasFile) {
            setMostrarMensajeTemporalAsignaturas(true);
            const dataAsignaturas = await ProcesaExcelAsignaturas(
                selectedAsignaturasFile,
                ["Asignaturas"]
            );
            try {
                setAsignaturas(dataAsignaturas);
                const response = await axios.post(
                    "http://localhost:5001/asignaturas/addLoteAsignaturas",
                    dataAsignaturas
                );
                if (response.data.asignaturasCreadas.length > 0) {
                    console.log(
                        "Las asignaturas se han agregado correctamente."
                    );
                    // Mensaje al administrador
                    setMensajeAsignaturas(
                        "Las asignaturas se han agregado correctamente."
                    );
                    setMostrarMensajeTemporalAsignaturas(false);
                    setMostrarMensajeAsignaturas(true);
                } else {
                    console.log(
                        "Ya estaban todas las asignaturas cargadas en el sistema."
                    );
                    // Mensaje al administrador
                    setMensajeAsignaturas(
                        "Ya estaban todas las asignaturas cargadas en el sistema."
                    );
                    setMostrarMensajeTemporalAsignaturas(false);
                    setMostrarMensajeAsignaturas(true);
                }
            } catch (error) {
                console.error("Error al agregar asignaturas:", error);
                setMensajeAsignaturas("Error al agregar asignaturas.");
                setMostrarMensajeTemporalAsignaturas(false);
                setMostrarMensajeAsignaturas(true);
            }
        } else {
            alert("Por favor, selecciona un archivo de asignaturas.");
        }
    };

    const handleCerrarMensaje = () => {
        setMostrarMensajeAsignaturas(false);
    };

    const handleCerrarMensajeGrupos = () => {
        setMostrarMensajeGrupos(false);
    };

    // Función para verificar la existencia de asignaturas en la base de datos
    const verificarAsignaturas = async () => {
        try {
            // Si no hay asignaturas, mostrar mensaje de alerta
            if (asignaturas.length === 0) {
                alert(
                    "No hay asignaturas en la base de datos. Cárgalas primero."
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al verificar las asignaturas:", error);
            return false;
        }
    };

    let dataGrupos = [];

    // Función para procesar el archivo de grupos
    const handleCargarGrupos = async () => {
        // Verificar la existencia de asignaturas antes de cargar grupos
        const hayAsignaturas = await verificarAsignaturas();

        // Si hay asignaturas, continuar con la carga de grupos
        if (hayAsignaturas) {
            if (selectedGruposFile) {
                setMostrarMensajeTemporalGrupos(true);
                dataGrupos = await ProcesaExcelGrupos(selectedGruposFile, [
                    "Hoja1",
                ]);

                // Crear grupos
                for (const grupoInfo of dataGrupos) {
                    console.log("Grupo Info", grupoInfo);
                    // Buscar la asignatura necesaria en la lista de asignaturas
                    let asignatura = asignaturas.find(
                        (asignatura) =>
                            asignatura.idAsignatura ===
                            getIdAsignatura(grupoInfo.nombre)
                    );
                    console.log("La asignatura en esta línea es ", asignatura);

                    let idAsignatura = 0;
                    if (asignatura) {
                        // Obtener el ID de la asignatura
                        idAsignatura = asignatura.id;
                        console.log("ID asignatura: ", idAsignatura);
                    } else {
                        console.error(
                            "No se encontró la asignatura:",
                            grupoInfo.id
                        );
                    }

                    let grupoTeo = {};
                    let grupoPA = {};
                    let grupoPL = {};
                    let grupoTG = {};

                    if (grupoInfo.cex !== "") {
                        grupoTeo = {
                            //id: grupos.length + 1,
                            nombre:
                                grupoInfo.cex +
                                "_" +
                                obtenerNombreAsignacion(
                                    asignatura.idAsignatura
                                ),
                            tipo: "Teoría",
                            AsignaturaId: idAsignatura,
                        };
                    }
                    if (grupoInfo.pas !== "") {
                        grupoPA = {
                            //id: grupoInfo.id,
                            nombre:
                                grupoInfo.pas +
                                "_" +
                                obtenerNombreAsignacion(
                                    asignatura.idAsignatura
                                ),
                            tipo: "PA",
                            AsignaturaId: idAsignatura,
                        };
                    }
                    if (grupoInfo.pl !== "") {
                        grupoPL = {
                            //id: grupoInfo.id,
                            nombre:
                                grupoInfo.pl +
                                "_" +
                                obtenerNombreAsignacion(
                                    asignatura.idAsignatura
                                ),
                            tipo: "PL",
                            AsignaturaId: idAsignatura,
                        };
                    }
                    if (grupoInfo.tug !== "") {
                        grupoTG = {
                            //id: grupoInfo.id,
                            nombre:
                                grupoInfo.tug +
                                "_" +
                                obtenerNombreAsignacion(
                                    asignatura.idAsignatura
                                ),
                            tipo: "TG",
                            AsignaturaId: idAsignatura,
                        };
                    }

                    // Añadir grupos si no existen
                    addGroupIfNotExists(grupoTeo);
                    addGroupIfNotExists(grupoPA);
                    addGroupIfNotExists(grupoPL);
                    addGroupIfNotExists(grupoTG);
                    // Añadir usuarios si no existen
                    if (grupoInfo.uo !== "#N/D" && grupoInfo.uo !== "") {
                        const user = { uo: grupoInfo.uo }; // Crear un objeto usuario con la estructura correcta
                        addUserIfNotExists(user);
                    }

                    // Añadir matrículas si no existen (necesito los grupos y usuarios creados para el ID)
                }
                // setGruposNuevos(nuevosGruposTemp);
                // setUsuariosNuevos(nuevosUsuariosTemp);

                await AgregarGrupos(gruposNuevos);
                await AgregarUsuarios(usuariosNuevos);
                await handleMatriculas();
                setMostrarMensajeTemporalGrupos(false);
            } else {
                alert("Por favor, selecciona un archivo de grupos.");
            }
        }
    };

    const AgregarGrupos = async (Grupos) => {
        console.log("Grupos antes de su agregación: ", grupos);
        console.log("Nuevos grupos antes de su agregacion: ", gruposNuevos);

        try {
            if (Grupos.length !== 0) {
                const response = await axios.post(
                    "http://localhost:5001/grupos/addGrupos",
                    Grupos
                );
                if (response.data.gruposCreados.length > 0) {
                    console.log(
                        "Los grupos se han agregado correctamente:",
                        response.data
                    );
                    setGrupos(response.data.todosLosGrupos);
                    gruposTemp = response.data.todosLosGrupos;
                    setMensajeGrupos(
                        "Se han agregado " +
                            response.data.gruposCreados.length +
                            " grupos nuevos al sistema."
                    );
                } else {
                    console.log(
                        "No se ha agregado ningún grupo.",
                        response.data
                    );
                    setMensajeGrupos("No se ha agregado ningún grupo nuevo.");
                }
            } else {
                gruposTemp = grupos;
                console.log("Se han agregado " + Grupos.length + " grupos.");
                setMensajeGrupos("No se ha agregado ningún grupo nuevo.");
            }
        } catch (error) {
            console.error("Error al agregar grupos:", error);
            setMensajeGrupos("Error al agregar grupos.");
            setMostrarMensajeTemporalGrupos(false);
            setMostrarMensajeGrupos(true);
        }
    };

    // Función auxiliar para añadir grupo si no existe
    const addGroupIfNotExists = (grupo) => {
        if (!isEmptyObject(grupo)) {
            const existsInGrupos = grupos.some(
                (existingGroup) => existingGroup.nombre === grupo.nombre
            );
            const existsInGruposNuevos = gruposNuevos.some(
                (existingGroup) => existingGroup.nombre === grupo.nombre
            );

            if (!existsInGrupos && !existsInGruposNuevos) {
                gruposNuevos.push(grupo);
                console.log("Grupo añadido:", grupo);
            } else {
                console.log("El grupo ya existe:", grupo.nombre);
            }
        }
    };

    const AgregarUsuarios = async (Usuarios) => {
        console.log("Usuarios antes de su agregación: ", usuarios);
        console.log("Nuevos usuarios antes de su agregación: ", usuariosNuevos);

        try {
            if (Usuarios.length !== 0) {
                const response = await axios.post(
                    "http://localhost:5001/usuarios/addLoteUsuarios/alumnos/inactivos",
                    Usuarios
                );
                if (response.data.usuariosCreados.length > 0) {
                    console.log(
                        "Los usuarios se han agregado correctamente:",
                        response.data
                    );
                    setUsuarios(response.data.todosLosUsuarios);
                    usuariosTemp = response.data.todosLosUsuarios;
                    setMensajeUsuarios(
                        "Se han agregado " +
                            response.data.usuariosCreados.length +
                            " usuarios nuevos al sistema."
                    );
                } else {
                    console.log(
                        "No se ha agregado ningún usuario.",
                        response.data
                    );
                    setMensajeUsuarios(
                        "No se ha agregado ningún usuario nuevo."
                    );
                }
            } else {
                usuariosTemp = usuarios;
                console.log(
                    "Se han agregado " + Usuarios.length + " usuarios."
                );
                setMensajeUsuarios("No se ha agregado ningún usuario nuevo.");
            }
        } catch (error) {
            console.error("Error al agregar usuarios:", error);
            setMensajeGrupos("Error al agregar usuarios.");
            setMostrarMensajeTemporalGrupos(false);
            setMostrarMensajeGrupos(true);
        }
    };

    // Función auxiliar para añadir usuario si no existe
    const addUserIfNotExists = (user) => {
        if (!isEmptyObject(user)) {
            const existsInUsers = usuarios.some(
                (existingUser) => existingUser.uo === user.uo
            );
            const existsInUsersNuevos = usuariosNuevos.some(
                (existingUser) => existingUser.uo === user.uo
            );

            if (!existsInUsers && !existsInUsersNuevos) {
                usuariosNuevos.push(user);
                console.log("Usuario añadido:", user);
            } else {
                console.log("El usuario ya existe:", user.uo);
            }
        }
    };

    const handleMatriculas = async () => {
        console.log("Grupos antes del handleMatriculas: ", gruposTemp);
        console.log("Usuarios antes del handleMatriculas: ", usuariosTemp);
        for (const grupoInfo of dataGrupos) {
            // ID para el uo
            console.log("Grupo info: ", grupoInfo);
            let idUsuario = obtenerIdUsuarioPorUo(grupoInfo.uo);
            console.log("ID del usuario: ", idUsuario);

            // ID para la asignatura
            // Buscar la asignatura necesaria en la lista de asignaturas
            let asignatura = asignaturas.find(
                (asignatura) =>
                    asignatura.idAsignatura ===
                    getIdAsignatura(grupoInfo.nombre)
            );
            console.log("La asignatura en esta línea es ", asignatura);

            let idAsignatura = 0;
            if (asignatura) {
                // Obtener el ID de la asignatura
                idAsignatura = asignatura.id;
                console.log("ID asignatura: ", idAsignatura);
            } else {
                console.error("No se encontró la asignatura:", grupoInfo.id);
            }

            // ID para los 4 grupos
            let idGrupoTeo = 0;
            let idGrupoPA = 0;
            let idGrupoPL = 0;
            let idGrupoTG = 0;
            // Encontrar el id del nombre de cada uno de los grupos
            if (grupoInfo.cex !== "" && idUsuario !== null) {
                let nombreGrupoTeo =
                    grupoInfo.cex +
                    "_" +
                    obtenerNombreAsignacion(asignatura.idAsignatura);
                // Buscas el id con ese nombre
                idGrupoTeo = obtenerIdGrupoPorNombre(nombreGrupoTeo);

                // Si existe el grupo creo la matrícula
                // Creamos la matrícula
                const matricula = {
                    estado: "Pendiente",
                    ver: true,
                    UsuarioId: idUsuario,
                    AsignaturaId: idAsignatura,
                    GrupoId: idGrupoTeo,
                };
                // Añadimos la matrícula
                addMatriculaIfNotExists(matricula);
            }
            if (grupoInfo.pas !== "" && idUsuario !== null) {
                let nombreGrupoPA =
                    grupoInfo.pas +
                    "_" +
                    obtenerNombreAsignacion(asignatura.idAsignatura);
                // Buscas el id con ese nombre
                idGrupoPA = obtenerIdGrupoPorNombre(nombreGrupoPA);

                // Si existe el grupo creo la matrícula
                // Creamos la matrícula
                const matricula = {
                    estado: "Pendiente",
                    ver: true,
                    UsuarioId: idUsuario,
                    AsignaturaId: idAsignatura,
                    GrupoId: idGrupoPA,
                };
                // Añadimos la matrícula
                addMatriculaIfNotExists(matricula);
            }
            if (grupoInfo.pl !== "" && idUsuario !== null) {
                let nombreGrupoPL =
                    grupoInfo.pl +
                    "_" +
                    obtenerNombreAsignacion(asignatura.idAsignatura);
                // Buscas el id con ese nombre
                idGrupoPL = obtenerIdGrupoPorNombre(nombreGrupoPL);

                // Si existe el grupo creo la matrícula
                // Creamos la matrícula
                const matricula = {
                    estado: "Pendiente",
                    ver: true,
                    UsuarioId: idUsuario,
                    AsignaturaId: idAsignatura,
                    GrupoId: idGrupoPL,
                };
                // Añadimos la matrícula
                addMatriculaIfNotExists(matricula);
            }
            if (grupoInfo.tug !== "" && idUsuario !== null) {
                let nombreGrupoTG =
                    grupoInfo.tug +
                    "_" +
                    obtenerNombreAsignacion(asignatura.idAsignatura);
                // Buscas el id con ese nombre
                idGrupoTG = obtenerIdGrupoPorNombre(nombreGrupoTG);

                // Si existe el grupo creo la matrícula
                // Creamos la matrícula
                const matricula = {
                    estado: "Pendiente",
                    ver: true,
                    UsuarioId: idUsuario,
                    AsignaturaId: idAsignatura,
                    GrupoId: idGrupoTG,
                };
                // Añadimos la matrícula
                addMatriculaIfNotExists(matricula);
            }
        }

        await AgregarMatriculas(matriculasNuevas);
    };

    const AgregarMatriculas = async (Matriculas) => {
        //console.log("Matrículas antes de su agregación: ", matriculas);
        console.log(
            "Nuevas matrículas antes de su agregación: ",
            matriculasNuevas
        );
        try {
            let matriculasC = 0;
            let matriculasChange = [];
            // Dividir las matrículas en lotes
            const tamañoLote = 100;
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
            }

            // Obtener las matrículas de los alumnos
            const responseMatriculasAlumnos = await axios.get(
                "http://localhost:5001/matriculas/matriculasAlumnos"
            );
            const matriculasAlumnos =
                responseMatriculasAlumnos.data.matriculasAlumnos;

            // Filtrar las matrículas de alumnos que no estén en matriculasNuevas
            matriculasChange = matriculasAlumnos.filter((matriculaAlumno) => {
                const encontrado = Matriculas.find(
                    (matriculaNueva) =>
                        matriculaNueva.UsuarioId ===
                            matriculaAlumno.UsuarioId &&
                        matriculaNueva.AsignaturaId ===
                            matriculaAlumno.AsignaturaId &&
                        matriculaNueva.GrupoId === matriculaAlumno.GrupoId
                );
                return !encontrado;
            });

            console.log("Matrículas Change: ", matriculasChange);

            // Actualizar ver
            for (let i = 0; i < matriculasChange.length; i += tamañoLote) {
                const lote = matriculasChange.slice(i, i + tamañoLote);
                const response1 = await axios.post(
                    "http://localhost:5001/matriculas/updateMatriculasVer",
                    lote
                );
                console.log(
                    `Lote ${
                        i / tamañoLote + 1
                    } de matrículas a cambiar enviado correctamente:`,
                    response1.data
                );
            }

            if (matriculasC === 0) {
                setMensajeMatriculas(
                    "No se ha agregado ninguna matrícula nueva."
                );
            } else {
                setMensajeMatriculas(
                    "Se han agregado " + matriculasC + " matrículas nuevas."
                );
            }
            setMatriculasNuevas([]);
            setMostrarMensajeTemporalGrupos(false);
            setMostrarMensajeGrupos(true);
        } catch (error) {
            console.error("Error al agregar matrículas:", error);
            setMensajeMatriculas("Error al agregar matrículas.");
            setMostrarMensajeTemporalGrupos(false);
            setMostrarMensajeGrupos(true);
        }
    };

    const addMatriculaIfNotExists = (matricula) => {
        if (!isEmptyObject(matricula)) {
            matriculasNuevas.push(matricula);
            console.log("Matricula añadida:", matricula);
        }
    };

    const isEmptyObject = (obj) => {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    };

    function getIdAsignatura(nombreAsignacion) {
        // Buscar la asignatura por su nombre de asignación
        const asignaturaEncontrada = asignaturas.find(
            (asignatura) => asignatura.nombreAsignación === nombreAsignacion
        );

        // Verificar si se encontró una asignatura con ese nombre
        if (asignaturaEncontrada) {
            return asignaturaEncontrada.idAsignatura; // Devolver el ID de la asignatura encontrada
        } else {
            return null; // O devolver null si no se encuentra ninguna asignatura con ese nombre
        }
    }

    // Función para obtener el nombre de la asignatura
    function obtenerNombreAsignacion(nombreCompleto) {
        if (typeof nombreCompleto !== "string") {
            console.error(
                "El nombre completo no es un string válido:",
                nombreCompleto
            );
            return "";
        }
        const partes = nombreCompleto.split("-");
        return partes[partes.length - 1];
    }

    // Función para obtener el ID de un grupo por su nombre
    const obtenerIdGrupoPorNombre = (nombreGrupo) => {
        const grupoEncontrado = gruposTemp.find(
            (grupo) => grupo.nombre === nombreGrupo
        );

        if (grupoEncontrado) {
            return grupoEncontrado.id; // Devolver el ID del grupo encontrado
        } else {
            return null; // O devolver null si no se encuentra ningún grupo con ese nombre
        }
    };

    // Función para obtener el ID de un usuario por su UO
    const obtenerIdUsuarioPorUo = (uo) => {
        const usuarioEncontrado = usuariosTemp.find(
            (usuario) => usuario.uo === uo
        );

        if (usuarioEncontrado) {
            return usuarioEncontrado.id; // Devolver el ID del usuario encontrado
        } else {
            return null; // O devolver null si no se encuentra ningún usuario con ese UO
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
                            <div className="titleLabel">
                                Gestión de Asignaturas y Grupos
                            </div>
                        </div>
                        <div className="containerGestion">
                            <div className="boxAsignaturas">
                                <div className="TituloGrupos">
                                    <h1>Asignaturas</h1>
                                </div>

                                <div className="CargarFicheroGrupos">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleAsignaturasFileChange}
                                    />
                                    <button onClick={handleCargarAsignaturas}>
                                        Cargar Asignaturas
                                    </button>
                                    {mostrarMensajeTemporalAsignaturas && (
                                        <div className="mensaje-dialogo-asignaturas">
                                            <div className="mensaje-dialogo-contenido-asignaturas">
                                                <p>
                                                    Procesando el archivo.{" "}
                                                    <br />
                                                    Creando asignaturas...{" "}
                                                    <br />
                                                    Este proceso puede tardar
                                                    unos segundos. <br />
                                                    Espere.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {mostrarMensajeAsignaturas && (
                                        <div className="mensaje-dialogo-asignaturas">
                                            <div className="mensaje-dialogo-contenido-asignaturas">
                                                <p>{mensajeAsignaturas}</p>
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
                                    Para cargar las asignaturas debemos
                                    seleccionar el Excel "Asignaturas.xlsx".
                                </p>
                            </div>

                            <div className="boxGrupos">
                                <div className="TituloGrupos">
                                    <h1>Grupos</h1>
                                </div>

                                <div className="CargarFicheroGrupos">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleGruposFileChange}
                                    />
                                    <button onClick={handleCargarGrupos}>
                                        Cargar Grupos de los Alumnos
                                    </button>
                                    {mostrarMensajeTemporalGrupos && (
                                        <div className="mensaje-dialogo-asignaturas">
                                            <div className="mensaje-dialogo-contenido-asignaturas">
                                                <p>
                                                    Procesando el archivo.{" "}
                                                    <br />
                                                    Creando grupos... <br />
                                                    Creando usuarios... <br />
                                                    Creando matrículas... <br />
                                                    Este proceso puede tardar
                                                    unos segundos. <br />
                                                    Espere.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {mostrarMensajeGrupos && (
                                        <div className="mensaje-dialogo-grupos">
                                            <div className="mensaje-dialogo-contenido-grupos">
                                                <p>{mensajeGrupos}</p>
                                                <p>{mensajeUsuarios}</p>
                                                <p>{mensajeMatriculas}</p>
                                                <button
                                                    onClick={
                                                        handleCerrarMensajeGrupos
                                                    }
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p>
                                    Para cargar los grupos, usuarios y sus
                                    matrículas debemos seleccionar el Excel
                                    "AsignacionGruposITIN.xlsx".
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export default AsignarGrupos;
