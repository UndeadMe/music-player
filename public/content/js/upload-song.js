const file_input = document.getElementById("upload-file")
const cover_input = document.getElementById("upload-music-cover")
const musicProfile = document.getElementById("music-profile")
const singerNameInput = document.getElementById("song-name-input")
const musicNameInput = document.getElementById("song-desc-input")
const submit = document.getElementById("submit-button")
const form = document.forms[0]

let music = {   
    id : "" ,
    play : false ,
    time : "" ,
    pathFile : "" , 
    musicCover : "" , 
    singerName : "" , 
    musicName : "" ,
}

submit.disabled = true

//? get file and create file reader 
const getFile = (e , fileType) => {
    const file = e.target.files[0]
    if (file) {
        if (fileType === "audio") {
            if (file.type.includes(fileType)) { createReader(file , fileType) }
            else { alert("please just upload audio") }
        }
        if (fileType === "image") {
            if (file.type.includes(fileType)) createReader(file , fileType)
            else alert("please just upload images")
        }
        file_input.type = "text"
        file_input.type = "file"
    }
}

//? create file reader
const createReader = (file , fileType) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
        setMusicFileInDB(reader.result , fileType)
    }
}

//? set music cover and music path file in inputs in DB
const setMusicFileInDB = (file , fileType) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let tx = db.transaction("musics" , "readonly")
        let store = tx.objectStore("musics")
        let getMusicsReq = store.getAll()
        getMusicsReq.onsuccess = (e) => {
            let reqResult = e.target.result
            //? if : object store (musics) is empty or length === 0 . else : if musics object store has one or two or ... key and value
            if (reqResult.length === 0) {
                
                if (fileType === "audio") {
                    music.pathFile = file
                    music.time = ""
                    createMusicTime(file)
                    alert("Complete the rest of the information to add music")
                    submit.disabled = false
                }
                if (fileType === "image") {
                    music.musicCover = file
                    musicProfile.src = file
                }

            }else {
                let musicFiltred = reqResult.filter(music => {
                    return music.pathFile === file
                });
                if (musicFiltred.length === 0) {

                    if (fileType === "audio") {
                        music.pathFile = file
                        music.time = ""
                        createMusicTime(file)
                        alert("Complete the rest of the information to add music")
                        submit.disabled = false
                    }
                    if (fileType === "image") {
                        music.musicCover = file
                        musicProfile.src = file
                    }
                    
                }else {
                    alert("This music has already been added")
                }
            }
        }
    }
}

//? create time for music with file music
const createMusicTime = (musicFile) => {
    let musicElem = document.createElement("audio")
    musicElem.src = musicFile
    let time ;
    musicElem.onloadedmetadata = () => {
        time = musicElem.duration
        const minut = Math.floor(time / 60)
        let second = Math.floor(time % 60)

        //? put 0 in time example 3:03 
        if (second.toString().length == 1) {
            second = "0" + second
        }

        music.time = `${minut}:${second}`
    }
}

//? generate unique id for music
const generateUniqueId = () => {
    const words = "zxcvbnmasdfghjklqwertyuiop123456789"
    let uniqueId = [] ;
    uniqueId = []
    for(let wordIndex = 0 ; wordIndex < 6 ; wordIndex++) {
        uniqueId.push(words[Math.floor(Math.random() * words.length)])
    }
    return uniqueId.join("")
}

//? put value of inputs in music object
const checkInputs = (e) => {
    e.preventDefault()
    music.singerName = singerNameInput.value 
    music.musicName = musicNameInput.value
    music.musicCover = musicProfile.src
    music.id = generateUniqueId()
    addToDB(music)
}

//? add music to DB
const addToDB = (object) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let tx = db.transaction("musics" , "readwrite")
        let store = tx.objectStore("musics")
        let addMusicReq = store.add(object)
        resetInputs()
        submit.disabled = true 
        alert("Your music has been added")
    }
}

//? reset music object
const resetInputs = () => {
    music.pathFile = ""
    music.musicCover = ""
    music.id = ""
    music.time = ""
    singerNameInput.value = ""
    musicNameInput.value = ""
    musicProfile.src = "public/content/img/profile-default/default.jpg"
}

file_input.addEventListener("change" , (e) => getFile(e , "audio"))
cover_input.addEventListener("change" , (e) => getFile(e , "image"))
form.addEventListener("submit" , checkInputs)