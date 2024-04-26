import "./header.css";

const Header: React.FC = () =>  {
  return (
    <div className="header">
      <div className="headerImgContainer">
        <img
          className="headerImg"
          src="home.png"          
        />
      </div>
    </div>
  );
};

export default Header;
