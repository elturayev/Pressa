const router = require('express').Router()
const controller = require('../controllers/advertisement.js')
const validator = require('../middlewares/validation.js')

router.get('/',controller.GET)
router.get('/:adminAd',controller.GET)
router.get('/active/:id',controller.ACTIVE)
router.post('/',validator.validAd,controller.POST)
router.put('/',controller.PUT)
module.exports = router
