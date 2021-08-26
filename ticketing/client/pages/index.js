const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

// LandingPage.getInitialProps = async (context) => {
  // 这里因为在 AppContainer 中已经获取一次了，我们及传递下来，不要二次重复
  // const client = buildClient(context);
  // const { data } = await client
  //   .get('/api/users/currentuser')
  //   .catch((err) => console.log('报错了', err));
  // return data;
// };

export default LandingPage;
