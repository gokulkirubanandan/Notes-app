import { useState, useEffect, useRef } from "react";

const genId = () => `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const STORAGE_KEY = "notesapp_v2";
const loadNotes = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
const saveNotes = (notes) => localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
const formatDate = (ts) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const CARD_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-pink-500",
  "from-cyan-500 to-sky-600",
  "from-lime-500 to-green-600",
];
const CARD_BG = [
  "bg-violet-50 border-violet-200","bg-rose-50 border-rose-200","bg-amber-50 border-amber-200",
  "bg-emerald-50 border-emerald-200","bg-sky-50 border-sky-200","bg-fuchsia-50 border-fuchsia-200",
  "bg-cyan-50 border-cyan-200","bg-lime-50 border-lime-200",
];
const ACCENT_TEXT = [
  "text-violet-700","text-rose-700","text-amber-700","text-emerald-700",
  "text-sky-700","text-fuchsia-700","text-cyan-700","text-lime-700"
];
const noteColorIndex = {};
const getNoteColor = (id) => {
  if (noteColorIndex[id] === undefined)
    noteColorIndex[id] = Object.keys(noteColorIndex).length % CARD_GRADIENTS.length;
  return noteColorIndex[id];
};
const TAG_STYLES = [
  "bg-violet-100 text-violet-700","bg-rose-100 text-rose-700","bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700","bg-sky-100 text-sky-700","bg-fuchsia-100 text-fuchsia-700",
];
const tagStyleMap = {};
const getTagStyle = (tag) => {
  if (!tagStyleMap[tag]) tagStyleMap[tag] = TAG_STYLES[Object.keys(tagStyleMap).length % TAG_STYLES.length];
  return tagStyleMap[tag];
};

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
const XIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const ArchiveIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>;
const RestoreIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>;
const PinIcon = ({ filled }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>;
const TagIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>;
const MenuIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>;

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl p-6 mx-4 max-w-sm w-full animate-bounce-in">
      <div className="text-4xl text-center mb-3">⚠️</div>
      <p className="text-gray-800 font-bold text-center mb-1 text-lg" style={{fontFamily:"'Syne',sans-serif"}}>Are you sure?</p>
      <p className="text-gray-500 text-sm text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all text-sm">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all text-sm">Delete</button>
      </div>
    </div>
  </div>
);

const NoteModal = ({ mode, note, onSave, onClose }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(note?.tags || []);
  const [isEditing, setIsEditing] = useState(mode !== "view");
  const titleRef = useRef();
  const ci = note ? getNoteColor(note.id) : 0;

  useEffect(() => { if (isEditing && titleRef.current) titleRef.current.focus(); }, [isEditing]);

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase().replace(/,/g,"");
      if (t && !tags.includes(t)) setTags([...tags, t]);
      setTagInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col animate-modal-in">
        <div className={`bg-gradient-to-r ${CARD_GRADIENTS[ci]} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
              {mode==="create"?"✨ New Note":isEditing?"✏️ Editing":"📖 Reading"}
            </span>
            <div className="flex gap-2">
              {mode==="view"&&!isEditing&&(
                <button onClick={()=>setIsEditing(true)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all"><EditIcon/></button>
              )}
              <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all"><XIcon/></button>
            </div>
          </div>
          {isEditing
            ? <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give your note a title..." className="w-full bg-transparent text-white text-2xl font-black placeholder-white/50 outline-none" style={{fontFamily:"'Syne',sans-serif"}}/>
            : <h2 className="text-white text-2xl font-black" style={{fontFamily:"'Syne',sans-serif"}}>{note?.title}</h2>
          }
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {isEditing ? (
            <>
              <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="What's on your mind? Start typing... ✍️" rows={7} className="w-full text-gray-600 placeholder-gray-300 outline-none resize-none text-sm leading-relaxed"/>
              <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100">
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map(t=>(
                    <span key={t} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getTagStyle(t)}`}>
                      #{t}<button onClick={()=>setTags(tags.filter(x=>x!==t))} className="hover:opacity-60"><XIcon/></button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border-2 border-gray-100 focus-within:border-violet-300 transition-colors">
                  <TagIcon/>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add tags and press Enter..." className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"/>
                </div>
              </div>
            </>
          ) : (
            <>
              {note?.content
                ? <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                : <p className="text-gray-300 text-sm italic text-center py-8">No content added yet.</p>
              }
              {note?.tags?.length>0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-dashed border-gray-100">
                  {note.tags.map(t=><span key={t} className={`px-3 py-1 rounded-full text-xs font-bold ${getTagStyle(t)}`}>#{t}</span>)}
                </div>
              )}
            </>
          )}
        </div>
        {isEditing && (
          <div className="p-4 border-t border-gray-100 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={()=>{if(title.trim())onSave({title:title.trim(),content:content.trim(),tags})}} disabled={!title.trim()}
              className={`flex-1 py-3 rounded-2xl bg-gradient-to-r ${CARD_GRADIENTS[ci]} text-white font-bold text-sm disabled:opacity-40 hover:shadow-lg hover:scale-[1.02] transition-all`}>
              Save Note 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const NoteCard = ({ note, view, onPin, onView, onEdit, onArchive, onTrash, onRestore, onDeletePermanent }) => {
  const ci = getNoteColor(note.id);
  return (
    <div className={`relative group ${CARD_BG[ci]} rounded-3xl border-2 p-4 cursor-pointer hover:scale-[1.03] hover:shadow-xl transition-all duration-200`}
      onClick={()=>view!=="trash"&&onView(note)}>
      <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${CARD_GRADIENTS[ci]} mb-3`}/>
      {note.pinned&&(
        <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[ci]} flex items-center justify-center shadow-lg`}>
          <span className="text-white text-xs">📌</span>
        </div>
      )}
      <h3 className={`font-black text-base leading-tight line-clamp-2 mb-2 ${ACCENT_TEXT[ci]}`} style={{fontFamily:"'Syne',sans-serif"}}>{note.title}</h3>
      {note.content&&<p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-3">{note.content}</p>}
      {note.tags?.length>0&&(
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0,3).map(t=><span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getTagStyle(t)}`}>#{t}</span>)}
          {note.tags.length>3&&<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">+{note.tags.length-3}</span>}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400 font-medium">{formatDate(note.updatedAt)}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e=>e.stopPropagation()}>
          {view==="notes"&&<>
            <button onClick={()=>onPin(note.id)} className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${note.pinned?`bg-gradient-to-br ${CARD_GRADIENTS[ci]} text-white`:"bg-white/80 text-gray-400 hover:bg-white"}`}><PinIcon filled={note.pinned}/></button>
            <button onClick={()=>onEdit(note)} className="w-7 h-7 rounded-xl bg-white/80 hover:bg-white text-gray-400 flex items-center justify-center transition-all"><EditIcon/></button>
            <button onClick={()=>onArchive(note.id)} className="w-7 h-7 rounded-xl bg-white/80 hover:bg-amber-50 text-gray-400 hover:text-amber-500 flex items-center justify-center transition-all"><ArchiveIcon/></button>
            <button onClick={()=>onTrash(note.id)} className="w-7 h-7 rounded-xl bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all"><TrashIcon/></button>
          </>}
          {view==="archived"&&<>
            <button onClick={()=>onRestore(note.id)} className="w-7 h-7 rounded-xl bg-white/80 hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 flex items-center justify-center transition-all"><RestoreIcon/></button>
            <button onClick={()=>onTrash(note.id)} className="w-7 h-7 rounded-xl bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all"><TrashIcon/></button>
          </>}
          {view==="trash"&&<>
            <button onClick={()=>onRestore(note.id)} className="w-7 h-7 rounded-xl bg-white/80 hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 flex items-center justify-center transition-all"><RestoreIcon/></button>
            <button onClick={()=>onDeletePermanent(note.id)} className="w-7 h-7 rounded-xl bg-white/80 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-all"><TrashIcon/></button>
          </>}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [notes, setNotes] = useState(loadNotes);
  const [view, setView] = useState("notes");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [sidebar, setSidebar] = useState(false);

  useEffect(() => saveNotes(notes), [notes]);

  const allTags = [...new Set(notes.filter(n=>n.status==="notes").flatMap(n=>n.tags||[]))];

  const filtered = notes.filter(n => {
    if(n.status!==view) return false;
    const q = search.toLowerCase();
    return (!q||n.title.toLowerCase().includes(q)||n.content?.toLowerCase().includes(q))
      && (!selectedTag||(n.tags||[]).includes(selectedTag));
  }).sort((a,b) => {
    if(view==="notes"){if(a.pinned&&!b.pinned)return -1;if(!a.pinned&&b.pinned)return 1;}
    return b.updatedAt-a.updatedAt;
  });

  const counts = {
    notes: notes.filter(n=>n.status==="notes").length,
    archived: notes.filter(n=>n.status==="archived").length,
    trash: notes.filter(n=>n.status==="trash").length,
  };

  const createNote = data => { const now=Date.now(); setNotes(p=>[...p,{id:genId(),...data,pinned:false,status:"notes",createdAt:now,updatedAt:now}]); setModal(null); };
  const editNote = (id,data) => { setNotes(p=>p.map(n=>n.id===id?{...n,...data,updatedAt:Date.now()}:n)); setModal(null); };
  const togglePin = id => setNotes(p=>p.map(n=>n.id===id?{...n,pinned:!n.pinned}:n));
  const archiveNote = id => setNotes(p=>p.map(n=>n.id===id?{...n,status:"archived",pinned:false}:n));
  const trashNote = id => setNotes(p=>p.map(n=>n.id===id?{...n,status:"trash",pinned:false}:n));
  const restoreNote = id => setNotes(p=>p.map(n=>n.id===id?{...n,status:"notes"}:n));
  const deletePermanent = id => setConfirm({message:"This note will be gone forever.",onConfirm:()=>{setNotes(p=>p.filter(n=>n.id!==id));setConfirm(null);}});
  const emptyTrash = () => setConfirm({message:`Delete all ${counts.trash} notes permanently?`,onConfirm:()=>{setNotes(p=>p.filter(n=>n.status!=="trash"));setConfirm(null);}});

  const navItems = [
    {id:"notes",label:"All Notes",emoji:"📝",grad:"from-violet-500 to-purple-600"},
    {id:"archived",label:"Archived",emoji:"📦",grad:"from-amber-500 to-orange-500"},
    {id:"trash",label:"Trash",emoji:"🗑️",grad:"from-rose-500 to-red-600"},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-pink-50 flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600&display=swap');
        @keyframes modal-in{from{opacity:0;transform:scale(.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes bounce-in{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes slide-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .animate-modal-in{animation:modal-in .3s cubic-bezier(.34,1.56,.64,1)}
        .animate-bounce-in{animation:bounce-in .4s cubic-bezier(.34,1.56,.64,1)}
        .animate-slide-in{animation:slide-in .4s ease forwards;opacity:0}
        .float{animation:float 3s ease-in-out infinite}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        *{font-family:'Inter',sans-serif}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#DDD6FE;border-radius:99px}
      `}</style>

      {sidebar&&<div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={()=>setSidebar(false)}/>}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-30 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-2xl flex flex-col transition-transform duration-300 ${sidebar?"translate-x-0":"-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg float">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900" style={{fontFamily:"'Syne',sans-serif"}}>NoteBlast</h1>
              <p className="text-xs text-gray-400 font-medium">Your ideas, amplified</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button onClick={()=>{setModal({mode:"create"});setSidebar(false)}}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold py-3.5 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg text-sm">
            <PlusIcon/> Create New Note
          </button>
        </div>

        <div className="px-4 pb-4 grid grid-cols-3 gap-2">
          {navItems.map(({id,emoji})=>(
            <div key={id} className="text-center p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-lg font-black text-gray-800" style={{fontFamily:"'Syne',sans-serif"}}>{counts[id]}</p>
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide capitalize">{id}</p>
            </div>
          ))}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-4">
          {navItems.map(({id,label,emoji,grad})=>(
            <button key={id} onClick={()=>{setView(id);setSelectedTag(null);setSearch("");setSidebar(false)}}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${view===id?`bg-gradient-to-r ${grad} text-white shadow-lg scale-[1.02]`:"text-gray-600 hover:bg-gray-50 hover:scale-[1.01]"}`}>
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
              {counts[id]>0&&<span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${view===id?"bg-white/30 text-white":"bg-gray-100 text-gray-500"}`}>{counts[id]}</span>}
            </button>
          ))}

          {allTags.length>0&&(
            <div className="pt-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-4 mb-2">🏷️ Tags</p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {allTags.map(t=>(
                  <button key={t} onClick={()=>{setView("notes");setSelectedTag(selectedTag===t?null:t);setSidebar(false)}}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 ${selectedTag===t?getTagStyle(t)+" shadow-sm scale-105":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-300 font-medium">✨ All notes saved locally</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white/60 backdrop-blur-xl border-b border-white/60 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600" onClick={()=>setSidebar(true)}><MenuIcon/></button>
          <div className="flex-1 flex items-center bg-white border-2 border-gray-100 rounded-2xl px-4 py-2.5 gap-2 shadow-sm max-w-md focus-within:border-violet-300 transition-colors">
            <SearchIcon/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your notes..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none font-medium"/>
            {search&&<button onClick={()=>setSearch("")} className="text-gray-400 hover:text-gray-600"><XIcon/></button>}
          </div>
          <button onClick={()=>setModal({mode:"create"})}
            className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold px-5 py-2.5 rounded-2xl transition-all hover:scale-105 hover:shadow-lg text-sm">
            <PlusIcon/> New Note
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900" style={{fontFamily:"'Syne',sans-serif"}}>
                {{notes:"📝 All Notes",archived:"📦 Archived",trash:"🗑️ Trash"}[view]}
              </h2>
              {selectedTag&&(
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400 font-medium">Filtered by tag:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTagStyle(selectedTag)}`}>#{selectedTag}</span>
                  <button onClick={()=>setSelectedTag(null)} className="text-gray-400 hover:text-gray-600"><XIcon/></button>
                </div>
              )}
            </div>
            {view==="trash"&&counts.trash>0&&(
              <button onClick={emptyTrash}
                className="text-xs text-red-500 hover:text-white font-bold border-2 border-red-200 hover:bg-red-500 hover:border-red-500 px-4 py-2 rounded-xl transition-all">
                🗑️ Empty Trash
              </button>
            )}
          </div>

          {filtered.length===0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-6xl mb-4 float">{view==="notes"?"🌟":view==="archived"?"📦":"🗑️"}</div>
              <p className="text-xl font-black text-gray-800 mb-1" style={{fontFamily:"'Syne',sans-serif"}}>
                {search||selectedTag?"No matches found!":{notes:"No notes yet!",archived:"Nothing archived!",trash:"Trash is empty!"}[view]}
              </p>
              <p className="text-gray-400 text-sm mb-5">{!search&&!selectedTag&&view==="notes"?"Create your first note and start building ideas 🚀":""}</p>
              {!search&&!selectedTag&&view==="notes"&&(
                <button onClick={()=>setModal({mode:"create"})}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl font-bold text-sm hover:scale-105 hover:shadow-lg transition-all">
                  ✨ Create First Note
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((note,i)=>(
                <div key={note.id} className="animate-slide-in" style={{animationDelay:`${i*40}ms`}}>
                  <NoteCard note={note} view={view}
                    onPin={togglePin} onView={n=>setModal({mode:"view",note:n})}
                    onEdit={n=>setModal({mode:"edit",note:n})}
                    onArchive={archiveNote} onTrash={trashNote}
                    onRestore={restoreNote} onDeletePermanent={deletePermanent}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <button onClick={()=>setModal({mode:"create"})}
          className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-2xl shadow-2xl shadow-violet-300 flex items-center justify-center hover:scale-110 transition-all z-20">
          <PlusIcon/>
        </button>
      </main>

      {modal&&<NoteModal mode={modal.mode} note={modal.note} onClose={()=>setModal(null)}
        onSave={data=>modal.mode==="create"?createNote(data):editNote(modal.note.id,data)}/>}
      {confirm&&<ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}