import React, { useState } from "react";
import "../estilos/Sidebar.css";
import { SidebarData } from "./SidebarData.js";

function Sidebar({ id, isAdmin }) {
    const [expandedItem, setExpandedItem] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

    const handleItemClick = (index) => {
        setExpandedItem((prevItem) => (prevItem === index ? null : index));
        setActiveItem((prevItem) => (prevItem === index ? null : index));
    };

    const filteredSidebarData = SidebarData({ id }).filter((item) =>
        isAdmin
            ? item.isAdminSection === "true"
            : item.isAdminSection === "false"
    );

    return (
        <div className="Sidebar">
            <div className="titleAreaPersonalSideBar">Mi Área Personal</div>
            <div>
                <hr></hr>
            </div>
            <ul className="SidebarList">
                {filteredSidebarData.map((val, index) => (
                    <li
                        key={index}
                        className={`containerCompleto ${
                            activeItem === index ? "active" : ""
                        }`}
                        onClick={() => handleItemClick(index)}
                    >
                        <div className="fila">
                            <div className="iconoText">
                                {val.icon} {val.title}
                            </div>
                            {val.childrens && (
                                <span
                                    className={`arrow ${
                                        expandedItem === index ? "down" : "up"
                                    }`}
                                ></span>
                            )}
                        </div>
                        {val.childrens && expandedItem === index && (
                            <ul className="SubmenuList">
                                {val.childrens.map((child, childIndex) => (
                                    <li
                                        key={childIndex}
                                        className="children"
                                        onClick={() =>
                                            (window.location.pathname =
                                                child.link)
                                        }
                                    >
                                        <div>
                                            {child.icon} {child.title}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar;
