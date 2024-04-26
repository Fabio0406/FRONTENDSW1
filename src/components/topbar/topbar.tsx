import React from 'react';
import { Link } from 'react-router-dom';
import './topbar.css';
import { useNavigate } from 'react-router-dom';

const Topbar: React.FC = () => {
  const navigate = useNavigate();

  const localData = window.localStorage.getItem('loggedFocusEvent') !== null ? window.localStorage.getItem('loggedFocusEvent') : null;

  const isLoggedIn = localData !== null && Object.keys(localData).length !== 0;


  const localDataParsed = localData && localData !== 'null' ? JSON.parse(localData) : null;

  const userData = localDataParsed && Object.keys(localDataParsed).length > 0 ? JSON.parse(localDataParsed.userData) : null;


  const handleLogout = () => {
    window.localStorage.removeItem('loggedFocusEvent');

    navigate('/'); // Redirige a la página de inicio
  };
  return (
    <div className="top">
      <div className="topLeft">
        <div className="centeredItems">
          <ul className="topList">
            <li className="topListItem">
              <Link className="link" to="/">
                Inicio
              </Link>
            </li>
          </ul>
        </div>
        <div className="topRight">
          {isLoggedIn && (
            <li className="topListItemTu">
              <Link className="link" to="/diagramas">
                Tus Diagramas
              </Link>
            </li>
          )}
          {isLoggedIn ? (
            <div className="">
              <ul className="topList">
                {userData && (
                  <li className="topListItemTu" >
                    {userData.nombre}
                  </li>
                )}
                <li>
                  <Link className="link" to="/settings">
                    <img className="topImg" style={{ marginTop: '17px' }} src="https://c1.alamy.com/thumbs/2fntnx5/icono-de-perfil-de-messenger-sobre-fondo-blanco-aislado-ilustracion-2fntnx5.jpg" alt="" />
                  </Link>
                </li>
                <li>
                  <button className="topLogoutButton" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <ul className="topList">
              <li className="topListItem">
                <button className="topLogoutButton">
                <Link className="link" to="/login">
                  Iniciar Sesión
                </Link>
                </button>
              </li>
              <li className="topListItem">
              <button className="topLogoutButton">
                <Link className="link" to="/register">
                  Crear Cuenta
                </Link>
              </button>
              </li>
            </ul>
          )}

        </div>
      </div>
    </div>
  );
};

export default Topbar;
