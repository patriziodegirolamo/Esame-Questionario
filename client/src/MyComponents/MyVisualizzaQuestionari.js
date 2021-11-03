import { Row, Button, Container, Col } from "react-bootstrap"
import { useState } from "react";
import { Link } from 'react-router-dom';
import DomandaAperta from "./DomandaAperta";
import DomandaChiusa from "./DomandaChiusa";


function MyVisualizzaQuestionari(props) {

    //lista con tutti i diversi id di compilazione
    const listIdsComp = [...new Set(props.risposteUser.map(comp => comp.idComp))];


    const users = [];
    const fakeIds = [];

    //per ogni idComp abbiamo uno user
    for (let compilazione of props.risposteUser) {
        if (!fakeIds.includes(compilazione.idComp)) {
            fakeIds.push(compilazione.idComp);
            users.push(compilazione.utilizzatore);
        }
    }

    //indice dello user--> serve quando navighiamo tra i diversi users
    const [index, setIndex] = useState(0)

    const [currentUser, setCurrentUser] = useState(() => users[index]);
    const [currentIdComp, setCurrentIdComp] = useState(() => listIdsComp[index])


    const selectUserPrecedente = (event) => {
        event.preventDefault();

        if (index === 0) {
            setIndex(users.length - 1);
            setCurrentUser(users[users.length - 1]);
            setCurrentIdComp(listIdsComp[listIdsComp.length - 1]);
        }
        else {
            setCurrentUser(users[index - 1])
            setIndex((index) => index - 1)
            setCurrentIdComp(listIdsComp[index - 1]);
        }

    }


    const selectUserSuccessivo = (event) => {
        event.preventDefault();

        if (index === users.length - 1) {
            setCurrentUser(users[0])
            setIndex(0)
            setCurrentIdComp(listIdsComp[0])
        }
        else {
            setCurrentUser(users[index + 1])
            setIndex((index) => index + 1)
            setCurrentIdComp(listIdsComp[index + 1])
        }

    }


    return <Container id="containerCompilaQuestionario">
        <h1 style={{ marginTop: 15, textAlign: "center", marginBottom: 15 }}>Questionario: {props.questionario.titolo} </h1>

        <Row>
            <Col sm={4}>
                <Container>
                    <Button id="buttonModal" size="lg" onClick={selectUserPrecedente}>Precedente</Button>
                </Container>
            </Col>

            <Col sm={4} style={{
                borderStyle: "solid", borderWidth: 5, backgroundColor: "#c78b9f"
                , textAlign: "center", paddingTop: 5, borderRadius: 8, fontWeight: 400, fontSize: 20
            }}>

                User: {currentUser}
            </Col>



            <Col sm={4}>
                <Container style={{ justifyContent: "right", display: "flex" }}>
                    <Button id="buttonModal" size="lg" onClick={selectUserSuccessivo}>Successivo</Button>
                </Container>
            </Col>
        </Row>


        {props.domande.map((dom, index) => {
            if (dom.tipo === 0)
                return <DomandaAperta key={[index]} domanda={dom}
                    readonly={true}
                    risposta={props.risposteUser.filter(risp => risp.idDom === dom.idDom && risp.idComp === currentIdComp)}
                />
            else return <DomandaChiusa key={[index]} domanda={dom}
                readonly={true}
                risposte={props.risposteUser.filter(risp => risp.idDom === dom.idDom && risp.idComp === currentIdComp)}
            />
        })}


        <Row>
            <Col sm={6}>
                <Container>
                    <Link to='/questionari'>
                        <Button id="buttonModal" size="lg"
                        > Torna indietro</Button>
                    </Link>
                </Container>
            </Col>
        </Row>
    </Container>
}



export default MyVisualizzaQuestionari;