const puppeteer = require("puppeteer-extra")
const {codes, pageURL} = require('./config');
const moment = require('moment');
const fs = require('fs');

(async () => {
  const pluginStealth = require("puppeteer-extra-plugin-stealth");
  puppeteer.use(pluginStealth());
  fs.writeFileSync('results.csv', 'HTTPresponse,successError,DateTime,code,valid\n');
  for (let i = 0; i < codes.length; i++) {
    let valid = false;
    let responseStatus;
    try {
      console.log(`${i} - Started Working on code # ${i + 1} (${codes[i]}) at: ${moment().format('DD-MM-YYYY HH:mm:ss')}`);
      const browser = await puppeteer.launch({ headless: true, args: [ '--window-size=1366,768', '--no-sandbox' ] });
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 768 });
      const response = await page.goto(pageURL, { timeout: 0, waitUntil: 'load' });
      responseStatus = response.status();
      // console.log(responseStatus);
      if (response.status() === 403) {
        console.log('Your ip Blocked by Website...');
      } else if (response.status() === 404) {
        console.log('Page Not Found...');
      } else {
        // const zipcodeInputNode = await page.$('input#zipcode-input');
        // if (zipcodeInputNode) {
        //   await page.type('input#zipcode-input', '90001');
        //   await page.keyboard.press('Enter');
        //   await page.waitForSelector('button.art-fsp-shopThisStoreBtn0');
        //   await Promise.all([
        //     page.waitForNavigation({timeout: 0, waitUntil: 'load'}),
        //     page.click('button.art-fsp-shopThisStoreBtn0'),
        //   ]);
        // }
        
        await page.click('button.btn-add');
        await page.waitFor(3000);
        await page.goto('https://www.lowes.com/cart', {timeout: 0, waitUntil: 'load'});
        await page.waitForSelector('a.art-sc-promo_expand');
        await page.click('a.art-sc-promo_expand');
        await page.waitForSelector('input.art-sc-promo_inputField');
        await page.type('input.art-sc-promo_inputField', codes[i]);
        await page.click('input.art-sc-promo_btnApply');
        await page.waitFor(3000);
        const errorNode = await page.$('.js-promo-error-alert');
        if (errorNode) {
          console.log('Code is INVALID - Error Node Found');
        } else {
          console.log('Code is VALID - Error Node Not Found');
          valid = true;
        }
      }
      await page.close();
      await browser.close();
      fs.appendFileSync('results.csv', `${responseStatus},SUCCESS,${moment().format('DD-MM-YYYY HH:mm:ss')},${codes[i]},${valid}\n`);
    } catch (error) {
      console.log(error);
      fs.appendFileSync('results.csv', `${responseStatus},ERROR,${moment().format('DD-MM-YYYY HH:mm:ss')},${codes[i]},${valid}\n`);
    }
    console.log(`${i} - Finished Working on code # ${i + 1} (${codes[i]}) at: ${moment().format('DD-MM-YYYY HH:mm:ss')}`);
  }
})();
