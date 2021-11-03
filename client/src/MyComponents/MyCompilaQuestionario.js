import { Row, Button, Container, Form, Col, Alert } from "react-bootstrap"
import { useState } from "react";
import { Link, Redirect } from 'react-router-dom';
import DomandaAperta from "./DomandaAperta";
import DomandaChiusa from "./DomandaChiusa";
import { RiAlertLine } from "react-icons/ri";


function MyCompilaQuestionario(props) {

    //serve per ritornare alla home quando si ha concluso la compilazione
    const [sendAndGoBack, setSendAndGoBack] = useState(false);

    //utili per i messaggi di errore
    const [showAlert, setShowAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");

    //il nome dell user che sta compilando
    const [user, setUser] = useState("");
    const [errorUser, setErrorUser] = useState("Non lasciare il nome incompleto!");

    //array di errori:
    //ogni cella ha una stringa inizializzata a "" se non presenta alcun errore, esempio risposta opzionale
    //oppure se presenta un errore ci sarà il messaggio corrispondente, per esempio una domanda obbligatoria non ancora compilata
    const [errors, setErrors] = useState(() => {
        const allErrors = props.domande.map((dom, index) => {
            if (dom.tipo === 0) {
                if (dom.min === 1) {
                    return "Non lasciare incompleto un form obbligatorio";
                }
                else {
                    return "";
                }
            }
            else {
                if (dom.min >= 1) {
                    return "Non soddisfa i vincoli sul numero minimo di risposte!";
                }
                else {
                    return "";
                }
            }
        })
        return allErrors;
    });

    //array di risposte: nel caso di risposte chiuse si fa un append con il "_"
    //esempio 1_0_4 vuol dire che sono state settate le risposte 0 1 e 4 di quel form
    const [risposte, setRisposte] = useState(new Array(props.lung).fill(""));
    
    //serve per far illuminare il form di verde quando è valido
    const [validated, setValidated] = useState(false);

    //serve per far illuminare il form di verde o rosso solo dopo averlo submittato
    const [submitted, setSubmitted] = useState(false);


    //aggiunge una risposta.
    //nel caso la risposta ci sia già nell array, viene sovrascritta
    const addRisposta = (risp, indice) => {
        const newArr = [];

        for (let i = 0; i < risposte.length; i++) {
            if (i === indice) {
                newArr.push(risp);
            }
            else newArr.push(risposte[i]);
        }
        setRisposte(newArr);
    }

    ////aggiunge un errore all array di errori.
    //nel caso l'errore sia gia presente, questo viene sovrascritto
    const addError = (errore, indice) => {
        const newArr = [];
        for (let i = 0; i < errors.length; i++) {
            if (i === indice) {
                newArr.push(errore);
            }
            else newArr.push(errors[i]);
        }
        setErrors(newArr);
    }


    const handleSubmit = (event) => {
        // stop event default and propagation
        event.preventDefault();
        event.stopPropagation();


        //blocca la compilazione se non ci sono domande --> questionario con solo il titolo
        if (props.lung === 0) {
            setAlertMsg("Non è possibile effettuare una compilazione, non ci sono domande!")
            setShowAlert(true);
            setSendAndGoBack(false);
        }
        

        else if (errorUser === "") {
            let ok = true;
            errors.forEach(err => {
                if (err !== "") {
                    ok = false;
                }
            })
            //se non c'è nessun errore --> è valido
            if (ok === true) {
                setValidated(true);
                let newComp = {}

                newComp.idQuest = props.idQuest;
                newComp.utilizzatore = user;
                newComp.arrayRisposte = [];

                props.domande.forEach((dom, index) => {
                    if (dom.tipo === 0) {
                        newComp.arrayRisposte.push({
                            idQuest: dom.idQuest,
                            idDom: dom.idDom,
                            risp: risposte[index],
                        })
                    }
                    else {
                        let fakeArrayRisposte = [];
                        risposte[index].split("_").forEach(numRisposta => {
                            fakeArrayRisposte.push(dom.risposte[numRisposta])
                        })

                        newComp.arrayRisposte.push({
                            idDom: dom.idDom,
                            risp: fakeArrayRisposte
                        })
                    }
                })

                //inizializza la nuova compilazione:
                //idQuest -- utilizzatore -- [domanda0, domanda1, domanda2...]
                //dove ogni domanda ha il seguente formato: {idQuest, idDom, risposte}
                //in caso di domanda chiuse, le varie risposte sono separate da "_" 
                            

                props.addNewCompilazione(newComp);
                setAlertMsg("");
                setShowAlert(false);
                setSendAndGoBack(true);

            }
            else {
                setAlertMsg("IL QUESTIONARIO PRESENTA DEGLI ERRORI, SI PREGA DI CORREGGERLI PRIMA DI INVIARLO");
                setShowAlert(true);
                setSendAndGoBack(false);
            }
        }
        //not ok
        else {
            setAlertMsg("IL QUESTIONARIO PRESENTA DEGLI ERRORI, SI PREGA DI CORREGGERLI PRIMA DI INVIARLO");

            setShowAlert(true);
            setValidated(false);
            setSendAndGoBack(false);
        }

        setSubmitted(true);
    }


    const handleChangeName = (event) => {
        event.preventDefault();
        if (!event.target.value || event.target.value === '') {
            setErrorUser("Non lasciare il form incompleto!");
        }
        else {
            setErrorUser("");
        }
        setUser(event.target.value);
    }


    if (sendAndGoBack) return <Redirect to='/questionari'></Redirect>

    else return <Container id="containerCompilaQuestionario">
        <h1 style={{ marginTop: 15, textAlign: "center" }}>Compila il Questionario: {props.questionario.titolo} </h1>
        <Container>
            <Form validated={validated} noValidate id="formQuestionario" onSubmit={handleSubmit}>
                <Container id="domandaObbligatoria">
                    <Form.Group as={Row} size="lg" >
                        <Col sm={4}>
                            <Form.Label style={{ fontSize: 22, fontStyle: "italic", fontWeight: 500 }}>Inserisci il tuo nome:</Form.Label>
                            <Form.Label style={{ color: "red", marginLeft: "10px" }}> *</Form.Label>
                        </Col>
                        <Col sm={7}>
                            <Form.Control required autoFocus type="username" placeholder="Il tuo nome"
                                onChange={handleChangeName}
                                isInvalid={!!(submitted && errorUser)} />
                            <Form.Control.Feedback type="invalid">{errorUser}</Form.Control.Feedback>

                        </Col>
                    </Form.Group>
                </Container>

                {props.domande.map((dom, index) => {
                    if (dom.tipo === 0)
                        return <DomandaAperta key={[index]} domanda={dom}
                            addRisposta={addRisposta}
                            addError={addError}
                            submitted={submitted}
                            setSubmitted={setSubmitted}
                        />
                    else return <DomandaChiusa key={[index]} domanda={dom}
                        addRisposta={addRisposta}
                        addError={addError}
                        submitted={submitted}
                        setSubmitted={setSubmitted}
                    />
                })}

                {showAlert ? <Container style={{display: "flex", justifyContent: "center"}}>
                    <Alert variant="danger"
                        onClose={() => setShowAlert(false)}
                    ><RiAlertLine size="45" ></RiAlertLine>{alertMsg}
                    </Alert>
                </Container> : <></>}

                <Row>
                    <Col sm={6}>
                        <Container>
                            <Link to='/questionari'>
                                <Button id="buttonModal" size="lg" > Torna indietro</Button>
                            </Link>
                        </Container>
                    </Col>

                    <Col sm={6}>
                        <Container style={{ justifyContent: "right", display: "flex" }}>
                            <Button id="buttonModal" size="lg" form="formQuestionario" type="submit" > Invia </Button>
                        </Container>
                    </Col>
                </Row>
            </Form>

        </Container>
    </Container >
}



export default MyCompilaQuestionario;