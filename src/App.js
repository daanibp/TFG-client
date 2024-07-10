import "./App.css";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { AuthContext } from "./helpers/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import PageNotFound from "./pages/PageNotFound";
import CalendarioEscolar from "./pages/CalendarioEscolar";
import CalendarioGlobal from "./pages/CalendarioGlobal";
import LoadingIndicator from "./Components/LoadingIndicator";
import AdminRegistration from "./pages/AdminRegistration";
import GestionCalendarios from "./pages/GestionCalendarios";
//import GestionMatriculas from "./pages/GestionMatriculas";
//import RealizarMatricula from "./pages/RealizarMatricula";
import AsignarGrupos from "./pages/AsignarGrupos";
import { PiPersonArmsSpreadFill } from "react-icons/pi";

function App() {
    const [authState, setAuthState] = useState({
        uo: "",
        id: 0,
        admin: false,
        status: false,
    });
    const [loading, setLoading] = useState(true);
    const [showPerfil, setShowPerfil] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changePasswordError, setChangePasswordError] = useState("");
    const passwordFormRef = useRef(null); // Referencia al formulario

    useEffect(() => {
        axios
            .get("http://localhost:5001/usuarios/auth", {
                headers: {
                    accessToken: localStorage.getItem("accessToken"),
                },
            })
            .then((response) => {
                if (response.data.error) {
                    setAuthState((prevAuthState) => ({
                        ...prevAuthState,
                        status: false,
                    }));
                } else {
                    setAuthState({
                        uo: response.data.uo,
                        id: response.data.id,
                        admin: response.data.admin,
                        email: response.data.email,
                        profesor: response.data.profesor,
                        estado: response.data.estado,
                        status: true,
                    });
                }
                setLoading(false);
            });
    }, [setAuthState]);

    const logout = () => {
        localStorage.removeItem("accessToken");
        setAuthState({
            uo: "",
            id: 0,
            admin: false,

            status: false,
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setChangePasswordError("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await axios.put(
                "http://localhost:5001/usuarios/changePassword",
                { uo: authState.uo, newPassword: newPassword }
            );
            console.log("Respuesta del servidor:", response.data);
            alert("Contraseña cambiada exitosamente");
            setShowPerfil(false);
            resetPasswordForm();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setChangePasswordError(
                    "La contraseña debe tener al menos 4 dígitos"
                );
            } else {
                console.error(
                    "Error al cambiar la contraseña:",
                    error.response.data
                );
                setChangePasswordError(
                    "Error al cambiar la contraseña. Inténtalo de nuevo más tarde."
                );
            }
        }
    };

    if (loading) {
        return <LoadingIndicator />;
    }

    const handleOpenPerfil = () => {
        resetPasswordForm();
        setShowPerfil((prevShowPerfil) => !prevShowPerfil);
    };

    const handleClosePerfil = () => {
        setShowPerfil(false);
        resetPasswordForm();
    };

    const resetPasswordForm = () => {
        setNewPassword("");
        setConfirmPassword("");
        setChangePasswordError("");
        if (passwordFormRef.current) {
            passwordFormRef.current.reset();
        }
    };

    return (
        <div className="App">
            <AuthContext.Provider value={{ authState, setAuthState }}>
                <Router>
                    <div className="navigation">
                        <div className="brand">
                            <Link to="/">Mi Área Personal</Link>
                        </div>
                        <div className="login-registration">
                            {!authState.status ? (
                                <div>
                                    <Link to="/login">Iniciar sesión</Link>
                                    <Link to="/registration">Regístrate</Link>
                                </div>
                            ) : (
                                <div className="user-info">
                                    <div className="user-info-container">
                                        <button
                                            className="perfil-btn"
                                            onClick={handleOpenPerfil}
                                        >
                                            <PiPersonArmsSpreadFill />
                                            <h1>{authState.uo}</h1>
                                        </button>
                                        {showPerfil && (
                                            <div className="perfil">
                                                <h2>Cambiar contraseña</h2>
                                                <form
                                                    onSubmit={
                                                        handleChangePassword
                                                    }
                                                >
                                                    <input
                                                        type="password"
                                                        placeholder="Nueva contraseña"
                                                        value={newPassword}
                                                        onChange={(e) =>
                                                            setNewPassword(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="Confirmar contraseña"
                                                        value={confirmPassword}
                                                        onChange={(e) =>
                                                            setConfirmPassword(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <button type="submit">
                                                        Guardar
                                                    </button>
                                                    {changePasswordError && (
                                                        <p className="error-message">
                                                            {
                                                                changePasswordError
                                                            }
                                                        </p>
                                                    )}
                                                </form>
                                                <button
                                                    onClick={handleClosePerfil}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {authState.status && (
                                        <button
                                            className="logout-btn"
                                            onClick={logout}
                                        >
                                            Cerrar sesión
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/registration"
                            element={<Registration />}
                        />
                        <Route
                            path="/calendar/calendarioescolar/:id"
                            element={<CalendarioEscolar />}
                        />
                        <Route
                            path="/calendar/calendarioglobal"
                            element={<CalendarioGlobal />}
                        />
                        {/* <Route
                            path="/matriculas/realizarmatricula"
                            element={<RealizarMatricula />}
                        /> */}
                        <Route
                            path="/admin/crearadmin"
                            element={<AdminRegistration />}
                        />
                        <Route
                            path="/admin/gestioncalendarios"
                            element={<GestionCalendarios />}
                        />
                        {/* <Route
                            path="/admin/gestionmatriculas"
                            element={<GestionMatriculas />}
                        /> */}
                        <Route
                            path="/admin/asignargrupos"
                            element={<AsignarGrupos />}
                        />
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </Router>
            </AuthContext.Provider>
        </div>
    );
}

export default App;
