import React from 'react';

const getRobots = () => {
  return `User-agent: *\nDisallow: /`;
};

class Robots extends React.Component {
  static async getInitialProps({ res }) {
    res.setHeader('Content-Type', 'text/plain');
    res.write(getRobots());
    res.end();
  }
}
export default Robots;
