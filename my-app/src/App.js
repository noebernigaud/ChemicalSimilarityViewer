import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

// function App() {

//   return (
//     // <div className="App">
//     //   <header className="App-header">
//     //     <button onClick={Send}>
//     //       Send
//     //     </button>
//     //   </header>
//     // </div>
//     <div>
//   );
// }

// export default App;

function App() {
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  var isSelected = false;

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);

    isSelected = true;
  };

  const handleSubmission = () => {
    const formData = new FormData();

    formData.append('File', selectedFile);

    fetch(
      '/file',
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => response.json())
      .then(res => { document.getElementById('name').innerHTML = "Nombre de molécules :" + res.file; })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <input type="file" name="file" onChange={changeHandler} />
      {isSelected ? (
        <div>
          <p>Filename: {selectedFile.name}</p>
          <p>Filetype: {selectedFile.type}</p>
          <p>Size in bytes: {selectedFile.size}</p>
          <p>
            lastModifiedDate:{' '}
            {selectedFile.lastModifiedDate.toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p>Select a file to show details</p>
      )}
      <div>
        <button onClick={handleSubmission}>Submit</button>
      </div>
    </div>
  )
};


export default App;

function Send() {
  var inputName = document.getElementById("nameinput").value;

  fetch('/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ title: inputName })
  })
    .then((response) => response.json()
      .then(res => { document.getElementById('name').innerHTML = "hello " + res.title; }));
}

