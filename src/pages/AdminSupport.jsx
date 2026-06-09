import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Power, User, Mail, Calendar, Loader2 } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';

const AdminSupport = () => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('open'); // 'open', 'closed'

  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all chat sessions (Poll every 5 seconds)
  useEffect(() => {
    if (!token) return;

    const fetchSessions = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await API.get('/support/sessions', config);
        setSessions(res.data);
      } catch (err) {
        console.error('Error fetching chat sessions:', err.message);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions(); // fetch immediately
    const interval = setInterval(fetchSessions, 5000);

    return () => clearInterval(interval);
  }, [token]);

  // Fetch messages for the selected session (Poll every 3 seconds)
  useEffect(() => {
    if (!activeSession?.id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/support/messages/${activeSession.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching chat messages:', err.message);
      }
    };

    fetchMessages(); // fetch immediately
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeSession?.id) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    // Append locally immediately for responsiveness
    const tempMsg = {
      id: Date.now(),
      session_id: activeSession.id,
      message: textToSend,
      sender_type: 'admin',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await API.post('/support/message', {
        sessionId: activeSession.id,
        message: textToSend,
        senderType: 'admin'
      }, config);
    } catch (err) {
      console.error('Error sending message:', err.message);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession?.id) return;
    if (!window.confirm('Are you sure you want to end this customer support chat?')) return;

    try {
      const res = await API.post(`/support/session/${activeSession.id}/close`);
      // Update active session locally
      setActiveSession(res.data);
      // Update sessions list locally
      setSessions(prev => prev.map(s => s.id === activeSession.id ? res.data : s));
    } catch (err) {
      console.error('Error closing session:', err.message);
    }
  };

  // Filtered sessions
  const filteredSessions = sessions.filter(s => s.status === filter);

  // Helper to get sender name
  const getSessionName = (session) => {
    if (session.user) return session.user.name;
    return session.guest_name || 'Guest Customer';
  };

  // Helper to get sender email
  const getSessionEmail = (session) => {
    if (session.user) return session.user.email;
    return session.guest_email || 'No Email';
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      
      {/* Page Title */}
      <div className="border-b border-brand-border dark:border-zinc-800 pb-4 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
          Support Desk Portal
        </h1>
        <p className="text-[10px] font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading mt-0.5">
          Moderate active support chats and consultation tickets
        </p>
      </div>

      {/* Main Split Window */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
        
        {/* Left Column: Sessions Directory */}
        <div className="lg:col-span-1 border-r border-brand-border dark:border-zinc-800 flex flex-col h-full bg-brand-bg-grey/10 dark:bg-zinc-950/10">
          {/* Filters tabs */}
          <div className="flex border-b border-brand-border dark:border-zinc-800 flex-shrink-0">
            <button
              onClick={() => setFilter('open')}
              className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-wider font-heading transition-colors border-b-2 cursor-pointer ${
                filter === 'open'
                  ? 'border-brand-blue text-brand-blue bg-white dark:bg-zinc-900'
                  : 'border-transparent text-brand-grey dark:text-gray-400 hover:text-brand-dark dark:hover:text-white'
              }`}
            >
              Active Chats ({sessions.filter(s => s.status === 'open').length})
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-wider font-heading transition-colors border-b-2 cursor-pointer ${
                filter === 'closed'
                  ? 'border-brand-blue text-brand-blue bg-white dark:bg-zinc-900'
                  : 'border-transparent text-brand-grey dark:text-gray-400 hover:text-brand-dark dark:hover:text-white'
              }`}
            >
              Archived ({sessions.filter(s => s.status === 'closed').length})
            </button>
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-20 text-brand-grey">
                <Loader2 className="animate-spin mr-2" size={18} />
                <span className="text-xs font-semibold uppercase">Loading tickets...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-20 text-brand-grey dark:text-gray-400 text-xs">
                No {filter} support tickets found.
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = activeSession?.id === session.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className={`w-full text-left p-3.5 border rounded-lg transition-all flex flex-col gap-1.5 cursor-pointer relative ${
                      isActive
                        ? 'border-brand-blue bg-blue-50/20 dark:bg-zinc-800/40 ring-1 ring-brand-blue/10'
                        : 'border-brand-border dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-brand-bg-grey dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-brand-dark dark:text-gray-200 truncate pr-2">
                        {getSessionName(session)}
                      </span>
                      {session.status === 'open' && (
                        <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse mt-1" />
                      )}
                    </div>
                    
                    <span className="text-[9px] text-brand-grey dark:text-gray-450 truncate block">
                      {getSessionEmail(session)}
                    </span>
                    
                    <span className="text-[8px] text-brand-grey dark:text-gray-500 uppercase font-medium mt-1">
                      Updated: {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window log */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-zinc-900">
          
          {activeSession ? (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Active Conversation Header */}
              <div className="border-b border-brand-border dark:border-zinc-800 p-4 flex justify-between items-center bg-brand-bg-grey/5 dark:bg-zinc-950/5 flex-shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-extrabold text-brand-dark dark:text-white uppercase tracking-wider font-heading">
                      {getSessionName(activeSession)}
                    </h3>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      activeSession.status === 'open'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900'
                        : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-450 border border-brand-border dark:border-zinc-800'
                    }`}>
                      {activeSession.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-brand-grey dark:text-gray-450">
                    <span className="flex items-center gap-1"><Mail size={10} /> {getSessionEmail(activeSession)}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> Started: {new Date(activeSession.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {activeSession.status === 'open' && (
                  <button
                    onClick={handleCloseSession}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-brand-accent hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-900/60 rounded text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Power size={11} /> End Chat
                  </button>
                )}
              </div>

              {/* Message Log logs */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-bg-grey/10 dark:bg-zinc-950/10 pr-2">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-brand-grey text-xs">
                    Connection secure. Type below to respond.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.sender_type === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[70%] ${isSelf ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs break-words shadow-xs border ${
                            isSelf
                              ? 'bg-brand-blue text-white rounded-tr-none border-brand-blue/30'
                              : 'bg-white dark:bg-zinc-850 text-brand-dark dark:text-gray-200 rounded-tl-none border-brand-border dark:border-zinc-800'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-[8px] text-brand-grey dark:text-gray-450 mt-1 uppercase">
                          {isSelf ? 'Admin Response' : 'Customer Query'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin Input Form */}
              {activeSession.status === 'open' ? (
                <form onSubmit={handleSendMessage} className="border-t border-brand-border dark:border-zinc-800 p-4 flex gap-2.5 bg-white dark:bg-zinc-900 flex-shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type support reply..."
                    className="flex-1 px-3.5 py-2.5 border border-brand-border dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-850 text-brand-dark dark:text-gray-150 focus:outline-none focus:border-brand-blue"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white p-3 rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Send size={15} />
                  </button>
                </form>
              ) : (
                <div className="bg-gray-50 dark:bg-zinc-950 p-4 text-center border-t border-brand-border dark:border-zinc-800 text-[10px] text-brand-grey dark:text-gray-400 font-extrabold uppercase tracking-widest flex-shrink-0">
                  ⚠️ This support chat session has been closed.
                </div>
              )}

            </div>
          ) : (
            /* No conversation selected placeholder */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-zinc-800 text-brand-blue dark:text-blue-400 rounded-full border border-blue-100 dark:border-zinc-700 shadow-xs">
                <MessageSquare size={36} />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-sm font-bold text-brand-dark dark:text-white uppercase tracking-wider font-heading">
                  No Session Selected
                </h4>
                <p className="text-xs text-brand-grey dark:text-gray-400 leading-relaxed font-medium">
                  Select an active customer ticket from the sidebar directory to view transcripts and dispatch replies.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminSupport;
