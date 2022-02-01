const express =  require('express')
const fileUpload = require('express-fileupload')
const PORT = process.env.PORT || 1234
const cors = require('cors')
const path = require('path')
const app = express()
app.use(express.json())
app.use(fileUpload())
app.use(cors())
app.use('/data',express.static(path.join(process.cwd(),'src','files')))
const model = require('./middlewares/model.js')
app.use(model)

const adRouter = require('./router/advertisement.js')
const authRouter = require('./router/auth.js')
app.use('/ad', adRouter)
app.use('/auth', authRouter)


app.use((err,req,res,next)=>{
	if([400,401,404,413,415].includes(err.status)){
		res.status(err.status).json({
			status: err.status,
			message: err.message
		})
	}
	else {
		res.status(500).json({
			status:500,
			message: "Internal Server Error!"
		})
	}
})

app.listen(PORT, ()=> console.log(`Backend server is running on http://localhost:${PORT}`))