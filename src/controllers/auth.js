const sha256 = require('sha256')
const { ClientError } = require('../utils/error.js')

const LOGIN = (request,response,next)=>{
	try{
		const { username, password } = request.body
		const users = request.select('users')
		let admin = users[0]
		if(admin.name == username && admin.password == sha256(password)){
			response.json({
				status: 555,
				message: "The admin is successfully on logged!"
			})
		}else  throw new ClientError(401,"The admin is password and username error entered!")
		return next()
	}catch(error){
		return next(error)
	}
}

module.exports = {
	LOGIN,
}