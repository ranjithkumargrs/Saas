import { ArrowLeft, FileText, MoreVertical, Paperclip, Phone, Search, Send, Smile, Video, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import useLocalStorage from '../hooks/useLocalStorage'

const sampleMessages = [
  { id: 'john-1', own: true, text: 'Lorem Ipsum is simply', time: '09:02 PM' },
  { id: 'john-2', own: true, text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', time: '09:02 PM' },
  { id: 'john-3', own: false, images: ['/Saas/Table.png', '/Saas/Table (1).png'], time: '09:03 PM' },
  { id: 'john-5', own: true, text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', time: '09:04 PM' },
]

const initialChats = [
  { id: 'shelby', person: 'Shelby Goode', time: '1 min ago', type: 'personal', avatar: 6, online: true, preview: 'Lorem Ipsum is simply dummy text of the printing', messages: [] },
  { id: 'robert', person: 'Robert Bacins', time: '9 min ago', type: 'personal', avatar: 2, online: false, preview: 'Lorem Ipsum is simply dummy text of the printing', messages: [] },
  { id: 'john', person: 'John Carilo', time: '15 min ago', type: 'personal', avatar: 9, online: true, preview: 'Lorem Ipsum is simply dummy text of the printing', messages: sampleMessages },
  { id: 'adriene', person: 'Adriene Watson', time: '21 min ago', type: 'personal', avatar: 4, online: true, preview: 'Lorem Ipsum is simply dummy text of the printing', messages: [] },
  { id: 'jhon', person: 'Jhon Deo', time: '29 min ago', type: 'personal', avatar: 0, online: true, preview: 'Lorem Ipsum is simply dummy text of the printing', messages: [] },
  { id: 'mark', person: 'Mark Ruffalo', time: '45 min ago', type: 'personal', avatar: 6, online: true, preview: 'Lorem Ipsum is simply dummy text of the printing', messages: [] },
  { id: 'bethany', person: 'Bethany Jackson', time: '1h ago', type: 'personal', avatar: 8, online: true, preview: 'Lorem Ipsum is simply dummy text of the printing', messages: [] },
  { id: 'design-team', person: 'Design Team', time: '12 min ago', type: 'team', avatar: null, online: true, preview: 'Maya: The new mockups are ready to review', messages: [] },
  { id: 'product-team', person: 'Product Team', time: '34 min ago', type: 'team', avatar: null, online: true, preview: 'Alex: Thanks for the update!', messages: [] },
]

const tabs = ['All', 'Personal', 'Teams']
const emojis = ['😀', '🙂', '😂', '👍', '❤️', '🎉']

function getInitials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2)
}

function MessageAvatar({ chat, size = 'normal' }) {
  return chat.type === 'team'
    ? <span className={`chat-avatar chat-avatar-team ${size}`}>{getInitials(chat.person)}</span>
    : <span className={`chat-avatar chat-avatar-person ${size}`} style={{ '--chat-avatar-index': chat.avatar }} />
}

export default function Messages() {
  const [chats, setChats] = useLocalStorage('saas-dashboard-message-chats', initialChats)
  const [selectedId, setSelectedId] = useState('john')
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('Personal')
  const [draft, setDraft] = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [notice, setNotice] = useState('')
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false)
  const fileInput = useRef(null)
  const draftInput = useRef(null)
  const threadRef = useRef(null)
  const shouldScrollRef = useRef(false)

  const visibleChats = useMemo(() => chats.filter((chat) => {
    const matchesTab = activeTab === 'All' || (activeTab === 'Teams' ? chat.type === 'team' : chat.type === 'personal')
    const matchesQuery = `${chat.person} ${chat.preview}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesTab && matchesQuery
  }), [activeTab, chats, query])
  const activeChat = chats.find((chat) => chat.id === selectedId) || chats[0]

  useEffect(() => {
    if (shouldScrollRef.current && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
      shouldScrollRef.current = false
    }
  }, [activeChat?.id, activeChat?.messages])

  const selectChat = (chat) => {
    setSelectedId(chat.id)
    setMobileConversationOpen(true)
    setShowNewMessage(false)
    setShowMore(false)
    if (chat.unread) setChats((current) => current.map((item) => item.id === chat.id ? { ...item, unread: false } : item))
  }

  const send = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text && !pendingFile) return
    const time = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date())
    const newMessage = {
      id: `message-${Date.now()}`,
      own: true,
      ...(text ? { text } : {}),
      ...(pendingFile ? { fileName: pendingFile.name, fileType: pendingFile.type } : {}),
      time,
    }
    shouldScrollRef.current = true
    setChats((current) => current.map((chat) => chat.id === selectedId
      ? { ...chat, preview: text || pendingFile.name, time: 'now', messages: [...chat.messages, newMessage] }
      : chat))
    setDraft('')
    setPendingFile(null)
    setShowEmoji(false)
    if (fileInput.current) fileInput.current.value = ''
  }

  const startConversation = (chat) => {
    if (!chat.messages.length) {
      setChats((current) => current.map((item) => item.id === chat.id ? { ...item, messages: [], unread: false } : item))
    }
    selectChat(chat)
    setQuery('')
  }

  const insertEmoji = (emoji) => {
    setDraft((current) => `${current}${emoji}`)
    setShowEmoji(false)
    draftInput.current?.focus()
  }

  const clearConversation = () => {
    setChats((current) => current.map((chat) => chat.id === selectedId
      ? { ...chat, messages: [], preview: 'Start a conversation', time: 'now' }
      : chat))
    setShowMore(false)
  }

  return (
    <div className={`messages-layout ${mobileConversationOpen ? 'messages-conversation-open' : ''}`}>
      <aside className="panel chat-list" aria-label="Conversations">
        <div className="chat-list-heading">
          <h1>Message</h1>
          <button className="round-add" aria-label="New message" onClick={() => setShowNewMessage(true)}>+</button>
        </div>
        <label className="search-field chat-search">
          <Search size={16} />
          <input placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search conversations" />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}
        </label>
        <div className="chat-tabs" role="tablist" aria-label="Conversation type">
          {tabs.map((tab) => (
            <button type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} key={tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="chat-previews">
          {visibleChats.map((chat) => (
            <button type="button" className={`chat-preview ${chat.id === selectedId ? 'chat-selected' : ''}`} key={chat.id} onClick={() => selectChat(chat)}>
              <span className="chat-preview-avatar">
                <MessageAvatar chat={chat} />
                {chat.type === 'personal' && <i className={chat.online ? 'online' : 'offline'} />}
              </span>
              <span className="chat-preview-copy"><b>{chat.person}</b><small>{chat.preview}</small></span>
              <span className="chat-preview-meta"><i>{chat.time}</i>{chat.unread && <b aria-label="Unread messages" />}</span>
            </button>
          ))}
          {visibleChats.length === 0 && <p className="chat-empty">No conversations found.</p>}
        </div>
      </aside>

      <section className="panel chat-window" aria-label={`Conversation with ${activeChat.person}`}>
        <header className="chat-header">
          <button className="chat-back" aria-label="Back to conversations" onClick={() => setMobileConversationOpen(false)}><ArrowLeft size={18} /></button>
          <span className="chat-header-avatar">
            <MessageAvatar chat={activeChat} />
            {activeChat.type === 'personal' && <i className={activeChat.online ? 'online' : 'offline'} />}
          </span>
          <span className="chat-header-copy"><b>{activeChat.person}</b><small>{activeChat.type === 'team' ? 'Team conversation' : activeChat.online ? 'Online' : 'Offline'}</small></span>
          <div className="chat-header-actions">
            <button aria-label="Voice call" onClick={() => setNotice('Voice calls are not available in this demo yet.')}><Phone size={17} /></button>
            <button aria-label="Video call" onClick={() => setNotice('Video calls are not available in this demo yet.')}><Video size={17} /></button>
            <span className="chat-more-wrap">
              <button aria-label="More options" aria-expanded={showMore} onClick={() => setShowMore((current) => !current)}><MoreVertical size={17} /></button>
              {showMore && <span className="chat-more-menu" role="menu">
                <button role="menuitem" onClick={() => { setChats((current) => current.map((chat) => chat.id === selectedId ? { ...chat, unread: !chat.unread } : chat)); setShowMore(false) }}>Toggle unread</button>
                <button role="menuitem" onClick={clearConversation}>Clear conversation</button>
              </span>}
            </span>
          </div>
        </header>
        {notice && <div className="chat-notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={14} /></button></div>}

        <div ref={threadRef} className={`chat-thread ${activeChat.id === 'john' && activeChat.messages.length ? 'chat-thread-reference' : ''}`} aria-live="polite">
          {activeChat.messages.map((item, index) => {
            const previous = activeChat.messages[index - 1]
            const next = activeChat.messages[index + 1]
            const showAvatar = !item.own && !item.images && (!previous || previous.own)
            const showGroupAvatar = item.own && (!next || !next.own) && activeChat.id === 'john'
            const showTime = !item.own || !next || !next.own
            return (
              <div className={`message-line ${item.own ? 'message-own' : 'message-incoming'} ${item.own && next?.own ? 'message-group-start' : ''} ${item.images || item.fileName ? 'message-attachment' : ''}`} key={item.id}>
                {showAvatar && <span className="message-sender-avatar"><MessageAvatar chat={activeChat} size="small" /></span>}
                {item.images
                  ? <span className="message-image-gallery">{item.images.map((image, imageIndex) => <span className={`message-image message-image-crop-${imageIndex}`} role="img" aria-label="Shared dashboard preview" key={image} />)}</span>
                  : item.fileName
                    ? <span className="message-file"><FileText size={18} /><span><b>{item.fileName}</b><small>{item.fileType || 'File attachment'}</small></span></span>
                    : <p>{item.text}{showTime && <small>{item.time}</small>}</p>}
                {showGroupAvatar && <span className="message-sender-avatar message-group-avatar"><MessageAvatar chat={activeChat} size="small" /></span>}
              </div>
            )
          })}
          {activeChat.messages.length === 0 && <p className="chat-thread-empty">Send a message to start the conversation.</p>}
        </div>

        {pendingFile && <div className="pending-attachment"><FileText size={15} /><span>{pendingFile.name}</span><button aria-label="Remove attachment" onClick={() => { setPendingFile(null); if (fileInput.current) fileInput.current.value = '' }}><X size={14} /></button></div>}
        {showEmoji && <div className="emoji-picker" role="group" aria-label="Choose an emoji">{emojis.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)}>{emoji}</button>)}</div>}
        <form className="message-composer" onSubmit={send}>
          <input ref={fileInput} className="chat-file-input" type="file" aria-label="Choose attachment" onChange={(event) => setPendingFile(event.target.files?.[0] || null)} />
          <button type="button" aria-label="Attach file" onClick={() => fileInput.current?.click()}><Paperclip size={18} /></button>
          <textarea ref={draftInput} placeholder="Type a message..." value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Type a message" rows={1} onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form.requestSubmit()
            }
          }} />
          <button type="button" aria-label="Add emoji" aria-expanded={showEmoji} onClick={() => setShowEmoji((current) => !current)}><Smile size={17} /></button>
          <button className="send-message" type="submit" aria-label="Send message" disabled={!draft.trim() && !pendingFile}><Send size={17} fill="currentColor" /></button>
        </form>
      </section>

      {showNewMessage && (
        <Modal title="New message" onClose={() => setShowNewMessage(false)}>
          <div className="new-chat-list">
            <label className="search-field">
              <Search size={15} />
              <input aria-label="Search people and teams" placeholder="Search people and teams" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            {chats.filter((chat) => `${chat.person} ${chat.type}`.toLowerCase().includes(query.toLowerCase())).map((chat) => (
              <button type="button" key={chat.id} onClick={() => startConversation(chat)}>
                <MessageAvatar chat={chat} />
                <span><b>{chat.person}</b><small>{chat.type === 'team' ? 'Team' : 'Personal'}</small></span>
              </button>
            ))}
          </div>
          <div className="new-chat-actions"><Button variant="outline" type="button" onClick={() => { setQuery(''); setShowNewMessage(false) }}>Cancel</Button></div>
        </Modal>
      )}
    </div>
  )
}
