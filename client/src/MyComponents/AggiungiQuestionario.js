import { Row, Button, Container, Form, Col, Modal, Alert } from "react-bootstrap"
import { useState } from "react";
import { Redirect } from 'react-router-dom';

import { ImCircleDown, ImCircleUp } from "react-icons/im";

import { RiDeleteBin6Fill, RiAlertLine } from "react-icons/ri"



function AggiungiQuestionario(props) {

    const [titolo, setTitolo] = useState("");
    const [errorTitolo, setErrorTitolo] = useState("Non lasciare il TITOLO in bianco!");


    const [showFormDomandaAperta, setShowFormDomandaAperta] = useState(false);
    const [showFormDomandaChiusa, setShowFormDomandaChiusa] = useState(false);


    const [domande, setDomande] = useState([]);

    //numero corrente di domande
    const [num, setNum] = useState(0);


    //quando è true --> torna alla home
    const [inviaNuovoQuestionario, setInviaNuovoQuestionario] = useState(false);

    //serve per i messaggi di errore
    const [attenzione, setAttenzione] = useState("");

    //serve per far visualizzare il form valido o invalido dopo la prima sottomissione
    const [submitted, setSubmitted] = useState(false);


    const addNewDomanda = (domanda) => {
        setDomande(() => [...domande, domanda])
    }


    const aggiungiDomandaAperta = (event) => {
        event.preventDefault();
        setShowFormDomandaAperta(true);
    }


    const aggiungiDomandaChiusa = (event) => {
        event.preventDefault();
        setShowFormDomandaChiusa(true);
    }


    const handleChangeTitolo = (event) => {
        event.preventDefault();

        if (!event.target.value || event.target.value === '') {
            setErrorTitolo("Non lasciare il form in bianco!");
        }
        else {
            setErrorTitolo("");
        }
        setTitolo(event.target.value);
    }


    //ritorna un array con tutte le domande tranne quella di indice === index
    const handleCancel = (event, index) => {
        event.preventDefault();
        setDomande(() => domande.filter((_, i) => i !== index));
    }


    //tipo bubble sort: fa risalire una domanda
    const handleGoUp = (event, index) => {
        event.preventDefault();
        const fakeValues = [...domande];
        if (index !== 0) {
            fakeValues[index - 1] = domande[index]
            fakeValues[index] = domande[index - 1]
        }
        setDomande(fakeValues);
    }


    //tipo bubble sort: fa scendere una domanda
    const handleGoDown = (event, index) => {
        event.preventDefault();
        const fakeValues = [...domande];
        if (index !== domande.length - 1) {
            fakeValues[index + 1] = domande[index]
            fakeValues[index] = domande[index + 1]
        }
        setDomande(fakeValues);
    }


    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        setSubmitted(true);

        //se presenta qualche errore, viene settato lo state ATTENZIONE
        if (errorTitolo) {
            setAttenzione("Inserire il titolo del form e riprovare!");

        }
        else if (domande.length === 0) {
            setAttenzione("Inserire almeno una domanda e riprovare!");

        }

        //altrimenti crea un nuovo questionario
        else {
            const newQuest = {
                titolo: titolo,
                creatorId: props.loggedAdmin.id,
                nome: props.loggedAdmin.nome
            }
            const newDomande = [];
            domande.forEach((dom, i) => {
                let newDomanda = {
                    idDom: dom.idDom,
                    quesito: dom.quesito,
                    tipo: dom.tipo,
                    pos: i,
                    min: dom.min,
                    max: dom.max,
                    risposte: null
                }
                dom.tipo === 0 ? newDomanda.risposte = null : newDomanda.risposte = [...dom.risposte]
                newDomande.push(newDomanda)
            });

            newQuest.domande = [...newDomande];

            //aspetta che il questionario sia inserito nel db tramite il server

            await props.addNewQuestionario(newQuest)

            setAttenzione("");
            
            setInviaNuovoQuestionario(true);
            
        }
        
    }

    if (inviaNuovoQuestionario)
        return <Redirect to="/view/questionari"></Redirect>

    else
        return <Container>
            <Form id="FormNuovaDomanda" onSubmit={handleSubmit}>
                <Container id="domandaObbligatoria">
                    <Form.Group as={Row} size="lg">
                        <Col sm={4}>
                            <Form.Label >Inserisci il titolo del questionario:</Form.Label>
                            <Form.Label style={{ color: "red", marginLeft: "10px" }}> *</Form.Label>
                        </Col>
                        <Col sm={7}>
                            <Form.Control autoFocus type="text" placeholder="Il titolo"
                                onChange={handleChangeTitolo}
                                isInvalid={!!(submitted && errorTitolo)}
                            />
                            <Form.Control.Feedback type="invalid">{errorTitolo}</Form.Control.Feedback>
                        </Col>
                    </Form.Group>
                </Container>
            </Form>

            {

                domande.map((dom, index) => {
                    return <Container key={index} id="domandaObbligatoria">
                        <Row>
                            <Col sm={4}>Domanda {index}:</Col>
                            <Col sm={5}>{dom.quesito}</Col>

                            <Col sm={1}>
                                <Container id="buttonContainer">
                                    <Button id="buttonModal" size="lg" onClick={(event) => handleCancel(event, index)}>
                                        <RiDeleteBin6Fill>

                                        </RiDeleteBin6Fill>
                                    </Button>
                                </Container>
                            </Col>


                            <Col sm={1}>
                                <Container id="buttonContainer">
                                    <Button id="buttonModal" size="lg" onClick={(event) => handleGoUp(event, index)}>
                                        <ImCircleUp>
                                        </ImCircleUp>
                                    </Button>
                                </Container>
                            </Col>


                            <Col sm={1}>
                                <Container id="buttonContainer">
                                    <Button id="buttonModal" size="lg" onClick={(event) => handleGoDown(event, index)}>
                                        <ImCircleDown>
                                        </ImCircleDown>
                                    </Button>
                                </Container>
                            </Col>

                        </Row>


                    </Container>
                })}


            {showFormDomandaAperta ? <AggiungiDomandaAperta
                setShow={setShowFormDomandaAperta}
                id={num} num={num} setNum={setNum}
                addNewDomanda={addNewDomanda}


            >
            </AggiungiDomandaAperta>
                : <></>}

            {showFormDomandaChiusa ? <AggiungiDomandaChiusa
                setShow={setShowFormDomandaChiusa}
                id={num} num={num} setNum={setNum}
                addNewDomanda={addNewDomanda}

            >
            </AggiungiDomandaChiusa>
                : <></>}

            {attenzione ?

                <Container style={{ display: "flex", justifyContent: "center" }}>
                    <Alert variant="danger"
                    ><RiAlertLine size="45" ></RiAlertLine>{attenzione}
                    </Alert>
                </Container>

                : <></>}

            <Row>
                <Col sm={4}>
                    <Container>
                        <Button id="buttonModal" size="lg" onClick={aggiungiDomandaAperta}> aggiungi domanda aperta</Button>
                    </Container>
                </Col>

                <Col sm={4}>
                    <Container>
                        <Button id="buttonModal" size="lg" onClick={aggiungiDomandaChiusa}> aggiungi domanda chiusa</Button>
                    </Container>
                </Col>


                <Col sm={4}>
                    <Container>
                        <Button id="buttonModal" size="lg" form="FormNuovaDomanda" type="submit"> pubblica questionario</Button>
                    </Container>
                </Col>


            </Row>
        </Container >

}

function AggiungiDomandaAperta(props) {

    const [titoloDom, setTitoloDom] = useState("");
    const [min, setMin] = useState(-1);

    const [errTitolo, setErrTitolo] = useState("Inserisci il Titolo");
    const [errMin, setErrMin] = useState("scegli tra Obbligatoria o Opzionale");

    const [attenzione, setAttenzione] = useState("");

    const [submitted, setSubmitted] = useState(false);

    const handleChangeTitoloDom = (event) => {
        event.preventDefault();
        setTitoloDom(event.target.value);

        if (!event.target.value || event.target.value === "") {
            setErrTitolo("Inserisci il Titolo");
        }
        else {
            setErrTitolo("");
        }
    }

    const handleChangeCheckboxes = (event) => {

        if (event.target.checked) {
            setMin(Number.parseInt(event.target.id));
            setErrMin("");
        }
        else {
            setMin(-1)
            setErrMin("scegli tra Obbligatoria o Opzionale");
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (errTitolo || errMin) {
            setAttenzione("Attenzione, Il form non è compilato correttamente")
        }
        else {
            props.setShow(false)
            setAttenzione("")

            const newDom = {

                idDom: props.id,
                quesito: titoloDom,
                tipo: 0,
                min: min,
                max: -1,
                risposte: null
            }
            props.addNewDomanda(newDom);

            props.setNum(() => props.num + 1);

        }

        setSubmitted(true);

    }
    return <Modal show onHide={() => props.setShow(false)}>
        <Modal.Header>
            Form Domanda Aperta
            <Button id="myCloseButton" onClick={() => props.setShow(false)}>X</Button>
        </Modal.Header>
        <Modal.Body>
            <Form id="FormDomandaAperta" show={props.show} onSubmit={handleSubmit}>
                <Container id="sezioneFormDomandaAperta">
                    <Form.Group as={Row} size="lg" onChange={handleChangeTitoloDom}>
                        <Form.Label>Inserisci il titolo della domanda:</Form.Label>
                        <Form.Control autoFocus type="text" placeholder="titolo domanda"
                            isInvalid={!!(submitted && errTitolo)}
                            isValid={!!(submitted && !errTitolo)}
                        />
                        <Form.Control.Feedback type="invalid">{errTitolo}</Form.Control.Feedback>
                    </Form.Group>
                </Container>

                <Container id="sezioneFormDomandaAperta">
                    <Form.Group size="lg" onChange={handleChangeCheckboxes}>
                        <Form.Label>Che domanda è?</Form.Label>

                        <Form.Check key={[0]} type="checkbox" id={[0]} label={"Opzionale"}
                            disabled={min === 1}
                            isInvalid={!!(submitted && errMin)}
                            isValid={!!(submitted && !errMin)}
                        >
                        </Form.Check>

                        <Form.Check key={[1]} type="checkbox" id={[1]} label={"Obbligatioria"}
                            disabled={min === 0}
                            isInvalid={!!(submitted && errMin)}
                            isValid={!!(submitted && !errMin)}
                        >
                        </Form.Check>


                    </Form.Group>
                </Container>
                <Container id="buttonContainer">
                    <Button id="buttonModal" form="FormDomandaAperta" type="submit">OK</Button>
                </Container>

                {!attenzione ? <></> : <Alert variant="danger">
                    <RiAlertLine size="35" ></RiAlertLine>{attenzione}
                </Alert>
                }
            </Form>
        </Modal.Body>
    </Modal >

}

function AggiungiDomandaChiusa(props) {

    const [titoloDom, setTitoloDom] = useState("");
    const [errTitolo, setErrTitolo] = useState("Inserisci il Titolo");

    const [min, setMin] = useState(0);
    const [errMin, setErrMin] = useState("")

    const [max, setMax] = useState(1);
    const [errMax, setErrMax] = useState("")

    //inizialmente ci sono tutte le 10 risposte settate
    const [risposte, setRisposte] = useState(new Array(10).fill(""));
    const [errRisposte, setErrRisposte] = useState(false);

    //serve per chiudere il modal
    const [showEndModal, setShowEndModal] = useState(false);

    //serve per mostrare i messaggi di errore
    const [attenzione, setAttenzione] = useState("");

    //serve per validare il form solo dopo la prima sottomissione
    const [submitted, setSubmitted] = useState(false);


    const addRisposta = (risposta, indice) => {
        const fakeRisp = [...risposte]
        fakeRisp[indice] = risposta;

        setRisposte(fakeRisp)

    }

    const handleSubmitRisposte = (event) => {
        event.preventDefault();
        event.stopPropagation();

        //toglie via le risposte inutili
        if (risposte)
            setRisposte(() => risposte.filter(r => r !== undefined && r !== ""));

        //controlla se c'è almeno una risposta utile
        if (risposte && risposte.filter(r => r !== undefined && r !== "").length === 0)
            setErrRisposte(true);

        else setErrRisposte(false);


        if (errTitolo !== "") {
            setAttenzione("Il form è sbagliato, modificare prima di reinviarlo");
        }
        else if (risposte && risposte.filter(r => r !== undefined && r !== "").length === 0) {
            setAttenzione("Il form è sbagliato, modificare prima di reinviarlo");
        }
        else {
            setAttenzione("");
            setShowEndModal(true);
        }

        setSubmitted(true);
    }



    const handleSubmitMinMax = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (min > max) {
            setErrMin(" ");
            setErrMax(" ");
            setAttenzione("Il numero minimo deve essere più piccolo del massimo!");
            return
        }
        else {
            let newDomanda = {

                idDom: props.id,
                quesito: titoloDom,
                tipo: 1,
                min: min,
                max: max,
                risposte: risposte
            }
            props.addNewDomanda(newDomanda);

            props.setNum(() => props.num + 1);
            setAttenzione("");
            props.setShow(false);
            setShowEndModal(false)
        }
    }

    const handleChangeTitoloDom = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setTitoloDom(event.target.value);

        if (!event.target.value || event.target.value === "") {
            setErrTitolo("Inserisci il Titolo");
        }
        else {
            setErrTitolo("");
        }
    }


    const handleChangeMin = (event) => {
        event.preventDefault();

        const reg = new RegExp("^[0-9]*$")
        if (!event.target.value || event.target.value === "") {
            setErrMin("inserisci un numero");
        }

        
        else if (event.target.value.match(reg) == null || event.target.value.match(reg).length === 0) {
            //non va al di sotto dello zero
        }
        
        else if (Number.parseInt(event.target.value) > risposte.length) {
            //non va al di sopra del numero di risposte
        }

        else if( Number.parseInt(event.target.value <= max)){
            setErrMin("");
            setErrMax("");
        }
        else {
            setErrMin("");
            setMin(Number.parseInt(event.target.value));
        }

        if( Number.parseInt(event.target.value) <= max ){
            setErrMax("");
        }
    }


    const handleChangeMax = (event) => {
        event.preventDefault();

        const reg = new RegExp("^[0-9]*$")
        if (!event.target.value || event.target.value === "") {
            setErrMax("inserisci un numero");
        }

        else if (event.target.value.match(reg) == null || event.target.value.match(reg).length === 0) {
            //non va al di sotto dello 0
        }
        else if (Number.parseInt(event.target.value) > risposte.length) {
            //non va al di sopra del numero di risposte
        }

        else{
            setErrMax("");
            setMax(Number.parseInt(event.target.value));
        }
        if( Number.parseInt(event.target.value) >= min ){
            setErrMin("");
        }


    }

    if (!showEndModal)
        return <Modal show onHide={() => props.setShow(false)}>
            <Modal.Header>
                Form Domanda Chiusa
                <Button id="myCloseButton" onClick={() => props.setShow(false)}>X</Button>
            </Modal.Header>

            <Modal.Body>

                <Form id="FormDomandaChiusaRisposte" show={props.show} onSubmit={handleSubmitRisposte}>

                    <Container id="sezioneFormDomandaAperta">
                        <Form.Group as={Row} size="lg" onChange={handleChangeTitoloDom}>
                            <Form.Label>Inserisci il titolo della domanda:</Form.Label>
                            <Form.Control autoFocus type="text" placeholder="titolo domanda"
                                isInvalid={!!(submitted && errTitolo)}
                                isValid={!!(submitted && !errTitolo)}

                            />
                            <Form.Control.Feedback type="invalid">{errTitolo}</Form.Control.Feedback>
                        </Form.Group>
                    </Container>

                    {Array.from({ length: 10 }).map((_, index) => {
                        return <Risposta key={index} id={index}
                            addRisposta={addRisposta}
                            risposte={risposte}
                            errRisposte={errRisposte}
                        >
                        </Risposta>
                    })
                    }

                    {attenzione ? <Alert variant="danger">{attenzione}</Alert> : <></>}
                    <Container id="buttonContainer">
                        <Button id="buttonModal" form="FormDomandaChiusaRisposte" type="submit">Invia</Button>
                    </Container>
                </Form>
            </Modal.Body>

        </Modal >

    else return <Modal show onHide={() => props.setShow(false)}>
        <Modal.Header>
            Form Domanda Chiusa
            <Button id="myCloseButton" onClick={() => props.setShow(false)}>X</Button>
        </Modal.Header>

        <Container style={{ marginBottom: 15 }}>
            <Form id="FormDomandaChiusaMinMax" onSubmit={handleSubmitMinMax}>

                <Container id="sezioneFormDomandaAperta">
                    <Form.Group as={Row} size="lg" >
                        <Form.Label>Definisci il numero minimo di risposte per questa domanda</Form.Label>
                        <Form.Control autoFocus type="number" placeholder="minimo"
                            isInvalid={!!(errMin)} value={min}
                            onChange={handleChangeMin}
                        />
                        <Form.Control.Feedback type="invalid">{errMin}</Form.Control.Feedback>
                    </Form.Group>
                </Container>

                <Container id="sezioneFormDomandaAperta">
                    <Form.Group as={Row} size="lg" >
                        <Form.Label>Definisci il numero massimo di risposte per questa domanda</Form.Label>
                        <Form.Control autoFocus type="number" placeholder="massimo" value={max}
                            isInvalid={!!(errMax)} onChange={handleChangeMax}
                        />
                        <Form.Control.Feedback type="invalid">{errMax}</Form.Control.Feedback>
                    </Form.Group>
                </Container>

                {attenzione ? <Alert variant="danger">{attenzione}</Alert> : <></>}
                <Container id="buttonContainer">
                    <Button id="buttonModal" form="FormDomandaChiusaMinMax" type="submit">Invia</Button>
                </Container>
            </Form>
        </Container>
    </Modal >

}

function Risposta(props) {

    const handleChangeTesto = (event, id) => {
        event.preventDefault();
        if (event.target.value)
            props.addRisposta(event.target.value, id);
    }

    return <Container id="sezioneFormDomandaAperta">
        <Form.Group key={props.id} as={Row} size="lg" onChange={(event) => handleChangeTesto(event, props.id)}>
            <Form.Label>Inserisci la risposta {props.id}</Form.Label>
            <Form.Control type="text" placeholder="risposta"
                isInvalid={props.errRisposte===0}
                
            >
            </Form.Control>
        </Form.Group>
    </Container>
}


export default AggiungiQuestionario;