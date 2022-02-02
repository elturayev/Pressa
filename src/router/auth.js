const router = require('express').Router()
const controller = require('../controllers/auth.js')
const validator = require('../middlewares/validation.js')
router.get('/valid',validator.valid,controller.VALID)
router.post('/login',validator.validLogin,controller.LOGIN)

module.exports = router
