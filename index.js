const joi = require('joi')
const express = require('express')
const app = express()
const PORT = process.PORT || 3000
const needBody = ['POST','PUT','PATCH']
const schema = joi.object({
    "url": joi.string().required(),
    "userAgent": joi.string(),
    "method": joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').required(),
    "body": joi.string(),
    "headers": joi.object()
})

app.use(express.json())

app.post('/', async (req,res) => {
    const {error} = schema.validate(req.body)
    if(error) res.json({"code":400,"message":error.message})
    const json = req.body
    let reqJSON = {"method":json.method,"headers":{}}
    if(needBody.includes(json.method) && !json.body) res.status(400).json({"code":400,"message":`Your request needs a body if you are sending a ${json.method} request`})
    if(needBody.includes(json.method)) reqJSON.method = json.method
    if(json.headers) reqJSON.headers = json.headers
    if(json.userAgent) reqJSON.headers['user-agent'] = json.userAgent
    if(json) {
        try {
            const r = await fetch(json.url,reqJSON)
            let headers = {}
            for([i,v] of r.headers.entries()) headers[i] = v
            const data = headers['content-type'].includes('application/json')? await r.json() : await r.text()
            res.json({
                "statusCode": r.status,
                "data": data,
                "headers": headers
        })
        } catch(e) {
            console.error(e)
            res.json({'error':e.message,'mesage':'An unexcpected error accoured'})
        }
    }
})

app.listen(3000)