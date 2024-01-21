import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {

    const { userChat,
        isUserChatLoading,
        userChatError} = useContext(ChatContext);

        console.log("UserChat", userChat);
    return ( <>Chat</> );
}
 
export default Chat;