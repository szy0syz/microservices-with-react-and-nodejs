const axios = require('axios');
const https = require('https');

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const cookie =
  'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall4TXpSak9UVTNaR1F6Tmpnd01EQXhPV05rTlRoa01DSXNJbVZ0WVdsc0lqb2lNVEl6UURFeU15NWpiMjBpTENKcFlYUWlPakUyTXpBNE5EazVOekY5Lk5seTQxSmRneENRR2hLMldHVTZSTVo0emtzT2gtV0xFZEZodWczOHEtbDgifQ==';

const doRequest = async (index) => {
  const { data } = await instance.post(
    `https://ticketing.dev/api/tickets`,
    {
      title: 'ticket',
      price: 5,
    },
    {
      headers: { cookie },
    }
  );

  await instance.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      title: 'ticket',
      price: 10,
    },
    {
      headers: { cookie },
    }
  );

  await instance.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      title: 'ticket',
      price: 15,
    },
    {
      headers: { cookie },
    }
  );

  console.log(`[${index}] - Request complete.`);
};

(async () => {
  for (let i = 0; i < 200; i++) {
    doRequest(i);
  }
})();
