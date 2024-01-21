import { createContext, useState, useEffect } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";

export const ChatContext = createContext();

export const ChatContextProvider = ({children, user}) => {
    const [userChat, setUserChat] = useState(null);
    const [isUserChatLoading, setIsUserChatLoading] = useState(false);
    const [userChatError, setIsUserChatError] = useState(null);

    useEffect(()=>{
        const getUserChat = async()=>{
            if(user?._id){

                setIsUserChatLoading(true);
                setIsUserChatError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setIsUserChatLoading(false);

                if(response.error){
                    return setIsUserChatError(response);
                }

                setUserChat(response);
            }
        };
        getUserChat();
    },[user])

    return <ChatContext.Provider value = {{
        userChat,
        isUserChatLoading,
        userChatError,
    }}>
        {children}
    </ChatContext.Provider>

};
