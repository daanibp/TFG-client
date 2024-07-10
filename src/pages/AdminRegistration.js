import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../helpers/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../estilos/Registration.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import LoadingIndicator from "../Components/LoadingIndicator";

function AdminRegistration() {
    const { authState } = useContext(AuthContext);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [error, setError] = useState("");
    let navigate = useNavigate();

    useEffect(() => {
        // Verificar si el usuario es un administrador
        if (authState.admin) {
            setIsAuthorized(true);
            setLoading(false);
        } else {
            navigate("/PageNotFound"); // Redirigir a una ruta diferente si el usuario no es un administrador
        }
    }, [authState.admin, navigate]);

    if (loading) {
        return (
            <div>
                <LoadingIndicator />
            </div>
        ); // Mostrar un indicador de carga mientras se verifica la autorización del usuario
    }

    if (!isAuthorized) {
        return null; // Si el usuario no es un administrador, no renderizar nada
    }

    const initialValues = {
        uo: "",
        password: "",
    };

    const validationSchema = Yup.object().shape({
        uo: Yup.string().min(3).max(15).required("El UO es obligatorio"),
        password: Yup.string()
            .min(4)
            .max(20)
            .required("La contraseña es obligatoria"),
    });

    const onSubmit = async (data, { resetForm }) => {
        try {
            const response = await axios.post(
                "http://localhost:5001/usuarios/crearadmin",
                data
            );
            if (response.data === "SUCCESS") {
                setRegistroExitoso(true);
                setError("");
                resetForm();
            } else {
                setRegistroExitoso(false);
                setError(response.data);
            }
        } catch (error) {
            setError(error.response.data.error);
            setRegistroExitoso(false);
        }
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
                    <div className="CrearAdmin">
                        <Sidebar id={authState.id} isAdmin={authState.admin} />
                        <div className="Form">
                            <Formik
                                initialValues={initialValues}
                                onSubmit={onSubmit}
                                validationSchema={validationSchema}
                            >
                                <Form className="formContainer">
                                    <label>UO: </label>
                                    <ErrorMessage name="uo" component="span" />
                                    <Field
                                        name="uo"
                                        placeholder="(Ex. UO111111...)"
                                    />
                                    <label>Contraseña: </label>
                                    <ErrorMessage
                                        name="password"
                                        component="span"
                                    />
                                    <Field
                                        type="password"
                                        name="password"
                                        placeholder="Contraseña..."
                                    />
                                    <button
                                        className="buttonRegistration"
                                        type="submit"
                                    >
                                        Registrar
                                    </button>

                                    {registroExitoso && (
                                        <div className="mensaje-dialogo">
                                            <p>
                                                Has registrado un administrador
                                                correctamente.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setRegistroExitoso(false);
                                                }}
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="error">
                                            <p>{error}</p>
                                        </div>
                                    )}
                                </Form>
                            </Formik>
                        </div>
                    </div>
                )}
            </AuthContext.Provider>
        </div>
    );
}

export default AdminRegistration;
