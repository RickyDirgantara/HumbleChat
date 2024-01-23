import { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";

export const ChatContext = createContext();

export const ChatContextProvider = ({children, user}) => {
    const [userChat, setUserChat] = useState(null);
    const [isUserChatLoading, setIsUserChatLoading] = useState(false);
    const [userChatError, setIsUserChatError] = useState(null);
    const [potentialChat, setPotentialChat] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    console.log("messages", messages);
    useEffect(()=>{
        const getUsers = async() =>{
            const response = await getRequest(`${baseUrl}/user`);

            if(response.error){
                return console.log("Error fetching users...", response);
            }

            const pChats = response.filter((u) => { 
                let isChatCreated = false;

                if(user?._id === u._id) return false;

                if(userChat){
                    isChatCreated = userChat?.some((chat)=>{
                        return chat.members[0] === u._id || chat.members[1] === u._id

                    })
                }

                return !isChatCreated;
            });
            setPotentialChat(pChats);
        };

        getUsers();

    }, [userChat]);


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
    },[user]);

    useEffect(()=>{
        const getMessage= async()=>{

                setMessagesLoading(true);
                setMessagesError(null);

                const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

                setMessagesLoading(false);

                if(response.error){
                    return setIsMessagesError(response);
                }

                setMessages(response);
            }
     
        getMessage();
    },[currentChat]);

    const updateCurrentChat = useCallback((chat)=>{
        setCurrentChat(chat)
    }, [])

    const createChat = useCallback( async (firstId, secondId)=>{
        const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({
            firstId,
            secondId,
        })
       
        );

        if(response.error){
            return console.log("Error creating chat", response);
        }

        setUserChat((prev)=>[...prev, response]);

    }, []);

    return <ChatContext.Provider value = {{
        userChat,
        isUserChatLoading,
        userChatError,
        potentialChat,
        createChat,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        currentChat,
    }}>
        {children}
    </ChatContext.Provider>

};
