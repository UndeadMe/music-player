const musicPlayerElement = document.getElementById("music-player")
const musicPlayerVolumeTimeLine = document.getElementById("music-player-volume-time-line")
const musicPlayerVolumeIcon = document.getElementById("music-player-volume-icon")
const progressVolume = document.getElementById("progress-css-volume")
const musicPlayerTimeLine = document.getElementById("music-player-time-line")
const musicPlayerTimeLineBox = document.getElementById("music-player-time-line-box")
const musicPlayerTimeStart = document.getElementById("music-player-time-start")
const musicPlayerPlayBtn = document.getElementById("music-player-play-btn")
const musicPlayerImg = document.getElementById("music-player-img")
const musicPlayerSingerName = document.getElementById("music-player-singer-name")
const musicPlayerMusicName = document.getElementById("music-player-music-name")
const musicPlayerTimeEnd = document.getElementById("music-player-time-end")
const playBackRateItem = document.querySelectorAll(".play-back-rate-dropdown-item")
const repeatBtn = document.getElementById("repeat-btn")
const nextBtn = document.getElementById("next-btn")
const prevBtn = document.getElementById("prev-btn")
const searchInput = document.getElementById("search-input")

//? document createElement
const create = (name) => {
    return document.createElement(name)
}

//? get localItem from localStorage
const getStorage = () => {
    return JSON.parse(localStorage.getItem("now-music"))
}

//? cehck indexDB has musics or no
const checkDB = (cond) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = e => {
        db = e.target.result
        let tx = db.transaction("musics" , "readonly")
        let store = tx.objectStore("musics")
        let getAllMusicsReq = store.getAll()

        getAllMusicsReq.onsuccess = (e) => {
            let myMusics = e.target.result
            if (myMusics.length !== 0) {
                //? add false to all musics in musics object store
                myMusics.some(music => {
                    if (music.play) {
                        music.play = false
                        db.transaction("musics", "readwrite").objectStore("musics").put(music)
                    }
                })
                //? if storage is not null or false ... call to music player to upload my music info 
                if (getStorage() && getStorage().length !== 0) {
                    let getMusicReq = db.transaction("musics", "readonly").objectStore("musics").get(getStorage())
                    getMusicReq.onsuccess = e => {
                        //? if result is not null or false or empty or ... call to musicplayer to upload my music info
                        if (e.target.result) {
                            uploadMusicInfoInMusicPlayer(e.target.result)
                            musicPlayerElement.classList.add("active")
                        }else {
                            localStorage.removeItem("now-music")
                            musicPlayerElement.classList.remove("active")
                        }
                    }
                }
                //? upload musics box in dom 
                uploadMusics(myMusics , cond)
            }else {
                createDBError("musics-wrap" , "You do not have a music")
                localStorage.removeItem("now-music")
                musicPlayerElement.classList.remove("active")
            }
        }
    }

    DBreqOp.onupgradeneeded = e => {
        db = e.target.result
        if (!db.objectStoreNames.contains("musics")) {
            db.createObjectStore("musics" , {
                keyPath : "id"
            })
        }
    }
}

//? add false to all musics in indexedDB
const addFalsePlayToAllMusic = () => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let tx = db.transaction("musics", "readwrite")
        let store = tx.objectStore("musics")
        let getAllMusicsReq = store.getAll()
        getAllMusicsReq.onsuccess = (e) => {
            let myMusic = e.target.result
            myMusic.some(music => {
                if (music.play) {
                    music.play = false      
                    db.transaction("musics", "readwrite").objectStore("musics").put(music)
                }
            })
        }
    }
}

//? create errror db . if i don't have any music show this error
const createDBError = (box , msg) => {
    const wrap = document.getElementById(box)

    const col_12 = document.createElement("div")
    col_12.className = "col-12 mt-3"

    const error_box = document.createElement("div")
    error_box.className = "error-box"
    error_box.innerHTML = msg
    col_12.appendChild(error_box)

    const fragment = createFragment()
    fragment.appendChild(col_12)
    wrap.innerText = ""
    wrap.appendChild(fragment)
}

//? create fragment
const createFragment = () => {
    return new DocumentFragment()
}

//? upload box musics in dom
const uploadMusics = (musicsDB , cond) => {
    const musicWrap = document.getElementById("musics-wrap")
    musicWrap.innerText = ""
    const fragment = createFragment()
    
    musicsDB.forEach(musicJson => {
        fragment.appendChild(createMusicBox(musicJson , cond))
    })
    
    musicWrap.appendChild(fragment)
}

//? create music box
const createMusicBox = (musicJson , cond) => {
    let box ;
    cond === true ? box = createMusicBox_window(musicJson) : box = createMusicBox_list(musicJson)
    return box
}

//? create music box like list
const createMusicBox_list = (musicJson) => {
    //? create col-12
    const col_12 = create("div")
    col_12.className = "col-12 mt-4"

    //? create music box
    const musicBox = create("div")
    musicBox.className = "music-box d-flex flex-row"
    musicBox.setAttribute("data-id", musicJson.id)

    //? create singer box
    const musicSingerBox = create("div")
    musicSingerBox.className = "col-3 p-0 music-box-column"

    //? create h5 for music singer name
    const singerH5 = create("h5")
    singerH5.className = "m-0 music-element-singer"
    singerH5.innerHTML = musicJson.singerName

    //? create music description box
    const musicDescBox = create("div")
    musicDescBox.className = "col-3 p-0  music-box-column"

    //? create h5 for put music description
    const musicNameH5 = create("h5")
    musicNameH5.className = "m-0 music-element-name"
    musicNameH5.innerHTML = musicJson.musicName

    //? create music time box
    const musicTimeBox = create("div")
    musicTimeBox.className = "col-3 p-0 music-box-column"

    //? create h5 for put time 
    const timeH5 = create("h5")
    timeH5.className = "m-0 music-element-time"
    timeH5.innerHTML = musicJson.time

    //? create music option box
    const musicOptionBox = create("div")
    musicOptionBox.className = "col-3 p-0 music-box-column justify-content-end"

    //? create music option play button
    const musicOptionPlay = create("button")
    musicOptionPlay.className = "music-options-button music-play-button-play"

    //? if: music is playing, the box of the music is active 
    //? else: the box of music is un active
    if (musicJson.play) {
        musicOptionPlay.innerHTML = "<i class='bx bx-stop'></i>"
        musicBox.classList.add("active")
    }else {
        musicOptionPlay.innerHTML = "<i class='bx bx-play'></i>"
        musicBox.classList.remove("active")
    }
    
    musicOptionPlay.addEventListener("click" , () => playMusic(musicJson.id))

    //? create music option add to play list button
    const musicOptionAddToPl = create("button")
    musicOptionAddToPl.className = "music-options-button"
    musicOptionAddToPl.innerHTML = "<i class='bx bx-list-plus'></i>"

    //? create musicOptionEditHref
    const musicOptionEditHref = create("a")
    musicOptionEditHref.className = "w-100 h-100"
    musicOptionEditHref.innerHTML = "<i class='bx bx-edit'></i>"
    musicOptionEditHref.href = `edit-music.html?music=${musicJson.id}`

    //? create music option edit information button
    const musicOptionEdit = create("button")
    musicOptionEdit.className = "music-options-button"

    //? create music option trash button
    const musicOptionTrash = create("button")
    musicOptionTrash.className = "music-options-button"
    musicOptionTrash.innerHTML = "<i class='bx bxs-trash'></i>"
    musicOptionTrash.addEventListener("click" , () => {
        deleteMusic( musicJson )
        if (music) music.pause()
        playBackRateNumber = 1
    })

    //? append child item in col-12 an return this col-12
    col_12.appendChild(musicBox)
    musicBox.appendChild(musicSingerBox)
    musicSingerBox.appendChild(singerH5)
    musicBox.appendChild(musicDescBox)
    musicDescBox.appendChild(musicNameH5)
    musicBox.appendChild(musicTimeBox)
    musicTimeBox.appendChild(timeH5)
    musicBox.appendChild(musicOptionBox)
    musicOptionBox.appendChild(musicOptionPlay)
    musicOptionBox.appendChild(musicOptionAddToPl)
    musicOptionEdit.appendChild(musicOptionEditHref)
    musicOptionBox.appendChild(musicOptionEdit)
    musicOptionBox.appendChild(musicOptionTrash)

    return col_12
}

//? create muisc box like window
const createMusicBox_window = (musicJson) => {
    //? create music box window
    const music_box_window = create("div")
    music_box_window.className = "col-3 music-box-window mt-5"
    music_box_window.setAttribute("data-id", musicJson.id)

    //? create music box window image box
    const music_box_window_image_box = create("div")
    music_box_window_image_box.className = "music-box-window-img-box col-12 d-flex"

    //? create music box window img
    const music_box_window_img = create("img")
    music_box_window_img.className = "img-fluid music-box-window-img"
    music_box_window_img.src = musicJson.musicCover

    //? create music box window description
    const music_box_window_desc = create("div")
    music_box_window_desc.className = "col-12 d-flex"
    
    //? create music box window left box
    const music_box_window_left_box = create("div")
    music_box_window_left_box.className = "col-8 msuic-box-window-left-box"
    
    //? create singer name as h4
    const singerNameH4 = create("h4")
    singerNameH4.className = "music-box-window-singer-name"
    singerNameH4.innerHTML = musicJson.singerName

    //? create music name as h6
    const musicNameH6 = create("h6")
    musicNameH6.className = "music-box-window-music-name"
    //? create span for music name h6 (first child) for music name
    const spanFirstChild = create("span")
    spanFirstChild.innerHTML = musicJson.musicName
    
    //? create span for music name h6 (second child) for music time
    const spanLastChild = create("span")
    spanLastChild.className = "ms-3"
    spanLastChild.innerHTML = musicJson.time

    //? create music window box right box
    const music_box_window_right_box = create("div")
    music_box_window_right_box.className = "col-4 d-flex align-items-center justify-content-end p-0"
    
    //? create music window dropdown for options
    const music_box_window_dropdown = create("div")
    music_box_window_dropdown.className = "music-box-window-dropdown text-end custom-dropdown"
    music_box_window_dropdown.addEventListener("click", () => {
        music_box_window_dropdown.classList.toggle("active")
    })

    //? create text for dropdown
    const dropdownH2 = create("h2")
    dropdownH2.className = "m-0 p-0"
    dropdownH2.innerHTML = "<i class='bx bx-dots-vertical-rounded text-warning bx-fw m-0'></i>"
    
    //? create music box window dropdown menu
    const music_box_window_dropdown_menu = create("div")
    music_box_window_dropdown_menu.className = "music-box-window-dropdown-menu"
    
    //? create dropdown ul
    const dropdownUl = create("ul")
    dropdownUl.className = "p-0 m-0 list-unstyled"
    
    //? create dropdown menu item play for dropdown ul 
    const music_box_window_dropdown_menu_item_play = create("li")
    music_box_window_dropdown_menu_item_play.className = "music-box-window-dropdown-menu-item text-center music-box-window-play-button"

    if (musicJson.play) {
        music_box_window_dropdown_menu_item_play.innerHTML = "<i class='bx bx-stop'></i>"
        music_box_window.classList.add("active")
    }else {
        music_box_window_dropdown_menu_item_play.innerHTML = "<i class='bx bx-play'></i>"
        music_box_window.classList.remove("active")
    }

    music_box_window_dropdown_menu_item_play.addEventListener("click" , () => playMusic(musicJson.id))

    //? create dropdown menu item edit button for dropdown ul 
    const music_box_window_dropdown_menu_item_edit = create("li")
    music_box_window_dropdown_menu_item_edit.className = "text-center d-flex"
    
    //? create dropdown menu item edit href button for dropdown ul 
    const music_box_window_dropdown_menu_item_edit_href = create("a")
    music_box_window_dropdown_menu_item_edit_href.className = "w-100 h-100 music-box-window-dropdown-menu-item"
    music_box_window_dropdown_menu_item_edit_href.innerHTML = "<i class='bx bx-edit'></i>"
    music_box_window_dropdown_menu_item_edit_href.href = `edit-music.html?id=${musicJson.id}`
    
    //? create dropdown menu item add to play list button for dropdown ul 
    const music_box_window_dropdown_menu_item_add_to_pl = create("li")
    music_box_window_dropdown_menu_item_add_to_pl.className = "music-box-window-dropdown-menu-item text-center"
    music_box_window_dropdown_menu_item_add_to_pl.innerHTML = "<i class='bx bx-list-plus'></i>"

    //? create dropdown menu item trash button for dropdown ul 
    const music_box_window_dropdown_menu_item_trash = create("li")
    music_box_window_dropdown_menu_item_trash.className = "music-box-window-dropdown-menu-item text-center"
    music_box_window_dropdown_menu_item_trash.innerHTML = "<i class='bx bx-trash-alt'></i>"
    music_box_window_dropdown_menu_item_trash.addEventListener("click" , () => {
        deleteMusic( musicJson )
        if (music) music.pause()
        playBackRateNumber = 1
    })

    //? append child item in music box window an return this music box window
    music_box_window.appendChild(music_box_window_image_box)
    music_box_window.appendChild(music_box_window_desc)
    music_box_window_image_box.appendChild(music_box_window_img)
    music_box_window_desc.appendChild(music_box_window_left_box)
    music_box_window_desc.appendChild(music_box_window_right_box)
    music_box_window_left_box.appendChild(singerNameH4)
    music_box_window_left_box.appendChild(musicNameH6)
    musicNameH6.appendChild(spanFirstChild)
    musicNameH6.appendChild(spanLastChild)
    music_box_window_right_box.appendChild(music_box_window_dropdown)
    music_box_window_dropdown.appendChild(dropdownH2)
    music_box_window_dropdown.appendChild(music_box_window_dropdown_menu)
    music_box_window_dropdown_menu.appendChild(dropdownUl)
    dropdownUl.appendChild(music_box_window_dropdown_menu_item_play)
    dropdownUl.appendChild(music_box_window_dropdown_menu_item_edit)
    music_box_window_dropdown_menu_item_edit.appendChild(music_box_window_dropdown_menu_item_edit_href)
    dropdownUl.appendChild(music_box_window_dropdown_menu_item_add_to_pl)
    dropdownUl.appendChild(music_box_window_dropdown_menu_item_trash)

    return music_box_window
}

let music = new Audio()
let repeatMusic = false
//? play music function
const playMusic = (id) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let getAllMusicsReq = db.transaction("musics", "readwrite").objectStore("musics").getAll()
        getAllMusicsReq.onsuccess = (e) => {
            let myMusics = e.target.result
            myMusics.some(musicObj => {
                if (musicObj.id === id) {
                    let musicJson = musicObj
                    
                    let musicBox
                    let playBtn
                    let playBtns 

                    if (windowBoxes) {
                        musicBox = findMusicBox(".music-box-window", musicJson)
                        activeMusicBox(musicBox, ".music-box-window")
                        playBtn = musicBox.children[1].children[1].children[0].children[1].children[0].children[0]
                        playBtns = document.querySelectorAll(".music-box-window-play-button")
                        playBtns.forEach(btn => {
                            if (btn === playBtn) {
                                //? if music is playing pause this music
                                //? else music is not play play this music
                                if (musicJson.play) {
                                    btn.innerHTML = '<i class="bx bx-play"></i>'
                                    musicPlayerPlayBtn.innerHTML = '<i class="bx bx-play"></i>'
                                    addFalsePlayToAllMusic()
                                    music.pause()
                                }else {
                                    btn.innerHTML = '<i class="bx bx-stop"></i>'
                                    localStorage.setItem("now-music" , JSON.stringify(musicJson.id))
                                    addPlayInIndexedDB(musicJson)
                                    uploadMusicInfoInMusicPlayer(musicJson)
                                    music.play()
                                    music.playbackRate = playBackRateNumber
                                    music.ontimeupdate = () => {
                                        if (music.currentTime === music.duration) {
                                            if (repeatMusic) {
                                                music.currentTime = 0
                                                music.play()
                                            }else {
                                                nextMusic(musicJson.id)
                                            }
                                        }
                                    }
                                }
                            }else {
                                btn.innerHTML = '<i class="bx bx-play"></i>'
                            }
                        })
                    }else {
                        musicBox = findMusicBox(".music-box", musicJson)
                        activeMusicBox(musicBox, ".music-box")
                
                        playBtn = musicBox.children[3].children[0]
                        playBtns = document.querySelectorAll(".music-play-button-play")
                        
                        playBtns.forEach(btn => {
                            if (btn === playBtn) {
                                //? if music is playing pause this music
                                //? else music is not play play this music
                                if (musicJson.play) {
                                    btn.innerHTML = '<i class="bx bx-play"></i>'
                                    musicPlayerPlayBtn.innerHTML = '<i class="bx bx-play"></i>'
                                    addFalsePlayToAllMusic()
                                    music.pause()
                                }else {
                                    btn.innerHTML = '<i class="bx bx-stop"></i>'
                                    localStorage.setItem("now-music" , JSON.stringify(musicJson.id))
                                    addPlayInIndexedDB(musicJson)
                                    uploadMusicInfoInMusicPlayer(musicJson)
                                    music.playbackRate = playBackRateNumber
                                    music.play()
                                    music.ontimeupdate = () => {
                                        if (music.currentTime === music.duration) {
                                            if (repeatMusic) {
                                                music.currentTime = 0
                                                music.play()
                                            }else {
                                                nextMusic(musicJson.id)
                                            }
                                        }
                                    }
                                }
                            }else {
                                btn.innerHTML = '<i class="bx bx-play"></i>'
                            }
                        })
                    }
                }
            })
        }
    }
}

//? add play to music in indexedDB
const addPlayInIndexedDB = (musicJson) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        tx = db.transaction("musics", "readwrite")
        store = tx.objectStore("musics")
        request = store.getAll()
        request.onsuccess = (e) => {
            const myMusic = e.target.result
            myMusic.forEach(music => {
                if (music.id === musicJson.id) {
                    music.play = true
                    store.put(music)
                    uploadMusicInfoInMusicPlayer(music)
                }else {
                    music.play = false
                    store.put(music)
                }
            })
        }
    }
}

//? upload information in music player
const uploadMusicInfoInMusicPlayer = (musicJson) => {
    //? upload music info in music player elements
    musicPlayerImg.src = musicJson.musicCover
    musicPlayerSingerName.innerHTML = musicJson.singerName
    musicPlayerMusicName.innerHTML  = musicJson.musicName
    musicPlayerTimeEnd.innerHTML = musicJson.time

    if (music.src !== musicJson.pathFile) music.src = musicJson.pathFile

    if (musicJson.play) {
        musicPlayerElement.classList.add("active")
        musicPlayerPlayBtn.innerHTML = '<i class="bx bx-stop"></i>'
    }else {
        musicPlayerPlayBtn.innerHTML = '<i class="bx bx-play"></i>'
    }
    
    musicPlayerElement.setAttribute("data-id", musicJson.id)
}

//? find music box clicked
const findMusicBox = (musicBoxClass, musicJson) => {
    let musicBoxs = document.querySelectorAll(musicBoxClass)
    let musicBox ;
    Array.from(musicBoxs).some(box => {
        if (box.dataset.id === musicJson.id) {
            musicBox = box
        }
    })
    return musicBox
}

//? next music function 
const nextMusic = (id) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let getAllMusicsReq = db.transaction("musics", "readonly").objectStore("musics").getAll()
        getAllMusicsReq.onsuccess = (e) => {
            let myMusics = e.target.result
            let myMusicIndex = myMusics.findIndex(musicItem => {
                return musicItem.id === id
            })
            let nextMusic = myMusics[myMusicIndex+1]
            nextMusic ? playMusic(nextMusic.id) : playMusic(myMusics[0].id)
        }
    }
}

//? prev music function 
const prevMusic = (id) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let getAllMusicsReq = db.transaction("musics", "readonly").objectStore("musics").getAll()
        getAllMusicsReq.onsuccess = (e) => {
            let myMusics = e.target.result
            let myMusicIndex = myMusics.findIndex(musicItem => {
                return musicItem.id === id
            })
            let prevMusic = myMusics[myMusicIndex-1]
            prevMusic ? playMusic(prevMusic.id) : playMusic(myMusics[myMusics.length - 1].id)
        }
    }
}

//? creaet current time for music time
const createCurrentTime = (currentTime) => {
    let second = Math.floor(currentTime % 60)
    let minut = Math.floor(currentTime / 60)
    if (second.toString().length === 1) {
        second = "0" + second
    }
    return `${minut}:${second}`
}

let heightClicked;

//? change volume time line
const changeVolume = (e) => {
    heightClicked = Number(e.layerY.toString().substr(1,10))
    music.volume = heightClicked / 131
    musicPlayerVolumeTimeLine.style.height = `${Math.floor(heightClicked / 131 * 100)}%`

    heightClicked > 100 ? musicPlayerVolumeIcon.innerHTML = "<i class='bx bx-volume-full'></i>" :
    heightClicked < 100 && heightClicked > 30 ? musicPlayerVolumeIcon.innerHTML = "<i class='bx bx-volume-low'></i>" :
    musicPlayerVolumeIcon.innerHTML = "<i class='bx bx-volume' ></i>"
}

//? set music currentTime based time line width
const setTimeLine = (e) => {
    const width = musicPlayerTimeLineBox.clientWidth
    const clickX = e.offsetX
    music.currentTime = (clickX / width) * music.duration
}

//? setTime line and time Start
const setTimeLineAndTimeStart = () => {
    //? set time line
    musicPlayerTimeLine.style.width = `${(music.currentTime / music.duration) * 100}%`
    //? set time start music
    musicPlayerTimeStart.innerHTML = createCurrentTime(music.currentTime)
}

//? mute music or unmute music just only with click
const muteOrUnMuteMusic = () => {
    let musicVolume = heightClicked ? heightClicked / 131 : 1
    
    heightClicked > 100 ? musicPlayerVolumeIcon.innerHTML = "<i class='bx bx-volume-full'></i>" : 
    heightClicked < 100 && heightClicked > 30 ? musicPlayerVolumeIcon.innerHTML = "<i class='bx bx-volume-low'></i>" :
    heightClicked < 30 ? musicPlayerVolumeIcon.innerHTML = "<i class='bx bx-volume' ></i>" : 
    musicPlayerVolumeIcon.innerHTML = "<i class='bx bx-volume-full'></i>"

    if (musicPlayerVolumeTimeLine.style.height === "0px") {
        music.volume = musicVolume
        musicPlayerVolumeTimeLine.style.height = `${Math.floor(musicVolume * 100)}%`
    }else {
        music.volume = 0
        musicPlayerVolumeIcon.innerHTML = "<i class='bx bx-volume-mute'></i>"
        musicPlayerVolumeTimeLine.style.height = 0
    }
}

//? active repeat music 
const activeRepeatMusic = () => {
    if (repeatMusic) {
        repeatMusic = false
        repeatBtn.classList.remove("active")
    }else {
        repeatMusic = true
        repeatBtn.classList.add("active")
    }
}

//? active music box if click play button --> active music box
const activeMusicBox = (musicBox, musicBoxClass) => {
    let allMusicsBoxs = document.querySelectorAll(musicBoxClass)
    allMusicsBoxs.forEach(box => {
        box === musicBox ? box.classList.add("active") : box.classList.remove("active")
    })
}

//? delete music function
const deleteMusic = (musicJson) => {
    const confirmDelete = confirm("Are you sure you want to delete this music?")
    //? if confirm delete is true open indexedDB and delete this music and upload music boxs
    if (confirmDelete) {
        let db = null
        let DBreqOp = indexedDB.open("music player")
        DBreqOp.onsuccess=  (e) => {
            db = e.target.result
            let tx = db.transaction("musics" , "readwrite")
            let store = tx.objectStore("musics")
            let deleteMusicReq = store.delete(musicJson.id)
            deleteMusicReq.onsuccess = checkDB(windowBoxes)
        }
    }
}

//? sort dropdown
const SortdropdownItem = document.querySelectorAll(".sort-dropdown-menu-item")
SortdropdownItem.forEach(dropdownItem => {
    dropdownItem.addEventListener("click" , (clickEvent) => {
        searchInput.value = ""
        let db = null
        let DBreqOp = indexedDB.open("music player")
        DBreqOp.onsuccess = (e) => {
            db = e.target.result
            let tx = db.transaction("musics" , "readonly")
            let store = tx.objectStore("musics")
            let getAllMusicsReq = store.getAll()
            getAllMusicsReq.onsuccess = (e) => {
                let myMusics = e.target.result
                if (myMusics.length !== 0) {
                    const sortDropdown = clickEvent.target.parentElement.parentElement.parentElement
                    const sortDropdownText = sortDropdown.children[0].children[0]
                    sortDropdownText.innerHTML = `sort by : ${clickEvent.target.innerHTML}`
                    
                    if (clickEvent.target.innerText === "singer name" || clickEvent.target.innerText === "music name") 
                        sortMusics(clickEvent.target.innerText)
                    
                    if (clickEvent.target.innerText === "time") 
                        sortMusics("time")
                    
                    if (clickEvent.target.innerText === "default") 
                        uploadMusics(myMusics , windowBoxes)

                }else 
                    alert("You don't have music to sort")
            }
        }
    })
})

//? music box sort by singer name
const sortMusics = (sortType) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let tx = db.transaction("musics" , "readonly")
        let store = tx.objectStore("musics")
        let getAllMusicsReq = store.getAll()
        getAllMusicsReq.onsuccess = (e) => {
            let myMusics = e.target.result
            
            let songs ;
            songs = "" ;
            
            //? if sort type === singer name, sort musics by singer name and if sort type === music name, sort musics by music name
            //? and if sort type === time, sort musics by time
            if (sortType === "singer name") {
                myMusics.sort((a,b) => {
                    if (a.singerName > b.singerName) { return  1 }
                    if (a.singerName < b.singerName) { return -1 }
                    return 0
                })
                songs = myMusics
            }
            if (sortType === "music name") {
                myMusics.sort((a,b) => {
                    if (a.musicName > b.musicName) return  1
                    if (a.musicName < b.musicName) return -1
                    return 0
                })
                songs = myMusics
            }
            if (sortType === "time") {
                myMusics.sort((a,b) => {
                    if (a.time > b.time) return -1
                    if (a.time < b.time) return  1
                    return 0
                })
                songs = myMusics
            }
            uploadMusics(songs , windowBoxes)
        }
    }
}

//? window butotn
let windowBoxes = false
const windowBtn = document.querySelector(".window-button")
windowBtn.addEventListener("click" , () => {
    searchInput.value = ""
    let db = null 
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = (e) => {
        db = e.target.result
        let tx = db.transaction("musics" , "readonly")
        let store = tx.objectStore("musics")
        let getAllMusicsReq = store.getAll()
        
        getAllMusicsReq.onsuccess = (e) => {
            let myMusics = e.target.result

            //? get sort dropdown text ( sort type )
            const sortDropdownText = document.querySelector(".sort-dropdown-text").innerText
    
            //? index of : in sort dropdown text
            const dotsIndexOf = sortDropdownText.indexOf(":")
            
            //? take sort type from sort dropdown text with dotsIndexOf
            const sortType = sortDropdownText.substr(dotsIndexOf+2 , sortDropdownText.length)
            
            //? else : we dont't have any musics alert this msg
            if (myMusics.length !== 0) {
                windowBtn.classList.toggle("active")

                windowBtn.classList.contains("active") ? windowBoxes = true : windowBoxes = false

                if (sortType === "singer name" || sortType === "music name") sortMusics(sortType)
                if (sortType === "time") sortMusics(sortType)
                if (sortType === "default") uploadMusics(myMusics , windowBoxes)
                
            }else 
                alert("You do not have a music")
        }
    }
})

//? create play back rate 
let playBackRateNumber = 1
playBackRateItem.forEach(playBackItem => {
    playBackItem.addEventListener("click", (e) => {
        playBackRateItem.forEach(item => {
            if (item.innerText === playBackItem.innerText) {
                playBackRateNumber = Number(item.innerText)
                item.classList.add("active")
                music.playbackRate = playBackRateNumber
            }else {
                item.classList.remove("active")
            }
        })
    })
})

//? search musics
const searchMusics = (inputEv) => {
    let db = null
    let DBreqOp = indexedDB.open("music player")
    DBreqOp.onsuccess = e => {
        db = e.target.result
        let getAllMusicsReq = db.transaction("musics", "readonly").objectStore("musics").getAll()
        getAllMusicsReq.onsuccess = e => {
            let myMusics = e.target.result
            let musicsSearch = myMusics.filter(musicItem => {
                return musicItem.singerName.toLowerCase().includes(inputEv.target.value.toLowerCase()) || musicItem.musicName.toLowerCase().includes(inputEv.target.value.toLowerCase())
            })
            musicsSearch.length !== 0 ? uploadMusics(musicsSearch, windowBoxes) : createDBError("musics-wrap" , "Your music could not be found")
        }
    }
}

window.addEventListener("load" , checkDB)
progressVolume.addEventListener("click" , changeVolume)
musicPlayerTimeLineBox.addEventListener("click", setTimeLine)
musicPlayerPlayBtn.addEventListener("click", () => playMusic(musicPlayerElement.dataset.id))
music.addEventListener("timeupdate", setTimeLineAndTimeStart)
musicPlayerVolumeIcon.addEventListener("click" , muteOrUnMuteMusic)
repeatBtn.addEventListener("click" , activeRepeatMusic)
nextBtn.addEventListener("click" , () => nextMusic(musicPlayerElement.dataset.id))
prevBtn.addEventListener("click" , () => prevMusic(musicPlayerElement.dataset.id))
searchInput.addEventListener("keyup", searchMusics)