import puppeteer from "puppeteer";
import fs from 'node:fs'

import utils from "./src/utils.js";

const getPage = async (url, targetRegion) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const selector = ".ProductPage_root__q7hfA";
  const cookie = ".CookiesAlert_agreeButton__cJOTA > button";
  const region = ".Region_regionIcon__oZ0Rt";
  const regionWrapper = ".UiRegionListBase_listWrapper__Iqbd5";
  const regionList = ".UiRegionListBase_list__cH0fK > li";
  const price = ".Price_price__QzA8L";
  const rateReviews = ".ActionsRow_reviewsWrapper__D7I6c > a";

  // init
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.setViewport({ width: 1280, height: 720 });

  // cookie
  await page.waitForSelector(cookie);
  await (await page.$(cookie)).click();

  // change region
  await page.waitForSelector(region);
  await (await page.$(region)).click();

  await page.waitForSelector(regionWrapper);

  await page.waitForSelector(regionList);
  const els = await page.$$(regionList);

  for (const el of els) {
    if ((await el.evaluate((el) => el.textContent)).includes(targetRegion)) {
      await el.click();
      break;
    }
  }

  await new Promise((res, rej) => setTimeout(() => res(), 5000));

  await page.waitForSelector(selector);
  const element = await page.$(selector);

  // check dir
  if (!fs.existsSync(`./data/${url.split("/").at(-1)}`)) {
    fs.mkdirSync(`./data/${url.split("/").at(-1)}`);
  }

  // make screenshoot
  await element.screenshot({
    path: `./data/${url.split("/").at(-1)}/screenshot.jpg`,
  });

  // get product data
  const data = {
    price: await (await page.$(price)).evaluate((el) => el.textContent),
    rate: await (
      await page.$$(rateReviews)
    )[0].evaluate((el) => el.textContent),
    reviews: await (
      await page.$$(rateReviews)
    )[1].evaluate((el) => el.textContent),
  };

  // set product data
  fs.writeFileSync(
    `./data/${url.split("/").at(-1)}/product.txt`,
    JSON.stringify(data)
  );

  await browser.close();
};

(async () => {
  const args = await utils.getArgs();

  await getPage(args.product, args.region);
})();
