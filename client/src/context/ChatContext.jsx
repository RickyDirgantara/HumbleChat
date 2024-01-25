import { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import {io} from "socket.io-client";
export const ChatContext = createContext();

export const ChatContextProvider = ({children, user}) => {
    const [userChat, setUserChat] = useState(null);
    const [isUserChatLoading, setIsUserChatLoading] = useState(false);
    const [userChatError, setIsUserChatError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null)
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);


    // initial socket

    useEffect(() =>{
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () =>{
            newSocket.disconnect();
        };

    }, [user]);

    // tambah user yang online
    useEffect(() => {
        if(socket === null) return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });

        return () => {
            socket.off("getOnlineUsers");
        };
    }, [socket]);

    // ngirim pesan
    useEffect(() => {
        if(socket === null) return;
        const recipientId = currentChat?.members.find((id) => id !== user?._id);

    socket.emit("sendMessage", {...newMessage, recipientId});
    }, [newMessage]);

    // menerima pesan dan notifikasi
    useEffect(() => {
        if(socket === null) return;
        
        socket.on("getMessage", (res) => {
            if(currentChat?._id !== res.chatId) return;

            setMessages((prev) => [...prev, res]);
        });

        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

            if(isChatOpen){
                setNotifications((prev) => [{ ...res, isRead: true}, ...prev]);
            }else{
                setNotifications((prev) => [res, ...prev]);
            }
        });

        return () =>{
            socket.off("getMessage");
            socket.off("getNotifications");
        };
    }, [socket, currentChat]); 




    useEffect(()=>{
        const getUser = async() =>{
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
            setPotentialChats(pChats);
            setAllUsers(response);
        };

        getUser();

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
    },[user, notifications]);

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

    const sendTextMessage = useCallback(
        async(textMessage, sender, currentChatId, setTextMessage) =>{
        if(!textMessage) return console.log("Nothing to send");

        const response = await postRequest(
            `${baseUrl}/messages`, JSON.stringify({
            chatId: currentChatId,
            senderId: sender._id,
            text: textMessage,
        })
        );

        if (response.error){
            return setSendTextMessageError(response);
        }

        setNewMessage(response);
        setMessages((prev)=> [...prev, response]);
        setTextMessage(" ");

    }, []);

    const updateCurrentChat = useCallback((chat)=>{
        setCurrentChat(chat)
    }, []);

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

    const markAllNotificationsAsRead = useCallback((notifications) => {
        const mNotifications = notifications.map((n) => {
            return {...n, isRead: true}
        });

        setNotifications(mNotifications);
    }, [])

    const markNotificationsAsRead = useCallback(
        (n, userChat, user, notifications) => {


            const desiredChat = userChat.find((chat) => {
                const chatMembers = [user._id, n.senderId];
                const isDesiredChat = chat?.members.every((member) => {
                    return chatMembers.includes(member);
                });
                return isDesiredChat;
            });

            const mNotifications = notifications.map((el) =>{
                if(n.senderId === el.senderId){
                    return {...n, isRead: true}
                } else{
                    return el
                }
            });
            updateCurrentChat(desiredChat);
            setNotifications(mNotifications);
    }, []);

    const markThisUserNotificationsAsRead = useCallback(
        (thisUserNotifications, notifications) => {
        const mNotifications = notifications.map((el) => {
            let notification;

            thisUserNotifications.forEach((n) =>{
                if(n.senderId === el.senderId){
                    notification = {...n, isRead: true};
                }else{
                    notification = el;
                }
            })

            return notification;
        })

        setNotifications(mNotifications);
    }, [])

    return ( <ChatContext.Provider value = {{
        userChat,
        isUserChatLoading,
        userChatError,
        potentialChats,
        createChat,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        currentChat,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationsAsRead,
        markThisUserNotificationsAsRead,
    }}>
        {children}
    </ChatContext.Provider>
    );
};
