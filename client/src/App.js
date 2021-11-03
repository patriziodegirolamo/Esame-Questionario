import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Alert, Container, Spinner } from "react-bootstrap";
import MyNavbar from './MyComponents/MyNavbar.js';
import MyModalLogin from './MyComponents/MyModalLogin.js';
import MyQuestionari from './MyComponents/MyQuestionarioScegli.js';
import MyCompilaQuestionario from './MyComponents/MyCompilaQuestionario.js';
import AggiungiQuestionario from './MyComponents/AggiungiQuestionario';
import MyVisualizzaQuestionari from './MyComponents/MyVisualizzaQuestionari';

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import GuardaRisultati from './MyComponents/GuardaRisultati';
import API from './API';

import {FcServices} from "react-icons/fc";


function App() {

  //all' inizio nessuno user è loggato
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedAdmin, setLoggedAdmin] = useState(null);

  //serve per visualizzare il modal di login
  const [showLoginModal, setShowLoginModal] = useState(false);


  const [questionari, setQuestionari] = useState([]);
  const [domande, setDomande] = useState([]);
  const [risposteUser, setRisposteUser] = useState([]);

  //dirty === true --> faccio una get dei dati dal server
  const [dirty, setDirty] = useState(true);

  //serve per i messaggi di errore
  const [message, setMessage] = useState("");

  //serve per visualizzare lo spinner di caricamento:
  //fin quando loading è true, visualizzo lo spinner
  const [loading, setLoading] = useState(true);


  const handleCloseModal = () => setShowLoginModal(false);


  //chiede al server di fare una post di un questionario
  //carica sia il questionario, sia le domande relative al questionario
  const addNewQuestionario = async (newQuestionario) => {
    try {
      await API.addNewQuestionario(newQuestionario);
      setDirty(true)
      setLoading(true);
    }
    catch (err) {
      setMessage(err);
    }
  }


  //chiede al server di fare una post delle compilazioni di un questionario
  const addNewCompilazione = async (newCompilazione) => {
    try {
      await API.addCompilazione(newCompilazione);
      setDirty(true);
      setLoading(true);
    }
    catch (err) {
      setMessage(err);
    }
  }

  const addNewDomande = (newDomande) => {
    setDomande(() => domande.concat(newDomande))
  }


  //quando eseguo il login --> vado a reperire dal server tutti i dati con delle get
  const doLogIn = async (credentials) => {
    try {
      const admin = await API.logIn(credentials);
      setLoggedAdmin(admin);
      setLoggedIn(true);
      setDirty(true);
      setLoading(true);
    }
    catch (err) {

      // error is handled and visualized in the login form, do not manage error, throw it
      // handleErrors(err)
      throw err;
    }
  }

  //quando faccio un logout --> richiedo al server i dati
  const handleLogOut = async () => {
    try {
      await API.logOut()
      // clean up everything
      setLoggedIn(false);
      setLoggedAdmin(null);
      setDirty(true);
      setLoading(true);
      setShowLoginModal(false)

    }
    catch (err) {
      setMessage(err);
    }

  }

  // check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedAdmin(user);
        setLoggedIn(true);
      } catch (err) {
      }
    };
    checkAuth();
  }, []);



  useEffect(() => {
    const getQuestionari = async () => {

      //se è loggato --> richiedo questionari, relative domande e compilazioni
      if (loggedIn) {
        try {
          const fetchedQuestionari = await API.getAllQuestionari()
          const fetchedDomande = await API.getAllDomande();
          const fetchedCompilazioni = await API.getAllCompilazioni();

          setQuestionari(fetchedQuestionari);
          setDomande(fetchedDomande);
          setRisposteUser(fetchedCompilazioni);

          setDirty(false);
          setLoading(false);

        }
        catch (err) {
          setMessage("Ci dispiace ma il servizio non è al momento disponibile, riprovare più tardi");
        }

      }

      //altrimenti richiedo solo questionari e relative domande
      else {
        try {
          const fetchedQuestionari = await API.getAllQuestionari()
          const fetchedDomande = await API.getAllDomande();

          setQuestionari(fetchedQuestionari);
          setDomande(fetchedDomande);

          setDirty(false);
          setLoading(false);

        }
        catch (err) {
          setMessage("Ci dispiace ma il servizio non è al momento disponibile, riprovare più tardi");
        }

      }

      //clean up
      return () => {
        setQuestionari([]);
        setDomande([]);
        setRisposteUser([]);
        setMessage("");
      };
    }

    if (dirty) {
      getQuestionari();
    }
  }, [dirty, loggedIn]);



  return <Router>

    <MyNavbar loggedAdmin={loggedAdmin}
      handleLogOut={handleLogOut}
      setShowLoginModal={setShowLoginModal}>
    </MyNavbar>

    
    <Alert show={message !== ""} variant="danger" onClose={() => setMessage("")}
      style={{margin: 20, textAlign: "center"}}>
      <FcServices size="30" style={{marginRight: 20}}/>
      {message}
    </Alert>


    <Switch>

      <Route path='/questionari/:idQuest' render={({ match }) => {

        if (loggedIn) {
          return <Redirect to="/"></Redirect>
        }


        if (loading) {
          return <Container id="containerSpinner">
            <Spinner animation="border" variant="danger" />
          </Container>
        }


        else {
          //se l' if va a buon fine, trovo almeno almeno un questionario da renderizzare
          if (questionari.filter(quest => quest.idQuest === Number.parseInt(match.params.idQuest)).length !== 0) {
            //filtro i questionari con l'id proveniente dall'url
            //ti ritorna un array di un solo elemento, se esiste
            return <>
              <MyCompilaQuestionario questionario={questionari.filter(quest => quest.idQuest === Number.parseInt(match.params.idQuest))[0]}
                domande={domande.filter(dom => dom.idQuest === Number.parseInt(match.params.idQuest))}
                lung={domande.filter(dom => dom.idQuest === Number.parseInt(match.params.idQuest)).length}
                idQuest={Number.parseInt(match.params.idQuest)}
                addNewCompilazione={addNewCompilazione}
              ></MyCompilaQuestionario>

              <MyModalLogin showLoginModal={showLoginModal} handleCloseModal={handleCloseModal}
                doLogIn={doLogIn}
                loggedAdmin={loggedAdmin}
              ></MyModalLogin>
            </>
          }
          else
            //altrimenti stampo un messaggio di errore
            return <Alert style={{ marginTop: 50, marginLeft: 50, marginRight: 50 }}
              variant="danger">Questionario non trovato</Alert>
        }
      }
      }>
      </Route>




      <Route path='/questionari' render={() => {

        if (loggedIn) {
          return <Redirect to="/"></Redirect>
        }

        return <>
          <MyQuestionari questionari={questionari}
            loading={loading}
          >
          </MyQuestionari>
          <MyModalLogin showLoginModal={showLoginModal} handleCloseModal={handleCloseModal}
            doLogIn={doLogIn}
            loggedAdmin={loggedAdmin}
          ></MyModalLogin>
        </>

      }
      }>
      </Route>




      <Route path='/add/questionari' render={() => {

        if (!loggedIn) {
          return <Redirect to="/"></Redirect>
        }

        return <AggiungiQuestionario addNewQuestionario={addNewQuestionario}
          addNewDomande={addNewDomande}
          loggedAdmin={loggedAdmin}
          domande={domande}
        >

        </AggiungiQuestionario>
      }

      }>
      </Route>



      <Route path='/view/questionari/:idQuest' render={({ match }) => {

        if (!loggedIn) {
          return <Redirect to="/"></Redirect>
        }


        if (questionari.filter(quest => quest.idQuest === Number.parseInt(match.params.idQuest))) {
          return <MyVisualizzaQuestionari questionario={questionari.filter(quest => quest.idQuest === Number.parseInt(match.params.idQuest))[0]}
            domande={domande.filter(dom => dom.idQuest === Number.parseInt(match.params.idQuest))}
            lung={domande.filter(dom => dom.idQuest === Number.parseInt(match.params.idQuest)).length}
            risposteUser={risposteUser.filter(setRisp => setRisp.idQuest === Number.parseInt(match.params.idQuest))}
          ></MyVisualizzaQuestionari>
        }
        else
          return <Alert variant="danger">Questionario non trovato</Alert>
      }

      }>
      </Route>

      <Route path='/view/questionari' render={() => {

        if (!loggedIn) {
          return <Redirect to="/"></Redirect>
        }

        return <GuardaRisultati questionari={questionari} risposteUser={risposteUser}
          loggedAdmin={loggedAdmin} loading={loading} >

        </GuardaRisultati>
      }

      }>
      </Route>


      {
        loggedIn ?
          <Route>
            <Redirect from='/' to='/view/questionari'></Redirect>
          </Route>
          :
          <Route>
            <Redirect from='/' to='/questionari'></Redirect>
          </Route>
      }

    </Switch >



  </Router >
}

export default App;
