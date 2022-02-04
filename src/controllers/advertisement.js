const path = require('path')
const { ClientError } = require('../utils/error.js')
const GET = (request,response,next)=>{
	try{
		let adResponse = request.select('advertisement')
		let userResponse = request.select('users')
		let { adminAd } = request.params
		let result = []
		let write
		for (let ad = 0; ad < adResponse.length; ad++){
			let dateReversed = adResponse[ad].date.split(' ')[0].split('/')
			let resultDate = dateReversed[1]+'/'+dateReversed[0]+'/'+dateReversed[2]+' '+adResponse[ad].date.split(' ')[1]
			let dates = (new Date()) - (new Date(resultDate)).getTime()
			if(dates > 0){
				let index = adResponse.findIndex(el => el.id == adResponse[ad].id)
				adResponse.splice(index,1)
				ad = ad == 0 ? ad : ad - 1
				write = true
			}
		}
		adResponse.sort((a, b) => (new Date(a.date.slice(3, 6) + a.date.slice(0, 3) + a.date.slice(6)).getTime()) >
		(new Date(b.date.slice(3, 6) + b.date.slice(0, 3) + b.date.slice(6)).getTime()) ? 1 : -1)
		for (let ad of adResponse){
			if ((adminAd == "pendding") && (ad.isAccepts == "pendding")){
				let user = userResponse.find(user => user.user_id == ad.user_id)
				ad.user = user
				delete ad.user_id
				result.push(ad)
			}
			else if ((!adminAd) && (ad.isAccepts == "accepts")){
				let user = userResponse.find(user => user.user_id == ad.user_id)
				ad.user = user
				delete ad.user_id
				result.push(ad)
			}
			else if ((adminAd == "rejected") && (ad.isAccepts == "rejected")){
				let user = userResponse.find(user => user.user_id == ad.user_id)
				ad.user = user
				delete ad.user_id
				result.push(ad)
			}
		}

		let { date,category, subcategory,format,page = 1, limit = 6, search } = request.query
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
			isAccepts: 'pendding',
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
			if(i.id == id && i.isAccepts == 'accepts'){
				i.active = i.active + 1
				found = i
				break
			}
			if(i.id == id && i.isAccepts == 'pendding'){
				found = i
				break
			}
			if(i.id == id && i.isAccepts == 'rejected'){
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


const PUT = (request,response,next)=>{
	try{
		const { id,faol } = request.body
		const ads = request.select('advertisement')
		if (!id) throw new ClientError(400,'ID not entered!')
		let found = ads.find(el => {
			if(el.id == id){
				if(el.isAccepts == 'pendding'){
					el.isAccepts = faol == 1 ? 'accepts': 'rejected'
				}
				else{
					el.isAccepts = (el.isAccepts == 'accepts' ? 'rejected' : 'accepts')
				}
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
	ACTIVE,
}
