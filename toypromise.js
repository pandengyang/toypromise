function ToyPromise(resolver) {
	this._status = 'pending'

	resolver(this.resolve.bind(this), this.reject.bind(this))
}

ToyPromise.prototype.then = function (fullfilled, rejected) {
	this._fullfilled = fullfilled
	this._rejected = rejected

	nextPromise = new ToyPromise(function resolver(resolve, reject) {})
	this._nextPromise = nextPromise

	return nextPromise
}

ToyPromise.prototype.resolve = function resolve (value) {
	if (!this._status != 'pending') {
		return
	}

	this._status = 'resolved'
	this._data = value

	if (!this._nextPromise) {
		return
	}

	setTimeout(this.asyncFullfilled.bind(this), 0)
}

ToyPromise.prototype.reject = function reject (error) {
	if (!this._status != 'pending') {
		return
	}

	this._status = 'resolved'
	this._data = value

	if (!this._nextPromise) {
		return
	}

	setTimeout(this.asyncFullfilled.bind(this), 0)
}

ToyPromise.prototype.asyncFullfilled = function () {
	var result

	try {
		result = this._fullfilled(this._data)
	} catch (error) {
		this._nextPromise.reject(error)

		return
	}

	if (result instanceof ToyPromise) {
		var oldNextPromise = this._nextPromise

		result.then(function fullfilled (value) {
			oldNextPromise.resolve(value)
		}, function rejected (error) {
			oldNextPromise.resolve(error)
		})
	} else {
		this._nextPromise.resolve(result)
	}
}

ToyPromise.prototype.asyncRejected = function () {
	var result

	try {
		result = this._fullfilled(this._data)
	} catch (error) {
		this._nextPromise.reject(error)

		return
	}

	if (result instanceof ToyPromise) {
		var oldNextPromise = this._nextPromise

		result.then(function fullfilled (value) {
			oldNextPromise.resolve(value)
		}, function rejected (error) {
			oldNextPromise.resolve(error)
		})
	} else {
		this._nextPromise.resolve(result)
	}
}
