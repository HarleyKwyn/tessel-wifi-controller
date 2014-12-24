#Tessel Wifi Controller

Extends the utilities found in the [Tessel Docs.](https://tessel.io/docs/wifi)

Best feature is automatic reconnecting via `.forever` function.

Standard wifi commands available through the `.wifi` property.

##Instillation

```
var Wifi = require('tessel-wifi-controller');

var config = {
  security: 'SECURITY-METHOD', // usually you'll want WPA2
  ssid: 'YOUR-NETWORK-SSID', // network name
  password: 'IDK-SOMETHING-SECURE', // super secret password
  timeout: 30 // in seconds
}

var wifi = new Wifi(config);

// Your awesome code here.
```

##Methods

###.connect
Thin layer for the standard wifi .connect method but doesn't require you to pass in the configuration information again.

###.forever
Will register a call back that will both  retry connecting after a disconnect three times then power cycle and continue forever until succesful reconnect.

###.powerCycle
Manually power cycle and reconnect.
