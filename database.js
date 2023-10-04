import express, { Router } from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
const router = express.Router()

const url = process.env.MONGODB_URL
const { Schema, model } = mongoose
const userSchema = new Schema({
    displayName: String,
    email: String,
    password: String,
    authMethod: String,
    spotifyRefreshToken: String,
    spotifyId: String,
    charms: [{
        name: String,
        completed: Boolean,
        description: String
    }],
    braceletConfig: {
        baseColor: String
    }

})
const User = model('User', userSchema)

mongoose.connect(url)

// await user.save()
router.get('/users/get-spotify-user', async (req, res) => {
    const spotifyId = req.query.spotifyId || null
    console.log(spotifyId)
    const user = await User.findOne({ spotifyId: spotifyId }).exec()

    console.log("User", user)
    res.send({
        status: 200,
        user: user
    })
})

router.post('/users/get-email-user', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        authMethod: 'email'
    })

    if (!user) {
        const spotifyCheck = await User.findOne({
            email: req.body.email,
            authMethod: 'spotify'
        })

        if (spotifyCheck) {
            console.log('they have a spotify account!')
            res.send({
                status: 400,
                message: `Looks like you created an account using Spotify!`

            })
        } else {
            res.send({
                status: 404,
                message: 'No user with that combo found'
            })
        }
    } else {
        console.log('they have an email account!')
        if (user.password === req.body.password) {
            res.send({
            status: 200,
                message: 'Nice job! You logged in!',
                user: user
            })
        } else {
            res.send({
                status: 403,
                message: 'Incorrect password!'
            })
        }
    }
})

router.post('/users/create-spotify-user', async (req, res) => {
    const user = new User({
        displayName: req.body.displayName,
        email: req.body.email,
        password: 'N/A',
        authMethod: req.body.authMethod,
        spotifyRefreshToken: req.body.spotifyRefreshToken,
        spotifyId: req.body.spotifyId,
        charms: [
            {
                name: 'FOLLOW',
                completed: true,
                description: 'Follow Chase Atlantic on Spotify and pre-save "Single Name."'
            },
            {
                name: 'LISTEN',
                completed: false,
                description: 'Host an exclusive "Mamacita" listening party for you and your bff.'
            },
            {
                name: 'FIND',
                completed: false,
                description: 'Hit the streets and head to one of the digital drop points.'
            },
            {
                name: 'CREATE',
                completed: false,
                description: 'Take a quick quiz to get a custom made playlist.'
            },
            {
                name: 'CHASE',
                completed: false,
                description: 'Download an itinerary curated by Chase Atlantic.'
            },
        ],
        braceletConfig: { 
            baseColor: '#bcc6cc' 
        }
        

    })

    // console.log(user)

    await user.save()
    res.send({
        status: 200,
        user: user
    })
})

router.post('/users/create-email-user', async (req, res) => {
    const checkUser = await User.findOne({
        email: req.body.email,
        authMethod: 'email'
    })

    if (!checkUser) {
        const user = new User({
            displayName: req.body.displayName,
            email: req.body.email,
            password: req.body.password,
            authMethod: req.body.authMethod,
            spotifyRefreshToken: 'N/A',
            spotifyId: 'N/A',
            charms: [
                {
                    name: 'FOLLOW',
                    completed: true,
                    description: 'Follow Chase Atlantic on Spotify and pre-save "Single Name."'
                },
                {
                    name: 'LISTEN',
                    completed: false,
                    description: 'Host an exclusive "Mamacita" listening party for you and your bff.'
                },
                {
                    name: 'FIND',
                    completed: false,
                    description: 'Hit the streets and head to one of the digital drop points.'
                },
                {
                    name: 'CREATE',
                    completed: false,
                    description: 'Take a quick quiz to get a custom made playlist.'
                },
                {
                    name: 'CHASE',
                    completed: false,
                    description: 'Download an itinerary curated by Chase Atlantic.'
                },
            ],
            braceletConfig: { 
                baseColor: '#bcc6cc' 
            }
            
    
        })
        await user.save()
        res.send({
            status: 200,
            user: user
        })

    } else {
        res.send({
            status: 400,
            message: 'You already have an account!'
        })
    }
})

router.get('/users/get-by-id', async (req, res) => {
    const userId = req.query.user_id || null
    const checkUser = await User.findOne({
        _id: userId
    })

    if (checkUser) {
        res.send({
            status: 200,
            user: checkUser
        })
    } else {
        res.send({
            status: 400,
            message: 'Error retrieving user'
        })
    }
})
export default router