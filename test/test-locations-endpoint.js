const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const mongoose = require('mongoose')

const expect = chai.expect

const { app, runServer, closeServer } = require('../server')
const Location = require('../models/locations-model')
const {TEST_DATABASE_URL} = require('../config')

chai.use(chaiHttp)

function seedLocationData () {
	console.info('seeding location info')
	const seedData = []

	for (let i=1; i<=10; i++) {
		seedData.push(generateLocationData())
	}

	return Location.insertMany(seedData)
}

function generateLocationData () {
	return {
		location: faker.lorem.word()
	}
}

function tearDownDb() {
	console.warn('Deleting database')
	return mongoose.connection.dropDatabase()
}

describe('locations API', function() {
	before(function() {
		return runServer(TEST_DATABASE_URL)
	})

	beforeEach(function() {
		return seedLocationData()
	})

	afterEach(function() {
		tearDownDb()
	})

	after(function() {
		return closeServer()
	})

	describe('GET endpoint', function() {

		it('should return all existing locations', function () {
			let res;
			return chai.request(app)
				.get('/api/locations')
				.then(function(_res){
					res = _res
					expect(res).to.have.status(200)
					expect(res.body).to.have.length.of.at.least(1)
					return Location.count()
			})
		})

		it('should return location with right fields', function () {
			let resLocation;
			return chai.request(app)
				.get('/api/locations')
				.then(function(res) {
					expect(res).to.have.status(200)
					expect(res).to.be.json
					expect(res.body).to.be.a('array')
					expect(res.body).to.have.length.of.at.least(1)

					res.body.forEach(function(location){
						expect(location).to.be.a('object')
						expect(location).to.include.keys('id', 'location')
					})

					resLocation = res.body[0]
					return Location.findById(resLocation.id)
				})
				.then (function(location){
					expect(resLocation.id).to.equal(location.id)
					expect(resLocation.location).to.equal(location.location)
				})

		})
	})

	describe('POST endpoint', function() {
		it('should add a new location', function() {
			const newLocation = generateLocationData()

			return chai.request(app)
				.post('/api/locations')
				.send(newLocation)
				.then(function(res){
					expect(res).to.have.status(201)
					expect(res).to.be.json
					expect(res.body).to.be.a('object')
					expect(res.body).to.include.keys('id', 'location')
					expect(res.body.id).to.not.be.null
					expect(res.body.location).to.equal(newLocation.location)
				})
		})
	})

	// describe('DELETE endpoint', function() {
	// 	let location;
		
	// 	it('should delete a location', function () {
	// 		return Location
	// 		.findOne()
	// 		.then(function(_location) {
	// 			location = _location
	// 			return chai.request(app).delete(`/api/locations/${location.id}`)
	// 		})
	// 		.then(function(res) {
	// 			expect(res).to.have.status(204)
	// 			return Location.findById(location.id)
	// 		})
	// 		.then(function(_location) {
	// 			expect(_location).to.be.null
	// 		})
	// 	})


	// })

	describe('PUT endpoint', function(){
		it('should update field you send over', function() {
			const updateData = {
				location: faker.lorem.word()
			}

			return Location
				.findOne()
				.then(function(location) {
					updateData.id = location.id

					return chai.request(app)
						.put(`/api/locations/${location.id}`)
						.send(updateData)
				})
				.then(function(res) {
					expect(res).to.have.status(204)

					return Location.findById(updateData.id)
				})
				.then(function(location) {
					expect(location.location).to.equal(updateData.location)
				})
		})
	})
})
