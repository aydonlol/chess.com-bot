
async function elo() {

const elo = await page.waitForSelector('<span class="user-tagline-rating user-tagline-dark')
const eloText = await elo.getProperty('textContent')
const eloValue = await eloText.jsonValue()
return eloValue


}

module.exports = elo