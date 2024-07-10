import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../estilos/Registration.css";

function Registration() {
    const initialValues = {
        uo: "",
        newPassword: "",
    };

    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    const validationSchema = Yup.object().shape({
        uo: Yup.string().min(3).max(15).required("El UO es obligatorio"),
        newPassword: Yup.string()
            .min(4)
            .max(20)
            .required("La contraseña es obligatoria"),
    });

    const onSubmit = async (data, { resetForm }) => {
        try {
            const response = await axios.post(
                "http://localhost:5001/usuarios/register",
                data
            );
            if (response.status === 200) {
                setRegistroExitoso(true);
                setMensajeError("");
                resetForm();
            } else {
                setRegistroExitoso(false);
                setMensajeError(response.data.error || "Error al registrar");
            }
        } catch (error) {
            setRegistroExitoso(false);
            setMensajeError(error.response.data.error);
        }
    };

    return (
        <div>
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
            >
                <Form className="formContainer">
                    <label>UO: </label>
                    <ErrorMessage name="uo" component="span" />
                    <Field
                        id="inputCreatePost"
                        name="uo"
                        placeholder="(Ex. UO111111...)"
                    />
                    <label>Contraseña: </label>
                    <ErrorMessage name="newPassword" component="span" />
                    <Field
                        type="password"
                        id="inputCreatePost"
                        name="newPassword"
                        placeholder="Tu contraseña..."
                    />
                    <button className="buttonRegistration" type="submit">
                        Registrarse
                    </button>

                    {registroExitoso && (
                        <div className="mensaje-dialogo-registration">
                            <p>
                                Te has registrado correctamente. Por favor,
                                revisa tu correo electrónico para validar tu
                                cuenta.
                            </p>
                            <button onClick={() => setRegistroExitoso(false)}>
                                Cerrar
                            </button>
                        </div>
                    )}

                    {mensajeError && (
                        <div className="error">
                            <p>{mensajeError}</p>
                        </div>
                    )}
                </Form>
            </Formik>
        </div>
    );
}

export default Registration;
