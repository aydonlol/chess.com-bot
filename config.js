module.exports = {
    //puppeteer.LaunchOptions
    browserCfg: {
        product: 'firefox', // chrome or firefox
        executablePath: '/usr/bin/firefox', // path for browser, not required (unless your browser isn't named the default)
        headless: false // runs stuff without a screen. set to false if you actually want to see the board
    },

    // PHPSESSID
    // multiple are allowed, untested though
    // create account on chess.com
    cookies: [
        "b"
        
    ]
};