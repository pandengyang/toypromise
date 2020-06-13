function ToyPromise(resolver, name) {
  this._status = "pending";
  this._name = name;

  this._fullfilled = function dummyFullfilled(value) {
    return value;
  };
  this._rejected = function dummyRejected(error) {
    throw error;
  };

  resolver(this._resolve.bind(this), this._reject.bind(this));
}

ToyPromise.prototype.then = function(fullfilled, rejected, name) {
  this._fullfilled = fullfilled;
  this._rejected = rejected;

  nextPromise = new ToyPromise(function resolver(resolve, reject) {}, name);
  this._nextPromise = nextPromise;
  console.log("" + this._name + "'s nextPromise is " + name);

  return nextPromise;
};

ToyPromise.prototype._resolve = function resolve(value) {
  if (this._status != "pending") {
    return;
  }

  this._status = "fullfilled";
  this._data = value;

  setTimeout(this._asyncFullfilled.bind(this), 0);
};

ToyPromise.prototype._reject = function reject(error) {
  if (this._status != "pending") {
    return;
  }

  this._status = "rejected";
  this._data = error;

  setTimeout(this._asyncRejected.bind(this), 0);
};

ToyPromise.prototype._asyncFullfilled = function() {
  console.log("\n" + this._name + " " + this._status + ": " + this._data);

  if (!this._nextPromise) {
    return;
  }

  var result;
  try {
    console.log("\tcall " + this._name + "'s _fullfiled");
    result = this._fullfilled(this._data);
  } catch (error) {
    console.log(
      "\treject next promise " + this._nextPromise._name + " by exception"
    );
    this._nextPromise._reject(error);

    return;
  }

  if (result instanceof ToyPromise) {
    result._fullfilled = this._nextPromise._fullfilled;
    result._rejected = this._nextPromise._rejected;
    result._nextPromise = this._nextPromise._nextPromise;

    this._nextPromise = result;

    console.log(
      "\t" + this._name + "'s next promise is " + this._nextPromise._name
    );
    console.log(
      "\t" + result._name + "'s next promise is " + result._nextPromise._name
    );
  } else {
    console.log("\tresolve next promise " + this._nextPromise._name);
    this._nextPromise._resolve(result);
  }
};

ToyPromise.prototype._asyncRejected = function() {
  console.log("\n" + this._name + " " + this._status + ": " + this._data);

  if (!this._nextPromise) {
    return;
  }

  var result;
  try {
    console.log("\tcall " + this._name + "'s _rejected");
    result = this._rejected(this._data);
  } catch (error) {
    console.log(
      "\treject next promise " + this._nextPromise._name + "by exception"
    );
    this._nextPromise._reject(error);

    return;
  }

  if (result instanceof ToyPromise) {
    result._fullfilled = this._nextPromise._fullfilled;
    result._rejected = this._nextPromise._rejected;
    result._nextPromise = this._nextPromise._nextPromise;

    this._nextPromise = result;

    console.log(
      "\t" + this._name + "'s next promise is " + this._nextPromise._name
    );
    console.log(
      "\t" + result._name + "'s next promise is " + result._nextPromise._name
    );
  } else {
    console.log("\tresolve next promise " + this._nextPromise._name);
    this._nextPromise._resolve(result);
  }
};

var A = new ToyPromise(function(resolve, reject) {
  var number = Math.random();

  if (number <= 0.5) {
    resolve("a");
  } else {
    reject(new Error("a"));
  }
}, "A");

A.then(
  function fullfilled(value) {
    return "b";
  },
  function rejected(error) {
    return "b";
  },
  "B"
)
  .then(
    function fullfilled(value) {
      throw new Error("c");
    },
    function rejected(error) {
      throw new Error("c");
    },
    "C"
  )
  .then(
    function fullfilled(value) {
      return "d";
    },
    function rejected(error) {
      return "d";
    },
    "D"
  )
  .then(
    function fullfilled(value) {
      return new ToyPromise(function(resolve, reject) {
        var number = Math.random();

        if (number <= 0.5) {
          resolve("d_1");
        } else {
          reject(new Error("d_1"));
        }
      }, "D_1");
    },
    function rejected(error) {
      return "e";
    },
    "E"
  )
  .then(
    function fullfilled(value) {
      return "f";
    },
    function rejected(error) {
      return "f";
    },
    "F"
  );
