const router = require('express').Router()
const controller = require('../controllers/advertisement.js')
const validator = require('../middlewares/validation.js')

router.get('/',controller.GET)
router.get('/:pendding',controller.GET)
router.get('/active/:id',controller.ACTIVE)
router.post('/',validator.validAd,controller.POST)
router.put('/',controller.PUT)
router.delete('/cancel',controller.DELETE)
module.exports = router