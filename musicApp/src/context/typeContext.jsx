import { createContext, useEffect, useState } from "react";

export const TypeContext = createContext()

export const TypesProvider = ({ children }) => {
    const [types, setTypes] = useState([]);


    useEffect(() => {

    }, [])
    const data = {
        types,
        setTypes(data) {
            setTypes(data)
        }
    };
    return <TypeContext.Provider value={data}>{children}</TypeContext.Provider>;
};
;