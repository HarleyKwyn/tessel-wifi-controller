/* the wifi-cc3000 library is bundled in with Tessel's firmware,
 * so there's no need for an npm install. It's similar
 * to how require('tessel') works.
 */

function WifiController(config) {
  this.wifi = require('wifi-cc3000');
  this.config = config;
  this.timeouts = 0;
  this.disconnects = 0;
  this.connecting = false;
  this.init();
}

WifiController.prototype.connect = function(cb) {
  console.log('WifiController: connecting...')
  if (!this.connecting) {
    this.wifi.connect(this.config);
    this.connecting = true;
  }

  this.wifi.on('connect', function(err) {
    console.log(err);
    if (cb) {
      cb();
    };
  });
};

WifiController.prototype.forever = function(cb) {
  var self = this;
  self.wifi.on('disconnect', function(data) {
    self.disconnects += 1;
    if (self.disconnects > 3) {
      self.disconnects = 0;
      console.log('WifiController: disconnected too many times, power cyling...')
      self.powerCycle()
    } else {
      console.log('WifiController: disconnected, retrying...')
      self.connect();
    }
  });
  self.wifi.on('connect', function(data) {
    console.log('WifiController: reconnected');
    if (cb) {
      cb()
    };
  });
}

WifiController.prototype.init = function() {
  console.log('wifi init');
  var self = this;

  this.wifi.connect(self.config);
  self.wifi.on('connect', function(data) {
    // you're connected
    console.log("WifiController: connect emitted", data);
    self.connecting = false;
  });

  self.wifi.on('disconnect', function(data) {
    // wifi dropped, probably want to call connect() again
    console.log("WifiController: disconnect emitted", data);
  })

  self.wifi.on('timeout', function(err) {
    // tried to connect but couldn't, retry
    console.log("WifiController: timeout emitted");
    self.connecting = false;
    if (self.timeouts > 3) {
      // reset the this.wifi chip if we've timed out too many times
      self.powerCycle();
    } else {
      // try to reconnect
      self.connect();
    }
  });

  this.wifi.on('error', function(err) {
    self.connecting = false;
    // one of the following happened
    // 1. tried to disconnect while not connected
    // 2. tried to disconnect while in the middle of trying to connect
    // 3. tried to initialize a connection without first waiting for a timeout or a disconnect
    console.log("WifiController: error emitted", err);
  });
}

// reset the wifi chip progammatically
WifiController.prototype.powerCycle = function() {
  var self = this;

  // when the wifi chip resets, it will automatically try to reconnect
  // to the last saved network
  self.wifi.reset(function() {
    self.timeouts = 0; // reset timeouts
    console.log("WifiController: done power cycling");
    // give it some time to auto reconnect
    setTimeout(function() {
      if (!self.wifi.isConnected()) {
        // try to reconnect
        console.log('WifiController: trying to reconnect...')
        self.connect();
      }
    }, 20 * 10000); // 20 second wait
  })
};

module.exports = WifiController;
