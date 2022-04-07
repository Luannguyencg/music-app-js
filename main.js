const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs :[
        {
            name: 'Sài gòn đau lòng quá',
            singer: 'Luân Nguyễn',
            path: './asset/music/SaiGonDauLongQua-HuaKimTuyenHoangDuyen-6992977.mp3',
            image: './asset/img/saigon-img.png'
        },
        {
            name: 'Chúng ta sau này',
            singer: 'Luân Nguyễn',
            path: './asset/music/ChungTaSauNay-TRI-6929586.mp3',
            image: './asset/img/chungtasaunay-img.png'
        },
        {
            name: 'Trên tình bạn dưới tình yêu',
            singer: 'MIN',
            path: './asset/music/TrenTinhBanDuoiTinhYeu-MIN-6802163.mp3',
            image: './asset/img/trentinhbạn-img.png'
        },
        {
            name: 'Lalisa',
            singer: 'Lisa',
            path: './asset/music/Lalisa-LISA-7086697.mp3',
            image: './asset/img/lalisa-img.png'
        },
        {
            name: 'Nevada',
            singer: 'lllll',
            path: './asset/music/Nevada-Monstercat-6983746.mp3',
            image: './asset/img/nevada-img.png'
        },
        {
            name: 'Có hẹn với thanh xuân',
            singer: 'Luân Nguyễn',
            path: './asset/music/cohenvoithanhxuan-MONSTAR-7050201.mp3',
            image: './asset/img/music-img.png'
        },
        {
            name: 'Rồi tới luôn',
            singer: 'Luân Nguyễn',
            path: './asset/music/RoiToiLuonRemixBeat-Beat-7086283.mp3',
            image: './asset/img/st-img.png'
        },

    ],
    setConfig: function(key, value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map(function(song, index){
            return `
            <div class="song" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvens: function(){

        //xử lý cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform:'rotate(360deg)'}
        ],{
            duration: 10000, //     10 giây
            iterations: Infinity 
        })
        cdThumbAnimate.pause()
        

        // xử lý kéo phóng to thu nhỏ khi kéo 
        const cdWidth = cd.offsetWidth

        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop  //lấy ra giá trị tăng giần hoặc giảm dần khi kéo thanh scroll
            const newWidth = cdWidth - scrollTop

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth
        }
        // click và nút play

        playBtn.onclick = function (){
           
            audio.onplay = function(){
                $$('.song')[app.currentIndex].classList.add('active')

                player.classList.add('playing')
                app.isPlaying = true
                cdThumbAnimate.play()
            }
            audio.onpause = function(){
                $$('.song')[app.currentIndex].classList.remove('active')

                app.isPlaying = false
                player.classList.remove('playing')
                cdThumbAnimate.pause()
            }
            if (app.isPlaying){
                audio.pause()
            }else{
                audio.play()
            }    

        }

        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
            
            // progress.onchange = function(e){
            //     const seekTime = audio.duration / 100 * e.target.value
            //     audio.currentTime = seekTime
            // }
            progress.oninput = function (e) {
                audio.pause();
                setTimeout(() => {
                  audio.play();
                }, 500);
                //Lấy ra thời gian sau khi click tua
                const seekTime = e.target.value * (audio.duration / 100);
                audio.currentTime = seekTime;
            };
        }
        //khi next
        nextBtn.onclick = function(){
           if(app.isRandom){
               playBtn.click()
               app.randomSong()
            }else{
               app.nextSong()
            }

            audio.play()
            app.scrollToActiveSong()
        }
        //khi prev
        prevBtn.onclick = function (){
            if(app.isRandom){
                app.randomSong()
            }else{
                app.prevSong()
            }
            audio.play()
            app.scrollToActiveSong()

        }
        //random
        randomBtn.onclick = function(){
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom) // đối số thứ 2 là boolean nếu true thì sẽ add , false thì remove
        }
        // xử lý khi repeat song
        repeatBtn.onclick = function (){
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)

            repeatBtn.classList.toggle('active', app.isRepeat)
        }
        // xử lý next bài hát khi hết bài 
        audio.onended = function (){
           if(app.isRepeat){
                audio.play()
           }else{
               nextBtn.click()
           }
        }
        // click vào danh sách phát
        playList.onclick = function (e){

            $$('.song')[app.currentIndex].classList.remove('active')
            
            const songNode =e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                // xử lý khi click vào song
                if(songNode){
                    playBtn.click()
                    app.currentIndex = songNode.dataset.index
                    app.loadCurruntSong()
                    audio.play()
                }
                // xử lý khi click vào option
                //
            }
        }

    },
    scrollToActiveSong: function(){
        setTimeout(function(){
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block:'center' ,
                
            })
        }, 300)
    },
    loadCurruntSong: function(){
        
        
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path

    },

    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    
    nextSong: function () {
        $$('.song')[this.currentIndex].classList.remove('active')

        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0 
        }
        this.loadCurruntSong()
    },
    prevSong: function () {
        $$('.song')[this.currentIndex].classList.remove('active')

        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurruntSong()
    },
    randomSong: function(){
        $$('.song')[this.currentIndex].classList.remove('active')

        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }
        while(newIndex === this.currentIndex) // nếu điều kiện này đúng thì chạy lại,  sai thì in ra  ,,, xong tiếp tục  :))

        this.currentIndex = newIndex
        this.loadCurruntSong()
    },
    

    start: function(){
        // gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        this.defineProperties()
        this.loadCurruntSong()
        this.handleEvens()
        this.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    }
}

app.start()

