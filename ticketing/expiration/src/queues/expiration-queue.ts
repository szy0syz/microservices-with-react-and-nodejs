import Queue from 'bull';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  console.log(
    'I want to publish an expiration:complete event for OrderId',
    job.data.orderId
  );
});

export { expirationQueue };
