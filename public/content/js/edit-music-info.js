const songCoverImg = document.getElementById("song-cover-img")
const coverInput = document.getElementById("song-cover-input")
const singerInput = document.getElementById("singer-input")
const musicNameInput = document.getElementById("music-name-input")
const submit = document.getElementById("submit-info")
const form = document.forms[0]

//? get music id from url
const getIdFromUrl = () => {
    const index = location.href.indexOf("=")
    return index === -1 ? location.replace("my-musics.html" , "edit-music.html") : location.href.substring(index+1 , location.href.length)
}

//? upload music information in dom
const uploadMusicJsonInDom = (id) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let tx = db.transaction("musics" , "readonly")
        let store = tx.objectStore("musics")
        let getMusicReq = store.get(id)
        getMusicReq.onsuccess = (e) => {
            let myMusic = e.target.result
            const { musicName , singerName , musicCover } = myMusic
            songCoverImg.src = musicCover
            singerInput.value = singerName
            musicNameInput.value = musicName
            submit.disabled = false
        }
    }
}

//? validation singer input
const validationInputs = (e) => {
    if (e.target.value.trim().length === 0) {
        submit.disabled = true
        e.target.nextElementSibling.classList.add("form-text-animate")
        e.target.nextElementSibling.innerHTML = "Please complete the information"
    }else {
        e.target.nextElementSibling.classList.remove("form-text-animate")
        e.target.nextElementSibling.innerHTML = ""
        if (singerInput.value.trim().length !== 0 && musicNameInput.value.trim().length !== 0) {
            submit.disabled = false
        }else {
            submit.disabled = true
        }
    }
}

//? submit form function 
const submitForm = (e) => {
    e.preventDefault()
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let tx = db.transaction("musics" , "readwrite")
        let store = tx.objectStore("musics")
        let getMusicReq = store.get(getIdFromUrl())
        getMusicReq.onsuccess = (e) => {
            let music = e.target.result
            
            music.musicCover = songCoverImg.src
            music.singerName = singerInput.value
            music.musicName  = musicNameInput.value
            
            let putMusicInDBReq = store.put(music)
            putMusicInDBReq.onsuccess = () => {
                alert("Information successfully saved")
            }
        }
    }
}

//? const upload song cover function
const uploadSongCover = (e) => {
    const file = e.target.files[0]
    if (file) {
        if (file.type.includes("image")) {
            const reader = createReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                songCoverImg.src = reader.result
            }
        }else {
            alert("Please select only photos")
        }
    }
}

//? create file reader and return it
const createReader = () => {
    return new FileReader()
}

window.addEventListener("load" , () => uploadMusicJsonInDom(getIdFromUrl()))
singerInput.addEventListener("keyup" , validationInputs)
musicNameInput.addEventListener("keyup" , validationInputs)
coverInput.addEventListener("change" , uploadSongCover)
form.addEventListener("submit" , submitForm)