const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const Favour = require('../models/favour.model')
const { checkLoggedIn, checkRole } = require('./../middleware')
const { isAdmin } = require('./../utils')

router.get('/admin-perfil', checkLoggedIn, checkRole('admin'), (req, res) => {

    let totalFavours

    Favour
        .find()
        .select('title description')
        .then(favours => {
            totalFavours = favours
            return User.find()
        })
        .then(users => {
            res.render('auth/admin-profile', { user: req.user, isAdmin: isAdmin(req.user), favours: totalFavours, users: users })
        })
        .catch(error => next(new Error(error)))
})

router.post('/admin-perfil/eliminar/:_id', (req, res) => {

    const _id = req.params._id

    Favour
        .findByIdAndRemove(_id)
        .then(() => res.redirect('/usuario/admin-perfil'))
        .catch(error => next(new Error(error)))
})

router.post('/admin-perfil/eliminar-usuario/:_id', (req, res) => {

    const _id = req.params._id

    User
        .findByIdAndRemove(_id)
        .then(() => res.redirect('/usuario/admin-perfil'))
        .catch(error => next(new Error(error)))
})

router.get('/perfil', (req, res) => {

    let userId = req.user._id
    const favoursReceived = Favour.findReceivers(userId)
    const numFavoursD = Favour.countGivers(userId)
    const favoursDone = Favour.findGivers(userId)

    Promise
        .all([favoursReceived, numFavoursD, favoursDone])
        .then(responses => res.render('./auth/profile', { user: req.user, listFavs: responses[0], numFavoursD: responses[1], favoursDone: responses[2] }))
        .catch(error => next(new Error(error)))
})

router.get('/editar/:_id', (req, res) => {

    const user_id = req.params._id

    User
        .findById(user_id)
        .then(user => res.render('user/edit', user))
        .catch(error => next(new Error(error)))
})

router.post('/editar/:_id', (req, res) => {

    const { username, avatar, description } = req.body, user_id = req.params._id

    User
        .findByIdAndUpdate(user_id, { username, avatar, description })
        .then(() => res.redirect('/usuario/perfil'))
        .catch(error => next(new Error(error)))
})

router.post('/dar-de-baja/:_id', (req, res) => {

    const { username, avatar, description } = req.body, user_id = req.params._id

    User
        .findByIdAndRemove(user_id, { username, avatar, description })
        .then(() => res.redirect('/'))
        .catch(error => next(new Error(error)))
})

module.exports = router
