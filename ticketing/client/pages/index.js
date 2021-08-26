import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  console.log('LandingPage.getInitialProps');
  const client = buildClient(context);
  const { data } = await client
    .get('/api/users/currentuser')
    .catch((err) => console.log('报错了', err));

  return data;
};

export default LandingPage;
