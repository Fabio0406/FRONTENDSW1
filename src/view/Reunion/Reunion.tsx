import * as go from "gojs";
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { useNavigate } from 'react-router-dom';

import { useEffect, useRef, useState } from "react";
import DiagramWrapper from "../DiagramWrapper";
import { ReactDiagram } from "gojs-react";
import { io } from 'socket.io-client';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';


const initialData = {
  nodeDataArray: [
    {
      key: "Usuario",
      text: "Usuario",
      isGroup: true,
      loc: "0 0",
      duration: 9,
    },
    {
      key: "Interfaz",
      text: "Interfaz",
      isGroup: true,
      loc: "100 0",
      duration: 9,
    },
    {
      key: "Servidor",
      text: "Servidor",
      isGroup: true,
      loc: "200 0",
      duration: 9,
    },
    {
      key: "Base Datos",
      text: "Base Datos",
      isGroup: true,
      loc: "300 0",
      duration: 9,
    },
    { group: "Interfaz", start: 1, duration: 2 },
    { group: "Servidor", start: 2, duration: 3 },
    { group: "Usuario", start: 3, duration: 1 },
    { group: "Interfaz", start: 5, duration: 1 },
    { group: "Usuario", start: 6, duration: 2 },
    { group: "Base Datos", start: 8, duration: 1 },
  ],

  linkDataArray: [
    { from: "Usuario", to: "Interfaz", text: "order", time: 1 },
    { from: "Interfaz", to: "Servidor", text: "order food", time: 2 },
    { from: "Interfaz", to: "Usuario", text: "serve drinks", time: 3 },
    { from: "Servidor", to: "Interfaz", text: "finish cooking", time: 5 },
    { from: "Interfaz", to: "Usuario", text: "serve food", time: 6 },
    { from: "Usuario", to: "Base Datos", text: "pay", time: 8 },
  ],
};

const Reunion: React.FC = () => {
  const location = useLocation();

  const { id, codigo } = useParams();
  const [data, setData] = useState(initialData);
  const [nextNodeX, setNextNodeX] = useState(400);
  const navigate = useNavigate()

  const diagramRef = useRef<ReactDiagram | null>(null);
  const socket = io('https://backendsw1-production.up.railway.app/reunion');
  let timeoutId;

  useEffect(() => {
    axios.get(`https://backendsw1-production.up.railway.app/diagrama/obtenerDiagramaIdReunion/${id}`)
      .then(async (response) => {
        const tipo = (location.state && location.state.tipo) || 'default';
        console.log("tipo: ", tipo)
        if (tipo === 'unirse' || tipo === 'nueva' || (location.state && location.state.usuarioId === response.data.usuarioId)) {
          console.log('response.data : ', response.data)
          setData(response.data);
        } else {
          navigate('/')
        }
      })
      .catch((error) => {
        // Maneja errores, por ejemplo, mostrando un mensaje al usuario
        console.error('Error al obtener el diagrama:', error);
      });

    socket.on('actualizarDiagramas', (updateData) => {
      console.log('data recib: ', updateData);
      setData(updateData,);
    });
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  // Función para gregar nodo
  const addNode = (_position) => {
    // Genera un nuevo nodo con una clave única
    const newNode = {
      key: "newNode" + Date.now(),
      text: "NewNode",
      isGroup: true,
      loc: `${nextNodeX} 0`,
      duration: 3,
    };
    // Copia el array existente y agrega el nuevo nodo
    const newNodeDataArray = [...data.nodeDataArray, newNode];

    // Actualiza el estado con el nuevo array de nodos
    setData({
      ...data,
      nodeDataArray: newNodeDataArray,
    });
    socket.emit('actualizarDiagrama', { id, data: { nodeDataArray: newNodeDataArray, linkDataArray: data.linkDataArray } });
    convertSVG();
    setNextNodeX(nextNodeX + 100);
  };

  const handleDiagramEvent = () => { };

  // Cuando se realice un cambio
  const handleModelChange = (obj: go.IncrementalData) => {
    if (diagramRef.current) {
      const model = diagramRef.current.getDiagram()?.model;
      // console.log("obj.modifiedLinkData[0] : ", obj.modifiedLinkData[0]);
      // data.linkDataArray.push(obj.modifiedLinkData[0].toJson);
      if (model) {
        const diagramData = {
          ...data,
          nodeDataArray: model.nodeDataArray,
          // @ts-ignore

          linkDataArray: model.linkDataArray

        };

        // Convierte el objeto del diagrama en JSON y guárdalo en el estado o variable
        // @ts-ignore

        setData(diagramData);
        // Cancela el envío anterior y programa un nuevo envío después de 500ms
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // @ts-ignore

          socket.emit('actualizarDiagrama', { id, data: { nodeDataArray: model.nodeDataArray, linkDataArray: model.linkDataArray } });
        }, 500);

        const reunionId = id;

        socket.emit('guardarDiagrama', { reunionId, diagrama: JSON.stringify(diagramData) });
        convertSVG();
      }
    }

    console.log("Model changed:", obj);
  };




  const downloadSvg = () => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();

      if (diagram) {

        const svgString = diagram.makeSvg({
          scale: 1,
          background: 'white',
        });
        const svgText = new XMLSerializer().serializeToString(svgString);


        const blob = new Blob([svgText], { type: 'image/svg+xml' });


        saveAs(blob, 'diagrama.svg');

        axios.post('https://backendsw1-production.up.railway.app/reuniones/savesvg', { svgString: svgText, id })
          .then(_response => {
            // console.log('SVG guardado correctamente en el Servidor:', response.data);
          })
          .catch(error => {
            console.error('Error al guardar el SVG:', error);
          });
      }
    }
  };
  const convertSVG = () => {
    const diagram = diagramRef.current.getDiagram();

    if (diagram) {
      // Obtén el elemento SVG del diagrama
      const svgString = diagram.makeSvg({
        scale: 1,  // Puedes ajustar la escala según sea necesario
        background: 'white',  // Puedes cambiar el fondo si lo deseas
      });
      const svgText = new XMLSerializer().serializeToString(svgString);

      axios.post('https://backendsw1-production.up.railway.app/reuniones/savesvg', { svgString: svgText, id })
        .then(_response => {
          // console.log('SVG guardado correctamente en el Servidor:', response.data);
        })
    }
  };
  
  
  
  const handleGojsDownloadButtonClick = () => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();
      if (diagram) {
        const jsonData = diagram.model.toJson();
        const blob = new Blob([jsonData], { type: 'application/gojs' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagramGoJS.gojs'; // Nombre del archivo a descargar
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }
  };
  const handleUploadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        if (data) {
          const jsonData = typeof data === "string" ? JSON.parse(data) : null;
          if (jsonData) {
            if (diagramRef.current) {
              const diagram = diagramRef.current.getDiagram();
              if (diagram) {
                diagram.model = go.Model.fromJson(jsonData);
              }
            }
          } else {
            console.error("Error al analizar el archivo JSON.");
          }
        }
      };
      reader.readAsText(file);
    } else {
      console.error("No se seleccionó ningún archivo.");
    }
  };



  <input type="file" accept=".gojs" onChange={handleUploadFile} key={Math.random()} />



  return (
    <div>
      <h1>Codigo de la Reunión: {codigo}</h1>
      <div className="row">
        <div className="col1">
          <button className="button2" onClick={addNode}>Añadir Nodo</button>
          
          <div>
            <button className="button2" onClick={handleGojsDownloadButtonClick}>Descargar Diagrama GoJs</button>
          </div>
          <div>
            <button className="button2" onClick={downloadSvg}>Descargar Imagen</button>
          </div>
          <input className="button2" type="file" accept=".gojs" onChange={handleUploadFile} key={Math.random()} />
        </div>
        <div className="col">
          <DiagramWrapper
            diagramRef={diagramRef}
            nodeDataArray={data.nodeDataArray}
            linkDataArray={data.linkDataArray}
            onDiagramEvent={handleDiagramEvent}
            onModelChange={handleModelChange}
          />
        </div>
      </div>
      <div>

        <ul>
          <li> </li>

        </ul>
      </div>
    </div>
  );
};
export default Reunion;