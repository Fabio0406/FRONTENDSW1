import React from 'react';

import Posts from '../../components/posts/Posts';
import Footer from '../../components/footer/footer';
import './homepage.css';

const Homepage: React.FC = () => {
  return (
    <>
      
      <div className="content-container">
        <div className="posts-container">
          <Posts />
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Homepage;
