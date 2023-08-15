import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { notesCollection, db } from "./firebase.js"
import { onSnapshot, addDoc, deleteDoc } from "firebase/firestore"
import { doc } from "@firebase/firestore"

export default function App() {
    const [notes, setNotes] = React.useState([])
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    
    const currentNote = 
        notes.find(note => note.id === currentNoteId) 
        || notes[0]

    React.useEffect(() => {
        // Sync up local notes array with the Snapshot (Firebase) Data
        const unsubscribe = onSnapshot(notesCollection, function(snapshot){
            const notesArray = snapshot.docs.map(doc => ({
                ...doc.data() ,
                id: doc.id
            }))
            setNotes(notesArray);
        })
        return unsubscribe
    }, [])

    React.useEffect(() => {
        setCurrentNoteId(React[0]?.id)
    }, [notes])

    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here"
        }
        const noteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(noteRef.id)
    }

    function updateNote(text) {
        setNotes(oldNotes => {
            const newArray = []
            for (let i = 0; i < oldNotes.length; i++) {
                const oldNote = oldNotes[i]
                if (oldNote.id === currentNoteId) {
                    // Put the most recently-modified note at the top
                    newArray.unshift({ ...oldNote, body: text })
                } else {
                    newArray.push(oldNote)
                }
            }
            return newArray
        })
    }

    async function deleteNote(noteId) {
        const docRef = doc(db,"notes", noteId);
        await deleteDoc(docRef)
    }

    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={notes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        <Editor
                            currentNote={currentNote}
                            updateNote={updateNote}
                        />
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
