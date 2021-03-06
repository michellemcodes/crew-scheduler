const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const jsonParser = bodyParser.json()
const Position = require('../models/positions-model')


router.get('/', (req, res) => {
	Position
		.find().collation({locale:'en',strength: 2}).sort({position:1})
		.then(positions => {
			res.json(positions.map(position => position.serialize()))
		})
		.catch(err => {
			console.log(err)
			res.status(500).json({error: 'Server Error'})
		})
})

router.post('/', jsonParser, (req, res) => {
	if (req.body.position == '') {
		res.status(400).json({error: 'No position entered'})
	}
	Position
		.create({
			position: req.body.position
		})
		.then(position => res.status(201).json(position.serialize()))
		.catch(err => {
			console.error(err)
			res.status(500).json({error: 'Something went wrong'})
		})
})

router.put('/:id', jsonParser, (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    	res.status(400).json({
      		error: 'Request path id and request body id values must match'
    	})
  	}

  	let updatedPosition = {
		position: req.body.position
  	}

  	Position
  		.findByIdAndUpdate(req.params.id, { $set: updatedPosition }, { new: true })
  		.then(update => res.status(204).end())
  		.catch(err => res.status(500).json({message: 'something went wrong'}))	
})

router.delete('/:id', (req, res) => {
	Position
		.findByIdAndRemove(req.params.id)
		.then(() => {
			res.status(204).json({message: 'success'})
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({error: 'something went wrong'})
		})
})

module.exports = router

