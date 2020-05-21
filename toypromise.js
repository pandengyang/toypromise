function ToyPromise(resolver, name) {
  this._status = "pending";
  this.name = name;

  resolver(this.resolve.bind(this), this.reject.bind(this));
}

ToyPromise.prototype.then = function(fullfilled, rejected, name) {
  this._fullfilled = fullfilled;
  this._rejected = rejected;

  nextPromise = new ToyPromise(function resolver(resolve, reject) {}, name);
  this._nextPromise = nextPromise;
  console.log("" + this.name + "'s nextPromise is " + name);

  return nextPromise;
};

ToyPromise.prototype.resolve = function resolve(value) {
  if (this._status != "pending") {
    return;
  }

  this._status = "resolved";
  this._data = value;

  setTimeout(this.asyncFullfilled.bind(this), 0);
};

ToyPromise.prototype.reject = function reject(error) {
  if (this._status != "pending") {
    return;
  }

  this._status = "resolved";
  this._data = error;

  setTimeout(this.asyncRejected.bind(this), 0);
};

ToyPromise.prototype.asyncFullfilled = function() {
  console.log("\n" + this.name + " " + this._status + ": " + this._data);

  if (!this._nextPromise) {
    return;
  }

  var result;
  try {
    result = this._fullfilled(this._data);
  } catch (error) {
    console.log("reject next promise " + this._nextPromise.name);
    this._nextPromise.reject(error);

    return;
  }

  if (result instanceof ToyPromise) {
    var oldNextPromise = this._nextPromise;

    result.then(
      function fullfilled(value) {
        console.log("resolve old next promise " + oldNextPromise.name);
        oldNextPromise.resolve(value);
      },
      function rejected(error) {
        console.log("reject old next promise " + oldNextPromise.name);
        oldNextPromise.reject(error);
      },
      result.name + "'s next"
    );
  } else {
    console.log("resolve next promise " + this._nextPromise.name);
    this._nextPromise.resolve(result);
  }
};

ToyPromise.prototype.asyncRejected = function() {
  console.log("\n" + this.name + " " + this._status + ": " + this._data);

  if (!this._nextPromise) {
    return;
  }

  var result;
  try {
    result = this._rejected(this._data);
  } catch (error) {
    console.log("reject next promise " + this._nextPromise.name);
    this._nextPromise.reject(error);

    return;
  }

  if (result instanceof ToyPromise) {
    var oldNextPromise = this._nextPromise;

    result.then(
      function fullfilled(value) {
        console.log("resolve old next promise " + oldNextPromise.name);
        oldNextPromise.resolve(value);
      },
      function rejected(error) {
        console.log("reject old next promise " + oldNextPromise.name);
        oldNextPromise.resolve(error);
      },
      result.name + "'s next"
    );
  } else {
    console.log("resolve next promise " + this._nextPromise.name);
    this._nextPromise.resolve(result);
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
  function(value) {
    return "b";
  },
  function(error) {
    return "b";
  },
  "B"
)
  .then(
    function(value) {
      throw new Error("c");
    },
    function(error) {
      throw new Error("c");
    },
    "C"
  )
  .then(
    function(value) {
      return "d";
    },
    function(error) {
      return "d";
    },
    "D"
  )
  .then(
    function(value) {
      return new ToyPromise(function(resolve, reject) {
        var number = Math.random();

        if (number <= 0.5) {
          resolve("d_1");
        } else {
          reject(new Error("d_1"));
        }
      }, "D_1");
    },
    function(error) {
      return "e";
    },
    "E"
  )
  .then(
    function(value) {
      return "f";
    },
    function(error) {
      return "f";
    },
    "F"
  );
