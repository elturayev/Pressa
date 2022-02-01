const fs = require('fs')
const path = require('path')

const model = (request,response,next)=>{
	try{
		request.select = (filename)=>{
			let  file = fs.readFileSync(path.join(process.cwd(), 'src','database',filename + '.json'),'UTF-8')
			file = file.length ? JSON.parse(file || '[]') : []
			return file
		}

		request.insert = (filename,data)=>{
			fs.writeFileSync(path.join(process.cwd(), 'src', 'database', filename + '.json'),JSON.stringify(data,null,4))
			return true
		}
		return next()
	}catch(error){
		return next(error)
	}
}

module.exports = model