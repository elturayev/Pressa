const sha256 = require('sha256')
const { ClientError } = require('../utils/error.js')
const jwt = require('jsonwebtoken')

const LOGIN = (request,response,next)=>{
	try{
		const { username, password } = request.body
		const users = request.select('users')
		let admin = users[0]
		if((admin.name == username) && (admin.password == sha256(password))){
			response.json({
				status: 200,
				message: "The admin is successfully on logged!",
				token: jwt.sign({id: admin.user_id},'secret_key')
			})
		}else  throw new ClientError(401,"The admin is password and username error entered!")
		return next()
	}catch(error){
		return next(error)
	}
}

const VALID = (request,response,next)=>{
	try{
		response.json({
			status:200,
			message: 'Token valid!'
		})
	}catch(error){
		return next(error)
	}
}

module.exports = {
	LOGIN,
	VALID
}
