/**
 * All the API calls
 */

async function getAllQuestionari() {
  // call:  GET /api/questionari

  const response = await fetch('/api/questionari', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const fetchedQuestionari = await response.json();

  if (response.ok) {
    return fetchedQuestionari;
  } else {
    throw fetchedQuestionari;  // An object with the error coming from the server
  }
}



async function getAllCompilazioni() {
  // call:  GET /api/compilazioni

  const response = await fetch('/api/compilazioni', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const fetchedCompilazioni = await response.json();
  if (response.ok) {
    return fetchedCompilazioni;
  } else {
    throw fetchedCompilazioni;  // An object with the error coming from the server
  }
}




async function getAllDomande() {
  const response = await fetch('/api/domande', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const fetchedDomande = await response.json();

  if (response.ok) {
    return fetchedDomande;
  } else {
    throw fetchedDomande;  // An object with the error coming from the server
  }

}



function addNewQuestionario(questionario) {
  // call:    POST /api/questionari
  return new Promise((resolve, reject) => {
    fetch('/api/questionari', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionario),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((obj) => { reject(obj); }) // error msg in the response body
            .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // Errore nella json()
        }
      })
      .catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // Errore nella fetch() : connection errors
  });
}


function addCompilazione(compilazione) {
  // call:    POST /api/compilazioni

  return new Promise((resolve, reject) => {
    fetch('/api/compilazioni', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(compilazione),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((obj) => { reject(obj); }) // error msg in the response body
            .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // Errore nella json()
        }
      })
      .catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // Errore nella fetch() : connection errors
  });
}








async function logIn(credentials) {
  let response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch(err) {
      throw err;
    }
  }
}

async function logOut() {
  await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function getUserInfo() {
  const response = await fetch('api/sessions/current');
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server, mostly unauthenticated user
  }
}


const API = { getAllQuestionari, getAllCompilazioni, getAllDomande, addNewQuestionario, addCompilazione, getUserInfo, logIn, logOut };
export default API