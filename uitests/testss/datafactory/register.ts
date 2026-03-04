import { request } from '@playwright/test';

const createReqeuestContext = await request.newContext();
const apiUrl = 'https://practicesoftwaretesting.com';

await createReqeuestContext.post(apiUrl + '/users/register', {
  data: {
  "first_name": "Dennis",
  "last_name": "silot",
  "dob": "1995-10-10",
  "phone": "0705515471",
  "email": "kip@mail.com",
  "password": "Silot777@",
  "address": {
    "street": "Olebush",
    "city": "Oleng",
    "state": "Nairobi",
    "country": "KE",
    "postal_code": "20152"
  }
},
  headers: {
    'sec-ch-ua-platform': '"macOS"',
    Referer: 'https://practicesoftwaretesting.com/',
    'Accept-Language': 'en-US',
    'sec-ch-ua': '"HeadlessChrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/143.0.7499.4 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
  }
});