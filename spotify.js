import express, { Router } from 'express'
import axios from 'axios'
const router = express.Router()

var client_id = '8076849e45fc4800a3dc64683a839683'
var client_secret = 'b0ffdc042f67457f9906c0be2767f1fa'
var redirect_uri = 'http://localhost:5000/spotify/callback'
var root_domain = 'http://localhost:5000'

const generateRandomString = length => {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

router.get('/login', (req,res) => {
    console.log('tryin it?')
    const state = generateRandomString(16)
    const scope = 'user-read-private user-read-email'

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

    const paramsObj = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri
    }

    const params = new URLSearchParams(paramsObj)

    // GET USER ACCESS TOKEN
    axios({
        method: 'POST',
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
            console.log('get access token', response.data)
            if (response.status === 200) {
                const { refresh_token } = response.data

                axios.get(`${root_domain}/spotify/refresh?refresh_token=${refresh_token}`)
                    .then(response => {
                        console.log( 'get refresh token', response.data)
                        const { access_token, token_type } = response.data

                        // Get user information
                        axios('https://api.spotify.com/v1/me', {
                            headers: {
                                Authorization: `${token_type} ${access_token}`
                            }
                        })
                            .then(response => {
                                console.log('get user information', response.data)
                                res.send({
                                    message: response.data
                                })
                            })
                    })
            }
        })
    })

    router.get('/refresh', (req, res) => {
        const { refresh_token } = req.query

        const paramsObj = {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        }
        const params = new URLSearchParams(paramsObj)

        axios({
            method: 'POST',
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
                res.send(response.data)
            })
            .catch((error => {
                res.send(error)
            }))
    })
export default router