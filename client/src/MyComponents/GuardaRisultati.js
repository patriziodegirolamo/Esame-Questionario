import { Button, Container, Table, Spinner } from "react-bootstrap"
import { Link } from 'react-router-dom';
import { AiOutlineSelect } from "react-icons/ai"



function GuardaRisultati(props) {

    return <Container>
        <h1 style={{ marginTop: 15, textAlign: "center" }}>Seleziona un Questionario </h1>
        {
            props.loading ?
                <Container id="containerSpinner">
                    <Spinner animation="border" variant="danger" />
                </Container>
                :
                <Table striped hover>

                    <thead>
                        <tr>
                            <th>Titolo</th>
                            <th>Creatore</th>
                            <th>Compilazioni</th>
                            <th>Analizza Risposte</th>
                        </tr>

                    </thead>

                    <tbody>
                        {
                            props.questionari.filter(quest => quest.creatorId === props.loggedAdmin.id).map((quest) =>
                                <HeaderQuest key={quest.idQuest} idQuest={quest.idQuest} titolo={quest.titolo}
                                    nome={quest.nome} risposteUser={props.risposteUser} loading={props.loading}
                                ></HeaderQuest>
                            )
                        }
                    </tbody>

                </Table>
        }


    </Container>


}
function HeaderQuest(props) {


    const listaIdCompDistinti = [...new Set(props.risposteUser.filter(risp => risp.idQuest === props.idQuest).map(risp => risp.idComp))]

    return <tr>

        <th>{props.titolo}</th>
        <th>{props.nome}</th>
        <th>{listaIdCompDistinti.length}</th>
        <th><Link to={{
            pathname: "/view/questionari/" + props.idQuest
        }}>
            <Button id="buttonCompilatore">
                <AiOutlineSelect></AiOutlineSelect>
            </Button>
        </Link>
        </th>
    </tr>
}

export default GuardaRisultati;