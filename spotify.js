import express, { Router } from 'express'
import axios from 'axios'
import 'dotenv/config'
const router = express.Router()



var client_id = process.env.SPOTIFY_CLIENT_ID
var client_secret = process.env.SPOTIFY_CLIENT_SECRET
var redirect_uri = process.env.SPOTIFY_REDIRECT_URI
var root_domain = process.env.SPOTIFY_ROOT_DOMAIN

const generateRandomString = length => {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

router.get('/login', (req,res) => {
    const state = generateRandomString(16)
    const scope = 'user-read-private user-read-email user-follow-read user-follow-modify user-library-modify user-library-read user-modify-playback-state user-read-playback-state'

    const paramsObj = {
        client_id: client_id,
        response_type: 'code',
        redirect_uri: redirect_uri,
        state: state,
        scope: scope
    }

    const params = new URLSearchParams(paramsObj)

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
})

router.get('/callback', (req, res) => {
    const code = req.query.code || null
    const state = req.query.state || null

    const paramsObj = {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
    }
    const params = new URLSearchParams(paramsObj)

    if(state === null) {
        res.send({
            message: 'error',
            error: 'state_mismatch'
        })
    } else {
        axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: params.toString(),
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${new Buffer.from(
                    `${client_id}:${client_secret}`
                ).toString('base64')}`
            }
        })
            .then(response => {
                console.log(response.status)
                if (response.status === 200) {
                    console.log('everything went well, store the refresh token and continue...')
                    res.send({
                        status: 200,
                        message: 'success',
                        data: response.data,
                        note: 'TIME TO STORE THE REFRESH TOKEN'
                    })
                } else {
                    console.log('something went... not so well')
                }
            })
            .catch(error => {
                console.log('error authorizing user')
                res.send({
                    status: 400,
                    message: 'error authenticating user',
                    data: error.response.data,
                    note: 'PROBABLY BECAUSE THE ACCESS TOKEN WAS EXPIRED'
                })
            })
    }
})

// Call this function when an existing user is revisitng
router.get('/refresh', (req, res) => {
    const { refresh_token } = req.query

    const paramsObj = {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
    }
    const params = new URLSearchParams(paramsObj)

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: params.toString(),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(
                `${client_id}:${client_secret}`
            ).toString('base64')}`
        }
    })
        .then((response) => {
            console.log(response.status)
            if (response.status === 200) {
                res.send({
                    status: 200,
                    message: 'success',
                    data: response.data,
                    note: 'QUERY THAT USER'
                })
            }
        })
})

router.get('/get-user', (req, res) => {
    const { access_token, token_type } = req.query

    axios('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: `${token_type} ${access_token}`
        }
    }).then(response => {
        res.send({
            status: 200,
            message: 'success',
            data: response.data
        })
    })
})

router.post('/follow-chase-atlantic', (req, res) => {
    axios(`${process.env.SPOTIFY_ROOT_DOMAIN}/spotify/refresh?refresh_token=${req.body.spotifyRefreshToken}`)
        .then(response => {
            const access_token = response.data.data.access_token 
            const token_type = response.data.data.token_type

            axios({
                method: 'put',
                url: 'https://api.spotify.com/v1/me/following?type=artist&ids=7cYEt1pqMgXJdq00hAwVpT',
                headers: {
                    Authorization: `${token_type} ${access_token}`
                }
            })
                .then(response => {
                    res.send({
                        status: 200,
                        message: 'success',
                        data: response.data
                    })
                })
            .catch(error => {
                console.log(error)
                res.send({
                    status: 400,
                    message: 'error',
                    error: error
                })
            })
        })
})

router.post('/save-mamacita', (req, res) => {
    axios(`${process.env.SPOTIFY_ROOT_DOMAIN}/spotify/refresh?refresh_token=${req.body.spotifyRefreshToken}`)
        .then(response => {
            const access_token = response.data.data.access_token
            const token_type = response.data.data.token_type
            axios({
                method: 'put',
                url: 'https://api.spotify.com/v1/me/tracks?ids=4cQAhjxynTUlhVUJN5yhUb',
                headers: {
                    Authorization: `${token_type} ${access_token}`
                }
            })
                .then(response => {
                    res.send({
                        status: 200,
                        message: 'success',
                        data: response.data
                    })
                })
            .catch(error => {
                console.log(error)
                res.send({
                    status: 400,
                    message: 'error',
                    error: error
                })
            })
        })
})

router.post('/play-mamacita', (req, res) => {
    axios(`${process.env.SPOTIFY_ROOT_DOMAIN}/spotify/refresh?refresh_token=${req.body.spotifyRefreshToken}`)
        .then(response => {
            const access_token = response.data.data.access_token
            const token_type = response.data.data.token_type
            // Get Spotify Playback State
            axios({
                method: 'get',
                url: 'https://api.spotify.com/v1/me/player',
                headers: {
                    Authorization: `${token_type} ${access_token}`
                }
            })
                .then(response => {
                    console.log("Status", response.status)
                    if (response.status === 204) {
                        console.log('playback device is not available') 
                    } else if (response.status === 200) {
                        if (response.data.device.is_active) {
                            console.log('active device!')
                            axios({
                                method: 'put',
                                url: 'https://api.spotify.com/v1/me/player/play',
                                headers: {
                                    Authorization: `${token_type} ${access_token}`,
                                    'Content-Type': 'application/json'
                                }
                            })

                        }
                    }
                })
            // axios({
            //     method: 'get',
            //     url: 'https://api.spotify.com/v1/me/player/devices',
            //     headers: {
            //         Authorization: `${token_type} ${access_token}`
            //     }
            // })
            //     .then(response => {
            //         console.log(response.data.devices)
            //     })
            // axios({
            //     method: 'put',
            //     url: 'https://api.spotify.com/v1/me/player/play',
            //     headers: {
            //         Authorization: `${token_type} ${access_token}`,
            //         'Content-Type': 'application/json'
            //     }
                
            // })
            //     .then(response => {
            //         console.log(response)
            //         res.send({
            //             status: 200,
            //             message: 'success',
            //             data: response.data
            //         })
            //     })
            // .catch(error => {
            //     console.log(error.message)
            //     console.log(error.status)
            //     res.send({
            //         status: 400,
            //         message: 'error',
            //         error: error
            //     })
            // })
        })
})
export default router