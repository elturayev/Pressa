const path = require('path')
const { ClientError } = require('../utils/error.js')
const GET = (request,response,next)=>{
	try{
		let adResponse = request.select('advertisement')
		let userResponse = request.select('users')
		let { pendding } = request.params
		let result = []
		let dateNow = new Date()
		let year = dateNow.getFullYear()
		let month = dateNow.getMonth()
		let day = dateNow.getDate()
		let hour = dateNow.getHours()
		let minut = dateNow.getMinutes()
		let write

		for (let rek = 0; rek < adResponse.length; rek++){
			if (adResponse[rek].date.split(' ')[0].split('/')[2] - year < 0){
				let index = adResponse.findIndex(el => el.id == adResponse[rek].id)
				adResponse.splice(index,1)
				rek = rek ==0 ? rek : rek - 1
				write = 1
			}
			else if ((adResponse[rek].date.split(' ')[0].split('/')[2] - year == 0) && (adResponse[rek].date.split(' ')[0].split('/')[1] - (month+1) < 0)){
				let index = adResponse.findIndex(el => el.id == adResponse[rek].id)
				adResponse.splice(index,1)
				rek = rek ==0 ? rek : rek - 1
				write = 1
			}
			else if ((adResponse[rek].date.split(' ')[0].split('/')[2] - year == 0) && (adResponse[rek].date.split(' ')[0].split('/')[1] - (month + 1) == 0) && ((adResponse[rek].date.split(' ')[0].split('/')[0] - day) < 0)){
				let index = adResponse.findIndex(el => el.id == adResponse[rek].id)
				adResponse.splice(index,1)
				rek = rek == 0 ? rek : rek - 1
				write = 1
			}
			else if ((adResponse[rek].date.split(' ')[0].split('/')[2] - year == 0) && 
					(adResponse[rek].date.split(' ')[0].split('/')[1] - (month + 1) == 0) &&
					((adResponse[rek].date.split(' ')[0].split('/')[0] - day) == 0) &&
					((adResponse[rek].date.split(' ')[2].split(':')[0] - hour) < 0)){
				let index = adResponse.findIndex(el => el.id == adResponse[rek].id)
				adResponse.splice(index,1)
				rek = rek == 0 ? rek : rek - 1
				write = 1
			}
			else if ((adResponse[rek].date.split(' ')[0].split('/')[2] - year == 0) && 
					(adResponse[rek].date.split(' ')[0].split('/')[1] - (month + 1) == 0) &&
					((adResponse[rek].date.split(' ')[0].split('/')[0] - day) == 0) &&
					((adResponse[rek].date.split(' ')[2].split(':')[0] - hour) == 0) &&
					((adResponse[rek].date.split(' ')[2].split(':')[1] - minut) < 0)){
				let index = adResponse.findIndex(el => el.id == adResponse[rek].id)
				adResponse.splice(index,1)
				rek = rek == 0 ? rek : rek - 1
				write = 1
			}
		}
		for (let ad of adResponse){
			if ((pendding == "pendding") && (!ad.isAccepts)){
				let user = userResponse.find(user => user.user_id == ad.user_id)
				ad.user = user
				delete ad.user_id
				result.push(ad)
			}
			else if (ad.isAccepts && (!pendding)){
				let user = userResponse.find(user => user.user_id == ad.user_id)
				ad.user = user
				delete ad.user_id
				result.push(ad)
			}
		}

		let { date,category, subcategory,format,page = 1, limit = 5, search } = request.query
		let filtered = []
		for (let ad of result){
			if((date ? (ad.date).includes(date): true) &&
				(subcategory ? subcategory == ad.subcategory : true) &&
				(format ? format == ad.watch_type : true) &&
				(category ? category == ad.category : true) &&
				(search ? (ad.user.first_name + ad.user.last_name).toLowerCase().includes(search.toLowerCase()):true )
			){
				filtered.push(ad)
			}
			
		}
		filtered = filtered.slice(page*limit - limit, page*limit)
		response.json(filtered)
		if(write){
			for (let i of adResponse){
				if(!i.user_id){
					i.user_id = i.user?.user_id
					delete i.user
				}
			}
			request.insert('advertisement',adResponse)
		} 
		return next()
	}catch(error){
		return next(error)
	}
}


const POST = (request,response,next)=>{
	try{
		const users = request.select('users')
		const ads = request.select('advertisement')
		let id
		const { file } = request.files
		const { 
				title,
				short_description,
				description,
				date,
				category,
				subcategory,
				watch_type,
				link,
				first_name,
				last_name,
				contact,
				user_job
			 } = request.body

		let found = users.find(user => (user.first_name == first_name) && (user.last_name == last_name) && (user.contact == contact))
		if(!found){
			let newUser = {
				user_id: users.length ? users[users.length - 1].user_id + 1 :1,
				first_name,
				last_name,
				contact,
				user_job
			}
			id = newUser.user_id
			users.push(newUser)
			request.insert('users',users)
		}else {
			id = found.user_id  
		}

		let fileName = file.name.replace(/\s/g,'')
		let newAd = {
			id: ads.length ? ads[ads.length - 1].id + 1: 1,
			title,
			short_description,
			description,
			img: '/images/' + fileName,
			date,
			active: 0,
			category,
			subcategory,
			watch_type,
			link,
			isAccepts: false,
			user_id: id
		}
		ads.push(newAd)
		request.insert('advertisement',ads)
		file.mv(path.join(process.cwd(),'src','files','images',fileName))

		response.json({
			message: "Advertisement created!"
		})

		return next()
	}catch(error){
		return next(error)
	}
}

const ACTIVE = (request,response,next)=>{
	try{
		const { id } = request.params
		const ads = request.select('advertisement')
		const userResponse = request.select('users')
		let found
		for (let i of ads){
			if(i.id == id && i.isAccepts){
				i.active = i.active + 1
				found = i
				break
			}
			else if(i.id == id && !i.isAccepts){
				found = i
				break
			}
		}
		if(!found)throw new ClientError(404,'Ad Not found!')
		let user = userResponse.find(el=> el.user_id == found.user_id)
		if(found.isAccepts)request.insert('advertisement',ads)
		found.user = user
		delete found.user_id
		response.json(found)
		return next()
	}catch(error){
		return next(error)
	}
}

const DELETE = (request,response,next)=>{
	try{
		const { id } = request.body
		const ads = request.select('advertisement')
		let index = ads.findIndex(el => {
			if((el.id == id) && !el.isAccepts ) return el
		})
		if(index == (-1))throw new ClientError(404,'Advertisement not found!')
		ads.splice(index,1)
		request.insert('advertisement',ads)
		response.json({message: "Advertisement is rejected!"})
	}catch(error){
		return next(error)
	}
}

const PUT = (request,response,next)=>{
	try{
		const { id } = request.body
		const ads = request.select('advertisement')
		if (!id) throw new ClientError(400,'ID not entered!')
		let found = ads.find(el => {
			if(el.id == id){
				el.isAccepts = true
				return el
			}
		})
		if(!found) throw new ClientError(404,'Advertisement not found!')
		response.json({message: 'Advertisement is Accepted!'})
		request.insert('advertisement',ads)
	}catch(error){
		return next(error)
	}
}

module.exports = {
	GET,
	POST,
	PUT,
	DELETE,
	ACTIVE,
}
