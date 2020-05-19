function ToyPromise(resolver) {
	this._status = 'pending'
	this.nextPromise = null

	// 决议函数
	this.fullfilled = function dummy() {}
	this.rejected = function dummy() {}

	function resolve (value) {
		if (!this._status != 'pending') {
			return
		}

		this._status = 'resolved'
		this._value = value

		// 异步执行 then 注册的回调
		setTimeout(function asyncFullfilled() {
			var result = this.fullfilled()

			if (result instanceof ToyPromise) {
				result.nextPromise = this.nextPromise
				result.resolve()
			} else {
				this.nextPromise.resolve()
			}
		}, 0)
	}

	function reject () {
	}

	// resolver 立即调用
	// resolve, reject 由 Promise 库提供，用于实现控制反转
	resolver(resolve.bind(this), reject.bind(this))
}

// 注册处理函数
ToyPromise.prototype.then = function (fullfilled, rejected) {
	// 为当前 Promise 设置回调
	this.fullfilled = fullfilled
	this.rejected = rejected

	// 无须关联任务
	// 新 Promise 的决议不是由任务触发，而是由前一个 Promise 触发
	nextPromise = new ToyPromise(function resolver(resolve, reject) {})
	this.nextPromise = nextPromise
}
