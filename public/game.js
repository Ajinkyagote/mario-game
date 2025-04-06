const {Client, Account, Databases, ID, Query} = Appwrite;
const projectId = '67d6e87000104045e642';
const databaseId = '67d6f788002a8559e6c2'
const collectionId = '67d6f7b5003acf2f6048'

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(projectId)

const account = new Account(client)
const database = new Databases(client)

async function isLoggedIn() {
    return account.get().then(response => {
        if(response){
            return true
        }
        return false
    }).catch(error => console.error(error))
}

function register(event) {
    event.preventDefault();

    account.create(
        ID.unique(),
        event.target.elements['register-email'].value,
        event.target.elements['register-password'].value,
        event.target.elements['register-username'].value
    ).then(response => {
        console.log(response)
        database.createDocument(
            databaseId,
            collectionId,
            response.$id,
            {
                "userId": response.$id,
                "HighScore": 0
            }
        )

        account.createEmailSession(
            event.target.elements['register-email'].value,
            event.target.elements['register-password'].value,
        ).then(() => {
            showDisplay();
        })
    }).catch(error => console.error(error))
    event.preventDefault()
}

function login(event) {
    account.createEmailSession(
        event.target.elements['login-email'].value,
        event.target.elements['login-password'].value
    ).then(() => {
        alert('Session created succesfully!')
        showDisplay()
        client.subscribe("account", (response) => {
            console.log(response)
        })
    }).catch(error => {
        alert('Failed to create Session')
        console.error(error)
    })
    event.preventDefault()
}

function logout(){
    account.deleteSession().then(() => {
        alert('Logged out')
        console.log('Current session deleted')
        showDisplay()
        const highscoreElement = document.getElementById('highscore')
        highscoreElement.textContent = ""
    }).catch(error => console.error(error))
}

function toggleModal(event) {
    const registerForm = document.getElementById('register-form')
    const loginForm = document.getElementById('login-form')
    const loginButton = document.getElementById('login-button')
    const registerButton = document.getElementById('register-button')

    if (event.srcElement.id === 'register-button') {
    registerForm.classList.remove('hidden')
    loginForm.classList.add('hidden')
    loginButton.classList.add('not-active')
    registerButton.classList.remove('not-active')
    }

    if (event.srcElement.id === 'login-button') {
        registerForm.classList.add('hidden')
        loginForm.classList.remove('hidden')
        loginButton.classList.remove('not-active')
        registerButton.classList.add('not-active')
        }
}    

function showDisplay() {
    const modalElement = document.getElementById('modal')
    modalElement.classList.add('hidden')
    isLoggedIn()
    .then(isLogin => {
        if(isLogin){
            const modalElement = document.getElementById('modal')
            modalElement.classList.add('hidden')
            const logoutButton = document.getElementById('logout-button')
            logoutButton.classList.remove('hidden')
            const highScoreTag = document.getElementById('highscore-tag')
            highScoreTag.classList.remove('hidden')
            startGame()
        } else {
            const modalElement = document.getElementById('modal')
            modalElement.classList.remove('hidden')
            const logoutButton = document.getElementById('logout-button')
            logoutButton.classList.remove('hidden')
            const highScoreTag = document.getElementById('highscore-tag')
            highScoreTag.classList.remove('hidden')
            const usernameElement = document.getElementById('username')
            usernameElement.textContent = ""
            const canvas = document.querySelector('canvas')
            if(canvas) canvas.remove()
        }
    }).catch(error => console.error(error))
}

showDisplay()

function startGame(){
    kaboom({
        global: true,
        fullscreen: true,
        scale: 2,
        clearColor: [0,0,0,1]
    })

    const moveSpeed = 120
    const jumpForce = 360
    const bigJumpForce = 550
    let currentJumpForce = jumpForce
    const falllDeath = 400
    const enemyDeath = 20
    const enemySpeed = 20

    let isJumping = true

    loadRoot('https://i.imgur.com/')
    loadSprite('coin', 'wbKxhcd.png')
    loadSprite('evil-shroom', 'KP03fR9.png')
    loadSprite('brick', 'pogC9x5.png')
    loadSprite('block', 'M6rwarW.png')
    loadSprite('mario', 'Wb1qfhK.png')
    loadSprite('mushroom', '0wMd92p.png')
    loadSprite('surprise', 'gesQ1KP.png')
    loadSprite('unboxed', 'bdrLpi6.png')
    loadSprite('pipe-top-left', 'ReTPiWY.png')
    loadSprite('pipe-top-right', 'hj2GK4n.png')
    loadSprite('pipe-bottom-left', 'c1cYSbt.png')
    loadSprite('pipe-bottom-right', 'nqQ79eI.png')
    loadSprite('blue-block', 'fVscIbn.png')
    loadSprite('blue-brick', '3e5YRQd.png')
    loadSprite('blue-steel', 'gqVoI2b.png')
    loadSprite('blue-evil-mushroom', 'SvV4ueD.png')
    loadSprite('blue-suprise', 'RMqCc1G.png')

    scene('game', ({ level, score}) => {
        layers(["bg", "obj","ui"], "obj")

            const maps = [ [
                '                                      ',
                '                                      ',
                '                                      ',
                '                                      ',
                '                                      ',
                '                                      ',
                '          @@@@                        ',
                '                                 x    ',
                '              z                     + ',
                '==============================   ====='
            ],
            [
                '                                      ',
                '                                      ',
                '                                      ',
                '       %   %   %   %   %              ',
                '                                      ',
                '        =====================         ',
                '                                      ',
                '           ^   ^   ^                  ',
                '                                    + ',
                '==============================   ====='
            ],
            [
                '                                      ',
                '                                      ',
                '                                      ',
                '       %   %   %   %   %              ',
                '                                      ',
                '        =====================         ',
                '                                      ',
                '           x   @   !                  ',
                '                                    + ',
                '==============================   ====='
            ]
        ]
            const levelCfg = {
                width: 20,
                height: 20,
                '=' : [sprite('block'), solid()],
                '$': [sprite('coin'), 'coin'],
                '%': [sprite('surprise'), solid(), 'coin-surprise'],
                "*": [sprite('surprise'), solid(), 'mushroom-surprise'],
                '}': [sprite('unboxed'), solid()],
                '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
                ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
                "-": [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
                '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
                "^": [sprite('evil-shroom'), solid(), 'dangerous'],
                '#': [sprite('mushroom'), solid(), 'mushroom', body()],
                "!": [sprite('blue-block'), solid(), scale(0.5)],
                "£": [sprite('blue-brick'), solid(), scale(0.5)],
                "z": [sprite('blue-evil-mushroom'), solid(), scale(0.5), 'dangerous'],
                "@": [sprite('blue-suprise'), solid(), scale(0.5), 'coin-surprise'],
                "x": [sprite('blue-steel'), solid(), scale(0.5)]


            }

            const gameLevel = addLevel(maps[level], levelCfg)

            const scoreLabel = add([
                text(score),
                pos(30, 6),
                layer('ui'),
                {
                    value: score
                }
            ])

            add([text('level' + parseInt(level + 1)), pos(40, 6)])

            const player = add([
                sprite('mario', solid()),
                pos(30, 0),
                body(),
                big(),
                origin('bot')
            ])

            function big() {
                let timer = 0
                let isBig = false
                return{
                    update() {
                        if (isBig) {
                            currentJumpForcce = bigJumpForce
                            time -= dt()
                            if (timer <= 0){
                                this.smallify()
                            }
                        }
                    },
                    isBig() {
                        return isBig
                    },
                    smallify() {
                        this.scale = vec2(1)
                        currentJumpForce = jumpForce
                        timer = 0
                        idBig = false
                    },
                    biggify(time){
                        this.scale = vec2(2)
                        timer = time
                        isBig = true
                    }
                }
            }

            player.on("headbump", (obj) => {
                if(obj.is('coin-surprise')){
                    gameLevel.spawn('$', obj.gridPos.sub(0, 1))
                    destroy(obj)
                    gameLevel.spawn('}', obj.gridPos.add(0,0))
                }
                if(obj.is('mushroom-surprise')){
                    gameLevel.spawn('#', obj.gridPos.sub(0, 1))
                    destroy(obj)
                    gameLevel.spawn('}', obj.gridPos.add(0,0))
                }
            })

            action('mushroom', (m) => {
                m.move(20,0)
            })

            player.collides('mushroom', (m) => {
                destroy(m)
                player.biggify(6)
            })

            player.collides('coin', (c) => {
                destroy(c)
                scoreLabel.value++
                scoreLabel.text = scoreLabel.value
            })

            action('dangerous', (d) => {
                d.move(-enemySpeed, 0)
            })

            player.collides('dangerous', (d) => {
                if(isJumping) {
                    destroy(d)
                } else{
                    go('lose', { score: scoreLabel.value})
                }
            })

            player.action(() => {
                camPos(player.pos)
                if(player.pos.y >= falllDeath) {
                    go('lose',{ score: scoreLabel.value })
                }
            })

            player.collides('pipe', () => {
                keyPress('down', () => {
                    go('game', {
                        level: (level + 1) % maps.length,
                        score: scoreLabel.value
                    })
                })
            })

            keyDown('left', () => {
                player.move(-moveSpeed, 0)
            })

            keyDown('right', () => {
                player.move(moveSpeed, 0)
            })

            player.action(() => {
                if(player.grounded()){
                    isJumping = false
                }
            })

            keyPress('space', () => {
                if (player.grounded()){
                    isJumping = true
                    player.jump(currentJumpForce)
                }
            })

            scene('lose', ({ score }) => {
                add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
            })
    })

    start("game", {level: 0, score: 0})
}


