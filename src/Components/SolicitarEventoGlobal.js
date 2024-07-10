import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-clock/dist/Clock.css";
import "../estilos/AñadirEvento.css";

function SolicitarEventoGlobal({ onSolicitarEvento, userId }) {
    const [fechaComienzo, setFechaComienzo] = useState(new Date());
    const [fechaFinalización, setFechaFinalización] = useState(new Date());
    const [fechaRecordatorio, setFechaRecordatorio] = useState(new Date());

    const [errorMessages, setErrorMessages] = useState({
        errorFechaComienzo: "",
        errorFechaFinalización: "",
        errorFechaRecordatorio: "",
        errorHoraComienzo: "",
        errorHoraFinalización: "",
        errorHoraRecordatorio: "",
    });

    const [recordarmeIsTrue, setRecordarmeIsTrue] = useState(false);

    const initialValues = {
        estado: "Pendiente",
        asunto: "",
        HorasComienzo: "08",
        MinutosComienzo: "00",
        HorasFinalización: "08",
        MinutosFinalización: "00",
        todoElDia: false,
        recordarme: recordarmeIsTrue,
        HorasRecordatorio: "00",
        MinutosRecordatorio: "00",
        organizador: "",
        descripción: "",
        prioridad: "Normal",
        privado: false,
        sensibilidad: "Normal",
    };

    const validationSchema = Yup.object().shape({
        asunto: Yup.string().required("El asunto es requerido"),
        horaComienzo: Yup.string(),
        horaFinalizacion: Yup.string(),
        organizador: Yup.string(),
        descripción: Yup.string().required("La descricpión es requerido"),
        prioridad: Yup.string().oneOf(["Baja", "Normal", "Alta"]),
        sensibilidad: Yup.string().oneOf(["Baja", "Normal", "Alta"]),
    });

    const onSubmit = async (data) => {
        console.log("Los datos del formulario son: ", data);
        setErrorMessages({
            errorFechaComienzo: "",
            errorFechaFinalización: "",
            errorFechaRecordatorio: "",
            errorHoraComienzo: "",
            errorHoraFinalización: "",
            errorHoraRecordatorio: "",
        });

        const newHoraComienzo = `${data.HorasComienzo}:${data.MinutosComienzo}`;

        const newHoraFinalizacion = `${data.HorasFinalización}:${data.MinutosFinalización}`;

        const newHoraRecordatorio = `${data.HorasRecordatorio}:${data.MinutosRecordatorio}`;

        if (fechaComienzo === null) {
            setErrorMessages((prevMessages) => ({
                ...prevMessages,
                errorFechaComienzo: "La fecha de comienzo es requerida",
            }));
            return;
        } else if (fechaFinalización === null) {
            setErrorMessages((prevMessages) => ({
                ...prevMessages,
                errorFechaFinalización: "La fecha de finalización es requerida",
            }));
            return;
        } else if (recordarmeIsTrue && fechaRecordatorio === null) {
            setErrorMessages((prevMessages) => ({
                ...prevMessages,
                errorFechaRecordatorio: "La fecha de recordatorio es requerida",
            }));
            return;
        } else if (newHoraComienzo === null) {
            setErrorMessages((prevMessages) => ({
                ...prevMessages,
                errorHoraComienzo: "La hora de comienzo es requerida",
            }));
            return;
        } else if (newHoraFinalizacion === null) {
            setErrorMessages((prevMessages) => ({
                ...prevMessages,
                errorHoraFinalización: "La hora de finalización es requerida",
            }));
            return;
        } else if (recordarmeIsTrue && newHoraRecordatorio === null) {
            setErrorMessages((prevMessages) => ({
                ...prevMessages,
                errorHoraRecordatorio: "La hora de recordatorio es requerida",
            }));
            return;
        }

        const reminderDate = recordarmeIsTrue
            ? new Date(fechaRecordatorio.getTime() + 60 * 60 * 1000)
            : null;
        const reminderTime = recordarmeIsTrue ? newHoraRecordatorio : "";
        console.log("Recordarme?: ", recordarmeIsTrue);

        const fechaC = new Date(fechaComienzo.getTime() + 60 * 60 * 1000);
        const fechaF = new Date(fechaFinalización.getTime() + 60 * 60 * 1000);

        console.log(fechaC);
        console.log(fechaF);

        // Validación de fecha y hora
        if (fechaC > fechaF) {
            setErrorMessages((prevMessages) => ({
                ...prevMessages,
                errorFechaFinalización:
                    "La fecha de finalización debe ser posterior a la fecha de comienzo",
            }));
            return;
        } else if (
            fechaC.getDate() === fechaF.getDate() &&
            newHoraComienzo >= newHoraFinalizacion
        ) {
            setErrorMessages((prevMessages) => ({
                ...prevMessages,
                errorHoraFinalización:
                    "La hora de finalización debe ser posterior a la hora de comienzo",
            }));
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5001/solicitudEventos/addSolicitudEvento",
                {
                    estado: data.estado,
                    asunto: data.asunto,
                    fechaDeComienzo: fechaC,
                    comienzo: newHoraComienzo,
                    fechaDeFinalización: fechaF,
                    finalización: newHoraFinalizacion,
                    todoElDía: data.todoElDia,
                    reminder: recordarmeIsTrue,
                    reminderDate: reminderDate,
                    reminderTime: reminderTime,
                    meetingOrganizer: data.organizador,
                    requiredAttendees: null,
                    optionalAttendees: null,
                    recursosDeLaReunión: null,
                    billingInformation: null,
                    categories: null,
                    description: data.descripción,
                    location: null,
                    mileage: null,
                    priority: data.prioridad,
                    private: data.privado,
                    sensitivity: data.sensibilidad,
                    showTimeAs: 2,
                    UsuarioId: userId,
                }
            );
            onSolicitarEvento(response.data);
            console.log("Solicitud enviada correctamente: ", response.data);
            // Se lo decimos al usuario
        } catch (error) {
            console.error("Error en la solicitud: ", error.message);
        }
    };

    const handleChange = (
        fechaComienzo,
        fechaFinalización,
        fechaRecordatorio
    ) => {
        setFechaComienzo(fechaComienzo);
        setFechaFinalización(fechaFinalización);
        setFechaRecordatorio(fechaRecordatorio);
    };

    const handleRecordarmeChange = (e) => {
        setRecordarmeIsTrue(e.target.checked);
    };

    return (
        <div className="containerFormulario">
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
            >
                <Form>
                    <h1 className="TituloSolicitud">
                        Solicitud de Evento Global
                    </h1>
                    <label>Asunto:</label>
                    <Field type="text" name="asunto" />
                    <ErrorMessage
                        name="asunto"
                        component="div"
                        className="error-messageF"
                    />

                    <div className="Fechas">
                        <label>Fecha de Comienzo:</label>
                        <DatePicker
                            selected={fechaComienzo}
                            onChange={(date) =>
                                handleChange(
                                    date,
                                    fechaFinalización,
                                    fechaRecordatorio
                                )
                            }
                        />
                        <div className="Errores">
                            {errorMessages.errorFechaComienzo}
                        </div>

                        <div className="HoraComienzo">
                            <label>Hora de Comienzo:</label>
                            <Field
                                as="select"
                                name="HorasComienzo"
                                className="ListaHoras"
                            >
                                {Array.from({ length: 13 }, (_, i) => {
                                    const hour = i + 8; // Ajustar el rango de horas
                                    const paddedHour = String(hour).padStart(
                                        2,
                                        "0"
                                    );
                                    return (
                                        <option key={hour} value={paddedHour}>
                                            {paddedHour}
                                        </option>
                                    );
                                })}
                            </Field>
                            <Field
                                as="select"
                                name="MinutosComienzo"
                                className="ListaMinutos"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option
                                        key={i}
                                        value={String(i * 5).padStart(2, "0")}
                                    >
                                        {String(i * 5).padStart(2, "0")}
                                    </option>
                                ))}
                            </Field>

                            <div className="ErroresHoras">
                                {errorMessages.errorHoraComienzo}
                            </div>
                        </div>
                    </div>

                    <div className="Fechas">
                        <label>Fecha de Finalización:</label>
                        <DatePicker
                            selected={fechaFinalización}
                            onChange={(date) =>
                                handleChange(
                                    fechaComienzo,
                                    date,
                                    fechaRecordatorio
                                )
                            }
                        />
                        <div className="Errores">
                            {errorMessages.errorFechaFinalización}
                        </div>

                        <div className="HoraFinalización">
                            <label>Hora de Finalización:</label>
                            <Field
                                as="select"
                                name="HorasFinalización"
                                className="ListaHoras"
                            >
                                {Array.from({ length: 13 }, (_, i) => {
                                    const hour = i + 8; // Ajustar el rango de horas
                                    const paddedHour = String(hour).padStart(
                                        2,
                                        "0"
                                    );
                                    return (
                                        <option key={hour} value={paddedHour}>
                                            {paddedHour}
                                        </option>
                                    );
                                })}
                            </Field>
                            <Field
                                as="select"
                                name="MinutosFinalización"
                                className="ListaMinutos"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option
                                        key={i}
                                        value={String(i * 5).padStart(2, "0")}
                                    >
                                        {String(i * 5).padStart(2, "0")}
                                    </option>
                                ))}
                            </Field>

                            <div className="ErroresHoras">
                                {errorMessages.errorHoraFinalización}
                            </div>
                        </div>
                    </div>

                    <label>Descripción:</label>
                    <Field type="text" name="descripción" />
                    <ErrorMessage
                        name="descripción"
                        component="div"
                        className="error-messageF"
                    />

                    <div>
                        <label>
                            Todo el Día
                            <Field type="checkbox" name="todoElDia" />
                        </label>
                    </div>

                    <div>
                        <label>
                            Recordarme
                            <Field
                                type="checkbox"
                                name="recordarme"
                                checked={recordarmeIsTrue}
                                onChange={handleRecordarmeChange}
                            />
                        </label>
                    </div>

                    {recordarmeIsTrue && (
                        <div className="Fechas">
                            <label>Fecha de Recordatorio:</label>
                            <DatePicker
                                selected={fechaRecordatorio}
                                onChange={(date) =>
                                    handleChange(
                                        fechaComienzo,
                                        fechaFinalización,
                                        date
                                    )
                                }
                            />
                            <div className="Errores">
                                {errorMessages.errorFechaRecordatorio}
                            </div>

                            <div className="HoraRecordatorio">
                                <label>Hora de Recordatorio:</label>
                                <Field
                                    as="select"
                                    name="HorasRecordatorio"
                                    className="ListaHoras"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option
                                            key={i}
                                            value={String(i).padStart(2, "0")}
                                        >
                                            {String(i).padStart(2, "0")}
                                        </option>
                                    ))}
                                </Field>
                                <Field
                                    as="select"
                                    name="MinutosRecordatorio"
                                    className="ListaMinutos"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option
                                            key={i}
                                            value={String(i * 5).padStart(
                                                2,
                                                "0"
                                            )}
                                        >
                                            {String(i * 5).padStart(2, "0")}
                                        </option>
                                    ))}
                                </Field>

                                <div className="ErroresHoras">
                                    {errorMessages.errorHoraRecordatorio}
                                </div>
                            </div>
                        </div>
                    )}

                    <label>Organizador:</label>
                    <Field type="text" name="organizador" />

                    <label>Prioridad:</label>
                    <Field as="select" name="prioridad">
                        <option value="Baja" label="Baja" />
                        <option value="Normal" label="Normal" />
                        <option value="Alta" label="Alta" />
                    </Field>

                    <div>
                        <label>
                            Privado
                            <Field type="checkbox" name="privado" />
                        </label>
                    </div>

                    <label>Sensibilidad:</label>
                    <Field as="select" name="sensibilidad">
                        <option value="Baja" label="Baja" />
                        <option value="Normal" label="Normal" />
                        <option value="Alta" label="Alta" />
                    </Field>

                    <label>Tipo:</label>

                    <button type="submit">Solicitar Evento Global</button>
                </Form>
            </Formik>
        </div>
    );
}

export default SolicitarEventoGlobal;
