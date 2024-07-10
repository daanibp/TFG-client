import React, { useState } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import "../estilos/Calendar.css";
import { CiCalendarDate } from "react-icons/ci";
import "dayjs/locale/es";

dayjs.Ls.en.weekStart = 1;
dayjs.locale("es");

function Calendario({ e, startHour, endHour }) {
    const localizer = dayjsLocalizer(dayjs);

    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    const closeModal = () => {
        setSelectedEvent(null);
    };

    const formatDate = (date) => {
        return dayjs(date).format("dddd, D [de] MMMM [de] YYYY [a las] HH:mm");
    };

    const components = {
        event: (props) => {
            return (
                <div>
                    <CiCalendarDate />
                    {props.title}
                </div>
            );
        },
    };

    return (
        <div className="Calendar">
            <Calendar
                localizer={localizer}
                events={e}
                components={components}
                formats={{
                    dayHeaderFormat: (date) => {
                        return dayjs(date).format("dddd @ DD/MM/YYYY");
                    },
                }}
                messages={{
                    next: "Siguiente",
                    previous: "Anterior",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    date: "Fecha",
                    time: "Hora",
                    event: "Evento",
                }}
                min={startHour}
                max={endHour}
                onSelectEvent={handleEventClick}
            />
            {selectedEvent && (
                <div className="event-info-box">
                    <h2>{selectedEvent.title}</h2>
                    <hr></hr>
                    <p>{selectedEvent.descripcion}</p>
                    <p>Fecha de inicio: {formatDate(selectedEvent.start)}</p>
                    <p>Fecha de fin: {formatDate(selectedEvent.end)}</p>

                    <button onClick={closeModal}>Cerrar</button>
                </div>
            )}
        </div>
    );
}

export default Calendario;
