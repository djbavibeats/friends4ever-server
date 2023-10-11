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
    missions: [{
        missionId: String,
        completed: Boolean
    }],
    braceletConfig: {
        baseColor: String
    }

})
const User = model('User', userSchema)

const missionSchema = new Schema({
    name: String,
    available: Boolean,
    description: String,
    finishers: [{
        userId: String,
        displayName: String
    }]
})
const Mission = model('Mission', missionSchema)

mongoose.connect(url)

router.post('/missions/create-mission', async (req, res) => {
    const { name, available, description, finishers } = req.body
    const mission = new Mission({
        name: name,
        available: available,
        description: description,
        finishers: finishers
    })
    
    await mission.save()
    res.send({
        status: 200,
        mission: mission
    })
})

router.get('/missions/get-all-missions', async (req, res) => {
    const missions = await Mission.find()
    res.send({
        status: 200,
        missions: missions
    })
})

router.post('/missions/update-mission-finishers', async (req, res) => {
    const mission = await Mission.findOne({ _id: req.body.missionId })
    const missionFinishers = mission.finishers

    const user = await User.findOne({ _id: req.body.userId })
    const userMissions = user.missions

    const missionUser = await mission.finishers.filter(finisher => finisher.userId === req.body.userId)

    if (missionUser.length !== 0) {
        res.send({
            status: 400,
            message: 'User already finished this mission!',
            mission: mission,
            user: user
        })
    } else {
        missionFinishers.push({
            userId: req.body.userId
        })
        userMissions.push({
            missionId: mission._id,
            completed: true
        })

        const updateMission = await Mission.findOneAndUpdate(
            { _id: req.body.missionId },
            { finishers: missionFinishers }
        )
        const updateUser = await User.findOneAndUpdate(
            { _id: req.body.userId },
            { missions: userMissions }
        )
        res.send({
            status: 200,
            message: 'User and mission updated!',
            mission: updateMission,
            user: updateUser
        })
    }
})

router.post('/missions/save-mamacita', async (req, res) => {
    console.log('save mamacita')
})
// await user.save()
router.get('/users/get-spotify-user', async (req, res) => {
    const spotifyId = req.query.spotifyId || null
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
        missions: [],
        braceletConfig: { 
            baseColor: '#bcc6cc' 
        }
    })

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
            missions: [],
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