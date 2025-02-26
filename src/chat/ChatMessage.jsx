import React, { useState, useEffect } from "react";
import {
  Avatar,
  Icon,
  Textarea,
  Loading,
  Tooltip,
  Button,
  Popover,
} from "@/components";
import { CopyIcon, ScrollView, Error, EmptyChat, ChatHelp } from "./component";
import { MessageRender } from "./MessageRender";
import { ConfigInfo } from "./ConfigInfo";
import { useGlobal } from "./context";
import { useMesssage, useSendKey, useOptions } from "./hooks";
import { dateFormat } from "./utils";
import avatar from "@/assets/images/avatar-gpt.png";
import styles from "./style/message.module.less";
import { classnames } from "../components/utils";
import { AuthModal } from "./component/AuthModal";
import { AdminPanel } from "./component/AdminPanel";
import { CreateProfileModal } from "./component/CreateProfileModal";
import { useAuth } from "./context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./context/firebase.js";
import { sendChatMessage } from './service/chat';
// import { insertToMongoDB } from './service/mongodb';
 
export function MessageHeader() {
  const { is, setIs, clearMessage, options } = useGlobal();
  const { message } = useMesssage();
  const { messages = [] } = message || {};
  const columnIcon = is.sidebar ? "column-close" : "column-open";
  const { setGeneral } = useOptions();

  const { currentUser } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [adminPanelVisible, setAdminPanelVisible] = useState(false);
  const [createProfileModalVisible, setCreateProfileModalVisible] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const checkUserProfile = async () => {
    if (currentUser) {
      try {
        const response = await fetch(`http://localhost:3001/api/profiles/check/${currentUser.uid}`);
        const data = await response.json();
        setHasProfile(data.exists);
      } catch (error) {
        console.error('Error checking profile:', error);
        setHasProfile(false);
      }
    }
  };

  useEffect(() => {
    checkUserProfile();
  }, [currentUser, createProfileModalVisible]); 
  return (
    <div className={classnames(styles.header)}>
      <Button
        type="icon"
        icon={columnIcon}
        onClick={() => setIs({ sidebar: !is.sidebar })}
      />
      {/* <Button type="icon" icon={columnIcon} onClick={handleInsert} /> */}
      <div className={styles.header_title}>
        {message?.title}
        <div className={styles.length}>{messages.length} messages</div>
      </div>
      <div className={styles.header_bar}>

        {currentUser && (
          <div style={{ marginRight: '10px' }}>
          <Button
            type="primary"
            onClick={() => setCreateProfileModalVisible(true)}
            className={styles.createProfileButton}
          >
            {hasProfile ? 'Edit Profile' : 'Create Profile'}
          </Button>
          </div>
        )}
         

        <Icon
          className={styles.icon}
          type={options.general.theme}
          onClick={() =>
            setGeneral({
              theme: options.general.theme === "light" ? "dark" : "light",
            })
          }
        /> 
         <Icon className={styles.icon} type="clear" onClick={clearMessage} />     
      </div>
    </div>
  );
}

export function EditorMessage() {
  return (
    <div>
      <Textarea rows="3" />
    </div>
  );
}

export function MessageItem(props) {
  const { content, sentTime, role } = props;
  const { removeMessage } = useGlobal();
  return (
    <div className={classnames(styles.item, styles[role])}>
      <Avatar src={role !== "user" && avatar} />
      <div className={classnames(styles.item_content, styles[`item_${role}`])}>
        <div className={styles.item_inner}>
          <div className={styles.item_tool}>
            {/* <div className={styles.item_date}>{dateFormat(sentTime)}</div> */}
            <div className={styles.item_bar}>
              {/* <Tooltip text="Remove Messages">
                <Icon
                  className={styles.icon}
                  type="trash"
                  onClick={removeMessage}
                />
              </Tooltip> */}
              {role === "user" ? (
                <React.Fragment>
                  <Icon className={styles.icon} type="reload" />
                  <Icon className={styles.icon} type="editor" />
                </React.Fragment>
              ) : (
                <CopyIcon value={content} />
              )}
            </div>
          </div>
          <MessageRender>{content}</MessageRender>
        </div>
      </div>
    </div>
  );
}

export function MessageBar() {
  const {
    sendMessage,
    setMessage,
    is,
    options,
    setIs,
    typeingMessage,
    clearTypeing,
    stopResonse,
    setState,
    chat,
    currentChat
  } = useGlobal();
  const { message } = useMesssage();
  const { messages = [] } = message || {};

  const { currentUser } = useAuth();

  const handleSendMessage = async () => {
    console.log({ typeingMessage });
    if (!typeingMessage?.content) return;

    try {
        setIs({ thinking: true });

        // Create a new message object for the user's input
        const userMessage = {
            role: "user",
            content: typeingMessage.content,
            sentTime: new Date().toISOString(),
            id: Date.now(),
            uid: currentUser?.uid || "anonymous",
            userEmail: currentUser?.email || "anonymous",
            persona: chat[currentChat]?.persona || null
        };

        // Create assistant message placeholder
        const assistantMessage = {
            role: "assistant",
            content: "Thinking...",
            sentTime: new Date().toISOString(),
            id: Date.now() + 1,
            uid: currentUser?.uid || "anonymous",
            userEmail: currentUser?.email || "anonymous",
            persona: chat[currentChat]?.persona || null
        };

        // Update chat with both messages immediately
        const updatedMessages = [...messages, userMessage, assistantMessage];
        const updatedChat = [...chat];
        updatedChat[currentChat] = {
            ...chat[currentChat],
            messages: updatedMessages
        };
        setState({ chat: updatedChat });

        clearTypeing(); // Clear input field

        //  Send request to your backend
        const response = await fetch("http://localhost:5001/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                context: typeingMessage.content
            })
        });

        if (!response.ok) throw new Error("Failed to fetch AI response");

        const data = await response.json();
        const aiResponse = JSON.stringify(data.response);

        console.log("AI Response:", aiResponse);

        // Update assistant message with actual response
        const finalAssistantMessage = {
            ...assistantMessage,
            content: aiResponse
        };

        // Update chat with final AI response
        const latestMessages = [...messages, userMessage, finalAssistantMessage];
        const newChat = [...chat];
        newChat[currentChat] = {
            ...chat[currentChat],
            messages: latestMessages
        };

        setState({ chat: newChat });

    } catch (error) {
        console.error("Failed to send message:", error);
    } finally {
        setIs({ thinking: false });
    }
};

  useSendKey(handleSendMessage, options.general.command);
  
  return (
    <div className={styles.bar}>
      {is.thinking && (
        <div className={styles.bar_tool}>
          <div className={styles.bar_loading}>
            <div className="flex-c">
              <span>Thinking</span> <Loading />
            </div>
            <Button
              size="min"
              className={styles.stop}
              onClick={stopResonse}
              icon="stop"
            >
              Stop Response
            </Button>
          </div>
        </div>
      )}
      <div className={styles.bar_inner}>
        <div className={styles.bar_type}>
          <Textarea
            transparent={true}
            rows="3"
            value={typeingMessage?.content || ""}
            onFocus={() => setIs({ inputing: true })}
            onBlur={() => setIs({ inputing: false })}
            placeholder="Enter something...."
            onChange={(value) => setMessage(value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default to avoid new line
                handleSendMessage();
              }
            }}
          />
        </div>
        <div className={styles.bar_icon}>
          {typeingMessage?.content && (
            <Tooltip text="clear">
              <Icon
                className={styles.icon}
                type="cancel"
                onClick={clearTypeing}
              />
            </Tooltip>
          )}
          <Icon className={styles.icon} type="send" onClick={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}

export function MessageContainer() {
  const { message } = useMesssage();
  const { messages = [] } = message || {};
  return (
    <React.Fragment>
      {messages.length ? (
        <div className={styles.container}>
          {messages.map((item, index) => (
            <MessageItem key={index} {...item} />
          ))}
        </div>
      ) : (
        <ChatHelp />
      )}
    </React.Fragment>
  );
}

export function ChatMessage() {
  const { is } = useGlobal();
  return (
    <React.Fragment>
      <div className={styles.message}>
        <MessageHeader />
        <ScrollView>
          <MessageContainer />
          {is.thinking && <Loading />}
        </ScrollView>
        <MessageBar />
      </div>
    </React.Fragment>
  );
}