import React from "react";
import SchoolIcon from "@mui/icons-material/School";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { RiAdminFill, RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { RiAdminLine } from "react-icons/ri";
import { FaCalendarPlus } from "react-icons/fa6";
import { AiOutlineGlobal } from "react-icons/ai";
import { SiCachet } from "react-icons/si";

export const SidebarData = ({ id }) => [
    {
        title: "Mi calendario",
        icon: <CalendarMonthIcon />,
        iconClosed: <RiArrowDownSFill />,
        iconOpened: <RiArrowUpSFill />,
        childrens: [
            {
                title: "Mi calendario escolar",
                icon: <SchoolIcon />,
                link: `/calendar/calendarioescolar/${id}`,
            },
            {
                title: "Calendario Global",
                icon: <AiOutlineGlobal />,
                link: "/calendar/calendarioglobal",
            },
            // {
            //     title: "Matrícula",
            //     icon: <SiCachet />,
            //     link: "/matriculas/realizarmatricula",
            // },
        ],
        isAdminSection: "false",
    },
    {
        title: "Administración",
        icon: <RiAdminFill />,
        iconClosed: <RiArrowDownSFill />,
        iconOpened: <RiArrowUpSFill />,
        childrens: [
            {
                title: "Crear administradores",
                icon: <RiAdminLine />,
                link: `/admin/crearadmin`,
            },
            {
                title: "Gestionar calendarios",
                icon: <FaCalendarPlus />,
                link: "/admin/gestioncalendarios",
            },
            // {
            //     title: "Gestionar matrículas",
            //     icon: <SiCachet />,
            //     link: "/admin/gestionmatriculas",
            // },
            {
                title: "Gestionar asignaturas y grupos",
                icon: <SiCachet />,
                link: "/admin/asignargrupos",
            },
        ],
        isAdminSection: "true",
    },
];
