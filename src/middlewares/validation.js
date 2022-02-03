const Joi = require('joi')
const { ClientError } = require('../utils/error.js')
const jwt =require('jsonwebtoken')
const schemaLogin = Joi.object({
	username: Joi.string().min(3).max(15).alphanum().required(),
	password: Joi.string().min(2).max(8).required()
})

const validAd = (request,response,next)=>{
	try{
		const { file } = request.files
		const { title, 
				short_description,
				description,
				first_name,
				last_name,
				contact
			 } = request.body
		if(title.length > 200) throw new ClientError(413,'The title must be a maximum of 200 symbols!')
		if(description.length > 2000) throw new ClientError(413,'The description must be a maximum of 1000 symbols!')
		if(short_description > 200) throw new ClientError(413,'The short description must be a maximum of 200 symbols!')
		if(!(['image/jpeg','image/png','image/jpg']).includes(file.mimetype)) throw new ClientError(415,'The img format should be .jpg or .jpeg or .png!')
		if(first_name.length > 50) throw new ClientError(401,'The length of the first_name must be 50 symbols!')
		if(last_name.length > 50) throw new ClientError(401,'The length of the last_name must be 50 symbols!')
		if(!(/^998[389][012345789][0-9]{7}$/).test(contact)) throw new ClientError(401,'The contact error entered!')
		return next()
	}catch(error){
		return next(error)
	}
}

const validLogin = (request,response,next)=>{
	try{
		const { value, error } = schemaLogin.validate(request.body)
		if(error) throw new ClientError(401,error)
		return next()
	}catch(error){
		return response.json(error)
	}
}

const valid = (request,response,next)=>{
	try{	
		const { id } = jwt.verify(request.headers.token, 'secret_key')
		if(id != 0)throw new ClientError(400,'Token invalid!')
		return next()
	}catch(error){
		return response.json(error)
	}
}

module.exports = {
	validAd,
	validLogin,
	valid
}
