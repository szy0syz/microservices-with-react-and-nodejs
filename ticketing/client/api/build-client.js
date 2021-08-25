import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // We are on the server

    return axios.create({
      baseURL:
        'http://default.ticketing-ingress.svc.cluster.local',
      // baseURL:
      // 'http://auth-srv:3000',
      headers: req.headers,
    });
  } else {
    // We must be on the browser
    return axios.create({
      baseUrl: '/',
    });
  }
};
