import { useCallback,useEffect } from "react";
import {createContext, useState} from "react";
import { postRequest } from "../utils/services";
import { baseUrl } from "../utils/services"; 

export const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [registerError, setRegisterError] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email:"",
    password: "",
});

const [loginError, setLoginError] = useState(null);
const [isLoginLoading, setIsLoginLoading] = useState(false);
const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
});

console.log("User", user);
console.log("loginInfo", loginInfo);

    useEffect(()=>{
    const user = localStorage.getItem("User");

    setUser(JSON.parse(user));
    },[]);

const updateRegisterInfo = useCallback ((info) =>{
    setRegisterInfo(info);
},[]);

const updateLoginInfo = useCallback ((info) =>{
    setLoginInfo(info);
},[]);



// userRegister
    const registerUser = useCallback(async (e) => {
        e.preventDefault();
        setIsRegisterLoading(true)
        setRegisterError(null)

        const response = await postRequest(`${baseUrl}/user/register`, JSON.stringify(registerInfo));

        setIsRegisterLoading(false)

        if(response.error){
        return setRegisterError(response);
        };

        localStorage.setItem("User", JSON.stringify(response))
        setUser(response)
    }, [registerInfo]
    );


// userLogin
    const loginUser = useCallback(async(e) => {
        e.preventDefault();
        
        setIsLoginLoading(true);
        setLoginError(null);

        const response = await postRequest(
            `${baseUrl}/user/login`,
            JSON.stringify(loginInfo)
        );
        
        setIsLoginLoading(false);
        
        if(response.error){
            return setLoginError(response);
        };

        localStorage.setItem("User", JSON.stringify(response));
        setUser(response);

    }, [loginInfo]);
   
   
// userLogout
    const logoutUser = useCallback(()=>{
        localStorage.removeItem("User");
        setUser(null);
    },[])


    return (<AuthContext.Provider value ={{
        user,
        setUser,
        registerInfo,
        updateRegisterInfo,
        registerUser,
        registerError,
        isRegisterLoading,
        loginUser,
        loginError,
        loginInfo,
        updateLoginInfo,
        isLoginLoading,
        logoutUser,
    }}>
        {children}
        </AuthContext.Provider>
    );
};